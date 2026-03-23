const express = require("express");
const cors = require("cors");
const alunosRoutes = require("./routes/alunos");
const escalasRoutes = require("./routes/escalas"); // 1. ADICIONE ESTA LINHA

const app = express();

app.use(cors());
app.use(express.json());

// Rota de status
app.get("/status", (req, res) => {
  res.json({
    status: "API funcionando",
    timestamp: new Date()
  });
});

// Rotas da aplicação
app.use("/alunos", alunosRoutes);
app.use("/escalas", escalasRoutes); // 2. ADICIONE ESTA LINHA

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});