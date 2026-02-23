import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useResume } from '../context/ResumeContext';
import { builderAPI } from '../services/api';
import toast from 'react-hot-toast';
import { ArrowLeft, CheckCircle, FileText, Loader2, Sparkles, AlertCircle, Download, FileSearch } from 'lucide-react';
import Header from '../components/Header';

export default function ResumeBuilder() {
    const navigate = useNavigate();
    const { structured, jobDescription } = useResume();
    const [step, setStep] = useState(1);
    const [templates, setTemplates] = useState([]);
    const [selectedTemplate, setSelectedTemplate] = useState(null);

    // Form Data
    const [formData, setFormData] = useState({
        fullName: '', email: '', phone: '', location: '', summary: '',
        experience: [{ company: '', role: '', startDate: '', endDate: '', bullets: [''] }],
        education: [{ school: '', degree: '', field: '', graduationDate: '' }],
        skills: ['']
    });

    const [loading, setLoading] = useState(false);
    const [pdfBlob, setPdfBlob] = useState(null);
    const [missingFields, setMissingFields] = useState([]);

    useEffect(() => {
        if (!structured && !jobDescription) {
            toast.error("Please analyze your resume first.");
            navigate('/app');
        }
    }, [structured, jobDescription, navigate]);

    useEffect(() => {
        const fetchTemplates = async () => {
            try {
                const res = await builderAPI.getTemplates();
                if (res.templates) setTemplates(res.templates);
            } catch (err) {
                toast.error('Failed to load templates');
            }
        };
        fetchTemplates();
    }, []);

    // Map parsed data on mount
    useEffect(() => {
        if (structured) {
            setFormData({
                fullName: structured.contactInfo?.name || '',
                email: structured.contactInfo?.email || '',
                phone: structured.contactInfo?.phone || '',
                location: structured.contactInfo?.location || '',
                summary: structured.summary || '',
                experience: structured.experience?.length ? structured.experience.map(e => ({
                    company: e.company || '',
                    role: e.role || '',
                    startDate: e.dates ? (e.dates.split(/[-–]/)[0] || '').trim() : '',
                    endDate: e.dates ? (e.dates.split(/[-–]/)[1] || '').trim() : '',
                    bullets: e.bullets?.length ? e.bullets : ['']
                })) : [{ company: '', role: '', startDate: '', endDate: '', bullets: [''] }],
                education: structured.education?.length ? structured.education.map(e => ({
                    school: e.institution || '',
                    degree: e.degree || '',
                    field: '',
                    graduationDate: e.year || ''
                })) : [{ school: '', degree: '', field: '', graduationDate: '' }],
                skills: structured.skills?.length ? structured.skills : ['']
            });
        }
    }, [structured]);

    const detectMissingFields = () => {
        const missing = [];
        if (!formData.fullName) missing.push('Full Name');
        if (!formData.email) missing.push('Email');
        if (!formData.phone) missing.push('Phone');
        if (!formData.location) missing.push('Location');
        if (!formData.summary) missing.push('Professional Summary');

        formData.experience.forEach((exp, idx) => {
            if (!exp.company) missing.push(`Experience ${idx + 1} Company`);
            if (!exp.role) missing.push(`Experience ${idx + 1} Role`);
            if (!exp.startDate) missing.push(`Experience ${idx + 1} Start Date`);
            if (!exp.endDate) missing.push(`Experience ${idx + 1} End Date`);
            if (!exp.bullets.length || !exp.bullets[0]) missing.push(`Experience ${idx + 1} Bullet Point`);
        });

        formData.education.forEach((edu, idx) => {
            if (!edu.school) missing.push(`Education ${idx + 1} School`);
            if (!edu.degree) missing.push(`Education ${idx + 1} Degree`);
            if (!edu.field) missing.push(`Education ${idx + 1} Field of Study`);
            if (!edu.graduationDate) missing.push(`Education ${idx + 1} Graduation Date`);
        });

        if (!formData.skills.length || !formData.skills[0]) missing.push('Skills');

        setMissingFields(missing);
        return missing;
    };

    const handleTemplateSelect = (id) => {
        setSelectedTemplate(id);
        const missing = detectMissingFields();
        setStep(missing.length > 0 ? 2 : 3);
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        const missing = detectMissingFields();
        if (missing.length > 0) {
            toast.error(`Please fill in all required fields: ${missing.slice(0, 3).join(', ')}...`);
            return;
        }
        setStep(3);
    };

    const updateFormData = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const updateArrayField = (arrayName, index, field, value) => {
        setFormData(prev => {
            const arr = [...prev[arrayName]];
            arr[index] = { ...arr[index], [field]: value };
            return { ...prev, [arrayName]: arr };
        });
    };

    const updateSkills = (value) => {
        setFormData(prev => ({ ...prev, skills: value.split(',').map(s => s.trim()) }));
    };

    const generateResume = async () => {
        setLoading(true);
        try {
            // 1. Optimize
            toast('Optimizing content...', { icon: '✨' });
            const optRes = await builderAPI.generateOptimizedResume(formData, jobDescription, selectedTemplate);

            // 2. Render PDF
            toast('Generating PDF...', { icon: '📄' });
            const pdfData = await builderAPI.renderPDF(selectedTemplate, optRes.optimizedData);

            const blob = new Blob([pdfData], { type: 'application/pdf' });
            setPdfBlob(blob);
            setStep(4);
            toast.success('Resume built successfully!');
        } catch (err) {
            toast.error('Failed to generate resume: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
            <Header />
            <div style={{ maxWidth: 1000, margin: '0 auto', padding: '40px 24px' }}>

                <button
                    onClick={() => step > 1 ? setStep(step - 1) : navigate('/app')}
                    style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600,
                        marginBottom: 30,
                    }}
                >
                    <ArrowLeft size={16} /> Back
                </button>

                {/* Step 1: Template Selection */}
                {step === 1 && (
                    <div className="fade-in-up">
                        <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 12 }}>
                            Choose a Template
                        </h1>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: 32 }}>
                            Select an ATS-friendly template to build your optimized resume.
                        </p>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
                            {templates.map(tpl => (
                                <div
                                    key={tpl.id}
                                    onClick={() => handleTemplateSelect(tpl.id)}
                                    style={{
                                        background: 'var(--bg-card)', border: `2px solid ${selectedTemplate === tpl.id ? '#8b5cf6' : 'var(--border-color)'}`,
                                        borderRadius: 16, overflow: 'hidden', cursor: 'pointer', transition: 'all 0.2s', padding: 16,
                                    }}
                                >
                                    <img src={tpl.thumbnail} alt={tpl.name} style={{ width: '100%', height: 'auto', borderRadius: 8, objectFit: 'cover' }} />
                                    <div style={{ padding: '16px 8px 8px' }}>
                                        <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>{tpl.name}</h3>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Step 2: Missing Data Form */}
                {step === 2 && (
                    <div className="fade-in-up">
                        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 16, padding: 32 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                                <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(245,158,11,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <AlertCircle size={20} style={{ color: '#f59e0b' }} />
                                </div>
                                <div>
                                    <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>Missing Information Detected</h2>
                                    <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Please fill in the incomplete fields before generating the PDF.</p>
                                </div>
                            </div>

                            <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                                {/* Contact Info */}
                                <div>
                                    <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 12, borderBottom: '1px solid var(--border-color)', paddingBottom: 8 }}>Contact Info</h3>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                        <div><label className="form-label">Full Name</label><input required value={formData.fullName} onChange={e => updateFormData('fullName', e.target.value)} className="input-field w-full" /></div>
                                        <div><label className="form-label">Email</label><input type="email" required value={formData.email} onChange={e => updateFormData('email', e.target.value)} className="input-field w-full" /></div>
                                        <div><label className="form-label">Phone</label><input required value={formData.phone} onChange={e => updateFormData('phone', e.target.value)} className="input-field w-full" /></div>
                                        <div><label className="form-label">Location</label><input required value={formData.location} onChange={e => updateFormData('location', e.target.value)} className="input-field w-full" /></div>
                                    </div>
                                </div>

                                {/* Summary */}
                                <div>
                                    <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 12, borderBottom: '1px solid var(--border-color)', paddingBottom: 8 }}>Professional Summary</h3>
                                    <textarea required value={formData.summary} onChange={e => updateFormData('summary', e.target.value)} className="input-field w-full" rows="4"></textarea>
                                </div>

                                {/* Experience */}
                                <div>
                                    <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 12, borderBottom: '1px solid var(--border-color)', paddingBottom: 8 }}>Experience</h3>
                                    {formData.experience.map((exp, idx) => (
                                        <div key={idx} style={{ marginBottom: 16, padding: 16, background: 'var(--bg-secondary)', borderRadius: 12 }}>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 12 }}>
                                                <div><label className="form-label">Company</label><input required value={exp.company} onChange={e => updateArrayField('experience', idx, 'company', e.target.value)} className="input-field w-full" /></div>
                                                <div><label className="form-label">Role</label><input required value={exp.role} onChange={e => updateArrayField('experience', idx, 'role', e.target.value)} className="input-field w-full" /></div>
                                                <div><label className="form-label">Start Date</label><input required placeholder="YYYY-MM" value={exp.startDate} onChange={e => updateArrayField('experience', idx, 'startDate', e.target.value)} className="input-field w-full" /></div>
                                                <div><label className="form-label">End Date</label><input required placeholder="YYYY-MM or Present" value={exp.endDate} onChange={e => updateArrayField('experience', idx, 'endDate', e.target.value)} className="input-field w-full" /></div>
                                            </div>
                                            <div>
                                                <label className="form-label">Key Achievement (Bullet 1)</label>
                                                <input required value={exp.bullets[0] || ''} onChange={e => {
                                                    const newBullets = [...exp.bullets]; newBullets[0] = e.target.value;
                                                    updateArrayField('experience', idx, 'bullets', newBullets);
                                                }} className="input-field w-full" />
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Education */}
                                <div>
                                    <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 12, borderBottom: '1px solid var(--border-color)', paddingBottom: 8 }}>Education</h3>
                                    {formData.education.map((edu, idx) => (
                                        <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                            <div><label className="form-label">School</label><input required value={edu.school} onChange={e => updateArrayField('education', idx, 'school', e.target.value)} className="input-field w-full" /></div>
                                            <div><label className="form-label">Degree</label><input required value={edu.degree} onChange={e => updateArrayField('education', idx, 'degree', e.target.value)} className="input-field w-full" /></div>
                                            <div><label className="form-label">Field of Study</label><input required value={edu.field} onChange={e => updateArrayField('education', idx, 'field', e.target.value)} className="input-field w-full" /></div>
                                            <div><label className="form-label">Graduation Date</label><input required value={edu.graduationDate} onChange={e => updateArrayField('education', idx, 'graduationDate', e.target.value)} className="input-field w-full" /></div>
                                        </div>
                                    ))}
                                </div>

                                {/* Skills */}
                                <div>
                                    <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 12, borderBottom: '1px solid var(--border-color)', paddingBottom: 8 }}>Skills (comma separated)</h3>
                                    <input required value={formData.skills.join(', ')} onChange={e => updateSkills(e.target.value)} className="input-field w-full" />
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
                                    <button type="submit" className="btn-primary" style={{ padding: '12px 24px', borderRadius: 10 }}>
                                        Proceed to Build <Sparkles size={16} className="ml-2" />
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Step 3: Action */}
                {step === 3 && (
                    <div className="fade-in-up" style={{ textAlign: 'center', padding: 60, background: 'var(--bg-card)', borderRadius: 16, border: '1px solid var(--border-color)' }}>
                        <FileSearch size={48} style={{ color: '#8b5cf6', margin: '0 auto 20px' }} />
                        <h2 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>Final Optimization & Render</h2>
                        <p style={{ fontSize: 15, color: 'var(--text-secondary)', marginBottom: 32, maxWidth: 400, margin: '0 auto 32px' }}>
                            We will now use AI to rewrite and inject ATS-friendly keywords from the job description into your bullets and summary.
                        </p>
                        <button onClick={generateResume} disabled={loading} className="btn-primary" style={{ padding: '14px 40px', fontSize: 16, borderRadius: 12, margin: '0 auto' }}>
                            {loading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                            {loading ? 'Building Resume...' : 'Generate AI Optimized PDF'}
                        </button>
                    </div>
                )}

                {/* Step 4: Download */}
                {step === 4 && pdfBlob && (
                    <div className="fade-in-up" style={{ textAlign: 'center', padding: 60, background: 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(6,182,212,0.1))', borderRadius: 16, border: '1px solid rgba(16,185,129,0.2)' }}>
                        <div style={{ width: 64, height: 64, background: '#10b981', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                            <CheckCircle size={32} style={{ color: 'white' }} />
                        </div>
                        <h2 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>Your Resume is Ready!</h2>
                        <p style={{ fontSize: 15, color: 'var(--text-secondary)', marginBottom: 32 }}>Your optimized, perfectly formatted ATS resume has been generated.</p>

                        <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
                            <button
                                onClick={() => {
                                    const url = URL.createObjectURL(pdfBlob);
                                    window.open(url, '_blank');
                                }}
                                style={{
                                    padding: '12px 24px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 12, color: 'var(--text-primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer'
                                }}
                            >
                                <FileText size={18} /> Preview PDF
                            </button>
                            <button
                                onClick={() => {
                                    const url = URL.createObjectURL(pdfBlob);
                                    const a = document.createElement('a');
                                    a.href = url;
                                    a.download = `Optimized_Resume_${templates.find(t => t.id === selectedTemplate)?.name || 'ATS'}.pdf`;
                                    a.click();
                                }}
                                className="btn-primary"
                                style={{
                                    padding: '12px 24px', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 8, background: 'linear-gradient(135deg, #10b981, #06b6d4)'
                                }}
                            >
                                <Download size={18} /> Download Target PDF
                            </button>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
