import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useResume } from '../context/ResumeContext';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2, X } from 'lucide-react';

const ACCEPTED_TYPES = {
    'application/pdf': ['.pdf'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    'application/msword': ['.doc'],
    'text/plain': ['.txt'],
};

export default function UploadStep() {
    const { uploadResume, loading, resumeFile, resumeText, structured, currentStep } = useResume();
    const [error, setError] = useState('');

    const onDrop = useCallback(async (acceptedFiles, rejectedFiles) => {
        setError('');

        if (rejectedFiles.length > 0) {
            setError('Invalid file type. Please upload a PDF, DOCX, DOC, or TXT file.');
            return;
        }

        const file = acceptedFiles[0];
        if (!file) return;

        try {
            await uploadResume(file);
        } catch (err) {
            setError(err.message);
        }
    }, [uploadResume]);

    const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
        onDrop,
        accept: ACCEPTED_TYPES,
        maxFiles: 1,
        maxSize: 10 * 1024 * 1024, // 10MB
        disabled: loading.upload,
    });

    const isUploaded = !!resumeText;

    const getBorderColor = () => {
        if (isDragReject || error) return '#ef4444';
        if (isDragActive) return '#8b5cf6';
        if (isUploaded) return '#10b981';
        return 'var(--border-color)';
    };

    const getBackgroundColor = () => {
        if (isDragActive) return 'rgba(139, 92, 246, 0.08)';
        if (isUploaded) return 'rgba(16, 185, 129, 0.04)';
        return 'var(--bg-card)';
    };

    return (
        <div className="fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Title */}
            <div>
                <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
                    📄 Upload Your Resume
                </h2>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
                    Supports PDF, DOCX, DOC, and TXT files up to 10MB
                </p>
            </div>

            {/* Drop Zone */}
            <div
                {...getRootProps()}
                id="resume-dropzone"
                style={{
                    border: `2px dashed ${getBorderColor()}`,
                    borderRadius: 16,
                    padding: '48px 32px',
                    textAlign: 'center',
                    cursor: loading.upload ? 'wait' : 'pointer',
                    background: getBackgroundColor(),
                    transition: 'all 0.3s ease',
                    outline: 'none',
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                <input {...getInputProps()} id="resume-file-input" />

                {/* Background gradient */}
                {isDragActive && (
                    <div style={{
                        position: 'absolute', inset: 0,
                        background: 'radial-gradient(circle at center, rgba(139,92,246,0.15), transparent)',
                        pointerEvents: 'none',
                    }} />
                )}

                {loading.upload ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
                        <Loader2 size={48} style={{ color: '#8b5cf6', animation: 'spin 1s linear infinite' }} />
                        <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>Parsing resume...</p>
                        <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Extracting text and structure</p>
                    </div>
                ) : isUploaded ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                        <CheckCircle size={52} style={{ color: '#10b981' }} />
                        <p style={{ fontSize: 16, fontWeight: 700, color: '#10b981' }}>Resume Uploaded!</p>
                        <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                            {resumeFile?.name} • {Math.round((resumeFile?.size || 0) / 1024)}KB
                        </p>
                        <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                            {resumeText.split(/\s+/).filter(Boolean).length} words extracted
                        </p>
                        <button
                            onClick={(e) => { e.stopPropagation(); }}
                            style={{
                                marginTop: 8, fontSize: 12, color: '#8b5cf6',
                                background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline',
                            }}
                        >
                            Click to replace
                        </button>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
                        <div style={{
                            width: 72, height: 72, borderRadius: 20,
                            background: isDragActive ? 'rgba(139,92,246,0.2)' : 'rgba(139,92,246,0.1)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'all 0.3s',
                        }}>
                            <Upload size={32} style={{ color: isDragActive ? '#8b5cf6' : '#8b5cf6', opacity: isDragActive ? 1 : 0.7 }} />
                        </div>
                        <div>
                            <p style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
                                {isDragActive ? 'Drop your resume here!' : 'Drag & drop your resume'}
                            </p>
                            <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                                or <span style={{ color: '#8b5cf6', fontWeight: 600 }}>browse to upload</span>
                            </p>
                        </div>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
                            {['PDF', 'DOCX', 'DOC', 'TXT'].map(t => (
                                <span key={t} className="badge-purple" style={{ padding: '3px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>
                                    {t}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Error message */}
            {error && (
                <div style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '12px 16px', borderRadius: 12,
                    background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
                    color: '#ef4444', fontSize: 13,
                }}>
                    <AlertCircle size={16} />
                    {error}
                    <button onClick={() => setError('')} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}>
                        <X size={14} />
                    </button>
                </div>
            )}

            {/* Structured data preview */}
            {structured && (
                <div style={{
                    background: 'var(--bg-card)', border: '1px solid var(--border-color)',
                    borderRadius: 14, padding: 20,
                }}>
                    <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 14 }}>
                        Extracted Data
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {structured.contactInfo?.name && structured.contactInfo.name !== 'Not found' && (
                            <InfoRow label="Name" value={structured.contactInfo.name} />
                        )}
                        {structured.contactInfo?.email && (
                            <InfoRow label="Email" value={structured.contactInfo.email} />
                        )}
                        {structured.skills?.length > 0 && (
                            <InfoRow
                                label="Skills Found"
                                value={`${Math.min(structured.skills.length, 6)} detected`}
                                badge={true}
                            />
                        )}
                        {structured.experience?.length > 0 && (
                            <InfoRow
                                label="Experience"
                                value={`${structured.experience.length} position(s) found`}
                            />
                        )}
                        {structured.education?.length > 0 && (
                            <InfoRow
                                label="Education"
                                value={`${structured.education.length} entry(ies) found`}
                            />
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

function InfoRow({ label, value, badge }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)', minWidth: 90 }}>{label}</span>
            <span style={{
                fontSize: 13, fontWeight: 600, color: 'var(--text-primary)',
                background: badge ? 'rgba(16,185,129,0.1)' : 'transparent',
                padding: badge ? '2px 10px' : 0,
                borderRadius: badge ? 6 : 0,
                color: badge ? '#10b981' : 'var(--text-primary)',
            }}>
                {value}
            </span>
        </div>
    );
}
