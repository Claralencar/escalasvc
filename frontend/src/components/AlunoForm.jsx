import { useState, useEffect } from "react";

function AlunoForm({ onSubmit, alunoEmEdicao, cancelarEdicao }) {
  // Padronização: Todos os campos em snake_case para bater com o Banco de Dados
  const estadoInicial = {
    matricula: "",
    nome_guerra: "",
    nome_completo: "",
    turma: "",
    segmento: "Masculino", // Padronizado com a primeira letra maiúscula para o ENUM
    funcao: "",
    estado_saude: "",
    email_institucional: "",
  };

  const [formData, setFormData] = useState(estadoInicial);

  useEffect(() => {
    if (alunoEmEdicao) {
      setFormData(alunoEmEdicao);
    } else {
      setFormData(estadoInicial);
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
        value={formData.matricula || ""}
        onChange={handleChange}
        disabled={!!alunoEmEdicao}
        required
      />

      <input
        type="text"
        name="nome_guerra"
        placeholder="Nome de guerra"
        value={formData.nome_guerra || ""}
        onChange={handleChange}
        required
      />

      <input
        type="text"
        name="nome_completo"
        placeholder="Nome completo"
        value={formData.nome_completo || ""}
        onChange={handleChange}
        required
      />

      <input
        type="text"
        name="turma"
        placeholder="Turma"
        value={formData.turma || ""}
        onChange={handleChange}
        required
      />

      <select
        name="segmento"
        value={formData.segmento || "Masculino"}
        onChange={handleChange}
        required
      >
        <option value="Masculino">Masculino</option>
        <option value="Feminino">Feminino</option>
      </select>

      <input
        type="text"
        name="funcao"
        placeholder="Função"
        value={formData.funcao || ""}
        onChange={handleChange}
        required
      />

      <input
        type="text"
        name="estado_saude" // Ajustado: de estadoSaude para estado_saude
        placeholder="Estado de saúde"
        value={formData.estado_saude || ""}
        onChange={handleChange}
        required
      />

      <input
        type="email"
        name="email_institucional" // Ajustado: de emailInstitucional para email_institucional
        placeholder="E-mail institucional"
        value={formData.email_institucional || ""}
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