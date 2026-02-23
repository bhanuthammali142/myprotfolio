/**
 * Resume Parser Service
 * Extracts structured data from raw resume text using regex + NLP patterns
 */

/**
 * Extract structured data from raw resume text
 * @param {string} rawText - Raw text extracted from PDF/DOCX
 * @returns {object} Structured resume data
 */
function extractStructuredData(rawText) {
    const text = rawText.trim();
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

    return {
        contactInfo: extractContactInfo(text),
        summary: extractSummary(text, lines),
        experience: extractExperience(text, lines),
        education: extractEducation(text, lines),
        skills: extractSkills(text, lines),
        certifications: extractCertifications(text, lines),
    };
}

/**
 * Extract contact information
 */
function extractContactInfo(text) {
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
    const phoneRegex = /[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}/;
    const linkedinRegex = /linkedin\.com\/in\/([a-zA-Z0-9-]+)/i;
    const githubRegex = /github\.com\/([a-zA-Z0-9-]+)/i;
    const urlRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/;

    const emailMatch = text.match(emailRegex);
    const phoneMatch = text.match(phoneRegex);
    const linkedinMatch = text.match(linkedinRegex);
    const githubMatch = text.match(githubRegex);

    // Try to find name (usually first non-empty line)
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    let name = '';
    for (let i = 0; i < Math.min(5, lines.length); i++) {
        const line = lines[i];
        // Name heuristic: 2-4 words, no special chars, not all caps words > 3
        if (line.match(/^[A-Z][a-z]+([\s]+[A-Z][a-z]*\.?){1,3}$/) && line.length < 50) {
            name = line;
            break;
        }
    }

    // Extract location (city, state/country pattern)
    const locationRegex = /\b([A-Z][a-z]+(?:\s[A-Z][a-z]+)?,\s*(?:[A-Z]{2}|[A-Z][a-z]+))\b/;
    const locationMatch = text.match(locationRegex);

    return {
        name: name || 'Not found',
        email: emailMatch ? emailMatch[0] : '',
        phone: phoneMatch ? phoneMatch[0] : '',
        linkedin: linkedinMatch ? `linkedin.com/in/${linkedinMatch[1]}` : '',
        github: githubMatch ? `github.com/${githubMatch[1]}` : '',
        location: locationMatch ? locationMatch[1] : '',
    };
}

/**
 * Extract professional summary/objective
 */
function extractSummary(text, lines) {
    const summaryHeaders = [
        /^(professional\s+)?summary$/i,
        /^objective$/i,
        /^profile$/i,
        /^about\s+me$/i,
        /^career\s+summary$/i,
        /^professional\s+profile$/i,
    ];

    const nextSectionHeaders = [
        /^work\s+experience/i, /^experience/i, /^employment/i,
        /^education/i, /^skills/i, /^certifications/i,
        /^projects/i, /^awards/i,
    ];

    return extractSection(lines, summaryHeaders, nextSectionHeaders);
}

/**
 * Extract work experience
 */
function extractExperience(text, lines) {
    const experienceHeaders = [
        /^work\s+experience$/i,
        /^professional\s+experience$/i,
        /^employment\s+history$/i,
        /^experience$/i,
        /^career\s+history$/i,
    ];

    const nextSectionHeaders = [
        /^education/i, /^skills/i, /^certifications/i,
        /^projects/i, /^awards/i, /^volunteer/i,
        /^publications/i, /^references/i,
    ];

    const rawSection = extractSection(lines, experienceHeaders, nextSectionHeaders);

    if (!rawSection) return [];

    // Parse individual job entries
    const jobs = [];
    const jobEntries = splitIntoEntries(rawSection);

    for (const entry of jobEntries) {
        const entryLines = entry.split('\n').filter(Boolean);
        if (entryLines.length < 2) continue;

        const datePattern = /(\b(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\b\s+\d{4}|\b\d{4}\b|\bPresent\b)/gi;

        let company = '', role = '', dates = '', bullets = [];
        const dateMatches = entry.match(datePattern);

        // Heuristic: first line = role, second line = company or combined
        if (entryLines.length > 0) {
            // Check if first line has | or @ separator for "Role at Company"
            if (entryLines[0].match(/\||\bat\b/i)) {
                const parts = entryLines[0].split(/\||\bat\b/i);
                role = parts[0].trim();
                company = parts[1] ? parts[1].trim() : '';
            } else {
                role = entryLines[0];
                company = entryLines[1] || '';
            }
        }

        if (dateMatches && dateMatches.length >= 2) {
            dates = `${dateMatches[0]} – ${dateMatches[1]}`;
        } else if (dateMatches && dateMatches.length === 1) {
            dates = dateMatches[0];
        }

        // Bullet points (lines starting with •, -, *, or leading whitespace)
        bullets = entryLines
            .filter(l => l.match(/^[•\-\*]/) || (l.startsWith(' ') && l.trim().length > 20))
            .map(l => l.replace(/^[•\-\*\s]+/, '').trim())
            .filter(l => l.length > 10);

        if (role || company) {
            jobs.push({ company, role, dates, bullets });
        }
    }

    return jobs.length > 0 ? jobs : [{ rawText: rawSection }];
}

/**
 * Extract education
 */
function extractEducation(text, lines) {
    const educationHeaders = [
        /^education$/i,
        /^academic\s+background$/i,
        /^educational\s+qualifications$/i,
        /^academic\s+qualifications$/i,
    ];

    const nextSectionHeaders = [
        /^skills/i, /^certifications/i, /^projects/i,
        /^experience/i, /^awards/i, /^references/i,
    ];

    const rawSection = extractSection(lines, educationHeaders, nextSectionHeaders);

    if (!rawSection) return [];

    const institutions = [];
    const degreePatterns = [
        /(?:Bachelor|Master|PhD|Doctor|B\.S\.|M\.S\.|B\.A\.|M\.A\.|B\.E\.|M\.E\.|MBA|BE|BS|MS|MA|PhD|Associate)[^\n]*/gi,
    ];

    const entryLines = rawSection.split('\n').filter(l => l.trim().length > 5);

    for (let i = 0; i < entryLines.length; i++) {
        const line = entryLines[i];
        if (line.match(/Bachelor|Master|PhD|B\.S|M\.S|B\.A|M\.A|MBA|B\.E|M\.E|Associate/i)) {
            institutions.push({
                degree: line.trim(),
                institution: entryLines[i + 1] ? entryLines[i + 1].trim() : '',
                year: (line + (entryLines[i + 1] || '')).match(/\b(19|20)\d{2}\b/)?.[0] || '',
            });
        }
    }

    return institutions.length > 0
        ? institutions
        : [{ rawText: rawSection }];
}

/**
 * Extract skills
 */
function extractSkills(text, lines) {
    const skillsHeaders = [
        /^skills$/i,
        /^technical\s+skills$/i,
        /^core\s+competencies$/i,
        /^key\s+skills$/i,
        /^expertise$/i,
        /^technologies$/i,
        /^skills\s*&\s*expertise$/i,
    ];

    const nextSectionHeaders = [
        /^experience/i, /^education/i, /^certifications/i,
        /^projects/i, /^awards/i, /^references/i,
        /^interests/i, /^languages/i,
    ];

    const rawSection = extractSection(lines, skillsHeaders, nextSectionHeaders);

    if (!rawSection) {
        // Fallback: look for common tech skills in entire text
        return extractSkillsFromText(text);
    }

    // Parse skills from the section
    const skills = rawSection
        .split(/[,;|\n•\-\*]/)
        .map(s => s.trim())
        .filter(s => s.length > 1 && s.length < 50 && !s.match(/^(skills|technical|core|key|expertise)/i));

    return [...new Set(skills)].filter(Boolean);
}

/**
 * Extract certifications
 */
function extractCertifications(text, lines) {
    const certHeaders = [
        /^certifications?$/i,
        /^licenses?\s*(&|and)\s*certifications?$/i,
        /^professional\s+certifications?$/i,
        /^accreditations?$/i,
    ];

    const nextSectionHeaders = [
        /^projects/i, /^awards/i, /^references/i,
        /^interests/i, /^volunteer/i, /^publications/i,
    ];

    const rawSection = extractSection(lines, certHeaders, nextSectionHeaders);

    if (!rawSection) return [];

    return rawSection
        .split('\n')
        .map(l => l.replace(/^[•\-\*]+/, '').trim())
        .filter(l => l.length > 5);
}

// ============ HELPER FUNCTIONS ============

function extractSection(lines, headerPatterns, stopPatterns) {
    let inSection = false;
    let sectionLines = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        if (!inSection) {
            if (headerPatterns.some(p => p.test(line))) {
                inSection = true;
                continue;
            }
        } else {
            if (stopPatterns.some(p => p.test(line))) {
                break;
            }
            sectionLines.push(line);
        }
    }

    return sectionLines.length > 0 ? sectionLines.join('\n') : null;
}

function splitIntoEntries(sectionText) {
    // Split by blank lines or date patterns that indicate new entries
    return sectionText
        .split(/\n{2,}/)
        .map(e => e.trim())
        .filter(e => e.length > 20);
}

function extractSkillsFromText(text) {
    // Common tech skills to scan for
    const techKeywords = [
        'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Ruby', 'Go', 'Rust', 'Swift',
        'React', 'Vue', 'Angular', 'Node.js', 'Express', 'Django', 'Flask', 'Spring', 'Rails',
        'SQL', 'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'Elasticsearch',
        'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Terraform', 'Jenkins', 'CI/CD',
        'Git', 'GitHub', 'GitLab', 'REST', 'GraphQL', 'gRPC', 'Microservices',
        'Machine Learning', 'Deep Learning', 'TensorFlow', 'PyTorch', 'Scikit-learn',
        'Agile', 'Scrum', 'Kanban', 'Jira', 'Confluence',
        'HTML', 'CSS', 'SASS', 'Tailwind', 'Bootstrap',
        'Linux', 'Unix', 'Bash', 'PowerShell',
    ];

    const foundSkills = techKeywords.filter(skill =>
        new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(text)
    );

    return foundSkills;
}

module.exports = { extractStructuredData, extractContactInfo };
