import { useResume } from '../context/ResumeContext';
import { Upload, FileText, BarChart2, Sparkles, CheckCircle } from 'lucide-react';

const steps = [
    { icon: Upload, label: 'Upload Resume', id: 0 },
    { icon: FileText, label: 'Job Description', id: 1 },
    { icon: BarChart2, label: 'ATS Analysis', id: 2 },
    { icon: Sparkles, label: 'AI Optimize', id: 3 },
];

export default function ProgressStepper() {
    const { currentStep } = useResume();

    return (
        <div style={{
            display: 'flex', alignItems: 'center', gap: 0,
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 16, padding: '20px 32px',
            overflowX: 'auto',
        }}>
            {steps.map((step, i) => {
                const Icon = step.icon;
                const isActive = currentStep === i;
                const isCompleted = currentStep > i;
                const isLast = i === steps.length - 1;

                return (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', flex: isLast ? 0 : 1, minWidth: 'fit-content' }}>
                        {/* Step */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, whiteSpace: 'nowrap' }}>
                            <div style={{
                                width: 40, height: 40, borderRadius: 12,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                transition: 'all 0.3s ease',
                                background: isCompleted
                                    ? 'linear-gradient(135deg, #10b981, #059669)'
                                    : isActive
                                        ? 'linear-gradient(135deg, #8b5cf6, #3b82f6)'
                                        : 'var(--bg-secondary)',
                                border: isActive ? 'none' : isCompleted ? 'none' : '1px solid var(--border-color)',
                                boxShadow: isActive ? '0 4px 16px rgba(139,92,246,0.3)' : isCompleted ? '0 4px 16px rgba(16,185,129,0.2)' : 'none',
                            }}>
                                {isCompleted
                                    ? <CheckCircle size={20} style={{ color: 'white' }} />
                                    : <Icon size={18} style={{ color: isActive ? 'white' : 'var(--text-secondary)' }} />
                                }
                            </div>
                            <div>
                                <div style={{
                                    fontSize: 13, fontWeight: isActive || isCompleted ? 700 : 500,
                                    color: isActive ? 'var(--accent-purple)' : isCompleted ? '#10b981' : 'var(--text-secondary)',
                                    transition: 'color 0.3s',
                                }}>
                                    {step.label}
                                </div>
                                <div style={{ fontSize: 11, color: 'var(--text-secondary)', opacity: 0.6 }}>
                                    Step {i + 1} of {steps.length}
                                </div>
                            </div>
                        </div>

                        {/* Connector */}
                        {!isLast && (
                            <div style={{
                                flex: 1, height: 2, margin: '0 20px',
                                background: currentStep > i
                                    ? 'linear-gradient(90deg, #10b981, #059669)'
                                    : 'var(--border-color)',
                                borderRadius: 2,
                                transition: 'background 0.5s ease',
                                minWidth: 40,
                            }} />
                        )}
                    </div>
                );
            })}
        </div>
    );
}
