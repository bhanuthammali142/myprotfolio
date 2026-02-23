import { useResume } from '../context/ResumeContext';
import ScoreTab from './tabs/ScoreTab';
import KeywordsTab from './tabs/KeywordsTab';
import OptimizeTab from './tabs/OptimizeTab';
import CoverLetterTab from './tabs/CoverLetterTab';
import InterviewTab from './tabs/InterviewTab';
import { BarChart2, Tag, Sparkles, FileText, Mic, ArrowLeft, PenTool } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TABS = [
    { id: 'score', label: 'ATS Score', icon: BarChart2 },
    { id: 'keywords', label: 'Keywords', icon: Tag },
    { id: 'optimize', label: 'AI Optimize', icon: Sparkles },
    { id: 'cover-letter', label: 'Cover Letter', icon: FileText },
    { id: 'interview', label: 'Interview Prep', icon: Mic },
];

export default function AnalysisPanel() {
    const { activeTab, setActiveTab, setCurrentStep, currentStep } = useResume();
    const navigate = useNavigate();

    return (
        <div className="fade-in-up" style={{ marginTop: 32 }}>
            {/* Top Banner Actions */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <button
                    onClick={() => setCurrentStep(1)}
                    style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: 'var(--text-secondary)', fontSize: 13, fontWeight: 500,
                    }}
                >
                    <ArrowLeft size={15} />
                    Back to Edit
                </button>

                <button
                    onClick={() => navigate('/build-resume')}
                    className="btn-primary"
                    style={{ padding: '8px 20px', borderRadius: 8, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, background: 'linear-gradient(135deg, #10b981, #06b6d4)' }}
                >
                    <PenTool size={15} /> Build Optimized ATS Resume
                </button>
            </div>

            {/* Tab navigation */}
            <div style={{
                display: 'flex', gap: 6, overflowX: 'auto',
                background: 'var(--bg-card)', border: '1px solid var(--border-color)',
                borderRadius: 16, padding: 8, marginBottom: 24,
                scrollbarWidth: 'none',
            }}>
                {TABS.map(tab => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            id={`tab-${tab.id}`}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                gap: 8, padding: '10px 20px', borderRadius: 12, border: 'none',
                                cursor: 'pointer', whiteSpace: 'nowrap', fontSize: 14, fontWeight: 600,
                                transition: 'all 0.2s',
                                background: isActive ? 'rgba(139,92,246,0.15)' : 'transparent',
                                color: isActive ? '#8b5cf6' : 'var(--text-secondary)',
                                borderColor: isActive ? 'rgba(139,92,246,0.3)' : 'transparent',
                                borderWidth: 1, borderStyle: 'solid',
                            }}
                        >
                            <Icon size={16} />
                            <span>{tab.label}</span>
                        </button>
                    );
                })}
            </div>

            {/* Tab content */}
            <div className="fade-in-up" key={activeTab}>
                {activeTab === 'score' && <ScoreTab />}
                {activeTab === 'keywords' && <KeywordsTab />}
                {activeTab === 'optimize' && <OptimizeTab />}
                {activeTab === 'cover-letter' && <CoverLetterTab />}
                {activeTab === 'interview' && <InterviewTab />}
            </div>
        </div>
    );
}
