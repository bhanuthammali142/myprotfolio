import { useResume } from '../context/ResumeContext';
import Header from '../components/Header';
import UploadStep from '../components/UploadStep';
import JobDescriptionStep from '../components/JobDescriptionStep';
import AnalysisPanel from '../components/AnalysisPanel';
import ProgressStepper from '../components/ProgressStepper';

export default function Dashboard() {
    const { currentStep } = useResume();

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
            <Header />
            <main style={{ maxWidth: 1400, margin: '0 auto', padding: '80px 24px 40px' }}>
                <ProgressStepper />

                {currentStep < 3 ? (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: currentStep >= 1 ? '1fr 1fr' : '1fr',
                        gap: 24,
                        marginTop: 32,
                        maxWidth: currentStep >= 1 ? '100%' : 700,
                        margin: currentStep >= 1 ? '32px 0 0' : '32px auto 0',
                    }}>
                        <UploadStep />
                        {currentStep >= 1 && <JobDescriptionStep />}
                    </div>
                ) : (
                    <AnalysisPanel />
                )}
            </main>
        </div>
    );
}
