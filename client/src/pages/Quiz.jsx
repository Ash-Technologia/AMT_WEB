import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { FiArrowRight, FiArrowLeft, FiCheckCircle } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { MandalaBackdrop } from '../components/ui/Decorations';
import '../components/admin/AdminLayout.css'; // For glass-card reuse

const questions = [
    {
        id: 1,
        question: "What is your primary wellness goal?",
        options: [
            { label: "Pain Relief (Joints/Muscles)", value: "pain" },
            { label: "Better Sleep & Relaxation", value: "sleep" },
            { label: "Energy & Vitality", value: "energy" },
            { label: "General Immunity", value: "immunity" }
        ]
    },
    {
        id: 2,
        question: "How much time can you dedicate to daily therapy?",
        options: [
            { label: "Less than 15 mins", value: "short" },
            { label: "15 - 30 mins", value: "medium" },
            { label: "While I sleep (Passive)", value: "passive" }
        ]
    },
    {
        id: 3,
        question: "Are you interested in ancient copper therapy?",
        options: [
            { label: "Yes, I prefer traditional methods", value: "copper" },
            { label: "I prefer modern grounding tech", value: "grounding" },
            { label: "Both sound great", value: "both" }
        ]
    }
];

const Quiz = () => {
    const [currentStep, setCurrentStep] = useState(0);
    const [answers, setAnswers] = useState({});
    const navigate = useNavigate();

    const handleSelect = (val) => {
        setAnswers({ ...answers, [questions[currentStep].id]: val });
    };

    const handleNext = () => {
        if (currentStep < questions.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            // Finish quiz and navigate to products with a category filter in mind
            // In a real app, we would calculate the exact product. Here we just go to products.
            navigate('/products?search=therapy');
        }
    };

    const handleBack = () => {
        if (currentStep > 0) setCurrentStep(currentStep - 1);
    };

    const isAnswered = !!answers[questions[currentStep]?.id];

    return (
        <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-2xl) var(--space-md)', position: 'relative', overflow: 'hidden' }}>
            <Helmet><title>Wellness Quiz — AMT</title></Helmet>
            
            <MandalaBackdrop style={{ position: 'absolute', top: '-20%', left: '-10%', width: '80%', color: 'var(--primary-light)', opacity: 0.1, zIndex: -1 }} />

            <div className="container" style={{ maxWidth: 600 }}>
                <div style={{ textAlign: 'center', marginBottom: 'var(--space-xl)' }}>
                    <span className="badge badge-gold" style={{ marginBottom: 'var(--space-md)' }}>Personalized For You</span>
                    <h1 style={{ fontSize: '2.5rem', fontFamily: 'Playfair Display', color: 'var(--text-primary)' }}>Discover Your Ideal Therapy</h1>
                    <p style={{ color: 'var(--text-secondary)', marginTop: 'var(--space-sm)' }}>Take this 1-minute quiz to find the perfect AMT products for your body.</p>
                </div>

                <div className="glass-card" style={{ padding: 'var(--space-2xl)', position: 'relative' }}>
                    {/* Progress Bar */}
                    <div style={{ width: '100%', height: 4, backgroundColor: 'var(--border)', borderRadius: 2, marginBottom: 'var(--space-xl)', overflow: 'hidden' }}>
                        <motion.div 
                            style={{ height: '100%', backgroundColor: 'var(--gold)' }}
                            initial={{ width: '0%' }}
                            animate={{ width: `${((currentStep + 1) / questions.length) * 100}%` }}
                            transition={{ duration: 0.3 }}
                        />
                    </div>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentStep}
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -20, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <h2 style={{ fontSize: '1.5rem', marginBottom: 'var(--space-xl)', color: 'var(--text-primary)' }}>
                                {questions[currentStep].question}
                            </h2>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                                {questions[currentStep].options.map(opt => {
                                    const selected = answers[questions[currentStep].id] === opt.value;
                                    return (
                                        <button
                                            key={opt.value}
                                            onClick={() => handleSelect(opt.value)}
                                            style={{
                                                padding: 'var(--space-lg)',
                                                borderRadius: 12,
                                                border: `2px solid ${selected ? 'var(--gold)' : 'var(--border)'}`,
                                                backgroundColor: selected ? 'rgba(201, 168, 76, 0.1)' : 'var(--surface)',
                                                color: 'var(--text-primary)',
                                                fontSize: '1.1rem',
                                                textAlign: 'left',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s ease'
                                            }}
                                        >
                                            {opt.label}
                                            {selected && <FiCheckCircle color="var(--gold)" size={20} />}
                                        </button>
                                    );
                                })}
                            </div>
                        </motion.div>
                    </AnimatePresence>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'var(--space-2xl)' }}>
                        <button 
                            className="btn btn-outline" 
                            onClick={handleBack}
                            style={{ opacity: currentStep === 0 ? 0 : 1, pointerEvents: currentStep === 0 ? 'none' : 'auto' }}
                        >
                            <FiArrowLeft /> Back
                        </button>
                        <button 
                            className="btn btn-gold" 
                            onClick={handleNext}
                            disabled={!isAnswered}
                            style={{ opacity: !isAnswered ? 0.5 : 1 }}
                        >
                            {currentStep === questions.length - 1 ? 'See Results' : 'Next'} <FiArrowRight />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Quiz;
