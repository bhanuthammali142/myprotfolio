/**
 * AI Rewriter Service
 * Uses OpenAI GPT-4 to rewrite resume content for ATS optimization
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
 * Demo mode response generator for when OpenAI is not configured
 */
function generateDemoResponse(type, input) {
    const demos = {
        bullet: {
            original: input.bulletText || 'Original bullet point',
            optimized: `Accomplished significant improvements as measured by 30% efficiency increase, by implementing ${(input.keywords || ['relevant technologies'])[0] || 'best practices'} and optimizing core workflows to deliver measurable business impact`,
            keywords_injected: input.keywords ? input.keywords.slice(0, 3) : ['leadership', 'collaboration', 'innovation'],
            improvement_rationale: 'Restructured using the Accomplished [X] as measured by [Y] by doing [Z] formula. Added quantifiable metrics and action-oriented language for ATS optimization.',
        },
        summary: 'Results-driven professional with 5+ years of experience delivering scalable solutions in fast-paced environments. Proven expertise in cross-functional collaboration, strategic problem-solving, and driving measurable outcomes. Passionate about leveraging cutting-edge technologies to create impactful user experiences aligned with business objectives.',
        fullResume: {
            optimizedText: input.resumeText || '',
            summary: 'AI-optimized professional summary tailored to the target role.',
            improvementNotes: [
                'Added quantifiable metrics to experience bullets',
                'Incorporated job-specific keywords naturally',
                'Restructured skills section for better ATS parsing',
                'Improved action verb usage throughout',
            ],
        },
        coverLetter: `Dear Hiring Manager,

I am writing to express my strong interest in the position at ${input.companyName || 'your company'}. With my background and passion for excellence, I am confident I would be a valuable addition to your team.

Throughout my career, I have consistently demonstrated the skills and dedication required to excel in this type of role. My experience has equipped me with both the technical expertise and interpersonal skills needed to make an immediate impact.

I am particularly drawn to ${input.companyName || 'your organization'} because of your commitment to innovation and excellence. I would welcome the opportunity to discuss how my background and skills align with your needs.

Thank you for your consideration.

Sincerely,
${input.applicantName || 'Your Name'}`,
        interviewQuestions: [
            {
                question: 'Tell me about a challenging project you managed and how you overcame obstacles.',
                sampleAnswer: 'In my previous role, I led a cross-functional team on a critical migration project. I established clear timelines, held weekly standups, and proactively identified risks. We delivered the project 2 weeks early with zero downtime.',
                category: 'Behavioral',
            },
            {
                question: 'How do you prioritize tasks when you have multiple competing deadlines?',
                sampleAnswer: 'I use a combination of urgency-impact matrix and stakeholder communication. I assess each task\'s business impact, communicate timeline constraints early, and negotiate when necessary to ensure the most critical deliverables are met.',
                category: 'Situational',
            },
            {
                question: 'Describe your experience with the core technical skills required for this role.',
                sampleAnswer: 'I have hands-on experience with the relevant technologies through both professional projects and personal initiatives. I stay current through continuous learning and have applied these skills to solve real business problems.',
                category: 'Technical',
            },
            {
                question: 'Where do you see yourself in 5 years?',
                sampleAnswer: 'I aim to develop deep expertise in this domain while growing into a leadership role. I\'m focused on making meaningful contributions to the organization while continuously expanding my skills and mentoring others.',
                category: 'Career Goals',
            },
            {
                question: 'Why are you interested in this specific role and company?',
                sampleAnswer: 'I\'m drawn to this role because it aligns perfectly with my career trajectory and passion for this field. Your company\'s reputation for innovation and strong culture makes this an especially exciting opportunity.',
                category: 'Motivation',
            },
        ],
    };

    return demos[type];
}

/**
 * Rewrite a single bullet point using GPT-4
 */
async function rewriteBulletPoint(bulletText, keywords = [], jobTitle = '') {
    const client = getOpenAIClient();

    if (!client) {
        return generateDemoResponse('bullet', { bulletText, keywords });
    }

    const prompt = `Rewrite this resume bullet point to be ATS-optimized for the target job.

Rules:
1. Use "Accomplished [X] as measured by [Y], by doing [Z]" format when possible
2. Incorporate relevant keywords naturally (don't keyword stuff)
3. Quantify achievements where possible (use estimates if needed, but mark with "approximately")
4. Start with a strong action verb
5. Keep under 2 lines
6. Maintain factual accuracy - NEVER invent specific numbers not implied by original
7. Professional tone

Target Job: ${jobTitle}
Keywords to incorporate (naturally): ${keywords.slice(0, 8).join(', ')}

Original bullet: "${bulletText}"

Return ONLY valid JSON (no markdown, no code blocks):
{
  "original": "the original text",
  "optimized": "the rewritten bullet",
  "keywords_injected": ["keyword1", "keyword2"],
  "improvement_rationale": "brief explanation of changes"
}`;

    const response = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.4,
        max_tokens: 500,
        response_format: { type: 'json_object' },
    });

    const content = response.choices[0].message.content;
    return JSON.parse(content);
}

/**
 * Rewrite professional summary using GPT-4
 */
async function rewriteProfessionalSummary(resumeText, jobDescription, candidateName = '') {
    const client = getOpenAIClient();

    if (!client) {
        return generateDemoResponse('summary', {});
    }

    const prompt = `Generate an ATS-optimized 3-4 sentence professional summary for this candidate based on their resume and the target job description.

Include:
1. Years of experience and key expertise area
2. Top 3 relevant skills/strengths that match the job
3. A notable career highlight or achievement
4. Clear alignment with the target role

Rules:
- Use specific keywords from the job description
- Be concise but impactful
- First person perspective is fine but avoid "I" - use action-oriented language
- No generic fluff phrases like "hard-working team player"
- Factual - only based on resume content provided

${candidateName ? `Candidate: ${candidateName}` : ''}

Resume:
${resumeText.substring(0, 2000)}

Target Job Description:
${jobDescription.substring(0, 1500)}

Return as plain text only (no JSON, no markdown, no quotes).`;

    const response = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.5,
        max_tokens: 300,
    });

    return response.choices[0].message.content.trim();
}

/**
 * Full resume optimization
 */
async function rewriteFullResume(resumeText, jobDescription, structured = {}) {
    const client = getOpenAIClient();

    if (!client) {
        return generateDemoResponse('fullResume', { resumeText });
    }

    const prompt = `You are an expert ATS resume optimizer. Optimize this resume for the target job description.

Tasks:
1. Rewrite the professional summary (3-4 sentences) to match the role
2. Suggest 3-5 improvements to bullet points (pick the weakest ones)
3. Identify top 5 keywords from the JD missing from the resume
4. Provide 3 skills to add and 1-2 to remove (if any seem irrelevant)

Rules:
- NEVER fabricate experience, companies, or specific metrics not in the original
- Preserve all factual information
- Only rewrite language, not facts
- Focus on natural keyword integration
- Return valid JSON only

Resume:
${resumeText.substring(0, 2500)}

Job Description:
${jobDescription.substring(0, 1500)}

Return ONLY valid JSON:
{
  "summary": "optimized professional summary",
  "bulletImprovements": [
    {"original": "...", "optimized": "...", "reason": "..."}
  ],
  "missingKeywords": ["keyword1", "keyword2"],
  "skillsToAdd": ["skill1", "skill2"],
  "skillsToRemove": ["skill1"],
  "overallAdvice": "2-3 sentence general advice"
}`;

    const response = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.4,
        max_tokens: 1500,
        response_format: { type: 'json_object' },
    });

    return JSON.parse(response.choices[0].message.content);
}

/**
 * Generate a cover letter
 */
async function generateCoverLetter(resumeText, jobDescription, companyName, applicantName) {
    const client = getOpenAIClient();

    if (!client) {
        return generateDemoResponse('coverLetter', { companyName, applicantName });
    }

    const prompt = `Generate a compelling, personalized cover letter for this job application.

Structure:
1. Opening paragraph: Specific reason for interest in THIS company + role
2. Body paragraph 1: Most relevant experience/achievement from resume
3. Body paragraph 2: Key skills that match the job requirements
4. Closing: Clear call to action

Rules:
- Personalize to the company and role (not generic)
- Use keywords from the job description naturally
- Reference specific achievements from the resume
- Professional but conversational tone
- 3-4 paragraphs, under 400 words
- No cliches ("I am writing to apply for...")

${applicantName ? `Applicant: ${applicantName}` : ''}
Company: ${companyName}

Resume Summary:
${resumeText.substring(0, 1500)}

Job Description:
${jobDescription.substring(0, 1000)}

Return as formatted plain text with proper paragraph breaks.`;

    const response = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.6,
        max_tokens: 600,
    });

    return response.choices[0].message.content.trim();
}

/**
 * Generate interview questions
 */
async function generateInterviewQuestions(resumeText, jobDescription, jobTitle) {
    const client = getOpenAIClient();

    if (!client) {
        return generateDemoResponse('interviewQuestions', {});
    }

    const prompt = `Generate 5 highly relevant interview questions with detailed sample answers for this candidate applying to this position.

Mix of question types:
- 2 behavioral (STAR format recommended for answers)
- 1 technical/role-specific
- 1 situational
- 1 about career goals/motivation

For each question provide:
- The question itself
- A strong sample answer (3-5 sentences, specific to resume/role)
- Category (Behavioral/Technical/Situational/Career Goals)

Return ONLY valid JSON:
{
  "questions": [
    {
      "question": "...",
      "sampleAnswer": "...",
      "category": "..."
    }
  ]
}

Job Title: ${jobTitle}
Resume: ${resumeText.substring(0, 1500)}
Job Description: ${jobDescription.substring(0, 1000)}`;

    const response = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.5,
        max_tokens: 1200,
        response_format: { type: 'json_object' },
    });

    const parsed = JSON.parse(response.choices[0].message.content);
    return parsed.questions || [];
}

/**
 * Optimize full JSON resume data for the builder
 */
async function optimizeResumeData(resumeData, jobDescription, improveSummary = true) {
    const client = getOpenAIClient();

    if (!client) {
        // Simple demo mode optimization
        const data = JSON.parse(JSON.stringify(resumeData));
        if (improveSummary && (!data.summary || data.summary.trim() === '')) {
            data.summary = 'Results-driven professional with proven expertise aligned with the target role. Adept at solving complex problems and delivering measurable impact.';
        }
        if (data.experience) {
            data.experience = data.experience.map(exp => ({
                ...exp,
                bullets: exp.bullets.map((b, i) => i === 0 ? `🚀 Optimized: ${b}` : b)
            }));
        }
        return data;
    }

    const commandStr = improveSummary
        ? "1. Rewrite each bullet point. Make it ATS-optimized using the JD keywords. Use 'Accomplished [X] as measured by [Y], by doing [Z]' formatting where appropriate.\\n2. Write or rewrite a 3-4 sentence professional summary focusing on the JD keywords.\\n3. Reorder the skills array, placing skills found in the JD at the top."
        : "1. Rewrite each bullet point. Make it ATS-optimized using the JD keywords. Use 'Accomplished [X] as measured by [Y], by doing [Z]' formatting where appropriate.\\n2. Reorder the skills array, placing skills found in the JD at the top.\\n3. Do NOT modify the summary text. Return the summary exactly as provided.";

    const prompt = `You are an expert ATS resume optimizer. Respond with a single JSON object conforming strictly to the original resume data structure.
Do not add arbitrary fields. Your task is to modify the values in the JSON according to these instructions:

Tasks:
${commandStr}

Rules:
- Keep the identical JSON schema as provided.
- DO NOT invent or fabricate facts, previous companies, or non-existent metrics. Keep factual accuracy strictly intact.
- Format all response strictly as a JSON object (no markdown formatting code blocks, just raw JSON).

Job Description:
${jobDescription.substring(0, 1500)}

Original Resume Data (JSON):
${JSON.stringify(resumeData)}

Return ONLY the optimized JSON data object:`;

    const response = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 2500,
        response_format: { type: 'json_object' },
    });

    const parsed = JSON.parse(response.choices[0].message.content);
    return parsed;
}

module.exports = {
    rewriteBulletPoint,
    rewriteProfessionalSummary,
    rewriteFullResume,
    generateCoverLetter,
    generateInterviewQuestions,
    optimizeResumeData,
};
