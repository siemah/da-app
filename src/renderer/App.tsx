import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import Prayers from '@/renderer/pages/prayers';
import Home from '@/renderer/pages';
import '@/renderer/globals.css';
import Notes from '@/renderer/pages/notes';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/prayers" element={<Prayers />} />
        <Route path="/notes" element={<Notes />} />
      </Routes>
    </Router>
  );
}
