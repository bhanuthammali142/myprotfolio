
import { useNavigate } from 'react-router-dom';
import { useResume } from '../context/ResumeContext';
import {
    Zap, FileText, Target, BarChart2, MessageSquare, Star,
    ArrowRight, CheckCircle, Moon, Sun, Github, Twitter
} from 'lucide-react';

const features = [
    {
        icon: FileText,
        title: 'Smart Resume Parsing',
        description: 'Upload PDF, DOCX, or plain text. Our engine extracts contact info, experience, skills, and education instantly.',
        color: '#8b5cf6',
        gradient: 'from-purple-500/20 to-purple-600/5',
    },
    {
        icon: Target,
        title: 'ATS Score Engine',
        description: 'Get your Rezi-like score out of 100 using TF-IDF vectorization and keyword match analysis.',
        color: '#3b82f6',
        gradient: 'from-blue-500/20 to-blue-600/5',
    },
    {
        icon: BarChart2,
        title: 'Keyword Gap Analysis',
        description: 'See exactly which keywords you\'re missing. Categorized by hard skills, soft skills, and qualifications.',
        color: '#06b6d4',
        gradient: 'from-cyan-500/20 to-cyan-600/5',
    },
    {
        icon: Zap,
        title: 'AI-Powered Rewriting',
        description: 'GPT-4 rewrites your bullets using the "Accomplished X as measured by Y by doing Z" formula.',
        color: '#10b981',
        gradient: 'from-emerald-500/20 to-emerald-600/5',
    },
    {
        icon: MessageSquare,
        title: 'Cover Letter Generator',
        description: 'Get a personalized, role-specific cover letter generated from your resume and job description.',
        color: '#f59e0b',
        gradient: 'from-amber-500/20 to-amber-600/5',
    },
    {
        icon: Star,
        title: 'Interview Prep',
        description: '5 predicted interview questions with AI-crafted sample answers tailored to your background.',
        color: '#ef4444',
        gradient: 'from-red-500/20 to-red-600/5',
    },
];

const stats = [
    { value: '10x', label: 'More interviews' },
    { value: '94%', label: 'ATS pass rate' },
    { value: '3 min', label: 'To optimize' },
    { value: '100%', label: 'Free to try' },
];

const steps = [
    { num: '01', title: 'Upload Resume', desc: 'Drop your PDF or DOCX' },
    { num: '02', title: 'Paste Job Description', desc: 'Any job posting you want' },
    { num: '03', title: 'Get Your Score', desc: 'Instant ATS analysis' },
    { num: '04', title: 'AI-Optimize', desc: 'Rewrite & download' },
];

export default function Landing() {
    const navigate = useNavigate();
    const { theme, toggleTheme } = useResume();

    return (
        <div style={{ background: 'var(--bg-primary)', minHeight: '100vh', overflowX: 'hidden' }}>
            {/* Navbar */}
            <nav style={{
                position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
                backdropFilter: 'blur(16px)',
                borderBottom: '1px solid var(--border-color)',
                background: 'rgba(10,10,15,0.8)',
            }}>
                <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                            width: 36, height: 36, borderRadius: 10,
                            background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 18, fontWeight: 800,
                        }}>R</div>
                        <span style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 22, color: 'var(--text-primary)' }}>
                            Resume<span style={{ background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>AI</span>
                        </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <button onClick={toggleTheme} className="btn-secondary" style={{ padding: '8px 12px', borderRadius: 10, fontSize: 16 }}>
                            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                        </button>
                        <button
                            onClick={() => navigate('/app')}
                            className="btn-primary"
                            style={{ padding: '10px 24px', borderRadius: 12, fontSize: 14 }}
                        >
                            Get Started Free →
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section style={{ paddingTop: 140, paddingBottom: 100, textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
                {/* Background glow */}
                <div style={{
                    position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)',
                    width: 800, height: 400,
                    background: 'radial-gradient(ellipse at center, rgba(139,92,246,0.15) 0%, transparent 70%)',
                    pointerEvents: 'none',
                }} />

                <div className="fade-in-up" style={{ maxWidth: 800, margin: '0 auto', padding: '0 24px', position: 'relative' }}>
                    {/* Badge */}
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: 8,
                        padding: '6px 16px', borderRadius: 100,
                        background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.25)',
                        marginBottom: 32, fontSize: 13, fontWeight: 600, color: '#a78bfa',
                    }}>
                        <Zap size={14} />
                        Powered by GPT-4 AI Technology
                    </div>

                    <h1 style={{
                        fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
                        fontFamily: 'Outfit', fontWeight: 800, lineHeight: 1.1,
                        color: 'var(--text-primary)', marginBottom: 24,
                    }}>
                        Beat the ATS.{' '}
                        <span style={{ background: 'linear-gradient(135deg, #8b5cf6, #3b82f6, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            Land the Interview.
                        </span>
                    </h1>

                    <p style={{
                        fontSize: 20, color: 'var(--text-secondary)', lineHeight: 1.7,
                        maxWidth: 600, margin: '0 auto 48px',
                    }}>
                        Upload your resume. Paste the job description. Watch our AI analyze your ATS compatibility, identify keyword gaps, and rewrite your resume to get noticed.
                    </p>

                    <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
                        <button
                            onClick={() => navigate('/app')}
                            className="btn-primary"
                            style={{ padding: '16px 36px', borderRadius: 14, fontSize: 16, display: 'flex', alignItems: 'center', gap: 8 }}
                        >
                            <Zap size={20} />
                            Optimize My Resume
                            <ArrowRight size={20} />
                        </button>
                    </div>

                    {/* Check features */}
                    <div style={{ display: 'flex', gap: 24, justifyContent: 'center', marginTop: 40, flexWrap: 'wrap' }}>
                        {['Free to use', 'No signup required', 'AI-powered'].map(f => (
                            <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)', fontSize: 14 }}>
                                <CheckCircle size={16} style={{ color: '#10b981' }} />
                                {f}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section style={{ padding: '40px 24px 80px' }}>
                <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                    <div style={{
                        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: 1, borderRadius: 20, overflow: 'hidden',
                        border: '1px solid var(--border-color)',
                    }}>
                        {stats.map((stat, i) => (
                            <div key={i} style={{
                                padding: '40px 32px', textAlign: 'center',
                                background: 'var(--bg-card)',
                                borderRight: i < stats.length - 1 ? '1px solid var(--border-color)' : 'none',
                            }}>
                                <div style={{
                                    fontSize: 48, fontWeight: 800, fontFamily: 'Outfit',
                                    background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
                                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                                    marginBottom: 8,
                                }}>{stat.value}</div>
                                <div style={{ color: 'var(--text-secondary)', fontSize: 15 }}>{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How it works */}
            <section style={{ padding: '80px 24px', background: 'var(--bg-secondary)' }}>
                <div style={{ maxWidth: 1200, margin: '0 auto', textAlign: 'center' }}>
                    <h2 style={{ fontSize: 36, fontFamily: 'Outfit', fontWeight: 700, marginBottom: 16, color: 'var(--text-primary)' }}>
                        From upload to offer in minutes
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 17, marginBottom: 60 }}>
                        Our 4-step process turns any resume into an ATS powerhouse
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 32 }}>
                        {steps.map((step, i) => (
                            <div key={i} className="stagger-children" style={{
                                textAlign: 'center',
                                animationDelay: `${i * 0.1}s`,
                            }}>
                                <div style={{
                                    width: 64, height: 64, borderRadius: 20,
                                    background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: 20, fontWeight: 800, color: 'white',
                                    margin: '0 auto 20px',
                                }}>{step.num}</div>
                                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: 'var(--text-primary)' }}>{step.title}</h3>
                                <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{step.desc}</p>
                                {i < steps.length - 1 && (
                                    <div style={{
                                        position: 'absolute', top: 32, right: -16,
                                        color: 'var(--text-muted)', fontSize: 24,
                                    }} />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section style={{ padding: '100px 24px' }}>
                <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: 64 }}>
                        <h2 style={{ fontSize: 36, fontFamily: 'Outfit', fontWeight: 700, marginBottom: 16, color: 'var(--text-primary)' }}>
                            Everything you need to get hired
                        </h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: 17 }}>
                            Six powerful AI tools working together for your job search
                        </p>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 24 }}>
                        {features.map((feature, i) => {
                            const Icon = feature.icon;
                            return (
                                <div key={i} className="card glass-hover" style={{ padding: 32, cursor: 'default' }}>
                                    <div style={{
                                        width: 52, height: 52, borderRadius: 14,
                                        background: `rgba(${feature.color === '#8b5cf6' ? '139,92,246' : feature.color === '#3b82f6' ? '59,130,246' : feature.color === '#06b6d4' ? '6,182,212' : feature.color === '#10b981' ? '16,185,129' : feature.color === '#f59e0b' ? '245,158,11' : '239,68,68'},0.15)`,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        marginBottom: 20,
                                    }}>
                                        <Icon size={24} style={{ color: feature.color }} />
                                    </div>
                                    <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 10, color: 'var(--text-primary)' }}>{feature.title}</h3>
                                    <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.7 }}>{feature.description}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section style={{ padding: '100px 24px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
                <div style={{
                    position: 'absolute', inset: 0,
                    background: 'radial-gradient(ellipse at 50% 50%, rgba(139,92,246,0.1) 0%, transparent 70%)',
                    pointerEvents: 'none',
                }} />
                <div style={{ position: 'relative', maxWidth: 600, margin: '0 auto' }}>
                    <h2 style={{ fontSize: 40, fontFamily: 'Outfit', fontWeight: 800, marginBottom: 20, color: 'var(--text-primary)' }}>
                        Ready to get hired?
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 18, marginBottom: 40 }}>
                        Join thousands of job seekers who've already optimized their resumes with AI
                    </p>
                    <button
                        onClick={() => navigate('/app')}
                        className="btn-primary"
                        style={{ padding: '18px 48px', borderRadius: 14, fontSize: 18, display: 'inline-flex', alignItems: 'center', gap: 10 }}
                    >
                        <Zap size={22} />
                        Start Optimizing — Free
                    </button>
                </div>
            </section>

            {/* Footer */}
            <footer style={{
                borderTop: '1px solid var(--border-color)',
                padding: '32px 24px',
                textAlign: 'center',
                color: 'var(--text-secondary)',
                fontSize: 14,
            }}>
                <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
                    <span style={{ fontFamily: 'Outfit', fontWeight: 700, color: 'var(--text-primary)', fontSize: 18 }}>
                        Resume<span style={{ background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>AI</span>
                    </span>
                    <span>© 2025 ResumeAI. Built for job seekers everywhere.</span>
                    <div style={{ display: 'flex', gap: 16 }}>
                        <a href="#" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Privacy</a>
                        <a href="#" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Terms</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
