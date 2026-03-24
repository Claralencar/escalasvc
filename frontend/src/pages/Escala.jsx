import { useEffect, useState } from "react";
import "./Escala.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3000";

const diasSemana = [
  { sigla: "SEG", dia: "24" },
  { sigla: "TER", dia: "25" },
  { sigla: "QUA", dia: "26" },
  { sigla: "QUI", dia: "27" },
  { sigla: "SEX", dia: "28" },
  { sigla: "SÁB", dia: "01", fimDeSemana: true },
  { sigla: "DOM", dia: "02", fimDeSemana: true }
];

function Escala() {
  const [escalas, setEscalas] = useState([]);
  const [statusApi, setStatusApi] = useState("Carregando...");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function carregar() {
      try {
        setCarregando(true);
        setErro("");

        const [resStatus, resEscalas] = await Promise.all([
          fetch(`${API_URL}/status`),
          fetch(`${API_URL}/escalas`)
        ]);

        if (!resStatus.ok) throw new Error("Erro ao consultar /status");
        if (!resEscalas.ok) throw new Error("Erro ao consultar /escalas");

        const dadosStatus = await resStatus.json();
        const dadosEscalas = await resEscalas.json();

        setStatusApi(dadosStatus.status || "API funcionando");
        setEscalas(Array.isArray(dadosEscalas) ? dadosEscalas : []);
      } catch (e) {
        console.error(e);
        setErro("Não foi possível carregar os dados da API.");
        setStatusApi("API indisponível");
      } finally {
        setCarregando(false);
      }
    }

    carregar();
  }, []);

  return (
    <div className="escala-layout">
      <aside className="escala-sidebar">
        <div className="brand">
          <div className="brand-icon"></div>
          <div>
            <h1>ESCALA</h1>
            <p>SISTEMA DE ESCALAS</p>
          </div>
        </div>

        <nav className="menu">
          <button className="menu-item">Dashboard</button>
          <button className="menu-item">Alunos</button>
          <button className="menu-item">Configurar Escalas</button>
          <button className="menu-item active">Gerar Escala</button>
          <button className="menu-item">Baixados</button>
          <button className="menu-item">Sargenteante</button>
        </nav>

        <div className="sidebar-footer">Sargenteante Simplificado</div>
      </aside>

      <main className="escala-content">
        <div className="topo">
          <div>
            <h2>Gerar Escala</h2>
            <p>Visualize o calendário e gere o PDF do aditamento</p>
          </div>

          <div className="acoes-topo">
            <button className="btn-secundario">Baixar PDF</button>
            <button className="btn-primario">Enviar Aditamento</button>
          </div>
        </div>

        <div className="filtros">
          <select>
            <option>Semana Atual</option>
          </select>

          <select>
            <option>Todas as Escalas</option>
          </select>
        </div>

        <div className="barra-status">
          <span><strong>Status da API:</strong> {statusApi}</span>
          <span><strong>Total de escalas:</strong> {escalas.length}</span>
        </div>

        {erro && <div className="caixa-erro">{erro}</div>}

        <section className="calendario">
          {diasSemana.map((dia) => (
            <div
              key={`${dia.sigla}-${dia.dia}`}
              className={`coluna-dia ${dia.fimDeSemana ? "fim-semana" : ""}`}
            >
              <div className="cabecalho-dia">
                <span>{dia.sigla}</span>
                <strong>{dia.dia}</strong>
                <div className={`marca-dia ${dia.fimDeSemana ? "vermelha" : ""}`}></div>
              </div>

              <div className="corpo-dia">
                {carregando ? (
                  <div className="card-vazio">Carregando...</div>
                ) : escalas.length === 0 ? (
                  <div className="card-vazio">Nenhuma escala cadastrada</div>
                ) : (
                  escalas.slice(0, 3).map((escala, index) => (
                    <div key={escala.id || index} className="card-nome">
                      {escala.nome_escala || "Escala sem nome"}
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </section>

        <section className="card-informativo">
          <div className="icone-info"></div>
          <div>
            <h3>Envio Automático do Aditamento</h3>
            <p>
              O PDF será enviado automaticamente para o Comandante de Companhia,
              Sargenteante e demais responsáveis.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Escala;