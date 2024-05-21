/**
 * Middleware function for user authentication.
 * Checks if the user is logged in before routes are processed.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 */
const user_auth = function (req, res, next) {
    const token = req.cookies.jwt_access_token;
    req.user = { is_guest: true };
    if (token) {
        req.app.jwt.verify(token, req.app.jwt_cfg.ACCESS_TOKEN_SECRET, (err, user) => {
            if (!err) {
                req.user = user;
            }
        });
    }
    next();
}

module.exports = user_auth;