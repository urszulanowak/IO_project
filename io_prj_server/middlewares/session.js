var jwt_cfg = require('@config/jwt_cfg');
var Cache = require('@utility/cache');

var session_cache = new Cache(jwt_cfg.ACCESS_TOKEN_TTL);

function next_session_id() {
    while (true) {
        const session_id = Math.random().toString(36).substring(2);
        if (!session_cache.exists(session_id)) {
            return session_id;
        }
    }
}

/**
 * Middleware function for session identification.
 * Checks if the user or quest has active session before routes are processed.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 */
const user_auth = function (req, res, next) {
    if (req.cookies.session_id === undefined) {
        req.cookies.session_id = next_session_id();
        res.cookie('session_id', req.cookies.session_id, { maxAge: jwt_cfg.ACCESS_TOKEN_TTL, httpOnly: true, secure: true, sameSite: 'Strict' });
        session_cache.set(req.cookies.session_id, {}, jwt_cfg.ACCESS_TOKEN_TTL);
    }
    req.session_id = req.cookies.session_id;
    req.session = session_cache.get(req.cookies.session_id);
    req.session_cache = session_cache;
    next();
}

module.exports = user_auth;