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
        '^@models/project_tag$': '../models/project_tag.js'
    },
};