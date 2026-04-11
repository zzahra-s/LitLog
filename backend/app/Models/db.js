const sql = require('mssql');
const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_NAME,
    options: {  
        encrypt: false,
        trustServerCertificate: true
    }
};

sql.connect(config)
    .then(() => console.log("Connected to SQL Server"))
    .catch(err => console.log("DB Connection Failed:", err));

module.exports = sql;