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
    const { nome_escala, cor, segmento_participante, regra_ordenacao } = req.body;

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

        res.status(201).json({ message: "Escala criada com sucesso!" });
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
        const { escalaPretaId, escalaVermelhaId } = req.body;
        const [escalasConfig] = await db.query("SELECT * FROM escalas");
        const [diasConfig] = await db.query("SELECT * FROM escala_dias_semana");
        const [alunos] = await db.query("SELECT * FROM alunos");

        if (alunos.length === 0) return res.status(400).json({ error: "Nenhum aluno cadastrado." });

        const idsSelecionados = [escalaPretaId, escalaVermelhaId].filter(id => id);
        if (idsSelecionados.length === 0) return res.status(400).json({ error: "Selecione uma escala." });

        const escalasParaGerar = escalasConfig.filter(e => idsSelecionados.map(String).includes(e.id.toString()));
        const mapaDias = { 'domingo': 0, 'segunda': 1, 'terca': 2, 'quarta': 3, 'quinta': 4, 'sexta': 5, 'sabado': 6 };
        const resultados = [];

        // Controle de folga: Forçamos a matrícula a ser sempre STRING para evitar erro de busca
        const ultimoServicoPorAluno = {};

        // Busca o histórico real do banco
        const [historico] = await db.query(
            "SELECT matricula_aluno, MAX(data_servico) as ultima_data FROM escala_gerada GROUP BY matricula_aluno"
        );

        historico.forEach(h => {
            const d = new Date(h.ultima_data);
            d.setHours(0, 0, 0, 0);
            ultimoServicoPorAluno[String(h.matricula_aluno)] = d;
        });

        for (let i = 1; i <= 7; i++) {
            let dataAtual = new Date();
            dataAtual.setDate(dataAtual.getDate() + i);
            dataAtual.setHours(0, 0, 0, 0);

            let diaSemanaJS = dataAtual.getDay();
            const escalasDoDia = diasConfig.filter(d =>
                mapaDias[d.dia_semana] === diaSemanaJS &&
                escalasParaGerar.some(eg => eg.id == d.escala_id)
            );

            for (const config of escalasDoDia) {
                const escalaInfo = escalasParaGerar.find(e => e.id == config.escala_id);

                let alunosElegiveis = alunos.filter(a => {
                    const segmentoBate = !escalaInfo.segmento_participante ||
                        escalaInfo.segmento_participante === 'todos' ||
                        a.segmento.toLowerCase() === escalaInfo.segmento_participante.toLowerCase();

                    // Buscamos a folga usando String() para garantir que a chave bata
                    const ultimaData = ultimoServicoPorAluno[String(a.matricula)];
                    let descansado = true;

                    if (ultimaData) {
                        const diffTime = Math.abs(dataAtual.getTime() - ultimaData.getTime());
                        const diffDias = Math.round(diffTime / (1000 * 60 * 60 * 24));

                        // REGRA: diffDias >= 3 significa 48h de folga real entre turnos
                        // Seg(1) -> Ter(2) folga -> Qua(3) folga -> Qui(4) pode trabalhar. (4-1 = 3)
                        descansado = diffDias >= 3;
                    }
                    return segmentoBate && descansado;
                });

                if (alunosElegiveis.length === 0) continue;

                // Ordenação (mantendo sua lógica original simplificada)
                alunosElegiveis.sort((a, b) => {
                    const regra = escalaInfo.regra_ordenacao;
                    if (regra.includes('nome_guerra')) {
                        return regra.includes('asc')
                            ? (a.nome_guerra || '').localeCompare(b.nome_guerra || '')
                            : (b.nome_guerra || '').localeCompare(a.nome_guerra || '');
                    }
                    if (regra.includes('matricula')) {
                        return regra.includes('asc') ? a.matricula - b.matricula : b.matricula - a.matricula;
                    }
                    return 0;
                });

                const alunoEscalado = alunosElegiveis[0];
                const nomeTratado = normalizarNome(alunoEscalado.nome_completo);

                await db.query(
                    "INSERT INTO escala_gerada (escala_id, matricula_aluno, data_servico, nome_aluno_formatado) VALUES (?, ?, ?, ?)",
                    [escalaInfo.id, alunoEscalado.matricula, dataAtual, nomeTratado]
                );

                resultados.push({
                    data: dataAtual,
                    escala: escalaInfo.nome_escala,
                    nome_guerra: alunoEscalado.nome_guerra,
                    nome_completo: nomeTratado
                });

                // ATUALIZAÇÃO CRUCIAL: Atualiza o mapa para o próximo dia do loop
                ultimoServicoPorAluno[String(alunoEscalado.matricula)] = new Date(dataAtual);
            }
        }
        res.json({ message: "Escala gerada!", cronograma: resultados });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erro ao processar geração automática" });
    }
};

exports.baixarPdfAditamento = async (req, res) => {
    try {
        const query = `SELECT eg.data_servico, e.nome_escala, eg.nome_aluno_formatado 
                       FROM escala_gerada eg JOIN escalas e ON eg.escala_id = e.id ORDER BY eg.data_servico ASC`;
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
        res.status(500).json({ error: "Erro ao gerar PDF" });
    }
};

exports.enviarEmailAditamento = async (req, res) => {
    try {
        // 1. Buscar os dados para o PDF (mesma lógica do download)
        const query = `
            SELECT eg.data_servico, e.nome_escala, eg.nome_aluno_formatado 
            FROM escala_gerada eg
            JOIN escalas e ON eg.escala_id = e.id
            ORDER BY eg.data_servico ASC
        `;
        const [dados] = await db.query(query);

        if (dados.length === 0) {
            return res.status(400).json({ error: "Não há escalas geradas para enviar." });
        }

        // 2. Configurar o Transportador (Nodemailer)
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        // 3. Criar o PDF em memória (Buffer)
        const doc = new PDFDocument();
        let chunks = [];
        doc.on('data', chunk => chunks.push(chunk));

        // Conteúdo do PDF
        doc.fontSize(18).text("ADITAMENTO AO BOLETIM INTERNO", { align: "center" });
        doc.moveDown();
        dados.forEach(item => {
            const dataFormatada = new Date(item.data_servico).toLocaleDateString('pt-BR');
            doc.fontSize(12).text(`${dataFormatada} - ${item.nome_escala}: ${item.nome_aluno_formatado}`);
        });
        doc.end();

        // Aguarda o PDF terminar de ser gerado
        doc.on('end', async () => {
            const pdfBuffer = Buffer.concat(chunks);

            // 4. Enviar o e-mail com o anexo
            await transporter.sendMail({
                from: `"Sistema Auto Escala" <${process.env.EMAIL_USER}>`,
                to: "gallotte.silva@ime.eb.br, gallotte.silva@ime.eb.br",
                subject: `Aditamento da Semana - Gerado em ${new Date().toLocaleDateString('pt-BR')}`,
                text: "Prezados, segue em anexo o aditamento da escala para a próxima semana.",
                attachments: [
                    {
                        filename: 'aditamento.pdf',
                        content: pdfBuffer
                    }
                ]
            });

            res.json({ message: "Aditamento enviado com sucesso com o PDF em anexo!" });
        });

    } catch (err) {
        console.error("Erro no envio de e-mail:", err);
        res.status(500).json({ error: "Falha ao processar ou enviar o e-mail." });
    }
};