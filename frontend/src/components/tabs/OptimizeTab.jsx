import { useState } from 'react';
import { useResume } from '../../context/ResumeContext';
import { resumeAPI } from '../../services/api';
import { Sparkles, Loader2, ChevronDown, ChevronUp, Copy, CheckCircle, RefreshCw, Lightbulb, Plus, Minus } from 'lucide-react';
import toast from 'react-hot-toast';

export default function OptimizeTab() {
    const { resumeText, jobDescription, structured, keywords, score, optimizeFull, loading, optimizedData } = useResume();
    const [bulletText, setBulletText] = useState('');
    const [bulletResult, setBulletResult] = useState(null);
    const [bulletLoading, setBulletLoading] = useState(false);
    const [summaryResult, setSummaryResult] = useState('');
    const [summaryLoading, setSummaryLoading] = useState(false);
    const [copied, setCopied] = useState({});

    const handleBulletRewrite = async () => {
        if (!bulletText.trim()) {
            toast.error('Please enter a bullet point to rewrite');
            return;
        }
        setBulletLoading(true);
        try {
            const result = await resumeAPI.rewriteBullet(
                bulletText,
                [...(keywords?.hardSkills || []), ...(keywords?.softSkills || [])].slice(0, 8),
                ''
            );
            setBulletResult(result.result);
        } catch (err) {
            toast.error('Rewrite failed: ' + err.message);
        } finally {
            setBulletLoading(false);
        }
    };

    const handleSummaryRewrite = async () => {
        setSummaryLoading(true);
        try {
            const result = await resumeAPI.rewriteSummary(
                resumeText,
                jobDescription,
                structured?.contactInfo?.name || ''
            );
            setSummaryResult(result.summary);
        } catch (err) {
            toast.error('Summary generation failed: ' + err.message);
        } finally {
            setSummaryLoading(false);
        }
    };

    const copyToClipboard = async (text, key) => {
        await navigator.clipboard.writeText(text);
        setCopied(prev => ({ ...prev, [key]: true }));
        toast.success('Copied to clipboard!');
        setTimeout(() => setCopied(prev => ({ ...prev, [key]: false })), 2000);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Full Optimization */}
            <FullOptimizeCard
                loading={loading.optimize}
                optimizedData={optimizedData}
                onOptimize={optimizeFull}
                copied={copied}
                onCopy={copyToClipboard}
            />

            {/* Bullet Point Rewriter */}
            <div style={{
                background: 'var(--bg-card)', border: '1px solid var(--border-color)',
                borderRadius: 16, padding: 24,
            }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Lightbulb size={18} style={{ color: '#f59e0b' }} />
                    Single Bullet Point Rewriter
                </h3>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20 }}>
                    Paste any individual bullet point and AI will rewrite it using the "Accomplished X as measured by Y by doing Z" formula
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <textarea
                        id="bullet-input"
                        value={bulletText}
                        onChange={e => setBulletText(e.target.value)}
                        placeholder="e.g. Worked on fixing bugs in the backend API and improved response time"
                        className="input-field"
                        style={{ width: '100%', minHeight: 100, padding: 14, borderRadius: 12, fontSize: 14, resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.5 }}
                    />

                    <button
                        onClick={handleBulletRewrite}
                        disabled={!bulletText.trim() || bulletLoading}
                        className="btn-primary"
                        id="rewrite-bullet-button"
                        style={{ padding: '12px 24px', borderRadius: 12, fontSize: 14, display: 'flex', alignItems: 'center', gap: 8, alignSelf: 'flex-start', opacity: !bulletText.trim() ? 0.5 : 1 }}
                    >
                        {bulletLoading ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Sparkles size={16} />}
                        {bulletLoading ? 'Rewriting...' : 'AI Rewrite'}
                    </button>

                    {bulletResult && (
                        <div className="fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                            {/* Original */}
                            <div style={{
                                padding: 16, borderRadius: 12,
                                background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)',
                            }}>
                                <div style={{ fontSize: 11, fontWeight: 700, color: '#ef4444', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>
                                    Original
                                </div>
                                <p style={{ fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.5 }}>{bulletResult.original}</p>
                            </div>

                            {/* Optimized */}
                            <div style={{
                                padding: 16, borderRadius: 12,
                                background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)',
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                                    <div style={{ fontSize: 11, fontWeight: 700, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                        ✨ AI Optimized
                                    </div>
                                    <button
                                        onClick={() => copyToClipboard(bulletResult.optimized, 'bullet')}
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#10b981', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}
                                    >
                                        {copied.bullet ? <CheckCircle size={14} /> : <Copy size={14} />}
                                        Copy
                                    </button>
                                </div>
                                <p style={{ fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.5 }}>{bulletResult.optimized}</p>

                                {/* Keywords injected */}
                                {bulletResult.keywords_injected?.length > 0 && (
                                    <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                        {bulletResult.keywords_injected.map((kw, i) => (
                                            <span key={i} className="badge-purple" style={{ fontSize: 11, padding: '2px 8px', borderRadius: 4 }}>
                                                +{kw}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Rationale */}
                            {bulletResult.improvement_rationale && (
                                <div style={{
                                    padding: 14, borderRadius: 12,
                                    background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.15)',
                                    fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5,
                                }}>
                                    💡 {bulletResult.improvement_rationale}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Professional Summary Generator */}
            <div style={{
                background: 'var(--bg-card)', border: '1px solid var(--border-color)',
                borderRadius: 16, padding: 24,
            }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Sparkles size={18} style={{ color: '#3b82f6' }} />
                    Professional Summary Generator
                </h3>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20 }}>
                    Generate an ATS-optimized professional summary tailored to the target job
                </p>

                <button
                    onClick={handleSummaryRewrite}
                    disabled={summaryLoading}
                    className="btn-primary"
                    id="generate-summary-button"
                    style={{ padding: '12px 24px', borderRadius: 12, fontSize: 14, display: 'flex', alignItems: 'center', gap: 8, marginBottom: summaryResult ? 16 : 0 }}
                >
                    {summaryLoading ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Sparkles size={16} />}
                    {summaryLoading ? 'Generating...' : 'Generate AI Summary'}
                </button>

                {summaryResult && (
                    <div className="fade-in-up" style={{
                        padding: 20, borderRadius: 12,
                        background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                ✨ AI-Generated Summary
                            </div>
                            <button
                                onClick={() => copyToClipboard(summaryResult, 'summary')}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#3b82f6', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}
                            >
                                {copied.summary ? <CheckCircle size={14} /> : <Copy size={14} />}
                                Copy
                            </button>
                        </div>
                        <p style={{ fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.7 }}>{summaryResult}</p>
                    </div>
                )}
            </div>
        </div>
    );
}

function FullOptimizeCard({ loading, optimizedData, onOptimize, copied, onCopy }) {
    const [expanded, setExpanded] = useState(false);

    return (
        <div style={{
            background: 'linear-gradient(135deg, rgba(139,92,246,0.08), rgba(59,130,246,0.05))',
            border: '1px solid rgba(139,92,246,0.2)',
            borderRadius: 16, padding: 24,
        }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}>
                <div>
                    <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                            width: 36, height: 36, borderRadius: 10,
                            background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <Sparkles size={18} style={{ color: 'white' }} />
                        </div>
                        Full AI Resume Optimization
                    </h3>
                    <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                        Get a comprehensive optimization: new summary, improved bullet points, skill recommendations, and missing keywords
                    </p>
                </div>
                <button
                    onClick={onOptimize}
                    disabled={loading}
                    id="full-optimize-button"
                    className="btn-primary"
                    style={{ padding: '12px 28px', borderRadius: 12, fontSize: 14, display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}
                >
                    {loading ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <Sparkles size={18} />}
                    {loading ? 'Optimizing...' : optimizedData ? 'Re-Optimize' : 'Optimize Resume'}
                </button>
            </div>

            {optimizedData && (
                <div className="fade-in-up" style={{ marginTop: 24 }}>
                    <button
                        onClick={() => setExpanded(!expanded)}
                        style={{
                            width: '100%', padding: '12px', borderRadius: 10,
                            background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)',
                            color: '#8b5cf6', fontSize: 14, fontWeight: 600,
                            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                        }}
                    >
                        {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        {expanded ? 'Collapse Results' : 'View Optimization Results'}
                    </button>

                    {expanded && (
                        <div className="fade-in-up" style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
                            {/* AI Summary */}
                            {optimizedData.summary && (
                                <ResultCard
                                    title="✨ Optimized Summary"
                                    content={optimizedData.summary}
                                    color="#8b5cf6"
                                    onCopy={() => onCopy(optimizedData.summary, 'full-summary')}
                                    copied={copied['full-summary']}
                                />
                            )}

                            {/* Bullet Improvements */}
                            {optimizedData.bulletImprovements?.length > 0 && (
                                <div style={{
                                    padding: 20, borderRadius: 12,
                                    background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)',
                                }}>
                                    <h4 style={{ fontSize: 13, fontWeight: 700, color: '#3b82f6', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                        🚀 Bullet Point Improvements
                                    </h4>
                                    {optimizedData.bulletImprovements.map((b, i) => (
                                        <div key={i} style={{ marginBottom: 16, paddingBottom: 16, borderBottom: i < optimizedData.bulletImprovements.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
                                            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>
                                                <span style={{ color: '#ef4444' }}>Before:</span> {b.original}
                                            </div>
                                            <div style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 500, marginBottom: 4 }}>
                                                <span style={{ color: '#10b981' }}>After:</span> {b.optimized}
                                            </div>
                                            {b.reason && (
                                                <div style={{ fontSize: 11, color: '#3b82f6', opacity: 0.8 }}>💡 {b.reason}</div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Skills to add/remove */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                {optimizedData.skillsToAdd?.length > 0 && (
                                    <div style={{ padding: 16, borderRadius: 12, background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)' }}>
                                        <div style={{ fontSize: 12, fontWeight: 700, color: '#10b981', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <Plus size={14} /> Skills to Add
                                        </div>
                                        {optimizedData.skillsToAdd.map((s, i) => (
                                            <div key={i} style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>• {s}</div>
                                        ))}
                                    </div>
                                )}
                                {optimizedData.skillsToRemove?.length > 0 && (
                                    <div style={{ padding: 16, borderRadius: 12, background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)' }}>
                                        <div style={{ fontSize: 12, fontWeight: 700, color: '#ef4444', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <Minus size={14} /> Skills to Remove
                                        </div>
                                        {optimizedData.skillsToRemove.map((s, i) => (
                                            <div key={i} style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>• {s}</div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Overall advice */}
                            {optimizedData.overallAdvice && (
                                <div style={{ padding: 16, borderRadius: 12, background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)', fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                                    💼 {optimizedData.overallAdvice}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

function ResultCard({ title, content, color, onCopy, copied }) {
    return (
        <div style={{ padding: 20, borderRadius: 12, background: `${color}08`, border: `1px solid ${color}20` }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {title}
                </div>
                <button onClick={onCopy} style={{ background: 'none', border: 'none', cursor: 'pointer', color, display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}>
                    {copied ? <CheckCircle size={14} /> : <Copy size={14} />}
                    Copy
                </button>
            </div>
            <p style={{ fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.7 }}>{content}</p>
        </div>
    );
}
