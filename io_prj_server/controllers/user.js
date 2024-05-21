var jwt = require('jsonwebtoken');
var jwt_cfg = require('@config/jwt_cfg.json');
var user_model = require('@models/user');

exports.login = async function (req, res, next) {
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

exports.register = async function (req, res, next) {
}