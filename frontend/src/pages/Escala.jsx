import { useEffect, useState } from "react";
import { useSignal } from "@preact/signals-react";
import "./Escala.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// Array reordenado: Começa em SEG (1) e termina em DOM (0)
const diasSemana = [
  { sigla: "SEG", dia: "1", indexJS: 1 },
  { sigla: "TER", dia: "2", indexJS: 2 },
  { sigla: "QUA", dia: "3", indexJS: 3 },
  { sigla: "QUI", dia: "4", indexJS: 4 },
  { sigla: "SEX", dia: "5", indexJS: 5 },
  { sigla: "SÁB", dia: "6", indexJS: 6, fimDeSemana: true },
  { sigla: "DOM", dia: "0", indexJS: 0, fimDeSemana: true }
];

function Escala() {
  const escalasConfig = useSignal([]);
  const cronogramaGerado = useSignal([]);

  const [escalaPretaSelecionada, setEscalaPretaSelecionada] = useState("");
  const [escalaVermelhaSelecionada, setEscalaVermelhaSelecionada] = useState("");

  const [statusApi, setStatusApi] = useState("Carregando...");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  // Estados do Modal
  const [mostrarModalPartida, setMostrarModalPartida] = useState(false);
  const [alunosDisponiveis, setAlunosDisponiveis] = useState([]);
  const [pontosPartida, setPontosPartida] = useState({
    preta: { '1° ano': '', '2° ano': '', '3° ano': '', '4° ano': '', '5° ano': '' },
    vermelha: { '1° ano': '', '2° ano': '', '3° ano': '', '4° ano': '', '5° ano': '' }
  });

  useEffect(() => {
    async function carregar() {
      try {
        setCarregando(true);
        const resStatus = await fetch(`${API_URL}/status`);
        const resEscalas = await fetch(`${API_URL}/escalas`);
        const resAlunos = await fetch(`${API_URL}/alunos`);

        if (!resStatus.ok) throw new Error("Erro ao consultar status");

        const dadosStatus = await resStatus.json();
        setStatusApi(dadosStatus.status || "API funcionando");

        if (resEscalas.ok) {
          const dadosEscalas = await resEscalas.json();
          escalasConfig.value = Array.isArray(dadosEscalas) ? dadosEscalas : [];
        }

        if (resAlunos.ok) {
          const dadosAlunos = await resAlunos.json();
          // Filtra apenas alunos aptos e que não são comando para a lista do modal
          const aptos = dadosAlunos.filter(a => 
            String(a.estado_saude).toLowerCase().trim() === 'apto' && 
            String(a.funcao).toLowerCase().trim() !== 'sim' &&
            String(a.funcao).toLowerCase().trim() !== 's'
          );
          setAlunosDisponiveis(aptos);
        }
      } catch (e) {
        console.error(e);
        setStatusApi("API indisponível");
      } finally {
        setCarregando(false);
      }
    }
    carregar();
  }, []);

  const handleAbrirModal = () => {
    if (!escalaPretaSelecionada && !escalaVermelhaSelecionada) {
      alert("Por favor, selecione pelo menos uma Escala Preta ou Vermelha antes de gerar.");
      return;
    }
    setMostrarModalPartida(true);
  };

  const handleGerarEscala = async () => {
    try {
      setErro("");
      setCarregando(true);
      setMostrarModalPartida(false);

      const payload = {
        escalaPretaId: escalaPretaSelecionada,
        escalaVermelhaId: escalaVermelhaSelecionada,
        pontosPartida: pontosPartida
      };

      const res = await fetch(`${API_URL}/escalas/gerar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Erro ao gerar escala");

      cronogramaGerado.value = data.cronograma || [];

      if (cronogramaGerado.value.length === 0) {
        alert("Problema na geração! Certifique-se que o Segmento dos Alunos confere com o da Escala selecionada.");
      } else {
        alert("Escala da próxima semana gerada com sucesso!");
      }

    } catch (e) {
      setErro(e.message);
    } finally {
      setCarregando(false);
    }
  };

  const updatePontoPartida = (cor, turma, matricula) => {
    setPontosPartida(prev => ({
      ...prev,
      [cor]: {
        ...prev[cor],
        [turma]: matricula
      }
    }));
  };

  const handleBaixarPDF = () => {
    window.open(`${API_URL}/escalas/pdf`, '_blank');
  };

  const handleEnviarEmail = async () => {
    try {
      const res = await fetch(`${API_URL}/escalas/enviar`, { method: "POST" });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Erro ao enviar e-mail");
      alert("Aditamento enviado com sucesso para o Comandante e Sargenteante!");
    } catch (e) {
      alert(`Falha ao enviar e-mail: ${e.message}`);
    }
  };

  const getEscalasDoDia = (indexJS) => {
    return cronogramaGerado.value.filter(item => {
      const dataItem = new Date(item.data.replace(/-/g, '\/').split('T')[0]);
      return dataItem.getDay() === indexJS;
    });
  };

  const escalasPretas = escalasConfig.value.filter(e => e.cor === 'preta');
  const escalasVermelhas = escalasConfig.value.filter(e => e.cor === 'vermelha');

  const turmas = ['1° ano', '2° ano', '3° ano', '4° ano', '5° ano'];

  return (
    <div className="escala-layout">
      {/* MODAL DE PONTO DE PARTIDA */}
      {mostrarModalPartida && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>A partir de qual aluno a escala começa a rodar?</h3>
            
            <div className="modal-scroll-area">
              {escalaPretaSelecionada && (
                <div className="modal-section">
                  <h4>Escala Preta (Segunda a Sexta)</h4>
                  {turmas.map(turma => (
                    <div key={`preta-${turma}`} className="form-group-modal">
                      <label>{turma}:</label>
                      <select 
                        value={pontosPartida.preta[turma]} 
                        onChange={(e) => updatePontoPartida('preta', turma, e.target.value)}
                      >
                        <option value="">-- Próximo da lista --</option>
                        {alunosDisponiveis
                          .filter(a => a.turma === turma)
                          .sort((a, b) => (a.nome_completo || '').localeCompare(b.nome_completo || ''))
                          .map(a => (
                            <option key={a.matricula} value={a.matricula}>
                              {a.nome_completo} [{String(a.nome_guerra).toUpperCase()}]
                            </option>
                          ))
                        }
                      </select>
                    </div>
                  ))}
                </div>
              )}

              {escalaVermelhaSelecionada && (
                <div className="modal-section">
                  <h4>Escala Vermelha (Sábado e Domingo)</h4>
                  {turmas.map(turma => (
                    <div key={`vermelha-${turma}`} className="form-group-modal">
                      <label>{turma}:</label>
                      <select 
                        value={pontosPartida.vermelha[turma]} 
                        onChange={(e) => updatePontoPartida('vermelha', turma, e.target.value)}
                      >
                        <option value="">-- Próximo da lista --</option>
                        {alunosDisponiveis
                          .filter(a => a.turma === turma)
                          .sort((a, b) => (a.nome_completo || '').localeCompare(b.nome_completo || ''))
                          .map(a => (
                            <option key={a.matricula} value={a.matricula}>
                              {a.nome_completo} [{String(a.nome_guerra).toUpperCase()}]
                            </option>
                          ))
                        }
                      </select>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="modal-actions">
              <button className="btn-cancelar" onClick={() => setMostrarModalPartida(false)}>Cancelar</button>
              <button className="btn-confirmar" onClick={handleGerarEscala}>Confirmar e Gerar</button>
            </div>
          </div>
        </div>
      )}

      <main className="escala-content">
        <div className="topo">
          <div>
            <h2>Gerar Escala</h2>
            <p>Selecione as escalas desejadas e gere o aditamento</p>
          </div>

          <div className="acoes-topo">
            <button className="btn-secundario" onClick={handleAbrirModal} disabled={carregando}>
              {carregando ? "Gerando..." : "Gerar Automático"}
            </button>
            <button className="btn-secundario" onClick={handleBaixarPDF}>Baixar PDF</button>
            <button className="btn-primario" onClick={handleEnviarEmail}>Enviar Aditamento</button>
          </div>
        </div>

        <div className="filtros">
          <select
            value={escalaPretaSelecionada}
            onChange={(e) => setEscalaPretaSelecionada(e.target.value)}
          >
            <option value="">-- Selecione a Escala Preta --</option>
            {escalasPretas.map(e => <option key={e.id} value={e.id}>{e.nome_escala}</option>)}
          </select>

          <select
            value={escalaVermelhaSelecionada}
            onChange={(e) => setEscalaVermelhaSelecionada(e.target.value)}
          >
            <option value="">-- Selecione a Escala Vermelha --</option>
            {escalasVermelhas.map(e => <option key={e.id} value={e.id}>{e.nome_escala}</option>)}
          </select>
        </div>

        <div className="barra-status">
          <span><strong>Status da API:</strong> {statusApi}</span>
          <span><strong>Total de configurações ativas no banco:</strong> {escalasConfig.value.length}</span>
        </div>

        {erro && <div className="caixa-erro">{erro}</div>}

        <section className="calendario">
          {diasSemana.map((dia) => {
            const escalasNesteDia = getEscalasDoDia(dia.indexJS);

            return (
              <div key={dia.sigla} className={`coluna-dia ${dia.fimDeSemana ? "fim-semana" : ""}`}>
                <div className="cabecalho-dia">
                  <span>{dia.sigla}</span>
                  <div className={`marca-dia ${dia.fimDeSemana ? "vermelha" : ""}`}></div>
                </div>

                <div className="corpo-dia">
                  {carregando ? (
                    <div className="card-vazio">...</div>
                  ) : escalasNesteDia.length === 0 ? (
                    <div className="card-vazio">Livre</div>
                  ) : (
                    escalasNesteDia.map((escala, index) => (
                      <div key={index} className="card-nome" title={escala.nome_completo}>
                        <small>{escala.escala}</small><br />
                        <strong>{escala.nome_completo}</strong>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </section>

        <section className="card-informativo">
          <div className="icone-info"></div>
          <div>
            <h3>Envio Automático do Aditamento</h3>
            <p>
              O PDF gerado conterá a lista de serviços baseada nas escalas selecionadas acima.
              O e-mail será disparado automaticamente para os responsáveis designados.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Escala;