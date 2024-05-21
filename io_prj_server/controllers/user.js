/**
 * Handles user login.
 * Stores user data and jwt tokens in cookies.
 * Responds with status 200 if login is successful.
 * Responds with status 401 if login fails.
 * Responds with status 500 if there is a server error.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
exports.login = async function (req, res) {
    var email = req.body.email;
    var pass = req.body.pass;
    try {
        user = await user_model.login(email, pass)
        if (user) {
            res.cookie('user',
                JSON.stringify(user),
                { maxAge: jwt_cfg.ACCESS_TOKEN_TTL, httpOnly: true, secure: true, sameSite: 'Strict' });
            res.cookie('jwt_access_token',
                jwt.sign(
                    user,
                    jwt_cfg.ACCESS_TOKEN_SECRET,
                    { expiresIn: jwt_cfg.ACCESS_TOKEN_TTL }
                ),
                { maxAge: jwt_cfg.ACCESS_TOKEN_TTL, httpOnly: true, secure: true, sameSite: 'Strict' });
            res.cookie('jwt_refresh_token',
                jwt.sign(
                    user,
                    jwt_cfg.REFRESH_TOKEN_SECRET,
                    { expiresIn: jwt_cfg.REFRESH_TOKEN_TTL }
                ),
                { maxAge: jwt_cfg.REFRESH_TOKEN_TTL, httpOnly: true, secure: true, sameSite: 'Strict' });
            res.status(200).json({ success: true });
        } else {
            res.status(401).json({ success: false, message: 'Login Failed! Invalid Email or Password!' });
        }
    } catch (err) {
        console.log('Login error: ', err);
        res.status(500).json({ success: false, message: 'Login Failed! Server error.' });
    }
}

/**
 * Handles user registration.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
exports.register = async function (req, res) {
    // Add code for user registration here
}