var db = require('@utility/database');

exports.get_user_notifications = async function (user_id) {
    return await db.request()
        .input('user_id', user_id)
        .query(`SELECT * FROM [dbo].[notification] JOIN [dbo].[notification_type] ON notification.notification_type_id = notification_type.notification_type_id
                WHERE user_id = @user_id 
                ORDER BY create_date DESC`)
        .then(result => {
            return result.recordset;
        });
}