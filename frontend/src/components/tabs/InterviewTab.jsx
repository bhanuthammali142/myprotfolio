import { useState } from 'react';
import { useResume } from '../../context/ResumeContext';
import { Mic, Loader2, ChevronDown, ChevronUp, CheckCircle, Brain, Target, TrendingUp, Star } from 'lucide-react';

const CATEGORY_ICONS = {
    'Behavioral': Brain,
    'Technical': Target,
    'Situational': TrendingUp,
    'Career Goals': Star,
};

const CATEGORY_COLORS = {
    'Behavioral': '#8b5cf6',
    'Technical': '#3b82f6',
    'Situational': '#06b6d4',
    'Career Goals': '#10b981',
};

function QuestionCard({ question, sampleAnswer, category, index }) {
    const [expanded, setExpanded] = useState(false);
    const Icon = CATEGORY_ICONS[category] || Brain;
    const color = CATEGORY_COLORS[category] || '#8b5cf6';

    return (
        <div style={{
            background: 'var(--bg-card)', border: '1px solid var(--border-color)',
            borderRadius: 16, overflow: 'hidden',
            transition: 'all 0.2s',
        }}>
            {/* Question header */}
            <button
                onClick={() => setExpanded(!expanded)}
                style={{
                    width: '100%', padding: '20px 24px',
                    background: 'none', border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'flex-start', gap: 16,
                    textAlign: 'left',
                }}
            >
                <div style={{
                    width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                    background: `${color}15`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    <Icon size={18} style={{ color }} />
                </div>
                <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                        <span style={{
                            fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px',
                            color, background: `${color}15`, padding: '2px 8px', borderRadius: 4,
                        }}>
                            {category}
                        </span>
                        <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Q{index + 1}</span>
                    </div>
                    <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.5 }}>
                        {question}
                    </p>
                </div>
                <div style={{
                    color: 'var(--text-secondary)', marginTop: 6, flexShrink: 0,
                    transition: 'transform 0.2s',
                    transform: expanded ? 'rotate(180deg)' : 'none',
                }}>
                    <ChevronDown size={18} />
                </div>
            </button>

            {/* Sample answer */}
            {expanded && (
                <div className="fade-in-up" style={{
                    padding: '0 24px 24px 76px',
                    borderTop: '1px solid var(--border-color)',
                    paddingTop: 20,
                }}>
                    <div style={{
                        padding: 16, borderRadius: 12,
                        background: `${color}08`, border: `1px solid ${color}20`,
                    }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <CheckCircle size={12} />
                            Sample Answer (STAR Format)
                        </div>
                        <p style={{ fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.7 }}>
                            {sampleAnswer}
                        </p>
                    </div>

                    <div style={{ marginTop: 12, fontSize: 12, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                        💡 Use this as a framework — personalize with your specific experiences
                    </div>
                </div>
            )}
        </div>
    );
}

export default function InterviewTab() {
    const { interviewQuestions, generateInterviewQs, loading, jobTitle } = useResume();

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Header */}
            <div style={{
                background: 'linear-gradient(135deg, rgba(16,185,129,0.08), rgba(6,182,212,0.05))',
                border: '1px solid rgba(16,185,129,0.2)',
                borderRadius: 16, padding: 28,
            }}>
                <h3 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                        width: 40, height: 40, borderRadius: 10,
                        background: 'linear-gradient(135deg, #10b981, #06b6d4)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <Mic size={20} style={{ color: 'white' }} />
                    </div>
                    Interview Preparation Coach
                </h3>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 20 }}>
                    Get 5 AI-predicted interview questions based on your resume and the job description,
                    each with a tailored sample answer using the STAR method.
                </p>

                <button
                    onClick={generateInterviewQs}
                    disabled={loading.interview}
                    id="generate-interview-button"
                    className="btn-primary"
                    style={{
                        padding: '12px 28px', borderRadius: 12, fontSize: 14,
                        display: 'flex', alignItems: 'center', gap: 8,
                        background: 'linear-gradient(135deg, #10b981, #06b6d4)',
                    }}
                >
                    {loading.interview ? (
                        <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Generating Questions...</>
                    ) : interviewQuestions.length > 0 ? (
                        <><Mic size={18} /> Regenerate Questions</>
                    ) : (
                        <><Mic size={18} /> Generate Interview Questions</>
                    )}
                </button>
            </div>

            {/* Questions */}
            {interviewQuestions.length > 0 && (
                <div className="fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)' }}>
                            Predicted Interview Questions
                        </h3>
                        <span style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <CheckCircle size={14} style={{ color: '#10b981' }} />
                            {interviewQuestions.length} questions generated
                        </span>
                    </div>

                    {interviewQuestions.map((q, i) => (
                        <QuestionCard
                            key={i}
                            index={i}
                            question={q.question}
                            sampleAnswer={q.sampleAnswer}
                            category={q.category}
                        />
                    ))}

                    <div style={{
                        padding: 16, borderRadius: 12,
                        background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)',
                        fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6,
                    }}>
                        🎯 <strong style={{ color: '#10b981' }}>Pro tip:</strong> Practice out loud with these questions. Time your answers to 2 minutes.
                        Frame your answers around specific achievements with measurable results.
                    </div>
                </div>
            )}

            {interviewQuestions.length === 0 && !loading.interview && (
                <div style={{
                    textAlign: 'center', padding: '60px 40px',
                    background: 'var(--bg-card)', border: '1px dashed var(--border-color)',
                    borderRadius: 16,
                }}>
                    <Mic size={48} style={{ color: 'var(--text-secondary)', margin: '0 auto 16px', opacity: 0.4, display: 'block' }} />
                    <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
                        No questions yet
                    </p>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', opacity: 0.7 }}>
                        Generate personalized interview questions based on your resume and the job posting
                    </p>
                </div>
            )}
        </div>
    );
}
