const express = require("express");
const router = express.Router();

const escalasController = require("../controllers/escalasController")

router.get("/", escalasController.listarEscalas);
router.post("/", escalasController.criarEscalas);

module.exports = router;