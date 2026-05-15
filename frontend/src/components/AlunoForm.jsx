import React, { useState, useEffect } from "react";

function AlunoForm({ onSubmit, alunoEmEdicao, cancelarEdicao }) {
  const [formData, setFormData] = useState({
    matricula: "",
    nome_guerra: "",
    nome_completo: "",
    turma: "1° ano",
    segmento: "Masculino",
    funcao: "Não",
    estado_saude: "Apto",
    email_institucional: "",
  });

  useEffect(() => {
    if (alunoEmEdicao) setFormData(alunoEmEdicao);
  }, [alunoEmEdicao]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  return (
    <form className="aluno-form" onSubmit={(e) => { e.preventDefault(); onSubmit(formData); }}>
      <h2>Informações do Aluno</h2>

      <div className="form-group">
        <label>Número de Matrícula *</label>
        <input name="matricula" placeholder="Ex: 123456" value={formData.matricula} onChange={handleChange} disabled={!!alunoEmEdicao} required />
      </div>

      <div className="form-group">
        <label>Nome de Guerra *</label>
        <input name="nome_guerra" placeholder="Ex: Silva" value={formData.nome_guerra} onChange={handleChange} required />
      </div>

      <div className="form-group">
        <label>Nome Completo *</label>
        <input name="nome_completo" placeholder="Nome completo do aluno" value={formData.nome_completo} onChange={handleChange} required />
      </div>

      <div className="form-group">
        <label>Turma *</label>
        <select name="turma" value={formData.turma} onChange={handleChange} required>
          <option value="1° ano">1° ano</option>
          <option value="2° ano">2° ano</option>
          <option value="3° ano">3° ano</option>
          <option value="4° ano">4° ano</option>
          <option value="5° ano">5° ano</option>
        </select>
      </div>

      <div className="form-group">
        <label>Segmento *</label>
        <select name="segmento" value={formData.segmento} onChange={handleChange}>
          <option value="Masculino">Masculino</option>
          <option value="Feminino">Feminino</option>
        </select>
      </div>

      <div className="form-group">
        <label>Estado de Saúde *</label>
        <select name="estado_saude" value={formData.estado_saude} onChange={handleChange}>
          <option value="Apto">Apto</option>
          <option value="Não Apto">Não Apto</option>
        </select>
      </div>

      <div className="form-group">
        <label>Está em função de comando? *</label>
        <select name="funcao" value={formData.funcao} onChange={handleChange}>
          <option value="Sim">Sim</option>
          <option value="Não">Não</option>
        </select>
      </div>

      <div className="form-group">
        <label>E-mail Institucional *</label>
        <input name="email_institucional" type="email" placeholder="aluno@instituicao.mil.br" value={formData.email_institucional} onChange={handleChange} required />
      </div>

      <div className="form-actions">
        <button type="submit" className="btn-salvar">
          {alunoEmEdicao ? "Salvar Alterações" : "Cadastrar Aluno"}
        </button>
        {alunoEmEdicao && (
          <button type="button" className="btn-excluir" onClick={cancelarEdicao}>
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}

export default AlunoForm;