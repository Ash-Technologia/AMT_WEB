import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { MandalaBackdrop, SilkFlow, LotusBloom, OrnamentalDivider } from '../components/ui/Decorations';

const About = () => (
    <>
        <Helmet><title>About Us — AMT Advanced Medical Therapeutics</title></Helmet>
        <div className="container" style={{ paddingTop: 'var(--space-2xl)', paddingBottom: 'var(--space-3xl)', position: 'relative' }}>
            {/* Luxury Background Elements */}
            <MandalaBackdrop style={{ position: 'absolute', top: '5%', right: '-10%', width: '400px', color: 'var(--primary-light)' }} />
            <SilkFlow style={{ position: 'absolute', top: '40%', left: '-5%', width: '110%', color: 'var(--gold)', opacity: 0.1 }} />
            <LotusBloom style={{ position: 'absolute', bottom: '15%', left: '5%', width: '120px', color: 'var(--primary-light)', opacity: 0.1 }} />
            <LotusBloom style={{ position: 'absolute', top: '20%', left: '15%', width: '80px', color: 'var(--gold)', opacity: 0.08 }} />

            <div className="section-header">
                <span className="section-label">Our Story</span>
                <h1 className="section-title">About AMT</h1>
                <div className="divider" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-2xl)', alignItems: 'center', marginBottom: 'var(--space-3xl)' }}>
                <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
                    <h2 style={{ marginBottom: 'var(--space-md)' }}>Advanced Medical Therapeutics</h2>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.9, marginBottom: 'var(--space-md)' }}>
                        AMT was founded with a singular vision: to make premium therapeutic healthcare accessible to every Indian household. We believe that true wellness is a combination of ancient healing wisdom and modern medical science.
                    </p>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.9, marginBottom: 'var(--space-md)' }}>
                        Our products are carefully designed by healthcare professionals and tested for safety, efficacy, and durability. From pain relief to rehabilitation, we offer a comprehensive range of therapy products for all ages.
                    </p>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.9 }}>
                        Based in India, we are committed to serving the health needs of our community with integrity, transparency, and compassion.
                    </p>
                </motion.div>
                <motion.div
                    className="glass-card"
                    style={{ padding: 'var(--space-2xl)', textAlign: 'center' }}
                    initial={{ opacity: 0, x: 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                >
                    <div style={{ fontSize: '5rem', marginBottom: 'var(--space-md)', animation: 'float 4s ease-in-out infinite' }}>🌿</div>
                    <h3 className="gradient-text" style={{ fontSize: '2rem', marginBottom: 'var(--space-sm)' }}>Our Mission</h3>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                        "To empower every individual with the tools and knowledge to achieve optimal health and well-being through natural, evidence-based therapy solutions."
                    </p>
                </motion.div>
            </div>

            {/* Values */}
            <div className="section-header">
                <h2 className="section-title">Our Values</h2>
            </div>
            <div className="grid-3">
                {[
                    { emoji: '🔬', title: 'Science-Backed', desc: 'Every product is developed with clinical research and medical expertise.' },
                    { emoji: '🌱', title: 'Natural First', desc: 'We prioritize natural ingredients and sustainable materials.' },
                    { emoji: '❤️', title: 'Patient-Centric', desc: 'Your health and satisfaction are at the heart of everything we do.' },
                    { emoji: '🏆', title: 'Quality Assured', desc: 'Rigorous quality control at every step of production.' },
                    { emoji: '🤝', title: 'Transparent', desc: 'Honest about ingredients, processes, and pricing.' },
                    { emoji: '🌍', title: 'Accessible', desc: 'Making premium therapy affordable for all Indians.' },
                ].map((v, i) => (
                    <motion.div
                        key={v.title}
                        className="glass-card"
                        style={{ padding: 'var(--space-xl)', textAlign: 'center' }}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                    >
                        <div style={{ fontSize: '2.5rem', marginBottom: 'var(--space-md)' }}>{v.emoji}</div>
                        <h3 style={{ marginBottom: 'var(--space-sm)', fontSize: '1rem' }}>{v.title}</h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.7 }}>{v.desc}</p>
                    </motion.div>
                ))}
            </div>

            <OrnamentalDivider />
        </div>
    </>
);

export default About;
