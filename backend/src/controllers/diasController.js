const db = require("../database/db");

exports.listarDias = async (req, res) => {
    try {
        const [results] = await db.promise().query("SELECT * FROM escala_dias_semana");
        res.json(results);
    } catch (err) {
        console.error("Erro ao listar dias:", err);
        res.status(500).json({ error: "Erro ao buscar dias no banco de dados" });
    }
};

exports.criarDias = async (req, res) => {
    const dia = req.body;

    const sql = `
    INSERT INTO escala_dias_semana (escala_id, dia_semana)
    VALUES (?, ?)
    `;

    try {
        await db.promise().query(sql, [dia.escala_id, dia.dia_semana]);

        res.status(201).json({ message: "Relação escala - dia da semana criada com sucesso" });
    } catch (err) {
        console.error("Erro ao criar dia:", err);
        res.status(500).json({ error: "Erro ao criar relação no banco de dados" });
    }
};

exports.deletarDias = async (req, res) => {
    const id = req.params.id;
    const sql = `DELETE FROM escala_dias_semana WHERE id = ?`;

    try {
        const [result] = await db.promise().query(sql, [id]);

        if (result.affectedRows === 0) {
            res.status(404).json({ message: "Relação escala - dia da semana não encontrada" });
        } else {
            res.json({ message: "Relação escala - dia da semana deletada com sucesso" });
        }
    } catch (err) {
        console.error("Erro ao deletar dia:", err);
        res.status(500).json({ error: "Erro ao deletar relação no banco de dados" });
    }
};