const mysql = require('mysql2/promise');

const db = mysql.createPool({
    host: process.env.DB_HOST || 'mysql',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'escala_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Se quiser testar se conectou de verdade (usando Promise em vez de callback)
db.getConnection()
    .then(conn => {
        console.log("Conectado ao MySQL com sucesso!");
        conn.release();
    })
    .catch(err => {
        console.error("Erro ao conectar no banco:", err);
    });

// Função para tentar conectar com retry
async function conectarComRetry() {
    try {
        const conn = await db.getConnection();
        console.log("Conectado ao MySQL com sucesso!");
        conn.release();
    } catch (err) {
        console.error("Banco ainda não está pronto... tentando novamente em 5 segundos.");
        setTimeout(conectarComRetry, 5000); // Tenta novamente após 5s
    }
}

conectarComRetry();

module.exports = db;