var db = require('@utility/database');

async function authorize(user_id, room_id) {
    return db.Request()
        .input('user_id', user_id)
        .input('room_id', room_id)
        .query(`SELECT 1 
                FROM [dbo].[message_room] mr 
                LEFT JOIN [dbo].[message_room_access] msa ON mr.message_room_id = msa.message_room_id
                WHERE mr.message_room_id = @room_id
                AND 
                (
                    mr.[public] = 1
                    OR msa.user_id = @user_id
                )
                `)
        .then(result => {
            if (result.recordset.length == 0) {
                throw new Error('no access');
            }
        });
}
exports.authorize = authorize;

exports.create_room = async function (tran, is_public) {
    return tran.request()
        .input('public', is_public)
        .query(`INSERT INTO [dbo].[message_room]([public]) OUTPUT INSERTED.message_room_id VALUES (@public)`)
        .then(result => {
            return result.recordset[0].message_room_id;
        });
}

exports.add_user_to_room = async function (tran, user_id, room_id) {
    return tran.request()
        .input('user_id', user_id)
        .input('room_id', room_id)
        .query(`INSERT INTO [dbo].[message_room_access](user_id, message_room_id) VALUES (@user_id, @room_id)`);
}

exports.get_messages_before = async function (user_id, room_id, before_id, limit) {
    await authorize(user_id, room_id);
    if (before_id == null)
        before_id = Number.MAX_SAFE_INTEGER;
    return await db.Request()
        .input('room_id', room_id)
        .input('before_id', before_id)
        .input('limit', limit)
        .query(`SELECT  m.message_id, m.create_date, m.user_id, u.name, m.text
                    FROM [dbo].[message] m
                    JOIN [dbo].[user] u ON m.user_id = u.user_id
                    WHERE m.message_room_id = @room_id
                    AND m.message_id < @before_id
                    ORDER BY m.create_date DESC
                    OFFSET 0 ROWS FETCH NEXT @limit ROWS ONLY`)
        .then(result => {
            return result.recordset.reverse();
        });
}

exports.get_messages_after = async function (user_id, room_id, after_id, limit) {
    await authorize(user_id, room_id);
    if (after_id == null)
        after_id = 0;
    return await db.Request()
        .input('room_id', room_id)
        .input('after_id', after_id)
        .input('limit', limit)
        .query(`SELECT  m.message_id, m.create_date, m.user_id, u.name, m.text
                    FROM [dbo].[message] m
                    JOIN [dbo].[user] u ON m.user_id = u.user_id
                    WHERE m.message_room_id = @room_id
                    AND m.message_id > @after_id
                    ORDER BY m.create_date DESC
                    OFFSET 0 ROWS FETCH NEXT @limit ROWS ONLY`)
        .then(result => {
            return result.recordset.reverse();
        });
}

exports.add_message = async function (user_id, room_id, text) {
    await authorize(user_id, room_id);
    return await db.Request()
        .input('user_id', user_id)
        .input('room_id', room_id)
        .input('text', text)
        .query(`INSERT INTO [dbo].[message](user_id, message_room_id, text) OUTPUT INSERTED.message_id VALUES (@user_id, @room_id, @text)`)
        .then(result => {
            return result.recordset[0].message_id;
        });
}