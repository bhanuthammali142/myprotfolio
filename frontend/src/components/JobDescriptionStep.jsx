import { useState } from 'react';
import { useResume } from '../context/ResumeContext';
import { Briefcase, Building2, Loader2, Sparkles, ChevronRight, FileSearch } from 'lucide-react';

const SAMPLE_JD = `We are looking for a talented Senior Software Engineer to join our team.

Requirements:
• 5+ years of experience with JavaScript, TypeScript, and React
• Strong knowledge of Node.js and RESTful API design
• Experience with cloud platforms (AWS, GCP, or Azure)
• Proficiency in SQL and NoSQL databases (PostgreSQL, MongoDB)
• Experience with Docker and Kubernetes
• Strong problem-solving and communication skills
• Ability to work in an Agile/Scrum environment
• Bachelor's degree in Computer Science or equivalent

Responsibilities:
• Design and develop scalable web applications
• Lead code reviews and mentor junior developers
• Collaborate with cross-functional teams
• Implement CI/CD pipelines and DevOps best practices
• Optimize application performance and reliability`;

export default function JobDescriptionStep() {
    const {
        jobDescription, setJobDescription, jobTitle, setJobTitle,
        companyName, setCompanyName, analyzeResume, loading, resumeText
    } = useResume();

    const [charCount, setCharCount] = useState(jobDescription.length);

    const handleJDChange = (e) => {
        setJobDescription(e.target.value);
        setCharCount(e.target.value.length);
    };

    const useSample = () => {
        setJobDescription(SAMPLE_JD);
        setCharCount(SAMPLE_JD.length);
        setJobTitle('Senior Software Engineer');
        setCompanyName('Tech Company');
    };

    const canAnalyze = resumeText && jobDescription.trim().length >= 50;

    return (
        <div className="fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: 20, animationDelay: '0.1s' }}>
            {/* Title */}
            <div>
                <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
                    💼 Job Description
                </h2>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
                    Paste the job posting you want to apply for
                </p>
            </div>

            {/* Job meta fields */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Job Title (optional)
                    </label>
                    <div style={{ position: 'relative' }}>
                        <Briefcase size={16} style={{
                            position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                            color: 'var(--text-secondary)', pointerEvents: 'none',
                        }} />
                        <input
                            type="text"
                            placeholder="e.g. Software Engineer"
                            value={jobTitle}
                            onChange={e => setJobTitle(e.target.value)}
                            className="input-field"
                            style={{ width: '100%', padding: '10px 12px 10px 38px', borderRadius: 10, fontSize: 14 }}
                            id="job-title-input"
                        />
                    </div>
                </div>
                <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Company Name (optional)
                    </label>
                    <div style={{ position: 'relative' }}>
                        <Building2 size={16} style={{
                            position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                            color: 'var(--text-secondary)', pointerEvents: 'none',
                        }} />
                        <input
                            type="text"
                            placeholder="e.g. Google"
                            value={companyName}
                            onChange={e => setCompanyName(e.target.value)}
                            className="input-field"
                            style={{ width: '100%', padding: '10px 12px 10px 38px', borderRadius: 10, fontSize: 14 }}
                            id="company-name-input"
                        />
                    </div>
                </div>
            </div>

            {/* JD Textarea */}
            <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Job Description *
                    </label>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                        <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{charCount} chars</span>
                        <button
                            onClick={useSample}
                            style={{
                                fontSize: 12, color: '#8b5cf6', background: 'none', border: 'none',
                                cursor: 'pointer', fontWeight: 600, textDecoration: 'underline',
                            }}
                        >
                            Use sample
                        </button>
                    </div>
                </div>
                <textarea
                    id="job-description-textarea"
                    value={jobDescription}
                    onChange={handleJDChange}
                    placeholder="Paste the full job description here...

Include requirements, responsibilities, qualifications, and any other relevant details for the best ATS analysis."
                    className="input-field"
                    style={{
                        width: '100%', minHeight: 260, padding: 16, borderRadius: 14,
                        fontSize: 14, resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6,
                    }}
                />
            </div>

            {/* Status info */}
            {jobDescription.trim().length > 0 && jobDescription.trim().length < 50 && (
                <div style={{
                    fontSize: 12, color: '#f59e0b',
                    background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)',
                    padding: '8px 14px', borderRadius: 10,
                }}>
                    ⚠️ Please paste a more complete job description for accurate analysis
                </div>
            )}

            {/* Analyze Button */}
            <button
                id="analyze-button"
                onClick={analyzeResume}
                disabled={!canAnalyze || loading.analyze}
                className="btn-primary"
                style={{
                    width: '100%', padding: '16px', borderRadius: 14,
                    fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                    opacity: !canAnalyze ? 0.5 : 1,
                    cursor: !canAnalyze ? 'not-allowed' : 'pointer',
                }}
            >
                {loading.analyze ? (
                    <>
                        <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
                        Analyzing with AI...
                    </>
                ) : (
                    <>
                        <FileSearch size={20} />
                        Analyze ATS Compatibility
                        <ChevronRight size={20} />
                    </>
                )}
            </button>

            {!resumeText && (
                <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-secondary)' }}>
                    ← Upload your resume first to enable analysis
                </p>
            )}
        </div>
    );
}
