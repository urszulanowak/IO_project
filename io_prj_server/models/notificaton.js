var db = require('@utility/database');

exports.get_user_notifications = async function (user_id) {
    var seen_time = new Date().toISOString();
    var notifications = await db.request()
        .input('user_id', user_id)
        .query(`SELECT  n.notification_id, n.create_date, n.seen, 
                        t.name AS notification_type_name,
                        u.user_id AS from_user_id, u.name AS from_user_name, u.from_user_is_admin, 
                        p.project_id AS from_project_id, p.title AS from_project_title,
                        n.message
                FROM [dbo].[notification] n
                JOIN [dbo].[notification_type] t ON n.notification_type_id = t.notification_type_id
                JOIN [dbo].[user] u ON n.from_user_id = u.user_id
                JOIN [dbo].[project] p ON n.from_project_id = p.project_id
                WHERE n.user_id = @user_id 
                ORDER BY n.create_date DESC`)
        .then(result => {
            return result.recordset;
        });
    await db.request()
        .input('user_id', user_id)
        .input('seen_time', seen_time)
        .query(`UPDATE [dbo].[notification]
                SET seen = 1
                WHERE user_id = @user_id
                AND create_date <= @seen_time`);
    return notifications;
}