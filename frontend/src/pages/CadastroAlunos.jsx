import React, { useState, useEffect } from 'react';
import api from '../services/api';
import './CadastroAlunos.css'; // Vamos criar um CSS para a tabela ficar bonita!

const CadastroAlunos = () => {
  const [alunos, setAlunos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');

  // Busca os alunos assim que o componente é montado na tela
  useEffect(() => {
    carregarAlunos();
  }, []);

  const carregarAlunos = async () => {
    try {
      setLoading(true);
      const response = await api.get('/alunos');
      setAlunos(response.data);
      setErro('');
    } catch (error) {
      console.error("Erro ao buscar alunos:", error);
      setErro('Não foi possível carregar a lista de alunos. Verifique a conexão com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Lista de Alunos</h1>

      {loading && <p>Carregando alunos...</p>}

      {erro && <p style={{ color: 'red' }}>{erro}</p>}

      {!loading && !erro && alunos.length === 0 && (
        <p>Nenhum aluno cadastrado no banco de dados ainda.</p>
      )}

      {!loading && !erro && alunos.length > 0 && (
        <div className="table-responsive">
          <table className="alunos-table">
            <thead>
              <tr>
                <th>Matrícula</th>
                <th>Nome de Guerra</th>
                <th>Nome Completo</th>
                <th>Turma</th>
                <th>Segmento</th>
              </tr>
            </thead>
            <tbody>
              {alunos.map((aluno) => (
                <tr key={aluno.matricula}>
                  <td>{aluno.matricula}</td>
                  <td>{aluno.nome_guerra}</td>
                  <td>{aluno.nome_completo}</td>
                  <td>{aluno.turma}</td>
                  {/* Capitalizando a primeira letra do segmento para ficar bonito */}
                  <td style={{ textTransform: 'capitalize' }}>{aluno.segmento}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CadastroAlunos;