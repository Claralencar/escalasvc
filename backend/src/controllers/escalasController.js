const db = require("../database/db");
const PDFDocument = require("pdfkit");
const nodemailer = require("nodemailer");

// Regra estrita: a normalização (remoção de acentos) é aplicada apenas ao nome completo.
const normalizarNome = (nome) => {
    return nome ? nome.normalize("NFD").replace(/[\u0300-\u036f]/g, "") : nome;
};

exports.listarEscalas = async (req, res) => {
    try {
        const [results] = await db.query("SELECT * FROM escalas");
        res.json(results);
    } catch (err) {
        console.error("Erro ao listar escalas:", err);
        res.status(500).json({ error: "Erro ao buscar escalas no banco de dados" });
    }
};

exports.criarEscalas = async (req, res) => {
    const { nome_escala, cor, segmento_participante, regra_ordenacao, cotas } = req.body;

    try {
        const query = `
          INSERT INTO escalas (nome_escala, cor, segmento_participante, regra_ordenacao) 
          VALUES (?, ?, ?, ?)
        `;

        const [result] = await db.query(query, [
            nome_escala,
            cor.toLowerCase(),
            segmento_participante.toLowerCase(),
            regra_ordenacao
        ]);

        const escalaId = result.insertId;

        let dias_semana = cor.toLowerCase() === 'preta'
            ? ['segunda', 'terca', 'quarta', 'quinta', 'sexta']
            : ['sabado', 'domingo'];

        for (const dia of dias_semana) {
            await db.query(
                "INSERT INTO escala_dias_semana (escala_id, dia_semana) VALUES (?, ?)",
                [escalaId, dia]
            );
        }

        if (cotas && typeof cotas === 'object') {
            for (const [turma, quantidade] of Object.entries(cotas)) {
                if (parseInt(quantidade) > 0) {
                    await db.query(
                        "INSERT INTO escala_cotas_ano (escala_id, turma, quantidade) VALUES (?, ?, ?)",
                        [escalaId, turma, parseInt(quantidade)]
                    );
                }
            }
        }

        res.status(201).json({ message: "Escala criada com sucesso!", id: escalaId });
    } catch (error) {
        console.error("Erro no DB:", error);
        res.status(500).json({ error: "Erro ao criar escala no banco" });
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

exports.gerarEscalaAutomatica = async (req, res) => {
    try {
        const { escalaPretaId, escalaVermelhaId, pontosPartida } = req.body;

        const [escalasConfig] = await db.query("SELECT * FROM escalas");
        const [diasConfig] = await db.query("SELECT * FROM escala_dias_semana");
        const [alunosRaw] = await db.query("SELECT * FROM alunos");
        const [cotasDB] = await db.query("SELECT * FROM escala_cotas_ano");

        if (alunosRaw.length === 0) return res.status(400).json({ error: "Nenhum aluno cadastrado." });

        const idsSelecionados = [escalaPretaId, escalaVermelhaId].filter(id => id);
        if (idsSelecionados.length === 0) return res.status(400).json({ error: "Selecione uma escala." });

        const escalasParaGerar = escalasConfig.filter(e => idsSelecionados.map(String).includes(String(e.id)));
        const mapaDias = { 'domingo': 0, 'segunda': 1, 'terca': 2, 'quarta': 3, 'quinta': 4, 'sexta': 5, 'sabado': 6 };
        const resultados = [];

        // 1. Filtragem Inicial (Saúde e Comando)
        const alunosAptos = alunosRaw.filter(a => {
            const statusSaude = String(a.estado_saude || '').trim().toLowerCase();
            const statusFuncao = String(a.funcao || '').trim().toLowerCase();
            return statusSaude === 'apto' && statusFuncao !== 'sim' && statusFuncao !== 's';
        });

        // 2. Histórico de Serviços (Controle Global de 48h)
        const ultimoServicoPorAluno = {};
        const [historico] = await db.query(
            "SELECT matricula_aluno, MAX(data_servico) as ultima_data FROM escala_gerada GROUP BY matricula_aluno"
        );
        historico.forEach(h => {
            const d = new Date(h.ultima_data);
            d.setHours(0, 0, 0, 0);
            ultimoServicoPorAluno[String(h.matricula_aluno)] = d;
        });

        // 3. Datas da Próxima Semana
        const hoje = new Date();
        const proximaSegunda = new Date(hoje);
        const diasAteSegunda = (1 - hoje.getDay() + 7) % 7 || 7;
        proximaSegunda.setDate(hoje.getDate() + diasAteSegunda);
        proximaSegunda.setHours(0, 0, 0, 0);

        const dataFim = new Date(proximaSegunda);
        dataFim.setDate(proximaSegunda.getDate() + 6);
        dataFim.setHours(23, 59, 59, 999);

        // Limpeza dos dias que vamos gerar
        await db.query("DELETE FROM escala_gerada WHERE data_servico BETWEEN ? AND ?", [proximaSegunda, dataFim]);

        // 4. Preparar as Filas Mestre para cada Escala e cada Ano
        const filaEscalas = {};
        escalasParaGerar.forEach(escala => {
            filaEscalas[escala.id] = {};
            const turmas = ['1° ano', '2° ano', '3° ano', '4° ano', '5° ano'];
            
            turmas.forEach(turma => {
                // Filtrar por turma e segmento da escala
                let fila = alunosAptos.filter(a => {
                    const turmaBate = String(a.turma) === turma;
                    const segEscala = String(escala.segmento_participante || "").toLowerCase().normalize("NFD").replace(/[^a-z0-9]/g, "");
                    const segAluno = String(a.segmento || "").toLowerCase().normalize("NFD").replace(/[^a-z0-9]/g, "");
                    const segmentoBate = !segEscala || segEscala === "todos" || segEscala === segAluno;
                    return turmaBate && segmentoBate;
                });

                // Ordenar conforme regra da escala
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

                // Rotação inicial (Ponto de Partida)
                const corChave = escala.cor === 'preta' ? 'preta' : 'vermelha';
                const matInicio = pontosPartida && pontosPartida[corChave] && pontosPartida[corChave][turma];
                
                if (matInicio && fila.some(a => String(a.matricula) === String(matInicio))) {
                    const index = fila.findIndex(a => String(a.matricula) === String(matInicio));
                    const anterior = fila.slice(0, index);
                    const posterior = fila.slice(index);
                    fila = [...posterior, ...anterior];
                }
                filaEscalas[escala.id][turma] = fila;
            });
        });

        // 5. GERAÇÃO DIA A DIA (SEG -> DOM)
        for (let i = 0; i < 7; i++) {
            let dataAtual = new Date(proximaSegunda);
            dataAtual.setDate(proximaSegunda.getDate() + i);
            dataAtual.setHours(0, 0, 0, 0);

            let diaSemanaJS = dataAtual.getDay();
            
            // Buscar quais escalas rodam neste dia (Seg-Sex = Pretas, Sab-Dom = Vermelhas)
            const escalasDoDia = diasConfig.filter(d =>
                mapaDias[d.dia_semana] === diaSemanaJS &&
                escalasParaGerar.some(eg => String(eg.id) === String(d.escala_id))
            );

            for (const config of escalasDoDia) {
                const escalaInfo = escalasParaGerar.find(e => String(e.id) === String(config.escala_id));
                const cotasEscala = cotasDB.filter(c => String(c.escala_id) === String(escalaInfo.id));

                for (const cota of cotasEscala) {
                    const turma = cota.turma;
                    const qtdNecessaria = cota.quantidade;
                    let qtdEscalada = 0;
                    
                    let fila = filaEscalas[escalaInfo.id][turma];
                    if (!fila || fila.length === 0) continue;

                    // Para cada vaga da cota
                    for (let q = 0; q < qtdNecessaria; q++) {
                        let alunoEncontrado = null;
                        let indexEncontrado = -1;

                        // Percorre a fila procurando o primeiro descansado
                        for (let f = 0; f < fila.length; f++) {
                            const candidato = fila[f];
                            const ultimaData = ultimoServicoPorAluno[String(candidato.matricula)];
                            let descansado = true;
                            
                            if (ultimaData) {
                                const diffTime = dataAtual.getTime() - ultimaData.getTime();
                                const diffDias = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                                descansado = diffDias >= 3; // Regra de 48h (D+3)
                            }

                            if (descansado) {
                                alunoEncontrado = candidato;
                                indexEncontrado = f;
                                break;
                            }
                        }

                        if (alunoEncontrado) {
                            // FORMATAÇÃO: NomeDeGuerra (X° ano)
                            const nomeFormatado = `${alunoEncontrado.nome_guerra} (${alunoEncontrado.turma})`;
                            
                            await db.query(
                                "INSERT INTO escala_gerada (escala_id, matricula_aluno, data_servico, nome_aluno_formatado) VALUES (?, ?, ?, ?)",
                                [escalaInfo.id, alunoEncontrado.matricula, dataAtual, nomeFormatado]
                            );

                            resultados.push({
                                data: dataAtual,
                                escala: escalaInfo.nome_escala,
                                nome_guerra: alunoEncontrado.nome_guerra,
                                nome_completo: nomeFormatado,
                                turma: alunoEncontrado.turma
                            });

                            // Atualiza histórico de descanso
                            ultimoServicoPorAluno[String(alunoEncontrado.matricula)] = new Date(dataAtual);
                            
                            // LOGICA CIRCULAR: Move APENAS o escalado para o final da fila
                            fila.splice(indexEncontrado, 1);
                            fila.push(alunoEncontrado);
                            
                            qtdEscalada++;
                        }
                    }
                    // Atualiza a fila da escala para o próximo dia/vaga
                    filaEscalas[escalaInfo.id][turma] = fila;
                }
            }
        }

        res.json({ message: "Escala gerada com sucesso!", cronograma: resultados });
    } catch (err) {
        console.error("Erro na geração de escala:", err);
        res.status(500).json({ error: "Erro ao processar geração automática" });
    }
};

exports.baixarPdfAditamento = async (req, res) => {
    try {
        const query = `
            SELECT eg.data_servico, e.nome_escala, eg.nome_aluno_formatado 
            FROM escala_gerada eg 
            JOIN escalas e ON eg.escala_id = e.id 
            WHERE eg.data_servico >= CURDATE()
            ORDER BY eg.data_servico ASC
        `;
        const [dados] = await db.query(query);

        const doc = new PDFDocument();
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=aditamento.pdf');
        doc.pipe(res);

        doc.fontSize(18).text("ADITAMENTO AO BOLETIM INTERNO", { align: "center" });
        doc.moveDown();
        doc.fontSize(12).text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`);
        doc.moveDown();

        dados.forEach(item => {
            const dataFormatada = new Date(item.data_servico).toLocaleDateString('pt-BR');
            doc.text(`${dataFormatada} - ${item.nome_escala}: ${item.nome_aluno_formatado}`);
        });
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
            ORDER BY eg.data_servico ASC
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

        const doc = new PDFDocument();
        let chunks = [];
        doc.on('data', chunk => chunks.push(chunk));

        doc.fontSize(18).text("ADITAMENTO AO BOLETIM INTERNO", { align: "center" });
        doc.moveDown();
        dados.forEach(item => {
            const dataFormatada = new Date(item.data_servico).toLocaleDateString('pt-BR');
            doc.fontSize(12).text(`${dataFormatada} - ${item.nome_escala}: ${item.nome_aluno_formatado}`);
        });
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