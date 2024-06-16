var db = require('@utility/database');

/**
 * Checks if user of a given email and password exists and returns their data.
 * @param {string} email - The user's email.
 * @param {string} pass - The user's password.
 * @returns {Promise<Object>} - A promise that resolves to the user object if login is successful.
 * @throws {Error('invalid email or password')} - If email and password don't match.
 */
exports.login = async function (email, pass) {
    return await db.Request()
        .input('email', email)
        .input('pass', pass)
        .query('SELECT * FROM [dbo].[user] WHERE email = @email AND pass = @pass')
        .then(result => {
            if (result.recordset.length == 0) {
                throw new Error('invalid email or password');
            } else {
                let user = {
                    user_id: result.recordset[0].user_id,
                    email: result.recordset[0].email,
                    name: result.recordset[0].name,
                    join_date: new Date(result.recordset[0].join_date).toISOString().substring(0,10),
                    is_guest: false,
                    is_admin: result.recordset[0].is_admin
                };
                return user;
            }
        });
}

/**
 * Registers a user with the given email, name and password.
 * @param {string} email - The user's email.
 * @param {string} name - The user's name.
 * @param {string} pass - The user's password.
 * @param {Date} birth_date - The user's birth date.
 * @param {string} gender - The user's gender.
 * @returns {null} - Nothing.
 * @throws {Error('email already exists')} - If email already exists.
 * @throws {Error('name already exists')} - If name already exists.
 * @throws {Error('email too short')} - If email is too short. (must be at least 8 characters long)
 * @throws {Error('name too short')} - If name is too short.
 * @throws {Error('pass too short')} - If password is too short.
 * @throws {Error('value too long')} - If any value is too long.
 * @throws {Error('user age')} - If user age is less than 16 years.
 */
exports.register = async function (email, name, pass, birth_date, gender) {
    await db.Request()
        .input('email', email)
        .input('name', name)
        .input('pass', pass)
        .input('birth_date', birth_date)
        .input('gender', gender)
        .query('INSERT INTO [dbo].[user] (email, name, pass, birth_date, gender) VALUES (@email, @name, @pass, @birth_date, @gender)')
        .catch(err => {
            if (err.code === 'EREQUEST' && err.originalError) {
                var info = err.originalError.info;
                if (info.message.includes('unique_email'))
                    throw new Error('email already exists');
                if (info.message.includes('unique_name'))
                    throw new Error('name already exists');
                if (info.message.includes('email_len'))
                    throw new Error('email too short');
                if (info.message.includes('name_len'))
                    throw new Error('name too short');
                if (info.message.includes('pass_len'))
                    throw new Error('pass too short');
                if (info.number === 2628)
                    throw new Error('value too long');
                if (info.message.includes('user_age'))
                    throw new Error('user age');
            }
            throw err;
        });
}
