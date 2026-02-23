import { createContext, useContext, useState, useCallback } from 'react';
import { resumeAPI } from '../services/api';
import toast from 'react-hot-toast';

const ResumeContext = createContext(null);

export function ResumeProvider({ children }) {
    // Resume state
    const [resumeFile, setResumeFile] = useState(null);
    const [resumeText, setResumeText] = useState('');
    const [structured, setStructured] = useState(null);
    const [jobDescription, setJobDescription] = useState('');
    const [jobTitle, setJobTitle] = useState('');
    const [companyName, setCompanyName] = useState('');

    // Analysis results
    const [score, setScore] = useState(null);
    const [keywords, setKeywords] = useState(null);
    const [optimizedData, setOptimizedData] = useState(null);
    const [coverLetter, setCoverLetter] = useState('');
    const [interviewQuestions, setInterviewQuestions] = useState([]);

    // UI state
    const [loading, setLoading] = useState({});
    const [currentStep, setCurrentStep] = useState(0); // 0: upload, 1: jd, 2: analyze, 3: results
    const [theme, setTheme] = useState('dark');
    const [activeTab, setActiveTab] = useState('score');

    const setLoadingState = (key, val) => setLoading(prev => ({ ...prev, [key]: val }));

    // Upload and parse resume
    const uploadResume = useCallback(async (file) => {
        setLoadingState('upload', true);
        try {
            const result = await resumeAPI.uploadResume(file);
            setResumeFile(file);
            setResumeText(result.rawText);
            setStructured(result.structured);
            toast.success(`📄 Resume parsed! ${result.wordCount} words extracted`);
            setCurrentStep(1);
            return result;
        } catch (err) {
            toast.error('Upload failed: ' + err.message);
            throw err;
        } finally {
            setLoadingState('upload', false);
        }
    }, []);

    // Analyze resume vs JD
    const analyzeResume = useCallback(async () => {
        if (!resumeText || !jobDescription) {
            toast.error('Please upload a resume and paste a job description first');
            return;
        }
        setLoadingState('analyze', true);
        try {
            const result = await resumeAPI.analyzeResume(resumeText, jobDescription);
            setScore(result.score);
            setKeywords(result.keywords);
            setCurrentStep(3);
            setActiveTab('score');
            toast.success('✅ Analysis complete!');
            return result;
        } catch (err) {
            toast.error('Analysis failed: ' + err.message);
            throw err;
        } finally {
            setLoadingState('analyze', false);
        }
    }, [resumeText, jobDescription]);

    // Full optimization
    const optimizeFull = useCallback(async () => {
        if (!resumeText || !jobDescription) return;
        setLoadingState('optimize', true);
        try {
            const result = await resumeAPI.rewriteFull(resumeText, jobDescription, structured);
            setOptimizedData(result.result);
            toast.success('🚀 Resume optimized with AI!');
            return result;
        } catch (err) {
            toast.error('Optimization failed: ' + err.message);
            throw err;
        } finally {
            setLoadingState('optimize', false);
        }
    }, [resumeText, jobDescription, structured]);

    // Generate cover letter
    const generateCoverLetter = useCallback(async () => {
        if (!resumeText || !jobDescription) return;
        setLoadingState('coverLetter', true);
        try {
            const result = await resumeAPI.generateCoverLetter(resumeText, jobDescription, companyName, structured?.contactInfo?.name);
            setCoverLetter(result.coverLetter);
            setActiveTab('cover-letter');
            toast.success('✉️ Cover letter generated!');
        } catch (err) {
            toast.error('Cover letter generation failed: ' + err.message);
        } finally {
            setLoadingState('coverLetter', false);
        }
    }, [resumeText, jobDescription, companyName, structured]);

    // Generate interview questions
    const generateInterviewQs = useCallback(async () => {
        if (!resumeText || !jobDescription) return;
        setLoadingState('interview', true);
        try {
            const result = await resumeAPI.generateInterviewQuestions(resumeText, jobDescription, jobTitle);
            setInterviewQuestions(result.questions);
            setActiveTab('interview');
            toast.success('🎤 Interview questions ready!');
        } catch (err) {
            toast.error('Failed to generate questions: ' + err.message);
        } finally {
            setLoadingState('interview', false);
        }
    }, [resumeText, jobDescription, jobTitle]);

    // Reset everything
    const resetAll = useCallback(() => {
        setResumeFile(null);
        setResumeText('');
        setStructured(null);
        setJobDescription('');
        setJobTitle('');
        setCompanyName('');
        setScore(null);
        setKeywords(null);
        setOptimizedData(null);
        setCoverLetter('');
        setInterviewQuestions([]);
        setCurrentStep(0);
        setActiveTab('score');
    }, []);

    const toggleTheme = useCallback(() => {
        setTheme(t => t === 'dark' ? 'light' : 'dark');
    }, []);

    const value = {
        // State
        resumeFile, resumeText, setResumeText,
        structured, jobDescription, setJobDescription,
        jobTitle, setJobTitle, companyName, setCompanyName,
        score, keywords, optimizedData, coverLetter, interviewQuestions,
        loading, currentStep, setCurrentStep, theme, activeTab, setActiveTab,

        // Actions
        uploadResume, analyzeResume, optimizeFull,
        generateCoverLetter, generateInterviewQs, resetAll, toggleTheme,
    };

    return (
        <ResumeContext.Provider value={value}>
            <div className={theme === 'light' ? 'light' : ''}>
                {children}
            </div>
        </ResumeContext.Provider>
    );
}

export function useResume() {
    const ctx = useContext(ResumeContext);
    if (!ctx) throw new Error('useResume must be used within ResumeProvider');
    return ctx;
}
