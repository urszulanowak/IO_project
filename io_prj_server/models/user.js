var db = require('@utility/database');

/**
 * Checks if user of a given email and password exists and returns their data. If user does not exist, returns null.
 * @param {string} email - The user's email.
 * @param {string} pass - The user's password.
 * @returns {Promise<Object|null>} - A promise that resolves to the user object if login is successful, or null if login fails.
 */
exports.login = async function (email, pass) {
    db.request()
        .input('email', email)
        .input('pass', pass)
        .query('SELECT * FROM user WHERE email = @email AND pass = @pass')
        .then(result => {
            if (result.recordset.length > 0) {
                let user = {
                    user_id: result.recordset[0].user_id,
                    email: result.recordset[0].email,
                    name: result.recordset[0].name,
                    is_guest: false,
                    is_admin: result.recordset[0].is_admin
                };
                return user;
            }
            else {
                return null;
            }
        });
}