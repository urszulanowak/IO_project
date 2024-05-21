const sql = require('mssql');
const db_cfg = require('@config/db_cfg.json');

// database connection
new sql.ConnectionPool(db_cfg).connect().then(db => {
    console.log('Connected to SQL Server')
    module.exports = db;
}).catch(err => {
    console.log('Database Connection Failed!')
    throw err;
});
