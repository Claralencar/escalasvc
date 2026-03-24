import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import CadastroEscala from './pages/CadastroEscala';

function App() {
  return (
    <Router>
      <nav style={{ padding: '1rem', background: '#f4f4f4', marginBottom: '1rem' }}>
        <Link to="/">Home</Link> | <Link to="/cadastro-escala">Configurar Escalas</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/cadastro-escala" element={<CadastroEscala />} />
      </Routes>
    </Router>
  );
}

export default App;