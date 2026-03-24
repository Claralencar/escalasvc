import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css'; // Opcional, caso tenha estilos específicos para a home

const Home = () => {
  return (
    <div className="home-container">
      <h1>Bem-vindo ao Sistema de Escalas</h1>
      <p>Selecione uma das opções abaixo para começar:</p>

      <div className="menu-opcoes">
        {/* Botão para Configurar Escalas (F2) */}
        <Link to="/cadastro-escala" className="btn-menu">
          Configurar Regras de Escala
        </Link>

        {/* Botão para Lista de Alunos */}
        <Link to="/alunos" className="btn-menu">
          Ver Lista de Alunos
        </Link>

        {/* NOVO Botão para a Aba de Geração/Visualização da Escala */}
        <Link to="/escala" className="btn-menu btn-destaque">
          Visualizar / Gerar Escalas
        </Link>
      </div>
    </div>
  );
};

export default Home;