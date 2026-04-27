import { useEffect, useState } from "react";
import { useSignal } from "@preact/signals-react";
import "./Escala.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const diasSemana = [
  { sigla: "DOM", dia: "0", indexJS: 0, fimDeSemana: true },
  { sigla: "SEG", dia: "1", indexJS: 1 },
  { sigla: "TER", dia: "2", indexJS: 2 },
  { sigla: "QUA", dia: "3", indexJS: 3 },
  { sigla: "QUI", dia: "4", indexJS: 4 },
  { sigla: "SEX", dia: "5", indexJS: 5 },
  { sigla: "SÁB", dia: "6", indexJS: 6, fimDeSemana: true }
];

function Escala() {
  const escalasConfig = useSignal([]); 
  const cronogramaGerado = useSignal([]); 
  
  // Voltando os selects para o useState padrão do React para garantir a atualização visual
  const [escalaPretaSelecionada, setEscalaPretaSelecionada] = useState("");
  const [escalaVermelhaSelecionada, setEscalaVermelhaSelecionada] = useState("");
  
  const [statusApi, setStatusApi] = useState("Carregando...");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    async function carregar() {
      try {
        setCarregando(true);
        const resStatus = await fetch(`${API_URL}/status`);
        const resEscalas = await fetch(`${API_URL}/escalas`);

        if (!resStatus.ok) throw new Error("Erro ao consultar status");
        
        const dadosStatus = await resStatus.json();
        setStatusApi(dadosStatus.status || "API funcionando");

        if (resEscalas.ok) {
            const dadosEscalas = await resEscalas.json();
            escalasConfig.value = Array.isArray(dadosEscalas) ? dadosEscalas : [];
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

  const handleGerarEscala = async () => {
    // Validação com as variáveis de estado normais
    if (!escalaPretaSelecionada && !escalaVermelhaSelecionada) {
        alert("Por favor, selecione pelo menos uma Escala Preta ou Vermelha antes de gerar.");
        return;
    }

    try {
      setErro("");
      setCarregando(true);
      
      const payload = {
          escalaPretaId: escalaPretaSelecionada,
          escalaVermelhaId: escalaVermelhaSelecionada
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
      const dataItem = new Date(item.data);
      return dataItem.getDay() === indexJS;
    });
  };

  // Filtra as opções para popular os Selects do frontend
  const escalasPretas = escalasConfig.value.filter(e => e.cor === 'preta');
  const escalasVermelhas = escalasConfig.value.filter(e => e.cor === 'vermelha');

  return (
    <div className="escala-layout">
      <main className="escala-content">
        <div className="topo">
          <div>
            <h2>Gerar Escala</h2>
            <p>Selecione as escalas desejadas e gere o aditamento</p>
          </div>

          <div className="acoes-topo">
            <button className="btn-secundario" onClick={handleGerarEscala} disabled={carregando}>
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
                        <small>{escala.escala}</small><br/>
                        <strong>{escala.aluno}</strong>
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