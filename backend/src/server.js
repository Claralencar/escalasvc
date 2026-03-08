const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/status", (req, res) => {
  res.json({
    status: "API funcionando",
    timestamp: new Date()
  });
});

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

const alunosRoutes = require("./routes/alunos");
app.use("/alunos", alunosRoutes);