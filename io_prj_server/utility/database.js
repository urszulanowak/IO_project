const sql = require('mssql');
const db_cfg = require('@config/db_cfg.json');

// database connection
try {
    const pool = new sql.ConnectionPool(db_cfg);
    pool.connect().then(() => {
        console.log('Connected to SQL Server');
        module.exports.pool = pool;
        module.exports.sql = sql;
        module.exports.Request = function () {
            return new sql.Request(pool);
        }
        module.exports.Transaction = function () {
            return new sql.Transaction(pool);
        }
        module.exports.PreparedStatement = function () {
            return new sql.PreparedStatement(pool);
        }
    });
} catch (err) {
    console.log('Database Connection Failed!')
    throw err;
}
