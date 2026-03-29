function AlunoList({ alunos, onEdit, onDelete }) {
  return (
    <div className="aluno-list">
      <h2>Lista de Alunos</h2>

      <table>
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
              <td colSpan="9">Nenhum aluno cadastrado.</td>
            </tr>
          ) : (
            alunos.map((aluno) => (
              <tr key={aluno.matricula}>
                <td>{aluno.matricula}</td>
                <td>{aluno.nomeGuerra}</td>
                <td>{aluno.nomeCompleto}</td>
                <td>{aluno.turma}</td>
                <td>{aluno.segmento}</td>
                <td>{aluno.funcao}</td>
                <td>{aluno.estadoSaude}</td>
                <td>{aluno.emailInstitucional}</td>
                <td>
                  <button onClick={() => onEdit(aluno)}>Editar</button>
                  <button onClick={() => onDelete(aluno.matricula)}>Excluir</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default AlunoList;