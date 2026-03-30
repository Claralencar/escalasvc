const express = require("express");
const router = express.Router();
const alunosController = require("../controllers/alunosController");

router.get("/", alunosController.listarAlunos);
router.post("/", alunosController.criarAlunos);
router.put("/:matricula", alunosController.atualizarAlunos); // <-- Rota nova adicionada
router.delete("/:matricula", alunosController.deletarAlunos);

module.exports = router;