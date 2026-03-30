const db = require('../database/db'); // Confirme se o caminho para o arquivo db.js está correto

// [C]RUD - Criar Aluno (POST)
exports.criarAlunos = async (req, res) => {
    // Pegamos os dados do corpo da requisição
    const {
        matricula,
        nome_guerra,
        nome_completo,
        turma,
        segmento,
        funcao,
        estado_saude,
        email_institucional
    } = req.body;

    try {
        const query = `INSERT INTO alunos (matricula, nome_guerra, nome_completo, turma, segmento, funcao, estado_saude, email_institucional) 
                       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

        // O segredo está aqui: usamos "|| null" para garantir que nada seja undefined
        await db.execute(query, [
            matricula || null,
            nome_guerra || null,
            nome_completo || null,
            turma || null,
            segmento || null,
            funcao || null,
            estado_saude || null,
            email_institucional || null
        ]);

        res.status(201).json({ message: "Aluno cadastrado com sucesso!" });
    } catch (error) {
        console.error("Erro no cadastro:", error);
        res.status(500).json({ error: "Erro ao cadastrar aluno." });
    }
};

// C[R]UD - Listar Alunos (GET)
exports.listarAlunos = async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM alunos');
        res.status(200).json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao buscar alunos." });
    }
};

// CR[U]D - Atualizar Aluno (PUT)
exports.atualizarAlunos = async (req, res) => {
    const { matricula } = req.params;
    const { nome_guerra, nome_completo, turma, segmento, funcao, estado_saude, email_institucional } = req.body;

    try {
        const query = `UPDATE alunos SET nome_guerra = ?, nome_completo = ?, turma = ?, segmento = ?, funcao = ?, estado_saude = ?, email_institucional = ? 
                       WHERE matricula = ?`;
        const [result] = await db.execute(query, [nome_guerra, nome_completo, turma, segmento, funcao, estado_saude, email_institucional, matricula]);

        if (result.affectedRows === 0) return res.status(404).json({ message: "Aluno não encontrado." });
        res.status(200).json({ message: "Aluno atualizado com sucesso!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao atualizar aluno." });
    }
};

// CRU[D] - Deletar Aluno (DELETE)
exports.deletarAlunos = async (req, res) => {
    const { matricula } = req.params;

    try {
        const [result] = await db.execute('DELETE FROM alunos WHERE matricula = ?', [matricula]);

        if (result.affectedRows === 0) return res.status(404).json({ message: "Aluno não encontrado." });
        res.status(200).json({ message: "Aluno deletado com sucesso!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao deletar aluno." });
    }
};