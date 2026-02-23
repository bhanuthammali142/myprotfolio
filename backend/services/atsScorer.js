/**
 * ATS Scoring Engine
 * Uses TF-IDF vectorization + cosine similarity for baseline scoring
 */

/**
 * Calculate Term Frequency
 */
function termFrequency(text) {
    const words = text.toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter(w => w.length > 2);

    const tf = {};
    words.forEach(word => {
        tf[word] = (tf[word] || 0) + 1;
    });

    // Normalize by document length
    const total = words.length;
    Object.keys(tf).forEach(key => {
        tf[key] = tf[key] / total;
    });

    return tf;
}

/**
 * Calculate cosine similarity between two TF vectors
 */
function cosineSimilarity(vec1, vec2) {
    const allTerms = new Set([...Object.keys(vec1), ...Object.keys(vec2)]);

    let dotProduct = 0;
    let mag1 = 0;
    let mag2 = 0;

    allTerms.forEach(term => {
        const v1 = vec1[term] || 0;
        const v2 = vec2[term] || 0;
        dotProduct += v1 * v2;
        mag1 += v1 * v1;
        mag2 += v2 * v2;
    });

    if (mag1 === 0 || mag2 === 0) return 0;
    return dotProduct / (Math.sqrt(mag1) * Math.sqrt(mag2));
}

/**
 * Assess ATS formatting friendliness
 */
function assessFormatting(resumeText) {
    let score = 100;
    const deductions = [];

    // Check for tables (pipe characters are common)
    if ((resumeText.match(/\|/g) || []).length > 10) {
        score -= 20;
        deductions.push('Possible table formatting detected');
    }

    // Check for very long lines (suggests columns)
    const longLines = resumeText.split('\n').filter(l => l.length > 120);
    if (longLines.length > 5) {
        score -= 10;
        deductions.push('Long lines may indicate column layout');
    }

    // Positive: Has standard section headers
    const standardHeaders = ['experience', 'education', 'skills', 'summary', 'objective'];
    const foundHeaders = standardHeaders.filter(h =>
        resumeText.toLowerCase().includes(h)
    );
    if (foundHeaders.length >= 3) {
        score = Math.min(100, score + 10);
    }

    // Check for special characters that may confuse ATS
    const specialCharCount = (resumeText.match(/[★☆■●□▪▫►◄→←↑↓]/g) || []).length;
    if (specialCharCount > 5) {
        score -= 15;
        deductions.push('Special characters may confuse ATS');
    }

    return {
        score: Math.max(0, Math.min(100, score)),
        deductions,
        standardHeaders: foundHeaders,
    };
}

/**
 * Calculate keyword match density and categorize keywords
 */
function calculateKeywordMatch(resumeText, jdKeywords) {
    const resumeLower = resumeText.toLowerCase();
    const matched = [];
    const missing = [];

    // Collect all keywords from all categories
    const allKeywords = [
        ...(jdKeywords.hardSkills || []),
        ...(jdKeywords.softSkills || []),
        ...(jdKeywords.qualifications || []),
        ...(jdKeywords.responsibilities || []),
    ];

    const uniqueKeywords = [...new Set(allKeywords.map(k => k.toLowerCase().trim()))];

    uniqueKeywords.forEach(keyword => {
        if (!keyword) return;

        const pattern = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');

        // Determine category
        let category = 'general';
        if (jdKeywords.hardSkills?.some(k => k.toLowerCase() === keyword)) category = 'hardSkill';
        else if (jdKeywords.softSkills?.some(k => k.toLowerCase() === keyword)) category = 'softSkill';
        else if (jdKeywords.qualifications?.some(k => k.toLowerCase() === keyword)) category = 'qualification';
        else if (jdKeywords.responsibilities?.some(k => k.toLowerCase() === keyword)) category = 'responsibility';

        if (pattern.test(resumeLower)) {
            matched.push({ keyword, category });
        } else {
            missing.push({ keyword, category });
        }
    });

    const total = uniqueKeywords.length;
    const matchPercent = total > 0 ? Math.round((matched.length / total) * 100) : 0;

    return { matched, missing, total, matchPercent };
}

/**
 * Assess experience relevance
 */
function assessExperienceRelevance(resumeText, jobDescription) {
    const resumeTF = termFrequency(resumeText);
    const jdTF = termFrequency(jobDescription);

    const similarity = cosineSimilarity(resumeTF, jdTF);

    // Scale to 0-100, with some adjustments
    return Math.min(100, Math.round(similarity * 300));
}

/**
 * Main ATS Score Calculator
 * Scoring formula:
 * - Keyword match density (40%)
 * - Formatting ATS-friendliness (20%)
 * - Experience relevance (20%)
 * - Skills alignment (20%)
 */
function calculateATSScore(resumeText, jobDescription, jdKeywords) {
    // 1. Keyword Match (40%)
    const keywordResult = calculateKeywordMatch(resumeText, jdKeywords);
    const keywordScore = keywordResult.matchPercent;
    const keywordWeighted = keywordScore * 0.40;

    // 2. Formatting (20%)
    const formattingResult = assessFormatting(resumeText);
    const formattingWeighted = formattingResult.score * 0.20;

    // 3. Experience Relevance (20%)
    const experienceScore = assessExperienceRelevance(resumeText, jobDescription);
    const experienceWeighted = Math.min(100, experienceScore) * 0.20;

    // 4. Skills Alignment (20%)
    const hardSkillMatched = keywordResult.matched.filter(k => k.category === 'hardSkill').length;
    const hardSkillTotal = [...(jdKeywords.hardSkills || [])].length;
    const skillsScore = hardSkillTotal > 0 ? Math.round((hardSkillMatched / hardSkillTotal) * 100) : keywordScore;
    const skillsWeighted = skillsScore * 0.20;

    // Total score
    const totalScore = Math.round(keywordWeighted + formattingWeighted + experienceWeighted + skillsWeighted);
    const finalScore = Math.min(100, Math.max(0, totalScore));

    // Score tier
    let tier, tierColor, recommendation;
    if (finalScore >= 80) {
        tier = 'Excellent';
        tierColor = '#10b981';
        recommendation = 'Your resume is well-optimized for this role. Minor tweaks may improve it further.';
    } else if (finalScore >= 60) {
        tier = 'Good';
        tierColor = '#3b82f6';
        recommendation = 'Your resume has good alignment. Adding missing keywords will significantly boost your score.';
    } else if (finalScore >= 40) {
        tier = 'Fair';
        tierColor = '#f59e0b';
        recommendation = 'Your resume needs optimization. Focus on incorporating the missing keywords and restructuring experience bullets.';
    } else {
        tier = 'Poor';
        tierColor = '#ef4444';
        recommendation = 'Your resume needs significant work. Consider a full rewrite targeting this specific role.';
    }

    return {
        total: finalScore,
        tier,
        tierColor,
        recommendation,
        breakdown: {
            keywordMatch: {
                score: keywordScore,
                weighted: Math.round(keywordWeighted),
                weight: '40%',
                label: 'Keyword Match Density',
            },
            formatting: {
                score: formattingResult.score,
                weighted: Math.round(formattingWeighted),
                weight: '20%',
                label: 'ATS Formatting',
                details: formattingResult.deductions,
            },
            experienceRelevance: {
                score: Math.min(100, experienceScore),
                weighted: Math.round(experienceWeighted),
                weight: '20%',
                label: 'Experience Relevance',
            },
            skillsAlignment: {
                score: skillsScore,
                weighted: Math.round(skillsWeighted),
                weight: '20%',
                label: 'Skills Alignment',
            },
        },
        keywords: {
            matched: keywordResult.matched,
            missing: keywordResult.missing,
            total: keywordResult.total,
            matchPercent: keywordResult.matchPercent,
        },
    };
}

module.exports = { calculateATSScore, calculateKeywordMatch, assessFormatting };
