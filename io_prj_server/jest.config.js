// jest.config.js
module.exports = {
    moduleNameMapper: {
        '^@utility/database$': '../utility/database.js',
        '^@modules/user$': '../models/user.js',
        '^@config/db_cfg.json$': '../config/db_cfg.json',
        '^@models/user$': '../models/user.js',
        '^@config/jwt_cfg$': '../config/jwt_cfg.json',
        '^@models/project$': '../models/project.js',
        '^@models/recommend$': '../models/recommend.js',
        '^@models/project_tag$': '../models/project_tag.js',
        '^@models/notification$': '../models/notification.js',
        '^@middlewares/user_auth$': './middlewares/user_auth.js',
        '^@middlewares/session$': './middlewares/session.js',
        '^@utility/cache$': '../utility/cache.js',
        '^@routes/index$': './routes/index.js',
        '^@routes/user$': './routes/user.js',
        '^@routes/project$': './routes/project.js',
        '^@controllers/user$': '../controllers/user.js',
        '^@controllers/project$': '../controllers/project.js',
        '^@controllers/notification$': '../controllers/notification.js',
    },
};