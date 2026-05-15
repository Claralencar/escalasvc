import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Trash2, Plus, Settings } from 'lucide-react';
import './CadastroEscala.css';

const CadastroEscala = () => {
  const [escalas, setEscalas] = useState([]);

  // Estado alinhado com o banco de dados e com os values dos <options>
  const [formData, setFormData] = useState({
    nome_escala: '',
    cor: 'preta',
    segmento_participante: 'todos',
    regra_ordenacao: 'nome_guerra_asc',
    cotas: {
      '1° ano': 0,
      '2° ano': 0,
      '3° ano': 0,
      '4° ano': 0,
      '5° ano': 0
    }
  });

  const handleCotaChange = (ano, valor) => {
    setFormData(prev => ({
      ...prev,
      cotas: {
        ...prev.cotas,
        [ano]: parseInt(valor) || 0
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const dadosParaEnviar = {
        ...formData,
        cor: formData.cor.toLowerCase(),
        segmento_participante: formData.segmento_participante.toLowerCase()
      };

      await api.post('/escalas', dadosParaEnviar);
      alert("Escala configurada com sucesso!");

      // Limpa formulário
      setFormData({
        nome_escala: '',
        cor: 'preta',
        segmento_participante: 'todos',
        regra_ordenacao: 'nome_guerra_asc',
        cotas: {
          '1° ano': 0,
          '2° ano': 0,
          '3° ano': 0,
          '4° ano': 0,
          '5° ano': 0
        }
      });
      carregarEscalas();
    } catch (error) {
      console.error("Erro na requisição:", error);
      alert("Erro ao criar escala no banco de dados.");
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
                  <option value="nome_guerra_asc">Alfabética por nome de guerra</option>
                  <option value="nome_guerra_desc">Anti-alfabética por nome de guerra</option>
                  <option value="nome_completo_asc">Alfabética por nome completo</option>
                  <option value="nome_completo_desc">Anti-alfabética por nome completo</option>
                  <option value="matricula_asc">Alfabética por matrícula</option>
                  <option value="matricula_desc">Anti-alfabética por matrícula</option>
                </select>
              </div>

              <div className="card quota-card" style={{ marginTop: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '8px' }}>
                <h4 style={{ marginBottom: '10px' }}>Quantos alunos de cada ano serão escalados nesses dias?</h4>
                <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '15px' }}>
                  <strong>{formData.cor === 'preta' ? 'Segunda a Sexta:' : 'Sábado e Domingo:'}</strong>
                </p>
                
                {['1° ano', '2° ano', '3° ano', '4° ano', '5° ano'].map(ano => (
                  <div key={ano} className="form-field" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <label style={{ margin: 0 }}>{ano}:</label>
                    <select 
                      style={{ width: '80px' }}
                      value={formData.cotas[ano]} 
                      onChange={(e) => handleCotaChange(ano, e.target.value)}
                    >
                      {[...Array(11).keys()].map(n => (
                        <option key={n} value={n}>{n}</option>
                      ))}
                    </select>
                  </div>
                ))}
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
                  <th>Regra de Ordenação</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {escalas.map((esc) => {
                  // Mapeamento das regras para exibição amigável
                  const regrasMap = {
                    'nome_guerra_asc': 'Alfabética (Guerra)',
                    'nome_guerra_desc': 'Anti-alfabética (Guerra)',
                    'nome_completo_asc': 'Alfabética (Completo)',
                    'nome_completo_desc': 'Anti-alfabética (Completo)',
                    'matricula_asc': 'Alfabética (Matrícula)',
                    'matricula_desc': 'Anti-alfabética (Matrícula)'
                  };

                  return (
                    <tr key={esc.id}>
                      <td>{esc.nome_escala}</td>
                      <td>
                        <span className={`tag ${esc.cor}`}>
                          {esc.cor.charAt(0).toUpperCase() + esc.cor.slice(1)}
                        </span>
                      </td>
                      <td>{esc.segmento_participante.charAt(0).toUpperCase() + esc.segmento_participante.slice(1)}</td>
                      <td>{regrasMap[esc.regra_ordenacao] || esc.regra_ordenacao}</td>
                      <td>
                        <button onClick={() => handleDelete(esc.id)} className="btn-icon-delete">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CadastroEscala;