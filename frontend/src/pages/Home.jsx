import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Home = () => {
  const [alunos, setAlunos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Chamada para o seu backend Node.js que está na porta 3000
    axios.get('http://localhost:3000/alunos')
      .then(response => {
        setAlunos(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error("Erro ao buscar dados:", error);
        setLoading(false);
      });
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h1>Bem-vindo ao Auto Escala</h1>
      <p>Status da API: {loading ? 'Carregando...' : 'Conectado'}</p>

      <h2>Lista de Alunos (Dados da API):</h2>
      {alunos.length > 0 ? (
        <ul>
          {alunos.map(aluno => (
            <li key={aluno.id}>{aluno.nome_guerra} - {aluno.turma}</li>
          ))}
        </ul>
      ) : (
        <p>Nenhum aluno encontrado ou API offline.</p>
      )}
    </div>
  );
};

export default Home;