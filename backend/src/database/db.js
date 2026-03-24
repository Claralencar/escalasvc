const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: "mysql",
    user: "root",
    password: "servicou",
    database: "escala_db"
});

connection.connect((err) => {
    if (err) {
        console.error("MySQL ainda não iniciou. Tentando novamente em 5 segundos...", err);
    } else {
        console.log("Conectado ao MySQL");
    }
});

module.exports = connection;