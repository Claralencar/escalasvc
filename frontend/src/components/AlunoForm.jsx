import { useState, useEffect } from "react";

function AlunoForm({ onSubmit, alunoEmEdicao, cancelarEdicao }) {
  const [formData, setFormData] = useState({
    matricula: "",
    nomeGuerra: "",
    nomeCompleto: "",
    turma: "",
    segmento: "masculino",
    funcao: "",
    estadoSaude: "",
    emailInstitucional: "",
  });

  useEffect(() => {
    if (alunoEmEdicao) {
      setFormData(alunoEmEdicao);
    } else {
      setFormData({
        matricula: "",
        nomeGuerra: "",
        nomeCompleto: "",
        turma: "",
        segmento: "masculino",
        funcao: "",
        estadoSaude: "",
        emailInstitucional: "",
      });
    }
  }, [alunoEmEdicao]);

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit(formData);
  }

  return (
    <form className="aluno-form" onSubmit={handleSubmit}>
      <h2>{alunoEmEdicao ? "Editar Aluno" : "Cadastrar Aluno"}</h2>

      <input
        type="text"
        name="matricula"
        placeholder="Matrícula"
        value={formData.matricula}
        onChange={handleChange}
        disabled={!!alunoEmEdicao}
        required
      />

      <input
        type="text"
        name="nomeGuerra"
        placeholder="Nome de guerra"
        value={formData.nomeGuerra}
        onChange={handleChange}
        required
      />

      <input
        type="text"
        name="nomeCompleto"
        placeholder="Nome completo"
        value={formData.nomeCompleto}
        onChange={handleChange}
        required
      />

      <input
        type="text"
        name="turma"
        placeholder="Turma"
        value={formData.turma}
        onChange={handleChange}
        required
      />

      <select
        name="segmento"
        value={formData.segmento}
        onChange={handleChange}
        required
      >
        <option value="masculino">Masculino</option>
        <option value="feminino">Feminino</option>
      </select>

      <input
        type="text"
        name="funcao"
        placeholder="Função"
        value={formData.funcao}
        onChange={handleChange}
        required
      />

      <input
        type="text"
        name="estadoSaude"
        placeholder="Estado de saúde"
        value={formData.estadoSaude}
        onChange={handleChange}
        required
      />

      <input
        type="email"
        name="emailInstitucional"
        placeholder="E-mail institucional"
        value={formData.emailInstitucional}
        onChange={handleChange}
        required
      />

      <div className="form-buttons">
        <button type="submit">
          {alunoEmEdicao ? "Salvar Alterações" : "Cadastrar"}
        </button>

        {alunoEmEdicao && (
          <button type="button" onClick={cancelarEdicao}>
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}

export default AlunoForm;