import React from "react";

function AlunoList({ alunos, onEdit, onDelete }) {
  return (
    <div className="table-responsive">
      <table className="alunos-table">
        <thead>
          <tr>
            <th>Matrícula</th>
            <th>Nome de Guerra</th>
            <th>Turma</th>
            <th>Segmento</th>
            <th>Função</th>
            <th>Saúde</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {alunos.map((aluno) => (
            <tr key={aluno.matricula}>
              <td>{aluno.matricula}</td>
              <td className="nome-guerra-cell">{aluno.nome_guerra}</td>
              <td>{aluno.turma}</td>
              <td>
                <span className={`badge badge-${aluno.segmento?.toLowerCase()}`}>
                  {aluno.segmento}
                </span>
              </td>
              <td>{aluno.funcao}</td>
              <td>
                <span className={`badge badge-${aluno.estado_saude === "Apto" ? "apto" : "nao-apto"}`}>
                  {aluno.estado_saude}
                </span>
              </td>
              <td>
                <button className="btn-icon" onClick={() => onEdit(aluno)}>Editar</button>
                <button className="btn-icon" onClick={() => onDelete(aluno.matricula)} style={{ color: "#ef4444" }}>Excluir</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AlunoList;