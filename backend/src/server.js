const express = require("express");
const cors = require("cors");

const alunosRoutes = require("./routes/alunos");
const escalasRoutes = require("./routes/escalas");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/status", (req, res) => {
  res.json({
    status: "API funcionando",
    timestamp: new Date()
  });
});

app.use("/alunos", alunosRoutes);
app.use("/escalas", escalasRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});