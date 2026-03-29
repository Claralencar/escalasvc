const API_URL = "http://localhost:3000/alunos";

export async function listarAlunos() {
  const response = await fetch(API_URL);
  if (!response.ok) {
    throw new Error("Erro ao listar alunos");
  }
  return response.json();
}

export async function criarAluno(aluno) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(aluno),
  });

  if (!response.ok) {
    throw new Error("Erro ao criar aluno");
  }

  return response.json();
}

export async function atualizarAluno(matricula, aluno) {
  const response = await fetch(`${API_URL}/${matricula}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(aluno),
  });

  if (!response.ok) {
    throw new Error("Erro ao atualizar aluno");
  }

  return response.json();
}

export async function excluirAluno(matricula) {
  const response = await fetch(`${API_URL}/${matricula}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Erro ao excluir aluno");
  }

  return response.json();
}