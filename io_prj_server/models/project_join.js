var db = require('@utility/database');

/**
 * Sends a join request for a project.
 * @param {number} user_id - The ID of the user sending the join request.
 * @param {number} project_id - The ID of the project to send the join request for.
 * @param {string} message - The message accompanying the join request.
 * @returns {Promise<void>} - A promise that resolves when the join request is sent.
 * @throws {Error('message to short')} - If the message is too short.
 * @throws {Error('message to long')} - If the message is too long.
 * @throws {Error('already member')} - If the user is already a member of the project.
 * @throws {Error('request denied')} - If the user's previous join request for the project was denied.
 * @throws {Error('request pending')} - If the user already has a pending join request for the project.
 */
exports.join_request = async function (user_id, project_id, message) {
    if (message.length < 50) {
        throw new Error('message too short');
    }
    if (message.length > 256) {
        throw new Error('message too long');
    }
    var tran = db.Transaction();
    return await tran.begin().then(async () => {
        await tran.request()
            .input('user_id', user_id)
            .input('project_id', project_id)
            .query('SELECT * FROM [dbo].[project_member] WHERE project_id = @project_id AND user_id = @user_id')
            .then(result => {
                if (result.recordset.length > 0) {
                    if (result.recordset[0].creator == 1 || result.recordset[0].accepted == 1) {
                        throw new Error('already member');
                    } else if (result.recordset[0].baned == 1) {
                        throw new Error('request denied');
                    } else {
                        throw new Error('request pending');
                    }
                }
            })
            .catch(err => {
                tran.rollback();
                throw err;
            });
        await tran.request()
            .input('user_id', user_id)
            .input('project_id', project_id)
            .query('INSERT INTO [dbo].[project_member] (project_id, user_id) VALUES (@project_id, @user_id)')
            .catch(err => {
                tran.rollback();
                throw err;
            });
        await tran.request()
            .input('from_user_id', user_id)
            .input('from_project_id', project_id)
            .input('message', message)
            .query(`INSERT INTO[dbo].[notification](notification_type_id, user_id, from_user_id, from_project_id, message) 
                    VALUES(
            (SELECT notification_type_id FROM[dbo].[notification_type]
                            WHERE name = 'join_request'),
            (SELECT user_id FROM[dbo].[project_member]
                            WHERE project_id = @from_project_id AND creator = 1),
    @from_user_id, @from_project_id, @message
                    )`)
            .catch(err => {
                tran.rollback();
                throw err;
            });
        await tran.commit();
    });
}

exports.get_project_join_requests = async function (project_id, user_id) {
    var project = {};
    var project_promise = db.Request()
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
    var project_creator_promise = db.Request()
        .input('project_id', project_id)
        .input('user_id', user_id)
        .query(`SELECT u.user_id, u.name, u.picture
                FROM [dbo].[project_member] m
                JOIN [dbo].[user] u ON m.user_id = u.user_id
                WHERE m.project_id = @project_id 
                AND m.creator = 1
                AND m.user_id = @user_id;`)
        .then(result => {
            if (result.recordset.length == 0) {
                throw new Error('not the creator of project');
            }
        });
    var project_join_requests_promise = await db.Request()
        .input('project_id', project_id)
        .query(`SELECT u.user_id, u.name, u.picture, m.join_date, n.message
                FROM [dbo].[project_member] m
                JOIN [dbo].[notification] n ON m.user_id = n.from_user_id AND m.project_id = n.from_project_id
                JOIN [dbo].[user] u ON m.user_id = u.user_id
                WHERE m.project_id = @project_id AND m.creator = 0 AND m.accepted = 0 AND m.baned = 0
                ORDER BY m.join_date DESC;`)
        .then(result => {
            project.join_requests = result.recordset
        });
    await Promise.all([project_promise, project_creator_promise, project_join_requests_promise]);
    return project;
};

exports.handle_join_request = async function (creator_id, project_id, user_id, accept) {
    var tran = db.Transaction();
    return await tran.begin().then(async () => {
        await tran.request()
            .input('project_id', project_id)
            .input('creator_id', creator_id)
            .query(`SELECT user_id
                FROM [dbo].[project_member]
                WHERE project_id = @project_id 
                AND creator = 1
                AND user_id = @creator_id;`)
            .then(result => {
                if (result.recordset.length == 0) {
                    throw new Error('not the creator of project');
                }
            })
            .catch(err => {
                tran.rollback();
                throw err;
            });
        if (accept) {
            await tran.request()
                .input('user_id', user_id)
                .input('project_id', project_id)
                .query(`UPDATE [dbo].[project_member] SET accepted = 1 WHERE project_id = @project_id AND user_id = @user_id`)
                .catch(err => {
                    tran.rollback();
                    throw err;
                });
        } else {
            await tran.request()
                .input('user_id', user_id)
                .input('project_id', project_id)
                .query(`UPDATE [dbo].[project_member] SET baned = 1 WHERE project_id = @project_id AND user_id = @user_id`)
                .catch(err => {
                    tran.rollback();
                    throw err;
                });
        }
        await tran.request()
            .input('user_id', creator_id)
            .input('from_user_id', user_id)
            .input('from_project_id', project_id)
            .query(`DELETE FROM [dbo].[notification] 
                    WHERE user_id = @user_id 
                    AND from_user_id = @from_user_id 
                    AND from_project_id = @from_project_id`)
            .catch(err => {
                tran.rollback();
                throw err;
            });
        await tran.request()
            .input('user_id', user_id)
            .input('from_project_id', project_id)
            .input('notification_type_name', accept ? 'join_request_accepted' : 'join_request_denied')
            .input('message', accept ? 'Twoje podanie zostało zaakceptowane!' : 'Twoje podanie zostało odrzucone!')
            .query(`INSERT INTO [dbo].[notification] (notification_type_id, user_id, from_project_id, message)
                    VALUES (
                        (SELECT notification_type_id FROM [dbo].[notification_type] WHERE name = @notification_type_name),
                        @user_id, @from_project_id, @message
                    )`)
            .catch(err => {
                tran.rollback();
                throw err;
            });
        await tran.commit();
    });
}