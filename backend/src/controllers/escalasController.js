const db = require("../database/db");
const PDFDocument = require("pdfkit");
const nodemailer = require("nodemailer");

// Regra estrita: a normalização (remoção de acentos) é aplicada apenas ao nome completo.
const normalizarNome = (nome) => {
    return nome ? nome.normalize("NFD").replace(/[\u0300-\u036f]/g, "") : nome;
};

exports.listarEscalas = async (req, res) => {
    try {
        const [escalas] = await db.query("SELECT * FROM escalas");
        const [cotas] = await db.query("SELECT * FROM escala_cotas_ano");

        const result = escalas.map(escala => {
            // Garantir que a comparação de ID seja feita com o mesmo tipo (String ou Number)
            const cotasDaEscala = cotas.filter(c => String(c.escala_id) === String(escala.id));
            const resumoCotas = {};
            cotasDaEscala.forEach(c => {
                resumoCotas[c.turma] = c.quantidade;
            });
            return { ...escala, cotas: resumoCotas };
        });

        res.json(result);
    } catch (err) {
        console.error("Erro ao listar escalas:", err);
        res.status(500).json({ error: "Erro ao buscar escalas no banco de dados" });
    }
};

exports.criarEscalas = async (req, res) => {
    const { nome_escala, cor, segmento_participante, regra_ordenacao, cotas } = req.body;

    try {
        console.log("--- NOVA REQUISIÇÃO DE CRIAÇÃO DE ESCALA ---");
        console.log("Body recebido:", JSON.stringify(req.body, null, 2));
        
        const query = `
          INSERT INTO escalas (nome_escala, cor, segmento_participante, regra_ordenacao) 
          VALUES (?, ?, ?, ?)
        `;

        const [result] = await db.query(query, [
            nome_escala,
            cor ? cor.toLowerCase() : 'preta',
            segmento_participante ? segmento_participante.toLowerCase() : 'todos',
            regra_ordenacao || 'nome_guerra_asc'
        ]);

        const escalaId = result.insertId;
        console.log("Escala inserida com ID:", escalaId);

        let dias_semana = (cor && cor.toLowerCase() === 'preta')
            ? ['segunda', 'terca', 'quarta', 'quinta', 'sexta']
            : ['sabado', 'domingo'];

        for (const dia of dias_semana) {
            await db.query(
                "INSERT INTO escala_dias_semana (escala_id, dia_semana) VALUES (?, ?)",
                [escalaId, dia]
            );
        }
        console.log("Dias da semana inseridos para ID:", escalaId);

        // Salvar as cotas por ano se fornecidas
        if (cotas && typeof cotas === 'object') {
            console.log("Processando cotas:", cotas);
            for (const [turma, quantidade] of Object.entries(cotas)) {
                const qtd = parseInt(quantidade);
                if (qtd > 0) {
                    console.log(`Tentando inserir cota: Escala=${escalaId}, Turma=${turma}, Qtd=${qtd}`);
                    const [cotaResult] = await db.query(
                        "INSERT INTO escala_cotas_ano (escala_id, turma, quantidade) VALUES (?, ?, ?)",
                        [escalaId, turma, qtd]
                    );
                    console.log("Resultado da inserção da cota:", cotaResult.affectedRows > 0 ? "SUCESSO" : "FALHA");
                } else {
                    console.log(`Pulando cota para ${turma} pois quantidade é ${quantidade}`);
                }
            }
        } else {
            console.log("AVISO: Nenhuma cota recebida ou formato inválido:", typeof cotas);
        }

        console.log("--- FIM DO PROCESSAMENTO DE CRIAÇÃO ---");
        res.status(201).json({ message: "Escala criada com sucesso!", id: escalaId });
    } catch (error) {
        console.error("ERRO CRÍTICO NO DB:", error);
        res.status(500).json({ error: "Erro ao criar escala no banco: " + error.message });
    }
};

exports.deletarEscalas = async (req, res) => {
    const id = req.params.id;
    try {
        const [result] = await db.query(`DELETE FROM escalas WHERE id = ?`, [id]);
        if (result.affectedRows === 0) {
            res.status(404).json({ message: "Escala não encontrada" });
        } else {
            res.json({ message: "Escala deletada com sucesso" });
        }
    } catch (err) {
        console.error("Erro ao deletar escala:", err);
        res.status(500).json({ error: "Erro ao deletar escala no banco de dados" });
    }
};

exports.editarEscalas = async (req, res) => {
    const id = req.params.id;
    const { nome_escala, cor, segmento_participante, regra_ordenacao, cotas } = req.body;

    try {
        console.log(`--- ATUALIZANDO ESCALA ID: ${id} ---`);
        
        // 1. Atualizar dados básicos da escala
        const updateQuery = `
            UPDATE escalas 
            SET nome_escala = ?, cor = ?, segmento_participante = ?, regra_ordenacao = ?
            WHERE id = ?
        `;
        await db.query(updateQuery, [
            nome_escala,
            cor ? cor.toLowerCase() : 'preta',
            segmento_participante ? segmento_participante.toLowerCase() : 'todos',
            regra_ordenacao,
            id
        ]);

        // 2. Atualizar cotas (mais simples deletar e inserir de novo)
        await db.query("DELETE FROM escala_cotas_ano WHERE escala_id = ?", [id]);
        
        if (cotas && typeof cotas === 'object') {
            for (const [turma, quantidade] of Object.entries(cotas)) {
                const qtd = parseInt(quantidade);
                if (qtd > 0) {
                    await db.query(
                        "INSERT INTO escala_cotas_ano (escala_id, turma, quantidade) VALUES (?, ?, ?)",
                        [id, turma, qtd]
                    );
                }
            }
        }

        console.log("--- ESCALA ATUALIZADA COM SUCESSO ---");
        res.json({ message: "Escala atualizada com sucesso!" });
    } catch (error) {
        console.error("ERRO AO EDITAR ESCALA:", error);
        res.status(500).json({ error: "Erro ao atualizar escala: " + error.message });
    }
};

exports.gerarEscalaAutomatica = async (req, res) => {
    try {
        const { escalaPretaId, escalaVermelhaId, pontosPartida } = req.body;
        console.log(">>> [GERAÇÃO] Iniciando geração automática");
        console.log(">>> [GERAÇÃO] Parâmetros recebidos:", { escalaPretaId, escalaVermelhaId });

        const [escalasConfig] = await db.query("SELECT * FROM escalas");
        const [diasConfig] = await db.query("SELECT * FROM escala_dias_semana");
        const [alunosRaw] = await db.query("SELECT * FROM alunos");
        const [cotasDB] = await db.query("SELECT * FROM escala_cotas_ano");

        console.log(`>>> [GERAÇÃO] Total de alunos no banco: ${alunosRaw.length}`);
        console.log(`>>> [GERAÇÃO] Total de cotas configuradas: ${cotasDB.length}`);

        if (alunosRaw.length === 0) return res.status(400).json({ error: "Nenhum aluno cadastrado." });

        const idsSelecionados = [escalaPretaId, escalaVermelhaId].filter(id => id);
        if (idsSelecionados.length === 0) return res.status(400).json({ error: "Selecione uma escala." });

        const escalasParaGerar = escalasConfig.filter(e => idsSelecionados.map(String).includes(String(e.id)));
        console.log(`>>> [GERAÇÃO] Escalas a processar: ${escalasParaGerar.map(e => e.nome_escala).join(", ")}`);

        const mapaDias = { 'domingo': 0, 'segunda': 1, 'terca': 2, 'quarta': 3, 'quinta': 4, 'sexta': 5, 'sabado': 6 };
        const resultados = [];

        // 1. Filtragem Inicial (Saúde e Comando)
        const alunosAptos = alunosRaw.filter(a => {
            const statusSaude = String(a.estado_saude || '').trim().toLowerCase();
            const statusFuncao = String(a.funcao || '').trim().toLowerCase();
            const ehApto = statusSaude !== 'não apto' && statusSaude !== 'nao apto';
            const ehComando = statusFuncao === 'sim' || statusFuncao === 's';
            
            if (!ehApto) console.log(`>>> [FILTRO] Aluno ${a.nome_guerra} removido: Saúde (${statusSaude})`);
            if (ehComando) console.log(`>>> [FILTRO] Aluno ${a.nome_guerra} removido: Comando (${statusFuncao})`);
            
            return ehApto && !ehComando;
        });
        console.log(`>>> [GERAÇÃO] Total de alunos aptos após filtros: ${alunosAptos.length}`);

        // 2. Datas da Próxima Semana (Segunda -> Domingo)
        const hoje = new Date();
        const proximaSegunda = new Date(hoje);
        const diasAteSegunda = (1 - hoje.getDay() + 7) % 7 || 7;
        proximaSegunda.setDate(hoje.getDate() + diasAteSegunda);
        proximaSegunda.setHours(0, 0, 0, 0);

        const dataFim = new Date(proximaSegunda);
        dataFim.setDate(proximaSegunda.getDate() + 6);
        dataFim.setHours(23, 59, 59, 999);

        console.log(`>>> [GERAÇÃO] Período: ${proximaSegunda.toLocaleDateString()} até ${dataFim.toLocaleDateString()}`);

        // 3. Histórico de Serviços (Controle Global de 48h)
        const ultimoServicoPorAluno = {};
        const [historico] = await db.query(
            "SELECT matricula_aluno, MAX(data_servico) as ultima_data FROM escala_gerada WHERE data_servico < ? GROUP BY matricula_aluno",
            [proximaSegunda]
        );
        historico.forEach(h => {
            const d = new Date(h.ultima_data);
            d.setHours(0, 0, 0, 0);
            ultimoServicoPorAluno[String(h.matricula_aluno)] = d;
        });

        // Limpeza dos dias que vamos gerar
        await db.query("DELETE FROM escala_gerada WHERE data_servico BETWEEN ? AND ?", [proximaSegunda, dataFim]);

        // 4. Preparar as Filas Mestre para cada Escala e cada Ano
        const filaEscalas = {};
        escalasParaGerar.forEach(escala => {
            filaEscalas[escala.id] = {};
            const turmasList = ['1° ano', '2° ano', '3° ano', '4° ano', '5° ano'];
            
            turmasList.forEach(turma => {
                let fila = alunosAptos.filter(a => {
                    const turmaBate = String(a.turma) === turma;
                    const segEscala = String(escala.segmento_participante || "").toLowerCase().normalize("NFD").replace(/[^a-z0-9]/g, "");
                    const segAluno = String(a.segmento || "").toLowerCase().normalize("NFD").replace(/[^a-z0-9]/g, "");
                    const segmentoBate = !segEscala || segEscala === "todos" || segEscala === segAluno;
                    return turmaBate && segmentoBate;
                });

                fila.sort((a, b) => {
                    const regra = escala.regra_ordenacao || "";
                    let res = 0;
                    if (regra.includes('nome_completo')) {
                        res = (a.nome_completo || '').localeCompare(b.nome_completo || '');
                    } else if (regra.includes('nome_guerra')) {
                        res = (a.nome_guerra || '').localeCompare(b.nome_guerra || '');
                    } else if (regra.includes('matricula')) {
                        res = String(a.matricula).localeCompare(String(b.matricula), undefined, { numeric: true });
                    }
                    return regra.includes('asc') ? res : -res;
                });

                const corChave = escala.cor === 'preta' ? 'preta' : 'vermelha';
                const matInicio = pontosPartida && pontosPartida[corChave] && pontosPartida[corChave][turma];
                
                if (matInicio && fila.some(a => String(a.matricula) === String(matInicio))) {
                    const index = fila.findIndex(a => String(a.matricula) === String(matInicio));
                    const anterior = fila.slice(0, index);
                    const posterior = fila.slice(index);
                    fila = [...posterior, ...anterior];
                }
                filaEscalas[escala.id][turma] = fila;
                console.log(`>>> [FILA] Escala ${escala.nome_escala} - ${turma}: ${fila.length} alunos`);
            });
        });

        // 5. GERAÇÃO DIA A DIA (SEG -> DOM)
        for (let i = 0; i < 7; i++) {
            let dataAtual = new Date(proximaSegunda);
            dataAtual.setDate(proximaSegunda.getDate() + i);
            dataAtual.setHours(0, 0, 0, 0);

            let diaSemanaJS = dataAtual.getDay();
            const diaNome = Object.keys(mapaDias).find(key => mapaDias[key] === diaSemanaJS);

            const escalasDoDia = diasConfig.filter(d =>
                mapaDias[d.dia_semana] === diaSemanaJS &&
                escalasParaGerar.some(eg => String(eg.id) === String(d.escala_id))
            );

            console.log(`\n>>> [DIA] Processando ${diaNome.toUpperCase()} (${dataAtual.toLocaleDateString()})`);

            for (const config of escalasDoDia) {
                const escalaInfo = escalasParaGerar.find(e => String(e.id) === String(config.escala_id));
                const cotasEscala = cotasDB.filter(c => String(c.escala_id) === String(escalaInfo.id));

                console.log(`  > Escala: ${escalaInfo.nome_escala} (Cotas encontradas: ${cotasEscala.length})`);

                // Se não houver cotas específicas, escala pelo menos 1 de qualquer ano
                const turmasParaEscalar = cotasEscala.length > 0 
                    ? cotasEscala 
                    : [{ turma: 'todos', quantidade: 1 }];

                for (const cota of turmasParaEscalar) {
                    const turmaAlvo = cota.turma;
                    const qtdNecessaria = cota.quantidade;
                    console.log(`    - Buscando ${qtdNecessaria} alunos para ${turmaAlvo}`);
                    
                    const turmasDaCota = turmaAlvo === 'todos' 
                        ? ['1° ano', '2° ano', '3° ano', '4° ano', '5° ano'] 
                        : [turmaAlvo];

                    for (let q = 0; q < qtdNecessaria; q++) {
                        let alunoEscalado = null;
                        let indexNaFila = -1;
                        let turmaDoEscalado = null;

                        for (const t of turmasDaCota) {
                            let fila = filaEscalas[escalaInfo.id][t];
                            if (!fila || fila.length === 0) continue;

                            for (let f = 0; f < fila.length; f++) {
                                const candidato = fila[f];
                                const ultimaData = ultimoServicoPorAluno[String(candidato.matricula)];
                                let descansado = true;
                                if (ultimaData) {
                                    const diffTime = dataAtual.getTime() - ultimaData.getTime();
                                    const diffHoras = Math.round(diffTime / (1000 * 60 * 60));
                                    // Para não escalar no sábado nem domingo (se escalado na sexta), 
                                    // a diferença deve ser maior que 48 horas (ou seja, só na segunda).
                                    descansado = diffHoras > 48;
                                }

                                if (descansado) {
                                    alunoEscalado = candidato;
                                    indexNaFila = f;
                                    turmaDoEscalado = t;
                                    break;
                                }
                            }
                            if (alunoEscalado) break;
                        }

                        if (alunoEscalado) {
                            const guerra = (alunoEscalado.nome_guerra || alunoEscalado.nome_completo || 'ALUNO').toUpperCase();
                            const nomeFormatado = `${guerra} (${alunoEscalado.turma})`;
                            
                            await db.query(
                                "INSERT INTO escala_gerada (escala_id, matricula_aluno, data_servico, nome_aluno_formatado) VALUES (?, ?, ?, ?)",
                                [escalaInfo.id, alunoEscalado.matricula, dataAtual, nomeFormatado]
                            );

                            resultados.push({
                                data: dataAtual,
                                escala: escalaInfo.nome_escala,
                                nome_guerra: guerra,
                                nome_completo: nomeFormatado,
                                turma: alunoEscalado.turma
                            });

                            ultimoServicoPorAluno[String(alunoEscalado.matricula)] = new Date(dataAtual);
                            
                            // Logística: Move para o final da fila
                            let filaOrigem = filaEscalas[escalaInfo.id][turmaDoEscalado];
                            filaOrigem.splice(indexNaFila, 1);
                            filaOrigem.push(alunoEscalado);
                            filaEscalas[escalaInfo.id][turmaDoEscalado] = filaOrigem;
                            
                            console.log(`      [OK] Escalado: ${guerra}`);
                        } else {
                            const aviso = `NÃO FOI POSSÍVEL ESCALAR (${turmaAlvo.toUpperCase()})`;
                            console.log(`      [AVISO] ${aviso}`);

                            await db.query(
                                "INSERT INTO escala_gerada (escala_id, matricula_aluno, data_servico, nome_aluno_formatado) VALUES (?, NULL, ?, ?)",
                                [escalaInfo.id, dataAtual, aviso]
                            );

                            resultados.push({
                                data: dataAtual,
                                escala: escalaInfo.nome_escala,
                                nome_guerra: "AVISO",
                                nome_completo: aviso,
                                turma: turmaAlvo
                            });
                        }
                    }
                }
            }
        }

        res.json({ message: "Escala gerada com sucesso!", cronograma: resultados });
    } catch (err) {
        console.error("Erro na geração de escala:", err);
        res.status(500).json({ error: "Erro ao processar geração automática" });
    }
};

const gerarCorpoRelatorio = (doc, dados) => {
    doc.fontSize(18).text("ADITAMENTO AO BOLETIM INTERNO", { align: "center" });
    doc.moveDown(2);

    if (dados.length === 0) {
        doc.fontSize(12).text("Não há escalas geradas para o período selecionado.", { align: "center" });
        return;
    }

    // Agrupar dados por data
    const gruposPorData = {};
    dados.forEach(item => {
        const dataStr = new Date(item.data_servico).toLocaleDateString('pt-BR', {
            weekday: 'long', 
            year: 'numeric', 
            month: '2-digit', 
            day: '2-digit'
        }).toUpperCase();
        
        if (!gruposPorData[dataStr]) gruposPorData[dataStr] = {};
        if (!gruposPorData[dataStr][item.nome_escala]) gruposPorData[dataStr][item.nome_escala] = [];
        gruposPorData[dataStr][item.nome_escala].push(item.nome_aluno_formatado);
    });

    // Renderizar grupos no PDF
    Object.entries(gruposPorData).forEach(([data, escalas]) => {
        doc.fillColor("#1a233b").fontSize(14).text(data, { underline: true });
        doc.moveDown(0.5);

        Object.entries(escalas).forEach(([nomeEscala, alunos]) => {
            doc.fillColor("#333").fontSize(12).text(`  • ${nomeEscala}:`, { continued: false });
            alunos.forEach(aluno => {
                doc.fillColor("#000").fontSize(12).text(`    - ${aluno}`);
            });
            doc.moveDown(0.5);
        });
        doc.moveDown(1);
    });
};

exports.baixarPdfAditamento = async (req, res) => {
    try {
        const query = `
            SELECT eg.data_servico, e.nome_escala, eg.nome_aluno_formatado 
            FROM escala_gerada eg 
            JOIN escalas e ON eg.escala_id = e.id 
            WHERE eg.data_servico >= CURDATE()
            ORDER BY eg.data_servico ASC, e.nome_escala ASC
        `;
        const [dados] = await db.query(query);

        const doc = new PDFDocument({ margin: 50 });
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=aditamento.pdf');
        doc.pipe(res);

        gerarCorpoRelatorio(doc, dados);
        
        doc.end();
    } catch (err) {
        console.error("Erro ao gerar PDF:", err);
        res.status(500).json({ error: "Erro ao gerar PDF" });
    }
};

exports.enviarEmailAditamento = async (req, res) => {
    try {
        const query = `
            SELECT eg.data_servico, e.nome_escala, eg.nome_aluno_formatado 
            FROM escala_gerada eg
            JOIN escalas e ON eg.escala_id = e.id
            WHERE eg.data_servico >= CURDATE()
            ORDER BY eg.data_servico ASC, e.nome_escala ASC
        `;
        const [dados] = await db.query(query);

        if (dados.length === 0) {
            return res.status(400).json({ error: "Não há escalas geradas para enviar." });
        }

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const doc = new PDFDocument({ margin: 50 });
        let chunks = [];
        doc.on('data', chunk => chunks.push(chunk));

        gerarCorpoRelatorio(doc, dados);
        doc.end();

        doc.on('end', async () => {
            const pdfBuffer = Buffer.concat(chunks);
            await transporter.sendMail({
                from: `"Sistema Auto Escala" <${process.env.EMAIL_USER}>`,
                to: "gallotte.silva@ime.eb.br, gallotte.silva@ime.eb.br",
                subject: `Aditamento da Semana - Gerado em ${new Date().toLocaleDateString('pt-BR')}`,
                text: "Prezados, segue em anexo o aditamento da escala para a próxima semana.",
                attachments: [{ filename: 'aditamento.pdf', content: pdfBuffer }]
            });
            res.json({ message: "Aditamento enviado com sucesso com o PDF em anexo!" });
        });
    } catch (err) {
        console.error("Erro no envio de e-mail:", err);
        res.status(500).json({ error: "Falha ao processar ou enviar o e-mail." });
    }
};