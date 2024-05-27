var user_model = require('@models/user');
var jwt = require('jsonwebtoken');
var jwt_cfg = require('@config/jwt_cfg');

/**
 * Handles user login.
 * Stores user data and jwt tokens in cookies.
 * Responds with status 200 if login is successful.
 * Responds with status 401 if login fails.
 * Responds with status 500 if there is a server error.
 * 
 * @param {Object} req - The request object.
 * @param {string} req.body.email - The user's email.
 * @param {string} req.body.pass - The user's password.
 * @param {Object} res - The response object.
 */
exports.login = function (req, res) {
    var email = req.body.email;
    var pass = req.body.pass;

    user_model.login(email, pass).then(user => {
        res.cookie('logged_in', 'true', { maxAge: jwt_cfg.ACCESS_TOKEN_TTL, httpOnly: false, secure: true, sameSite: 'Strict' });
        let jwt_access_token = jwt.sign(
            user,
            jwt_cfg.ACCESS_TOKEN_SECRET,
            { expiresIn: jwt_cfg.ACCESS_TOKEN_TTL }
        );
        let jwt_refresh_token = jwt.sign(
            user,
            jwt_cfg.REFRESH_TOKEN_SECRET,
            { expiresIn: jwt_cfg.REFRESH_TOKEN_TTL }
        );
        res.cookie('jwt_access_token',
            jwt_access_token,
            { maxAge: jwt_cfg.ACCESS_TOKEN_TTL, httpOnly: true, secure: true, sameSite: 'Strict' });
        res.cookie('jwt_refresh_token',
            jwt_refresh_token,
            { maxAge: jwt_cfg.REFRESH_TOKEN_TTL, httpOnly: true, secure: true, sameSite: 'Strict' });
        req.session.jwt_refresh_token = jwt_refresh_token;
        res.status(200).redirect('/');
    }).catch(err => {
        switch (err.message) {
            case 'invalid email or password':
                res.status(401).render('login', { error: 'Login Failed! Invalid Email or Password!' });
                break;
            default:
                console.log('Login error: ', err);
                res.status(500).render('login', { error: 'Login Failed! Server error.' });
                break;
        }
    });
}

/**
 * Handles user registration.
 * Responds with status 200 if registration is successful.
 * Responds with status 400 if registration fails.
 * Responds with status 500 if there is a server error.
 * 
 * @param {Object} req - The request object.
 * @param {string} req.body.email - The user's email.
 * @param {string} req.body.name - The user's name.
 * @param {string} req.body.pass - The user's password.
 * @param {string} req.body.confirm_pass - The user's password confirmation.
 * @param {string} req.body.birth_date - The user's birth date.
 * @param {string} req.body.gender - The user's gender.
 * @param {Object} res - The response object.
 */
exports.register = function (req, res) {
    var email = req.body.email;
    var name = req.body.name;
    var pass = req.body.pass;
    var confirm_pass = req.body.confirm_pass;
    var birth_date = req.body.birth_date;
    var gender = req.body.gender;

    // Sprawdzanie zgodności haseł
    if (pass !== confirm_pass) {
        return res.status(400).render('register', { error: 'Passwords do not match!' });
    }

    user_model.register(email, name, pass, birth_date, gender).then(() => {
        res.status(200).redirect('/user/login')
    }).catch(err => {
        switch (err.message) {
            case 'email already exists':
                res.status(400).render('register', { error: 'Registration Failed! Email already exists!' });
                break;
            case 'name already exists':
                res.status(400).render('register', { error: 'Registration Failed! Name already exists!' });
                break;
            case 'email too short':
                res.status(400).render('register', { error: 'Registration Failed! Email too short!' });
                break;
            case 'name too short':
                res.status(400).render('register', { error: 'Registration Failed! Name too short!' });
                break;
            case 'pass too short':
                res.status(400).render('register', { error: 'Registration Failed! Password too short!' });
                break;
            case 'value too long':
                res.status(400).render('register', { error: 'Registration Failed! Value too long!' });
                break;
            case 'user age':
                res.status(400).render('register', { error: 'Registration Failed! User age is less than 16 years!' });
                break;
            default:
                console.log('Registration error: ', err);
                res.status(500).render('register', { error: 'Registration Failed! Server error.' });
                break;
        }
    });
}

/**
 * Clears the cookies related to user session and authentication.
 * @param {Object} res - The response object.
 */
function clearCookies(res) {
    res.clearCookie('session_id');
    res.clearCookie('logged_in');
    res.clearCookie('jwt_access_token');
    res.clearCookie('jwt_refresh_token');
}

/**
 * Handles user logout.
 * Clears user data and jwt tokens from cookies. Deletes session on server.
 * Responds with status 200.
 * 
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
exports.logout = function (req, res) {
    clearCookies(res);
    req.session_cache.del(req.session_id);
    res.status(200).redirect('/');
}

/**
 * Refreshes the JWT access token.
 * Responds with status 200 if the token is refreshed successfully.
 * Responds with status 403 if the token is missing.
 * Responds with status 403 if the token is invalid.
 * Responds with status 500 if there is a server error.
 * 
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
exports.refresh_jwt = function (req, res) {
    try {
        var refresh_token = req.cookies.jwt_refresh_token;
        if (refresh_token === undefined) {
            clearCookies(res);
            return res.status(403).send('no token');
        }
        jwt.verify(refresh_token, jwt_cfg.REFRESH_TOKEN_SECRET, (err, user) => {
            if (err) {
                clearCookies(res);
                return res.status(403).send('invalid token');
            }
            let jwt_access_token = jwt.sign(
                user,
                jwt_cfg.ACCESS_TOKEN_SECRET,
            );
            res.cookie('jwt_access_token',
                jwt_access_token,
                { maxAge: jwt_cfg.ACCESS_TOKEN_TTL, httpOnly: true, secure: true, sameSite: 'Strict' });
            return res.status(200).send('ok');
        });
    } catch (err) {
        console.log('refresh_jwt error: ', err);
        return res.status(500).send('server error');
    }
}

exports.refresh_jwt_fail = function (req, res) {
    return res.status(200).render('login', { error: 'Proszę zalogować się ponownie. Sesja wygasła.' });
}
