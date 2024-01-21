import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import Prayers from '@/renderer/pages/prayers';
import Home from '@/renderer/pages';
import '@/renderer/globals.css';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/prayers" element={<Prayers />} />
      </Routes>
    </Router>
  );
}
