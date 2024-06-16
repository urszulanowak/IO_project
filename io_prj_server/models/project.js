var db = require('@utility/database');
var tag_model = require('@models/project_tag');
var message_model = require('@models/message');

/**
 * Retrieves a project by its ID.
 * @param {number} project_id - The ID of the project to retrieve.
 * @returns {Promise<Object>} - A promise that resolves to the project object.
 * @throws {Error('project not found')} - If the project is not found.
 */
exports.get_project = async function (project_id) {
    var project = {}
    var data_promise = db.Request()
        .input('project_id', project_id)
        .query(`SELECT * FROM [dbo].[project] 
                WHERE project_id = @project_id`)
        .then(result => {
            if (result.recordset.length == 0) {
                throw new Error('project not found');
            } else {
                project.data = result.recordset[0];
            }
        });
    var members_promise = db.Request()
        .input('project_id', project_id)
        .query(`SELECT u.user_id, u.name, u.email, u.picture,
                m.join_date, m.creator, m.accepted, m.baned
                FROM [dbo].[project_member] m 
                JOIN [dbo].[user] u ON m.user_id = u.user_id
                WHERE m.project_id = @project_id
                AND (m.creator = 1 OR m.accepted = 1) AND m.baned = 0
                ORDER BY m.join_date DESC`)
        .then(result => {
            project.members = result.recordset;
        });
    var comments_promise = db.Request()
        .input('project_id', project_id)
        .query('SELECT * FROM [dbo].[project_comment] c JOIN [dbo].[user] u ON c.user_id = u.user_id WHERE project_id = @project_id ORDER BY c.create_date DESC')
        .then(result => {
            project.comments = result.recordset;
        });
    var tags_promise = tag_model.get_project_tags([project_id]).then(tags => {
        project.tags = tags;
    });
    await Promise.all([data_promise, members_promise, comments_promise, tags_promise]);
    return project;
}

/**
 * Retrieves project previews by their IDs.
 * @param {number[]} project_ids - An array of project IDs to retrieve previews for.
 * @returns {Promise<Object[]>} - A promise that resolves to an array of project preview objects.
 */
exports.get_project_previews = async function (project_ids) {
    var project_previews = null;
    await db.Request()
        .input('project_ids', project_ids.join(','))
        .query("SELECT project_id, title, SUBSTRING(description, 1, 256) AS description FROM [dbo].[project] WHERE project_id IN  (SELECT value FROM STRING_SPLIT(@project_ids, ','))")
        .then(result => {
            project_previews = result.recordset;
        });
    await tag_model.get_project_tags(project_ids).then(tags => {
        project_previews.forEach(project => {
            project.tags = tags.filter(tag => tag.project_id == project.project_id);
        });
    });
    return project_previews;
}

exports.get_project_previews_by_user_id = async function (user_id) {
    var project_previews = null;
    await db.Request()
        .input('user_id', user_id)
        .query(`SELECT p.project_id, p.title, SUBSTRING(p.description, 1, 256) AS description
                FROM[dbo].[project] p JOIN[dbo].[project_member] m ON p.project_id = m.project_id
                WHERE m.user_id = @user_id AND m.creator = 1`)
        .then(result => {
            project_previews = result.recordset;
        });
    var project_ids = project_previews.map(project => project.project_id);
    await tag_model.get_project_tags(project_ids).then(tags => {
        project_previews.forEach(project => {
            project.tags = tags.filter(tag => tag.project_id == project.project_id);
        });
    });
    return project_previews;
}

/**
 * Publishes a new project.
 * @param {number} user_id - The ID of the user publishing the project.
 * @param {string} title - The title of the project.
 * @param {string} description - The description of the project.
 * @param {number[]} tags - An array of tag IDs for the project.
 * @returns {Promise<number>} - A promise that resolves to the ID of the newly published project.
 * @throws {Error('title to short')} - If the title is too short.
 * @throws {Error('description to short')} - If the description is too short.
 */
exports.publish = async function (user_id, title, description, tags) {
    if (title.length < 8) {
        throw new Error('title too short');
    }
    if (description.length < 100) {
        throw new Error('description too short');
    }
    var tran = db.pool.transaction();
    return await tran.begin().then(async () => {
        var project_id;
        var private_message_room_id;
        await tran.request()
            .input('title', title)
            .input('description', description)
            .query(`INSERT INTO [dbo].[project] (title, description, public_message_room_id, private_message_room_id) OUTPUT INSERTED.project_id VALUES (@title, @description,
                (INSERT INTO [dbo].[room](public) OUTPUT INSERTED.message_room_id VALUES (@public)),
                (INSERT INTO [dbo].[room](public) OUTPUT INSERTED.message_room_id VALUES (@public))
                )`)
            .then(result => {
                project_id = result.recordset[0].project_id;
                private_message_room_id = result.recordset[0].message_room_id;
            })
            .catch(err => {
                tran.rollback();
                throw err;
            });
        await tag_model.add_project_tags(tran, project_id, tags);
        await tran.request()
            .input('user_id', user_id)
            .input('project_id', project_id)
            .query('INSERT INTO [dbo].[project_member] (project_id, user_id, creator) VALUES (@project_id, @user_id, 1)')
            .catch(err => {
                tran.rollback();
                throw err;
            });
        await message_model.add_user_to_room(tran, user_id, private_message_room_id)
            .catch(err => {
                tran.rollback();
                throw err;
            });
        await tran.commit();
        return project_id;
    });
}