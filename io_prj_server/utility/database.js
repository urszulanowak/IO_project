const sql = require('mssql');
const db_cfg = require('@config/db_cfg.json');

// database connection
try {
    const pool = new sql.ConnectionPool(db_cfg);
    pool.connect().then(() => {
        console.log('Connected to SQL Server');
        module.exports.pool = pool;
        module.exports.sql = sql;
        module.exports.request = function () {
            return new sql.Request(pool);
        }
    });
} catch (err) {
    console.log('Database Connection Failed!')
    throw err;
}
