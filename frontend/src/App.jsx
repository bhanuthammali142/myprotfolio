import { Routes, Route } from 'react-router-dom';
import { ResumeProvider } from './context/ResumeContext';
import Dashboard from './pages/Dashboard';
import Landing from './pages/Landing';

function App() {
  return (
    <ResumeProvider>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/app" element={<Dashboard />} />
      </Routes>
    </ResumeProvider>
  );
}

export default App;
