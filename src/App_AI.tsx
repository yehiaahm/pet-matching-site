import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { PetMatAIDashboard } from './pages/PetMatAIDashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/ai-dashboard" element={<PetMatAIDashboard />} />
        <Route path="/" element={<div><h1>PetMat AI System</h1><p>Go to <a href="/ai-dashboard">AI Dashboard</a></p></div>} />
      </Routes>
    </Router>
  );
}

export default App;
