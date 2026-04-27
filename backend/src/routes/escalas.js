const express = require("express");
const router = express.Router();
const escalasController = require("../controllers/escalasController");

// Rotas Base
router.get("/", escalasController.listarEscalas);
router.post("/", escalasController.criarEscalas);
router.delete("/:id", escalasController.deletarEscalas);

// Rotas da Funcionalidade F3
router.post("/gerar", escalasController.gerarEscalaAutomatica);
router.get("/pdf", escalasController.baixarPdfAditamento);
router.post("/enviar", escalasController.enviarEmailAditamento);

module.exports = router;