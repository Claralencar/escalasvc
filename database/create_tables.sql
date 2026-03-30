CREATE TABLE IF NOT EXISTS alunos (
    matricula VARCHAR(50) NOT NULL PRIMARY KEY,
    nome_guerra VARCHAR(100) NOT NULL,
    nome_completo VARCHAR(255) NOT NULL,
    turma VARCHAR(50) NOT NULL,
    segmento ENUM('Masculino', 'Feminino') NOT NULL,
    funcao VARCHAR(100),
    estado_saude VARCHAR(255),
    email_institucional VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS escalas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome_escala VARCHAR(100) NOT NULL,
    cor ENUM('preta', 'vermelha',   'cinza', 'azul', 'verde', 'amarela', 'rosa', 'roxa', 'laranja') NOT NULL,
    segmento_participante ENUM('feminino','masculino','todos') NOT NULL,
    regra_ordenacao ENUM(
        'nome_guerra_asc',
        'nome_guerra_desc',
        'nome_completo_asc',
        'nome_completo_desc',
        'matricula_asc',
        'matricula_desc'
    ) NOT NULL
);

CREATE TABLE IF NOT EXISTS escala_dias_semana (
    id INT AUTO_INCREMENT PRIMARY KEY,
    escala_id INT NOT NULL,
    dia_semana ENUM('segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo') NOT NULL,
    FOREIGN KEY (escala_id) REFERENCES escalas(id) ON DELETE CASCADE
);