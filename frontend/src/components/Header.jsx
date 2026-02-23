import { useNavigate } from 'react-router-dom';
import { useResume } from '../context/ResumeContext';
import { Moon, Sun, Home, RotateCcw, Activity } from 'lucide-react';

export default function Header() {
    const navigate = useNavigate();
    const { theme, toggleTheme, resetAll, score } = useResume();

    return (
        <header style={{
            position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
            height: 64,
            backdropFilter: 'blur(16px)',
            background: 'rgba(10,10,15,0.85)',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex', alignItems: 'center',
        }}>
            <div style={{
                maxWidth: 1400, width: '100%', margin: '0 auto', padding: '0 24px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
                {/* Logo */}
                <button
                    onClick={() => navigate('/')}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}
                >
                    <div style={{
                        width: 34, height: 34, borderRadius: 10,
                        background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 17, fontWeight: 800, color: 'white',
                    }}>R</div>
                    <span style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 20, color: 'var(--text-primary)' }}>
                        Resume<span style={{ background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>AI</span>
                    </span>
                </button>

                {/* Score indicator */}
                {score && (
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '6px 16px', borderRadius: 100,
                        background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)',
                    }}>
                        <Activity size={15} style={{ color: '#8b5cf6' }} />
                        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>
                            ATS Score:&nbsp;
                        </span>
                        <span style={{
                            fontSize: 15, fontWeight: 800,
                            color: score.total >= 70 ? '#10b981' : score.total >= 50 ? '#f59e0b' : '#ef4444',
                        }}>
                            {score.total}/100
                        </span>
                    </div>
                )}

                {/* Controls */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <button
                        onClick={resetAll}
                        className="btn-secondary"
                        style={{ padding: '8px 14px', borderRadius: 10, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}
                    >
                        <RotateCcw size={15} />
                        Reset
                    </button>
                    <button
                        onClick={toggleTheme}
                        className="btn-secondary"
                        style={{ padding: '9px 12px', borderRadius: 10 }}
                    >
                        {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                    </button>
                </div>
            </div>
        </header>
    );
}
