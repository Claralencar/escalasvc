import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Trash2, Plus, Settings } from 'lucide-react';
import './CadastroEscala.css';

// Array auxiliar para os checkboxes
const OPCOES_DIAS = [
  { value: 'segunda', label: 'Seg' },
  { value: 'terca', label: 'Ter' },
  { value: 'quarta', label: 'Qua' },
  { value: 'quinta', label: 'Qui' },
  { value: 'sexta', label: 'Sex' },
  { value: 'sabado', label: 'Sáb' },
  { value: 'domingo', label: 'Dom' }
];

const CadastroEscala = () => {
  const [escalas, setEscalas] = useState([]);

  // 1. Adicionamos 'dias_semana' ao estado inicial
  const [formData, setFormData] = useState({
    nome_escala: '',
    cor: 'preta',
    segmento_participante: 'todos',
    regra_ordenacao: 'nome_guerra_asc',
    dias_semana: ['segunda', 'terca', 'quarta', 'quinta', 'sexta'] // Padrão para escala preta
  });


  // 2. Lógica para mudar os dias automaticamente quando a cor muda
  const handleCorChange = (e) => {
    const novaCor = e.target.value;
    let novosDias = [];

    if (novaCor === 'preta') {
      novosDias = ['segunda', 'terca', 'quarta', 'quinta', 'sexta'];
    } else if (novaCor === 'vermelha') {
      novosDias = ['sabado', 'domingo'];
    }

    setFormData({
      ...formData,
      cor: novaCor,
      dias_semana: novosDias
    });
  };

  // 3. Função para marcar/desmarcar dias individuais manualmente
  const handleDiaToggle = (diaValue) => {
    setFormData((prev) => {
      const jaSelecionado = prev.dias_semana.includes(diaValue);
      if (jaSelecionado) {
        return { ...prev, dias_semana: prev.dias_semana.filter(d => d !== diaValue) };
      } else {
        return { ...prev, dias_semana: [...prev.dias_semana, diaValue] };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.dias_semana.length === 0) {
      alert("Por favor, selecione pelo menos um dia da semana.");
      return;
    }

    try {
      const dadosParaEnviar = {
        ...formData,
        cor: formData.cor.toLowerCase(),
        segmento_participante: formData.segmento_participante.toLowerCase()
      };

      await api.post('/escalas', dadosParaEnviar);
      alert("Escala configurada com sucesso!");

      setFormData({ ...formData, nome_escala: '' });
      carregarEscalas();
    } catch (error) {
      console.error("Erro na requisição:", error);
      alert("Erro ao guardar na base de dados.");
    }
  };

  useEffect(() => {
    carregarEscalas();
  }, []);

  const carregarEscalas = async () => {
    try {
      const response = await api.get('/escalas');
      setEscalas(response.data);
    } catch (error) {
      console.error("Erro ao buscar escalas:", error);
    }
  };


  const handleDelete = async (id) => {
    if (window.confirm("Deseja realmente excluir esta configuração?")) {
      try {
        await api.delete(`/escalas/${id}`);
        carregarEscalas();
      } catch (error) {
        alert("Erro ao excluir.");
      }
    }
  };

  return (
    <div className="escala-container">
      <header className="header-view">
        <h1><Settings className="icon" />Cadastro da Escala</h1>
      </header>

      <div className="main-content">
        <div className="config-section">
          <div className="card info-card">
            <h3>1. Associação de cores aos dias</h3>
            <div className="color-guide">
              <div className="guide-item">
                <span className="dot black"></span>
                <strong>Escala Preta:</strong> Segunda a sexta
              </div>
              <div className="guide-item">
                <span className="dot red"></span>
                <strong>Escala Vermelha:</strong> Sábados, domingos e feriados
              </div>
            </div>
          </div>

          <div className="card form-card">
            <h3>2. Configuração de Nova Escala</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-field">
                <label>Nome da Escala</label>
                <input
                  type="text"
                  value={formData.nome_escala}
                  onChange={(e) => setFormData({ ...formData, nome_escala: e.target.value })}
                  placeholder="Ex: PretaSeg Fem Perm"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-field">
                  <label>Cor Associada</label>
                  <select value={formData.cor} onChange={(e) => setFormData({ ...formData, cor: e.target.value })}>
                    <option value="preta">Preta</option>
                    <option value="vermelha">Vermelha</option>
                  </select>
                </div>
                <div className="form-field">
                  <label>Segmento (Participantes)</label>
                  <select
                    value={formData.segmento_participante}
                    onChange={(e) => setFormData({ ...formData, segmento_participante: e.target.value })}
                  >
                    <option value="todos">Todos</option>
                    <option value="masculino">Segmento Masculino</option>
                    <option value="feminino">Segmento Feminino</option>
                  </select>
                </div>
              </div>

              <div className="form-field">
                <label>Regra de Ordenação</label>
                <select
                  value={formData.regra_ordenacao}
                  onChange={(e) => setFormData({ ...formData, regra_ordenacao: e.target.value })}
                >
                  <option value="alfabetica_guerra">Alfabética por nome de guerra</option>
                  <option value="anti_alfabetica_guerra">Anti-alfabética por nome de guerra</option>
                  <option value="alfabetica_completo">Alfabética por nome completo</option>
                  <option value="anti_alfabetica_completo">Anti-alfabética por nome completo</option>
                  <option value="alfabetica_matricula">Alfabética por matrícula</option>
                  <option value="anti_alfabetica_matricula">Anti-alfabética por matrícula</option>
                </select>
              </div>

              <button type="submit" className="btn-save">
                <Plus size={18} /> Adicionar Configuração
              </button>
            </form>
          </div>
        </div>

        <div className="list-section">
          <div className="card table-card">
            <h3>Escalas Ativas no Sistema</h3>
            <table>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Cor</th>
                  <th>Segmento</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {escalas.map((esc) => (
                  <tr key={esc.id}>
                    <td>{esc.nome_escala}</td>
                    <td>
                      <span className={`tag ${esc.cor}`}>
                        {esc.cor.charAt(0).toUpperCase() + esc.cor.slice(1)}
                      </span>
                    </td>
                    <td>{esc.segmento_participante.charAt(0).toUpperCase() + esc.segmento_participante.slice(1)}</td>
                    <td>
                      <button onClick={() => handleDelete(esc.id)} className="btn-icon-delete">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CadastroEscala;