const db = require("../database/db");

exports.listarEscalas = async (req, res) => {
    try {
        // REMOVIDO O .promise()
        const [results] = await db.query("SELECT * FROM escalas");
        res.json(results);
    } catch (err) {
        console.error("Erro ao listar escalas:", err);
        res.status(500).json({ error: "Erro ao buscar escalas no banco de dados" });
    }
};

exports.criarEscalas = async (req, res) => {
    const { nome_escala, cor, segmento_participante, regra_ordenacao } = req.body;

    try {
        const query = `
      INSERT INTO escalas (nome_escala, cor, segmento_participante, regra_ordenacao) 
      VALUES (?, ?, ?, ?)
    `;
        // REMOVIDO O .promise()
        await db.query(query, [
            nome_escala,
            cor.toLowerCase(),
            segmento_participante.toLowerCase(),
            regra_ordenacao
        ]);

        res.status(201).json({ message: "Escala criada com sucesso!" });
    } catch (error) {
        console.error("Erro no DB:", error);
        res.status(500).json({ error: "Erro ao criar escala no banco" });
    }
};

exports.deletarEscalas = async (req, res) => {
    const id = req.params.id;
    const sql = `DELETE FROM escalas WHERE id = ?`;

    try {
        // REMOVIDO O .promise()
        const [result] = await db.query(sql, [id]);

        if (result.affectedRows === 0) {
            res.status(404).json({ message: "Escala não encontrada" });
        } else {
            res.json({ message: "Escala deletada com sucesso" });
        }
    } catch (err) {
        console.error("Erro ao deletar escala:", err);
        res.status(500).json({ error: "Erro ao deletar escala no banco de dados" });
    }
};