const express = require("express");
const router = express.Router();

const alunosController = require("../controllers/alunosController");

router.get("/", alunosController.listarAlunos);
router.post("/", alunosController.criarAlunos);

module.exports = router;