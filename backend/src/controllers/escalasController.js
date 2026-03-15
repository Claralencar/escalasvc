const db = require("../database/db")

exports.listarEscalas = (req,res) => {
    db.query("SELECT * FROM escalas", (err, results) => {
        if(err) {
            res.status(500).json(err);
        } else {
            res.json(results);
        }
    });
};

exports.criarEscalas = (req, res) => {
    const escala = req.body;

    const sql = `
    INSERT INTO escalas (nome_escala, cor, segmento_participante, regra_ordenacao)
    VALUES(?, ?, ?, ?)`;

    db.query(sql,
        [escala.nome_escala, escala.cor, escala.segmento_participante, escala.regra_ordenacao],
        (err, result) => {
            if(err) {
                res.status(500),json(err);
            } else {
                res.json({message: "Escala criada com sucesso"})
            }
        }
    );
};