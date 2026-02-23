import { useState } from 'react';
import { useResume } from '../../context/ResumeContext';
import { FileText, Loader2, Copy, CheckCircle, RefreshCw, Building2 } from 'lucide-react';

export default function CoverLetterTab() {
    const { coverLetter, generateCoverLetter, loading, companyName, setCompanyName } = useResume();
    const [copied, setCopied] = useState(false);

    const copyToClipboard = async () => {
        await navigator.clipboard.writeText(coverLetter);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Header */}
            <div style={{
                background: 'linear-gradient(135deg, rgba(245,158,11,0.08), rgba(239,68,68,0.05))',
                border: '1px solid rgba(245,158,11,0.2)',
                borderRadius: 16, padding: 28,
            }}>
                <h3 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                        width: 40, height: 40, borderRadius: 10,
                        background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <FileText size={20} style={{ color: 'white' }} />
                    </div>
                    AI Cover Letter Generator
                </h3>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 20 }}>
                    Generate a personalized, compelling cover letter based on your resume and the target job description.
                    Our AI crafts a unique letter that highlights your most relevant experience.
                </p>

                <div style={{ display: 'flex', gap: 14, alignItems: 'flex-end', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: 200 }}>
                        <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            Company Name (for personalization)
                        </label>
                        <div style={{ position: 'relative' }}>
                            <Building2 size={16} style={{
                                position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                                color: 'var(--text-secondary)', pointerEvents: 'none',
                            }} />
                            <input
                                type="text"
                                placeholder="e.g. Google, Apple, Stripe..."
                                value={companyName}
                                onChange={e => setCompanyName(e.target.value)}
                                className="input-field"
                                style={{ width: '100%', padding: '10px 12px 10px 38px', borderRadius: 10, fontSize: 14 }}
                                id="cover-letter-company-input"
                            />
                        </div>
                    </div>

                    <button
                        onClick={generateCoverLetter}
                        disabled={loading.coverLetter}
                        id="generate-cover-letter-button"
                        className="btn-primary"
                        style={{
                            padding: '12px 28px', borderRadius: 12, fontSize: 14,
                            display: 'flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap',
                            background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
                        }}
                    >
                        {loading.coverLetter ? (
                            <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Generating...</>
                        ) : coverLetter ? (
                            <><RefreshCw size={18} /> Regenerate</>
                        ) : (
                            <><FileText size={18} /> Generate Cover Letter</>
                        )}
                    </button>
                </div>
            </div>

            {/* Cover Letter Display */}
            {coverLetter && (
                <div className="fade-in-up" style={{
                    background: 'var(--bg-card)', border: '1px solid var(--border-color)',
                    borderRadius: 16, overflow: 'hidden',
                }}>
                    {/* Toolbar */}
                    <div style={{
                        padding: '16px 24px', borderBottom: '1px solid var(--border-color)',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                            <CheckCircle size={16} style={{ color: '#10b981' }} />
                            Cover Letter Ready
                        </div>
                        <div style={{ display: 'flex', gap: 10 }}>
                            <button
                                onClick={copyToClipboard}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 6,
                                    padding: '8px 16px', borderRadius: 10,
                                    background: copied ? 'rgba(16,185,129,0.1)' : 'var(--bg-secondary)',
                                    border: '1px solid var(--border-color)',
                                    color: copied ? '#10b981' : 'var(--text-secondary)',
                                    cursor: 'pointer', fontSize: 13, fontWeight: 600,
                                    transition: 'all 0.2s',
                                }}
                            >
                                {copied ? <CheckCircle size={15} /> : <Copy size={15} />}
                                {copied ? 'Copied!' : 'Copy Text'}
                            </button>
                            <button
                                onClick={() => {
                                    const blob = new Blob([coverLetter], { type: 'text/plain' });
                                    const url = URL.createObjectURL(blob);
                                    const a = document.createElement('a');
                                    a.href = url;
                                    a.download = 'cover-letter.txt';
                                    a.click();
                                }}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 6,
                                    padding: '8px 16px', borderRadius: 10,
                                    background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)',
                                    color: '#8b5cf6', cursor: 'pointer', fontSize: 13, fontWeight: 600,
                                }}
                            >
                                ⬇ Download
                            </button>
                        </div>
                    </div>

                    {/* Cover letter content */}
                    <div style={{
                        padding: '40px 48px',
                        fontFamily: 'Georgia, serif',
                        background: 'rgba(255,255,255,0.02)',
                    }}>
                        {coverLetter.split('\n\n').map((paragraph, i) => (
                            <p key={i} style={{
                                marginBottom: 20, fontSize: 15,
                                color: 'var(--text-primary)', lineHeight: 1.8,
                                fontFamily: 'Georgia, serif',
                            }}>
                                {paragraph}
                            </p>
                        ))}
                    </div>
                </div>
            )}

            {!coverLetter && !loading.coverLetter && (
                <div style={{
                    textAlign: 'center', padding: '60px 40px',
                    background: 'var(--bg-card)', border: '1px dashed var(--border-color)',
                    borderRadius: 16,
                }}>
                    <FileText size={48} style={{ color: 'var(--text-secondary)', margin: '0 auto 16px', opacity: 0.4 }} />
                    <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
                        No cover letter yet
                    </p>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', opacity: 0.7 }}>
                        Click "Generate Cover Letter" above to create a personalized letter
                    </p>
                </div>
            )}
        </div>
    );
}
