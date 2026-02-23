import { useState } from 'react';
import { useResume } from '../../context/ResumeContext';
import { CheckCircle, XCircle, Code, Heart, GraduationCap, Briefcase, Search, Filter } from 'lucide-react';

const CATEGORY_CONFIG = {
    hardSkill: { label: 'Hard Skills', icon: Code, color: '#8b5cf6', bgColor: 'rgba(139,92,246,0.1)' },
    softSkill: { label: 'Soft Skills', icon: Heart, color: '#10b981', bgColor: 'rgba(16,185,129,0.1)' },
    qualification: { label: 'Qualifications', icon: GraduationCap, color: '#3b82f6', bgColor: 'rgba(59,130,246,0.1)' },
    responsibility: { label: 'Responsibilities', icon: Briefcase, color: '#f59e0b', bgColor: 'rgba(245,158,11,0.1)' },
    general: { label: 'General', icon: Search, color: '#06b6d4', bgColor: 'rgba(6,182,212,0.1)' },
};

function KeywordPill({ keyword, category, isMatched, onToggle, isMarked }) {
    const config = CATEGORY_CONFIG[category] || CATEGORY_CONFIG.general;
    const Icon = isMatched ? CheckCircle : XCircle;

    return (
        <div
            onClick={onToggle}
            style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '8px 14px', borderRadius: 100,
                background: isMatched ? config.bgColor : isMarked ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.08)',
                border: `1px solid ${isMatched ? config.color + '30' : isMarked ? '#10b98130' : '#ef444430'}`,
                cursor: !isMatched ? 'pointer' : 'default',
                transition: 'all 0.2s',
                userSelect: 'none',
            }}
        >
            <Icon size={13} style={{ color: isMatched ? config.color : isMarked ? '#10b981' : '#ef4444', flexShrink: 0 }} />
            <span style={{
                fontSize: 13, fontWeight: 600,
                color: isMatched ? config.color : isMarked ? '#10b981' : '#ef4444',
            }}>
                {keyword}
            </span>
            {!isMatched && !isMarked && (
                <span style={{ fontSize: 10, color: '#ef4444', opacity: 0.7 }}>+ Add</span>
            )}
            {!isMatched && isMarked && (
                <span style={{ fontSize: 10, color: '#10b981', opacity: 0.7 }}>✓ Have</span>
            )}
        </div>
    );
}

export default function KeywordsTab() {
    const { score, keywords } = useResume();
    const [filter, setFilter] = useState('all'); // all, matched, missing
    const [search, setSearch] = useState('');
    const [markedAsHave, setMarkedAsHave] = useState(new Set());

    if (!score || !keywords) {
        return <div style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: 60 }}>No keyword data yet</div>;
    }

    const { matched, missing } = score.keywords;

    const toggleMark = (keyword) => {
        setMarkedAsHave(prev => {
            const next = new Set(prev);
            if (next.has(keyword)) next.delete(keyword);
            else next.add(keyword);
            return next;
        });
    };

    const allKeywords = [
        ...matched.map(k => ({ ...k, isMatched: true })),
        ...missing.map(k => ({ ...k, isMatched: false })),
    ];

    const filtered = allKeywords.filter(k => {
        const matchesSearch = !search || k.keyword.toLowerCase().includes(search.toLowerCase());
        const matchesFilter =
            filter === 'all' ||
            (filter === 'matched' && k.isMatched) ||
            (filter === 'missing' && !k.isMatched);
        return matchesSearch && matchesFilter;
    });

    // Group by category
    const grouped = {};
    filtered.forEach(k => {
        const cat = k.category || 'general';
        if (!grouped[cat]) grouped[cat] = [];
        grouped[cat].push(k);
    });

    const matchRate = score.keywords.matchPercent;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Overview bar */}
            <div style={{
                background: 'var(--bg-card)', border: '1px solid var(--border-color)',
                borderRadius: 16, padding: 24,
            }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                    <div>
                        <div style={{ fontSize: 28, fontWeight: 800, fontFamily: 'Outfit', color: 'var(--text-primary)' }}>
                            {matched.length}<span style={{ fontSize: 16, color: 'var(--text-secondary)', fontWeight: 500 }}>/{score.keywords.total}</span>
                        </div>
                        <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>keywords matched from job description</div>
                    </div>
                    <div style={{
                        fontSize: 36, fontWeight: 900, fontFamily: 'Outfit',
                        color: matchRate >= 70 ? '#10b981' : matchRate >= 50 ? '#f59e0b' : '#ef4444',
                    }}>
                        {matchRate}%
                    </div>
                </div>

                {/* Progress bar */}
                <div style={{ height: 12, background: 'rgba(255,255,255,0.06)', borderRadius: 6, overflow: 'hidden' }}>
                    <div style={{
                        height: '100%', width: `${matchRate}%`,
                        background: matchRate >= 70
                            ? 'linear-gradient(90deg, #10b981, #059669)'
                            : matchRate >= 50
                                ? 'linear-gradient(90deg, #f59e0b, #d97706)'
                                : 'linear-gradient(90deg, #ef4444, #dc2626)',
                        borderRadius: 6, transition: 'width 1s ease',
                    }} />
                </div>

                {/* Category legend */}
                <div style={{ display: 'flex', gap: 16, marginTop: 16, flexWrap: 'wrap' }}>
                    {Object.entries(CATEGORY_CONFIG).slice(0, 4).map(([key, cfg]) => {
                        const count = allKeywords.filter(k => k.category === key).length;
                        if (!count) return null;
                        const Icon = cfg.icon;
                        return (
                            <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-secondary)' }}>
                                <Icon size={12} style={{ color: cfg.color }} />
                                {cfg.label}: {count}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
                    <Search size={15} style={{
                        position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                        color: 'var(--text-secondary)', pointerEvents: 'none',
                    }} />
                    <input
                        type="text"
                        placeholder="Search keywords..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="input-field"
                        style={{ width: '100%', padding: '9px 12px 9px 36px', borderRadius: 10, fontSize: 13 }}
                    />
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                    {['all', 'matched', 'missing'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            style={{
                                padding: '8px 16px', borderRadius: 10, border: 'none', cursor: 'pointer',
                                fontSize: 13, fontWeight: 600, transition: 'all 0.2s', textTransform: 'capitalize',
                                background: filter === f ? 'rgba(139,92,246,0.15)' : 'var(--bg-card)',
                                color: filter === f ? '#8b5cf6' : 'var(--text-secondary)',
                                borderColor: filter === f ? 'rgba(139,92,246,0.3)' : 'var(--border-color)',
                                borderWidth: 1, borderStyle: 'solid',
                            }}
                        >
                            {f === 'matched' ? `✓ ${matched.length}` : f === 'missing' ? `✗ ${missing.length}` : 'All'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Missing keywords priority alert */}
            {missing.length > 0 && filter !== 'matched' && (
                <div style={{
                    background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)',
                    borderRadius: 14, padding: 16,
                }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#ef4444', marginBottom: 8 }}>
                        💡 Top Missing Keywords to Add
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {missing
                            .filter(k => k.category === 'hardSkill')
                            .slice(0, 6)
                            .map((k, i) => (
                                <span key={i} style={{
                                    fontSize: 12, padding: '4px 12px', borderRadius: 20,
                                    background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
                                    color: '#ef4444', fontWeight: 600,
                                }}>
                                    {k.keyword}
                                </span>
                            ))}
                    </div>
                </div>
            )}

            {/* Keywords by category */}
            {Object.entries(grouped).map(([category, keywords]) => {
                const config = CATEGORY_CONFIG[category] || CATEGORY_CONFIG.general;
                const Icon = config.icon;
                return (
                    <div key={category} style={{
                        background: 'var(--bg-card)', border: '1px solid var(--border-color)',
                        borderRadius: 16, padding: 24,
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                            <div style={{
                                width: 32, height: 32, borderRadius: 8,
                                background: config.bgColor,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                                <Icon size={16} style={{ color: config.color }} />
                            </div>
                            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
                                {config.label}
                            </h3>
                            <span style={{ fontSize: 12, color: 'var(--text-secondary)', marginLeft: 'auto' }}>
                                {keywords.filter(k => k.isMatched).length}/{keywords.length} matched
                            </span>
                        </div>

                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                            {keywords.map((k, i) => (
                                <KeywordPill
                                    key={i}
                                    keyword={k.keyword}
                                    category={k.category}
                                    isMatched={k.isMatched}
                                    isMarked={markedAsHave.has(k.keyword)}
                                    onToggle={() => !k.isMatched && toggleMark(k.keyword)}
                                />
                            ))}
                        </div>
                    </div>
                );
            })}

            {filtered.length === 0 && (
                <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: 40 }}>
                    No keywords found for this filter
                </div>
            )}
        </div>
    );
}
