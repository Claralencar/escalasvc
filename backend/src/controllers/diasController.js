const db = require("../database/db")

exports.listarDias = (req, res) => {
    db.query("SELECT * FROM escala_dias_semana", (err, results) => {
        if (err) {
            res.status(500).json(err);
        } else {
            res.json(results);
        }
    });
};

exports.criarDias = (req, res) => {
    const dia = req.body;

    const sql = `
    INSERT INTO escala_dias_semana (escala_id, dia_semana)
    VALUES (?, ?)
    `;

    db.query(sql,
        [dia.escala_id, dia.dia_semana],
        (err, result) => {
            if (err) {
                res.status(500).json(err);
            } else {
                res.json({ message: "Relacao escala - dia da semana criada com sucesso" });
            }
        });
};

exports.deletarDias = (req, res) => {
    const id = req.params.id;

    const sql = `DELETE FROM escala_dias_semana WHERE id = ?`;

    db.query(sql, [id], (err, result) => {
        if (err) {
            res.status(500).json(err);
        } else if (result.affectedRows === 0) {
            res.status(404).json({ message: "Relacao escala - dia da semana não escontrada" });
        } else {
            res.json({ message: "Relacao escala - dia da semana deletada com sucesso" });
        }
    });
};