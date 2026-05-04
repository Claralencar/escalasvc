const express = require("express");
const cors = require("cors");
const alunosRoutes = require("./routes/alunos");
const escalasRoutes = require("./routes/escalas");

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
app.use("/escalas", escalasRoutes);

const PORT = 3000;

// O segundo parâmetro '0.0.0.0' é fundamental para aceitar conexões externas
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor rodando em http://192.168.1.102:${PORT}`);
});