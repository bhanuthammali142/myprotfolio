import { useResume } from '../../context/ResumeContext';
import { TrendingUp, Target, Award, CheckCircle, AlertCircle, Info } from 'lucide-react';

function ScoreRing({ score, size = 180 }) {
    const radius = (size - 24) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDasharray = (score / 100) * circumference;

    const getColor = (s) => {
        if (s >= 80) return '#10b981';
        if (s >= 60) return '#3b82f6';
        if (s >= 40) return '#f59e0b';
        return '#ef4444';
    };

    const color = getColor(score);

    return (
        <div style={{ position: 'relative', width: size, height: size, display: 'inline-block' }}>
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
                {/* Background ring */}
                <circle
                    cx={size / 2} cy={size / 2} r={radius}
                    fill="none" stroke="rgba(255,255,255,0.06)"
                    strokeWidth={12}
                />
                {/* Score ring */}
                <circle
                    cx={size / 2} cy={size / 2} r={radius}
                    fill="none" stroke={color}
                    strokeWidth={12}
                    strokeDasharray={`${strokeDasharray} ${circumference}`}
                    strokeLinecap="round"
                    style={{
                        transition: 'stroke-dasharray 1.5s ease',
                        filter: `drop-shadow(0 0 8px ${color}80)`,
                    }}
                />
            </svg>
            <div style={{
                position: 'absolute', inset: 0,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            }}>
                <span style={{ fontSize: size === 180 ? 44 : 28, fontWeight: 900, color, fontFamily: 'Outfit', lineHeight: 1 }}>
                    {score}
                </span>
                <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600 }}>/ 100</span>
            </div>
        </div>
    );
}

function ScoreBar({ label, score, weight, weighted, icon: Icon, color }) {
    return (
        <div style={{
            background: 'var(--bg-card)', border: '1px solid var(--border-color)',
            borderRadius: 14, padding: '20px 24px',
        }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                        width: 36, height: 36, borderRadius: 10,
                        background: `${color}20`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <Icon size={18} style={{ color }} />
                    </div>
                    <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{label}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Weight: {weight}</div>
                    </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 22, fontWeight: 800, color, fontFamily: 'Outfit' }}>{score}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>+{weighted} pts</div>
                </div>
            </div>

            {/* Progress bar */}
            <div style={{
                height: 8, background: 'rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden',
            }}>
                <div style={{
                    height: '100%', width: `${score}%`,
                    background: `linear-gradient(90deg, ${color}80, ${color})`,
                    borderRadius: 4,
                    transition: 'width 1.5s ease',
                    boxShadow: `0 0 8px ${color}60`,
                }} />
            </div>
        </div>
    );
}

export default function ScoreTab() {
    const { score } = useResume();

    if (!score) return <div style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: 60 }}>No analysis data yet</div>;

    const { breakdown } = score;

    const barData = [
        { ...breakdown.keywordMatch, icon: Target, color: '#8b5cf6' },
        { ...breakdown.formatting, icon: CheckCircle, color: '#06b6d4' },
        { ...breakdown.experienceRelevance, icon: TrendingUp, color: '#3b82f6' },
        { ...breakdown.skillsAlignment, icon: Award, color: '#10b981' },
    ];

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: 24 }}>
            {/* Left: Score ring + tier */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {/* Main score card */}
                <div className="card" style={{
                    padding: 32, textAlign: 'center',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 20,
                }}>
                    <div style={{ fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-secondary)', marginBottom: 24 }}>
                        ATS Compatibility Score
                    </div>

                    <ScoreRing score={score.total} size={200} />

                    <div style={{ marginTop: 24 }}>
                        <div style={{
                            display: 'inline-block', padding: '6px 20px', borderRadius: 100,
                            background: `${score.tierColor}15`, border: `1px solid ${score.tierColor}30`,
                            color: score.tierColor, fontSize: 15, fontWeight: 700, marginBottom: 16,
                        }}>
                            {score.tier} Match
                        </div>
                        <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                            {score.recommendation}
                        </p>
                    </div>
                </div>

                {/* Quick stats */}
                <div className="card" style={{ padding: 20 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-secondary)', marginBottom: 16 }}>
                        Keyword Overview
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <StatRow
                            icon={<CheckCircle size={16} style={{ color: '#10b981' }} />}
                            label="Keywords Matched"
                            value={score.keywords?.matched?.length || 0}
                            color="#10b981"
                        />
                        <StatRow
                            icon={<AlertCircle size={16} style={{ color: '#ef4444' }} />}
                            label="Keywords Missing"
                            value={score.keywords?.missing?.length || 0}
                            color="#ef4444"
                        />
                        <StatRow
                            icon={<Info size={16} style={{ color: '#3b82f6' }} />}
                            label="Total Keywords"
                            value={score.keywords?.total || 0}
                            color="#3b82f6"
                        />
                        <div style={{ height: 1, background: 'var(--border-color)', margin: '4px 0' }} />
                        <StatRow
                            icon={<Target size={16} style={{ color: '#8b5cf6' }} />}
                            label="Match Rate"
                            value={`${score.keywords?.matchPercent || 0}%`}
                            color="#8b5cf6"
                            bold
                        />
                    </div>
                </div>
            </div>

            {/* Right: Score breakdown */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                    Score Breakdown
                </h3>
                {barData.map((bar, i) => (
                    <ScoreBar key={i} {...bar} />
                ))}

                {/* Formatting tips */}
                {breakdown.formatting?.details?.length > 0 && (
                    <div style={{
                        background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)',
                        borderRadius: 14, padding: 20,
                    }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#f59e0b', marginBottom: 10 }}>
                            ⚠️ Formatting Issues Detected
                        </div>
                        {breakdown.formatting.details.map((d, i) => (
                            <div key={i} style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>
                                • {d}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function StatRow({ icon, label, value, color, bold }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {icon}
            <span style={{ fontSize: 13, color: 'var(--text-secondary)', flex: 1 }}>{label}</span>
            <span style={{ fontSize: bold ? 17 : 14, fontWeight: bold ? 800 : 600, color, fontFamily: 'Outfit' }}>
                {value}
            </span>
        </div>
    );
}
