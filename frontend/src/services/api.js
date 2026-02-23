import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    timeout: 60000, // 60 seconds for AI operations
    headers: {
        'Content-Type': 'application/json',
    },
});

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response.data,
    (error) => {
        const message = error.response?.data?.error || error.message || 'An unexpected error occurred';
        return Promise.reject(new Error(message));
    }
);

export const resumeAPI = {
    // Upload resume file
    uploadResume: async (file) => {
        const formData = new FormData();
        formData.append('resume', file);
        const response = await axios.post('/api/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            timeout: 30000,
        });
        return response.data;
    },

    // Analyze resume vs job description
    analyzeResume: async (resumeText, jobDescription) => {
        return api.post('/analyze', { resumeText, jobDescription });
    },

    // Extract keywords from JD
    extractKeywords: async (jobDescription) => {
        return api.post('/analyze/keywords', { jobDescription });
    },

    // Rewrite a bullet point
    rewriteBullet: async (bulletText, keywords, jobTitle) => {
        return api.post('/rewrite/bullet', { bulletText, keywords, jobTitle });
    },

    // Rewrite professional summary
    rewriteSummary: async (resumeText, jobDescription, candidateName) => {
        return api.post('/rewrite/summary', { resumeText, jobDescription, candidateName });
    },

    // Full resume optimization
    rewriteFull: async (resumeText, jobDescription, structured) => {
        return api.post('/rewrite/full', { resumeText, jobDescription, structured });
    },

    // Generate cover letter
    generateCoverLetter: async (resumeText, jobDescription, companyName, applicantName) => {
        return api.post('/generate/cover-letter', { resumeText, jobDescription, companyName, applicantName });
    },

    // Generate interview questions
    generateInterviewQuestions: async (resumeText, jobDescription, jobTitle) => {
        return api.post('/generate/interview-questions', { resumeText, jobDescription, jobTitle });
    },

    // Health check
    healthCheck: async () => {
        return api.get('/health');
    },
};

export default api;
