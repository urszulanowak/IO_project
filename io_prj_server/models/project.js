var db = require('@utility/database');

exports.get_project = async function (project_id) {
    var project = {}
    var data_promise = db.request()
        .input('project_id', project_id)
        .query('SELECT * FROM [dbo].[project] WHERE project_id = @project_id')
        .then(result => {
            if (result.recordset.length == 0) {
                throw new Error('project not found');
            } else {
                project.data = result.recordset[0];
            }
        });
    var comments_promise = db.request()
        .input('project_id', project_id)
        .query('SELECT * FROM [dbo].[project_comment] c JOIN [dbo].[user] u ON c.user_id = u.user_id WHERE project_id = @project_id ORDER BY c.create_date DESC')
        .then(result => {
            project.comments = result.recordset;
        });
    await Promise.all([data_promise, comments_promise]);
    return project;
}

exports.get_project_previews = async function (project_ids) {
    return await db.request()
        .input('project_ids', project_ids.join(','))
        .query("SELECT project_id, title, SUBSTRING(description, 1, 100) AS description FROM [dbo].[project] WHERE project_id IN  (SELECT value FROM STRING_SPLIT(@project_ids, ','))")
        .then(result => {
            return result.recordset;
        });
}

exports.publish = async function (user_id, title, description) {
    if (title.length < 8) {
        throw new Error('title too short');
    }
    if (description.length < 100) {
        throw new Error('description too short');
    }
    return await db.request()
        .input('user_id', user_id)
        .input('title', title)
        .input('description', description)
        .query('INSERT INTO [dbo].[project] (user_id, title, description) OUTPUT INSERTED.project_id VALUES (@user_id, @title, @description)')
        .then(result => {
            return result.recordset[0].project_id;
        });
}
