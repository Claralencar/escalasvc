const db = require("../database/db")

exports.listarAlunos = (req, res) => {
    db.query("SELECT * FROM alunos", (err, results) => {
        if (err) {
            res.status(500).json(err);
        } else {
            res.json(results);
        }
    });
};

exports.criarAlunos = (req, res) => {
    const aluno = req.body;

    const sql = `
    INSERT INTO alunos (matricula, nome_guerra, nome_completo, turma, segmento, funcao, estado_saude, email_institucional)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(sql, 
        [aluno.matricula, aluno.nome_guerra, aluno.nome_completo, aluno.turma, aluno.segmento, aluno.funcao, aluno.estado_saude, aluno.email_institucional], 
        (err, result) => {
            if(err) {
                res.status(500).json(err);
            } else {
                res.json({message: "Aluno criado com sucesso"});
            }
        });
};