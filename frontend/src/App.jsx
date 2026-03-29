import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import CadastroEscala from './pages/CadastroEscala';
import CadastroAlunos from './pages/CadastroAlunos';
import Escala from './pages/Escala'; // <-- 1. Importe o novo componente



function App() {
  return (
    <Router>
      {/* Se você tiver uma barra de navegação global, pode adicionar o link aqui também */}
    <nav>
      <Link to="/">Home</Link>
      <Link to="/cadastro-escala">Configurar Escalas</Link>
      <Link to="/alunos">Cadastro de Alunos</Link>
    </nav>

      <div className="page-container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/cadastro-escala" element={<CadastroEscala />} />
          <Route path="/alunos" element={<CadastroAlunos />} />
          <Route path="/escala" element={<Escala />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;