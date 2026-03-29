import { useEffect, useState } from "react";
import AlunoForm from "../components/AlunoForm";
import AlunoList from "../components/AlunoList";
import {
  listarAlunos,
  criarAluno,
  atualizarAluno,
  excluirAluno,
} from "../services/alunoService";

function CadastroAlunos() {
  const [alunos, setAlunos] = useState([]);
  const [alunoEmEdicao, setAlunoEmEdicao] = useState(null);
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");

  async function carregarAlunos() {
    try {
      const dados = await listarAlunos();
      setAlunos(dados);
      setErro("");
    } catch (error) {
      setErro("Não foi possível carregar os alunos.");
    }
  }

  useEffect(() => {
    carregarAlunos();
  }, []);

  async function handleSubmit(formData) {
    try {
      if (alunoEmEdicao) {
        await atualizarAluno(alunoEmEdicao.matricula, formData);
        setMensagem("Aluno atualizado com sucesso.");
      } else {
        await criarAluno(formData);
        setMensagem("Aluno cadastrado com sucesso.");
      }

      setAlunoEmEdicao(null);
      setErro("");
      carregarAlunos();
    } catch (error) {
      setErro("Erro ao salvar aluno.");
    }
  }

  async function handleDelete(matricula) {
    const confirmar = window.confirm("Deseja realmente excluir este aluno?");
    if (!confirmar) return;

    try {
      await excluirAluno(matricula);
      setMensagem("Aluno excluído com sucesso.");
      setErro("");
      carregarAlunos();
    } catch (error) {
      setErro("Erro ao excluir aluno.");
    }
  }

  function handleEdit(aluno) {
    setAlunoEmEdicao(aluno);
    setMensagem("");
    setErro("");
  }

  function cancelarEdicao() {
    setAlunoEmEdicao(null);
  }

  return (
    <div className="container">
      <h1>F1 - Cadastro de Alunos da Escala</h1>

      {mensagem && <p className="mensagem sucesso">{mensagem}</p>}
      {erro && <p className="mensagem erro">{erro}</p>}

      <AlunoForm
        onSubmit={handleSubmit}
        alunoEmEdicao={alunoEmEdicao}
        cancelarEdicao={cancelarEdicao}
      />

      <AlunoList
        alunos={alunos}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}

export default CadastroAlunos;