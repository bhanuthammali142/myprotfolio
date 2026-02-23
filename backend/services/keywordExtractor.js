/**
 * Keyword Extractor Service
 * Extracts keywords using OpenAI GPT-4 with local fallback
 */

const OpenAI = require('openai');

let openaiClient = null;

function getOpenAIClient() {
    if (!openaiClient && process.env.OPENAI_API_KEY) {
        openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    }
    return openaiClient;
}

/**
 * Extract keywords using OpenAI GPT-4
 */
async function extractKeywordsWithAI(jobDescription) {
    const client = getOpenAIClient();

    if (!client) {
        throw new Error('OpenAI client not configured');
    }

    const prompt = `Extract all key skills, requirements, and qualifications from this job description.
Return as JSON with categories:
- hardSkills: technical skills, tools, technologies (array of strings)
- softSkills: interpersonal, communication, leadership skills (array of strings)
- qualifications: degrees, certifications, years of experience (array of strings)
- responsibilities: key job duties mentioned (array of strings, max 8)

Rules:
- Each item should be a concise phrase (1-4 words)
- No duplicates
- Remove generic filler words
- Focus on specific, searchable terms

Format: JSON only, no additional text.

Job Description:
${jobDescription.substring(0, 3000)}`;

    const response = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
        max_tokens: 1000,
        response_format: { type: 'json_object' },
    });

    const content = response.choices[0].message.content;
    const parsed = JSON.parse(content);

    return {
        hardSkills: Array.isArray(parsed.hardSkills) ? parsed.hardSkills.slice(0, 20) : [],
        softSkills: Array.isArray(parsed.softSkills) ? parsed.softSkills.slice(0, 15) : [],
        qualifications: Array.isArray(parsed.qualifications) ? parsed.qualifications.slice(0, 10) : [],
        responsibilities: Array.isArray(parsed.responsibilities) ? parsed.responsibilities.slice(0, 8) : [],
    };
}

/**
 * Local fallback keyword extraction using NLP patterns
 */
function extractKeywordsLocal(jobDescription) {
    const text = jobDescription.toLowerCase();
    const words = text.split(/\s+/);

    // Common tech hard skills
    const hardSkillPatterns = [
        // Programming languages
        /\b(javascript|typescript|python|java|kotlin|swift|ruby|go|rust|c\+\+|c#|php|scala|r\b)/gi,
        // Frameworks
        /\b(react|vue|angular|node\.?js|django|flask|spring|rails|express|fastapi|nextjs|nuxt)/gi,
        // Databases
        /\b(sql|mysql|postgresql|mongodb|redis|elasticsearch|cassandra|dynamodb|sqlite|oracle)/gi,
        // Cloud & DevOps
        /\b(aws|azure|gcp|docker|kubernetes|k8s|terraform|jenkins|ci\/cd|ansible|helm)/gi,
        // Tools
        /\b(git|github|gitlab|jira|confluence|slack|linux|unix|bash|powershell)/gi,
        // Data/AI
        /\b(machine learning|deep learning|tensorflow|pytorch|pandas|numpy|scikit-learn|nlp|llm)/gi,
    ];

    // Common soft skills
    const softSkillPatterns = [
        /\b(communication|leadership|teamwork|collaboration|problem.solving|analytical|detail.oriented|organized|adaptable|critical thinking)/gi,
        /\b(project management|time management|presentation|mentoring|negotiation|creative|innovative)/gi,
    ];

    // Qualifications patterns
    const qualPatterns = [
        /\b(\d+\+?\s+years?\s+(?:of\s+)?(?:experience|exp))/gi,
        /\b(bachelor['s]*|master['s]*|phd|doctorate|associate|degree)\b/gi,
        /\b(aws certified|pmp|cpa|cissp|ceh|comptia|gcp certified|azure certified)/gi,
    ];

    // Responsibilities
    const respPatterns = [
        /(?:^|\n)[•\-\*]\s*(.{10,80})/gm,
        /(?:you will|responsibilities include|you'll)[:\s]+(.{10,100})/gi,
    ];

    const extractMatches = (text, patterns) => {
        const matches = new Set();
        patterns.forEach(pattern => {
            const found = text.match(pattern) || [];
            found.forEach(m => matches.add(m.trim().toLowerCase()));
        });
        return [...matches].filter(m => m.length > 2);
    };

    // Extract job title keywords using TF approach
    const words2 = text
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter(w => w.length > 3);

    const wordFreq = {};
    words2.forEach(w => wordFreq[w] = (wordFreq[w] || 0) + 1);

    // Stop words
    const stopWords = new Set([
        'will', 'have', 'with', 'that', 'this', 'from', 'they', 'their', 'what', 'which',
        'when', 'where', 'must', 'should', 'would', 'could', 'into', 'than', 'then',
        'about', 'also', 'more', 'some', 'such', 'your', 'our', 'work', 'team',
        'role', 'position', 'candidate', 'company', 'looking', 'seeking', 'required',
        'preferred', 'including', 'experience', 'skills', 'ability', 'strong',
    ]);

    const topWords = Object.entries(wordFreq)
        .filter(([w]) => !stopWords.has(w))
        .sort((a, b) => b[1] - a[1])
        .slice(0, 20)
        .map(([w]) => w);

    const hardSkills = extractMatches(jobDescription, hardSkillPatterns);
    const softSkills = extractMatches(jobDescription, softSkillPatterns);
    const qualifications = extractMatches(jobDescription, qualPatterns);
    const responsibilities = extractMatches(jobDescription, respPatterns);

    // Supplement with top words not already captured
    const allCaptured = new Set([...hardSkills, ...softSkills, ...qualifications]);
    const additionalHard = topWords
        .filter(w => !allCaptured.has(w) && !stopWords.has(w))
        .slice(0, 10);

    return {
        hardSkills: [...new Set([...hardSkills, ...additionalHard])].slice(0, 20),
        softSkills: [...new Set(softSkills)].slice(0, 15),
        qualifications: [...new Set(qualifications)].slice(0, 10),
        responsibilities: [...new Set(responsibilities)].slice(0, 8),
    };
}

module.exports = { extractKeywordsWithAI, extractKeywordsLocal };
