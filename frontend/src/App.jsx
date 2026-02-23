import { Routes, Route } from 'react-router-dom';
import { ResumeProvider } from './context/ResumeContext';
import Dashboard from './pages/Dashboard';
import Landing from './pages/Landing';
import ResumeBuilder from './pages/ResumeBuilder';

function App() {
  return (
    <ResumeProvider>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/app" element={<Dashboard />} />
        <Route path="/build-resume" element={<ResumeBuilder />} />
      </Routes>
    </ResumeProvider>
  );
}

export default App;
