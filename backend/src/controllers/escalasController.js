const db = require("../database/db")

exports.listarEscalas = (req, res) => {
    db.query("SELECT * FROM escalas", (err, results) => {
        if (err) {
            res.status(500).json(err);
        } else {
            res.json(results);
        }
    });
};

exports.criarEscalas = async (req, res) => {
    // Desestruturamos usando os nomes que virão do frontend
    const { nome_escala, cor, segmento_participante, regra_ordenacao } = req.body;

    try {
        const query = `
      INSERT INTO escalas (nome_escala, cor, segmento_participante, regra_ordenacao) 
      VALUES (?, ?, ?, ?)
    `;

        await db.query(query, [
            nome_escala,
            cor.toLowerCase(), // Garantimos que vá minúsculo para o ENUM
            segmento_participante.toLowerCase(), // Garantimos minúsculo
            regra_ordenacao
        ]);

        res.status(201).json({ message: "Escala criada com sucesso!" });
    } catch (error) {
        console.error("Erro no DB:", error);
        res.status(500).json({ error: "Erro ao criar escala no banco" });
    }
};

exports.deletarEscalas = (req, res) => {
    const id = req.params.id;

    const sql = `DELETE FROM escalas WHERE id = ?`;

    db.query(sql, [id], (err, result) => {
        if (err) {
            res.status(500).json(err);
        } else if (result.affectedRows === 0) {
            res.status(404).json({ message: "Escala não escontrada" });
        } else {
            res.json({ message: "Escala deletada com sucesso" });
        }
    });
};