function AlunoList({ alunos, onEdit, onDelete }) {
  return (
    <div className="aluno-list">
      <h2>Lista de Alunos</h2>

      <div className="table-responsive">
        <table className="alunos-table">
          <thead>
            <tr>
              <th>Matrícula</th>
              <th>Nome de Guerra</th>
              <th>Nome Completo</th>
              <th>Turma</th>
              <th>Segmento</th>
              <th>Função</th>
              <th>Estado de Saúde</th>
              <th>E-mail Institucional</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {alunos.length === 0 ? (
              <tr>
                <td colSpan="9" style={{ textAlign: "center" }}>
                  Nenhum aluno cadastrado.
                </td>
              </tr>
            ) : (
              alunos.map((aluno) => (
                <tr key={aluno.matricula}>
                  <td>{aluno.matricula}</td>
                  <td>{aluno.nome_guerra}</td> {/* Ajustado */}
                  <td>{aluno.nome_completo}</td> {/* Ajustado */}
                  <td>{aluno.turma}</td>
                  <td>{aluno.segmento}</td>
                  <td>{aluno.funcao}</td>
                  <td>{aluno.estado_saude}</td> {/* Ajustado */}
                  <td>{aluno.email_institucional}</td> {/* Ajustado */}
                  <td>
                    <div className="form-buttons">
                      <button onClick={() => onEdit(aluno)}>Editar</button>
                      <button
                        className="btn-excluir"
                        onClick={() => onDelete(aluno.matricula)}
                      >
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AlunoList;