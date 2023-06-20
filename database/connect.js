const mysql = require('mysql');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'test_nodejs'
});

connection.connect((err) => {
    if (err) {
        console.log("Error connecting to the database:", err);
        return;
    }
    console.log("Connected to the database");
});

module.exports = connection;