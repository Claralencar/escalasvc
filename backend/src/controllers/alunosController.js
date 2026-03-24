const db = require("../database/db");

exports.listarAlunos = async (req, res) => {
    try {
        const [results] = await db.promise().query("SELECT * FROM alunos");
        res.json(results);
    } catch (err) {
        console.error("Erro ao listar alunos:", err);
        res.status(500).json({ error: "Erro ao buscar alunos no banco de dados" });
    }
};

exports.criarAlunos = async (req, res) => {
    const aluno = req.body;

    const sql = `
    INSERT INTO alunos (matricula, nome_guerra, nome_completo, turma, segmento, funcao, estado_saude, email_institucional)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    try {
        await db.promise().query(sql, [
            aluno.matricula,
            aluno.nome_guerra,
            aluno.nome_completo,
            aluno.turma,
            aluno.segmento,
            aluno.funcao,
            aluno.estado_saude,
            aluno.email_institucional
        ]);

        res.status(201).json({ message: "Aluno criado com sucesso" });
    } catch (err) {
        console.error("Erro ao criar aluno:", err);
        res.status(500).json({ error: "Erro ao criar aluno no banco de dados" });
    }
};

exports.deletarAlunos = async (req, res) => {
    const matricula = req.params.matricula;
    const sql = `DELETE FROM alunos WHERE matricula = ?`;

    try {
        const [result] = await db.promise().query(sql, [matricula]);

        if (result.affectedRows === 0) {
            res.status(404).json({ message: "Aluno(a) não encontrado" });
        } else {
            res.json({ message: "Aluno(a) deletado com sucesso" });
        }
    } catch (err) {
        console.error("Erro ao deletar aluno:", err);
        res.status(500).json({ error: "Erro ao deletar aluno no banco de dados" });
    }
};