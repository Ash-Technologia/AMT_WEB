import { useEffect, useState, useRef, useCallback } from 'react';
import { motion, useScroll, useTransform, useInView, useMotionValue, useSpring, AnimatePresence } from 'framer-motion';
import { FiArrowRight, FiShield, FiAward, FiHeart, FiTruck, FiUsers, FiCheckCircle, FiStar, FiHeadphones, FiZap } from 'react-icons/fi';
import { Helmet } from 'react-helmet-async';
import API from '../services/api';
import ProductCard from '../components/products/ProductCard';
import { MandalaBackdrop, LotusBloom, SilkFlow, OrnamentalDivider } from '../components/ui/Decorations';
import './Home.css';

const features = [
    { icon: <FiShield />, title: 'Clinically Tested', desc: 'All products tested for safety and efficacy', color: '#52B788' },
    { icon: <FiAward />, title: 'Premium Quality', desc: 'Medical-grade materials and craftsmanship', color: '#C9A84C' },
    { icon: <FiHeart />, title: 'Natural Healing', desc: "Harnessing nature's therapeutic power", color: '#f87171' },
    { icon: <FiTruck />, title: 'Pan-India Delivery', desc: 'Fast and reliable shipping across India', color: '#818cf8' },
];

const stats = [
    { icon: <FiUsers />, value: 25000, suffix: '+', display: '25K+', label: 'Community Members', desc: 'Trusted by families across India', color: '#52B788', glow: 'rgba(82, 183, 136, 0.35)' },
    { icon: <FiCheckCircle />, value: 100, suffix: '%', display: '100%', label: 'Clinically Verified', desc: 'Every product scientifically backed', color: '#C9A84C', glow: 'rgba(201, 168, 76, 0.35)' },
    { icon: <FiStar />, value: 4.9, suffix: '★', display: '4.9★', label: 'Trust Score', desc: 'Average rating from verified buyers', color: '#f59e0b', glow: 'rgba(245, 158, 11, 0.35)' },
    { icon: <FiHeadphones />, value: 24, suffix: '/7', display: '24/7', label: 'Expert Support', desc: 'Round-the-clock wellness guidance', color: '#818cf8', glow: 'rgba(129, 140, 248, 0.35)' },
];

// ─── CountUp Hook ─────────────────────────────────────────────────────────────
const useCountUp = (target, duration = 2000, start = false) => {
    const [count, setCount] = useState(0);
    useEffect(() => {
        if (!start) return;
        const isFloat = target % 1 !== 0;
        const step = target / (duration / 16);
        let current = 0;
        const timer = setInterval(() => {
            current += step;
            if (current >= target) { setCount(target); clearInterval(timer); }
            else setCount(isFloat ? parseFloat(current.toFixed(1)) : Math.floor(current));
        }, 16);
        return () => clearInterval(timer);
    }, [start, target, duration]);
    return count;
};

// ─── Magnetic Button ──────────────────────────────────────────────────────────
const MagneticButton = ({ children, className, ...props }) => {
    const ref = useRef(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const springX = useSpring(x, { stiffness: 300, damping: 30 });
    const springY = useSpring(y, { stiffness: 300, damping: 30 });

    const handleMouseMove = useCallback((e) => {
        const btn = ref.current;
        if (!btn) return;
        const rect = btn.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        x.set((e.clientX - cx) * 0.35);
        y.set((e.clientY - cy) * 0.35);
    }, [x, y]);

    const handleMouseLeave = useCallback(() => {
        x.set(0); y.set(0);
    }, [x, y]);

    return (
        <motion.div
            ref={ref}
            style={{ x: springX, y: springY, display: 'inline-block' }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
        >
            <ProductLink className={className} {...props}>{children}</ProductLink>
        </motion.div>
    );
};

// Internal Link helper for MagneticButton
import { Link as ProductLink } from 'react-router-dom';

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ stat, index }) => {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, amount: 0.5 });
    const count = useCountUp(stat.value, 2000, inView);
    const isFloat = stat.value % 1 !== 0;
    const displayCount = isFloat ? count.toFixed(1) : count;

    return (
        <motion.div
            ref={ref}
            className="stat-card glass-card"
            initial={{ opacity: 0, y: 50 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: index * 0.12, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ y: -8, scale: 1.02, transition: { duration: 0.2 } }}
            style={{ '--stat-color': stat.color, '--stat-glow': stat.glow }}
        >
            <div className="stat-card__glow" />
            <div className="stat-card__icon" style={{ color: stat.color, boxShadow: `0 0 28px ${stat.glow}` }}>
                {stat.icon}
            </div>
            <div className="stat-card__body">
                <span className="stat-card__value" style={{ color: stat.color }}>
                    {inView ? displayCount : 0}{stat.suffix}
                </span>
                <span className="stat-card__label">{stat.label}</span>
                <p className="stat-card__desc">{stat.desc}</p>
            </div>
            <div className="stat-card__line" style={{ background: `linear-gradient(90deg, transparent, ${stat.color}, transparent)` }} />
        </motion.div>
    );
};

// ─── Feature Card ─────────────────────────────────────────────────────────────
const FeatureCard = ({ feature, index }) => {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, amount: 0.3 });

    return (
        <motion.div
            ref={ref}
            className="feature-card glass-card"
            initial={{ opacity: 0, y: 40 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ y: -6, transition: { duration: 0.2 } }}
            style={{ '--feature-color': feature.color }}
        >
            <div className="feature-icon" style={{ color: feature.color, boxShadow: `0 0 20px ${feature.color}30` }}>
                {feature.icon}
            </div>
            <h3 className="feature-title">{feature.title}</h3>
            <p className="feature-desc">{feature.desc}</p>
            <div className="feature-glow" style={{ background: `radial-gradient(circle at center, ${feature.color}15 0%, transparent 70%)` }} />
        </motion.div>
    );
};

// ─── Floating particles ───────────────────────────────────────
const PARTICLES = [...Array(18)].map((_, i) => ({
    left: `${(i * 5.5 + 3) % 100}%`,
    top: `${(i * 7.3 + 10) % 100}%`,
    delay: `${(i * 0.28) % 5}s`,
    dur: `${4 + (i % 4)}s`,
    size: 2 + (i % 3),
}));

const Home = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [config, setConfig] = useState({ homepageVideoUrl: 'https://www.youtube.com/watch?v=FmXREvYq3kE' });

    useEffect(() => {
        API.get('/config').then(res => {
            if (res.data.config) setConfig(prev => ({ ...prev, ...res.data.config }));
        }).catch(console.error);
    }, []);
    const heroRef = useRef(null);
    const { scrollY } = useScroll();
    const heroY = useTransform(scrollY, [0, 600], [0, 200]);
    const heroOpacity = useTransform(scrollY, [0, 350], [1, 0]);
    const heroScale = useTransform(scrollY, [0, 400], [1, 0.95]);

    useEffect(() => {
        API.get('/products?limit=6')
            .then(res => setProducts(res.data.products || []))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    return (
        <>
            <Helmet>
                <title>AMT — Advanced Medical Therapeutics | Premium Health Therapy</title>
            </Helmet>

            {/* ─── Hero ─────────────────────────────────────────────────────── */}
            <section className="hero" ref={heroRef}>
                {/* Luxury Background Elements */}
                <div className="hero__bg-luxury">
                    <MandalaBackdrop style={{ position: 'absolute', top: '-10%', right: '-10%', width: '80%', color: 'var(--primary-light)' }} />
                    <SilkFlow style={{ position: 'absolute', bottom: '15%', left: 0, width: '100%', color: 'var(--gold)' }} />
                    <LotusBloom style={{ position: 'absolute', top: '15%', left: '10%', width: '120px', color: 'var(--primary-light)', opacity: 0.15 }} />
                    <LotusBloom style={{ position: 'absolute', bottom: '25%', right: '15%', width: '160px', color: 'var(--gold)', opacity: 0.12 }} />
                </div>

                <motion.div className="hero__bg" style={{ y: heroY }}>
                    <div className="hero__particles">
                        {PARTICLES.map((p, i) => (
                            <div key={i} className="particle" style={{
                                left: p.left, top: p.top,
                                animationDelay: p.delay,
                                animationDuration: p.dur,
                                width: p.size, height: p.size,
                            }} />
                        ))}
                    </div>
                    <div className="hero__grid" />
                </motion.div>

                <motion.div
                    className="hero__content container"
                    style={{ opacity: heroOpacity, scale: heroScale }}
                >
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.9, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                    >
                        <motion.div
                            className="hero-badge"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                        >
                            <FiZap className="hero-badge__icon" />
                            <span>Advanced Medical Therapeutics</span>
                        </motion.div>

                        <h1 className="hero__title">
                            <span className="hero__title-line">Heal Naturally.</span><br />
                            <span className="gradient-text">Live Fully.</span>
                        </h1>

                        <p className="hero__subtitle">
                            Premium therapy products that harness the power of nature and science to restore your body's natural balance and vitality.
                        </p>

                        <div className="hero__actions">
                            <MagneticButton to="/products" className="btn btn-primary btn-lg hero-cta-primary">
                                Explore Products <FiArrowRight />
                            </MagneticButton>
                            <MagneticButton to="/about" className="btn btn-glass btn-lg hero-cta-glass">
                                Our Story
                            </MagneticButton>
                        </div>

                        <div className="hero-trust">
                            {['25K+ Users', '100% Natural', 'Clinically Tested'].map((t, i) => (
                                <motion.div
                                    key={t}
                                    className="hero-trust__item"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.7 + i * 0.1 }}
                                >
                                    <span className="hero-trust__dot" />
                                    {t}
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </motion.div>

                <div className="hero__scroll-indicator">
                    <div className="scroll-mouse">
                        <div className="scroll-wheel" />
                    </div>
                </div>
            </section>

            {/* ─── Stats ────────────────────────────────────────────────────── */}
            <section className="section stats-section">
                <div className="container">
                    <motion.div
                        className="section-header"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.4 }}
                        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    >
                        <span className="section-label">By The Numbers</span>
                        <h2 className="section-title">Why Thousands Trust AMT</h2>
                        <div className="divider" />
                    </motion.div>
                    <div className="stats-grid">
                        {stats.map((stat, i) => (
                            <StatCard key={stat.label} stat={stat} index={i} />
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── Features ─────────────────────────────────────────────────── */}
            <section className="section features-section">
                <div className="container">
                    <motion.div
                        className="section-header"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.4 }}
                        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    >
                        <span className="section-label">Our Promise</span>
                        <h2 className="section-title">What Sets AMT Apart</h2>
                        <div className="divider" />
                    </motion.div>
                    <div className="grid-4">
                        {features.map((f, i) => (
                            <FeatureCard key={f.title} feature={f} index={i} />
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── Products ─────────────────────────────────────────────────── */}
            <section className="section">
                <div className="container">
                    <motion.div
                        className="section-header"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.4 }}
                        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    >
                        <span className="section-label">Our Collection</span>
                        <h2 className="section-title">Therapy Products</h2>
                        <div className="divider" />
                        <p className="section-subtitle">Scientifically formulated therapy solutions for holistic wellness</p>
                    </motion.div>

                    {loading ? (
                        <div className="grid-3">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="skeleton" style={{ height: 380, borderRadius: 20 }} />
                            ))}
                        </div>
                    ) : (
                        <div className="grid-3">
                            {products.map((product, i) => (
                                <motion.div
                                    key={product._id}
                                    initial={{ opacity: 0, y: 40 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, amount: 0.1 }}
                                    transition={{ duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                                >
                                    <ProductCard product={product} />
                                </motion.div>
                            ))}
                        </div>
                    )}

                    <div className="text-center" style={{ marginTop: 'var(--space-2xl)' }}>
                        <MagneticButton to="/products" className="btn btn-outline btn-lg">
                            View All Products <FiArrowRight />
                        </MagneticButton>
                    </div>
                </div>
            </section>

            <OrnamentalDivider />

            {/* ── YouTube Showcase Section ── */}
            <section className="youtube-showcase">
                <div className="container">
                    <div className="section-header text-center">
                        <motion.span
                            className="badge badge-primary"
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                        >
                            Experience AMT
                        </motion.span>
                        <motion.h2
                            className="section-title"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                        >
                            Watch & <span className="text-gradient">Learn</span>
                        </motion.h2>
                        <motion.p
                            className="section-subtitle"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                        >
                            Discover the science behind our therapeutic products and how they can transform your wellness journey.
                        </motion.p>
                    </div>

                    <div className="youtube-showcase__content">
                        <motion.div
                            className="youtube-showcase__video-wrapper glass-card"
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                        >
                            <iframe
                                width="100%"
                                height="100%"
                                src={config.homepageVideoUrl?.includes('v=')
                                    ? `https://www.youtube.com/embed/${config.homepageVideoUrl.split('v=')[1]?.split('&')[0]}`
                                    : `https://www.youtube.com/embed/${config.homepageVideoUrl?.split('/').pop()}`}
                                title="AMT YouTube Gallery"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        </motion.div>

                        <div className="youtube-showcase__info">
                            <div className="youtube-showcase__stats grid-2">
                                <div className="stat-card stat-card--small">
                                    <span className="stat-card__value">100+</span>
                                    <span className="stat-card__label">Videos</span>
                                </div>
                                <div className="stat-card stat-card--small">
                                    <span className="stat-card__value">50k+</span>
                                    <span className="stat-card__label">Views</span>
                                </div>
                            </div>
                            <p className="youtube-showcase__text">
                                Our YouTube channel features in-depth tutorials, expert interviews, and success stories from our community. Subscribe to stay updated with the latest in advanced medical therapeutics.
                            </p>
                            <a
                                href="https://www.youtube.com/@Amrutamtsinghavi"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-primary"
                            >
                                Subscribe on YouTube
                            </a>
                            <div style={{ marginTop: 'var(--space-md)' }}>
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', display: 'block', marginBottom: '4px' }}>Video Link:</span>
                                <a 
                                    href={config.homepageVideoUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    style={{ color: 'var(--primary-light)', fontSize: '0.9rem', wordBreak: 'break-all', textDecoration: 'underline' }}
                                >
                                    {config.homepageVideoUrl}
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <OrnamentalDivider />

            {/* ── About / Mission Banner — UNIFIED STYLING ── */}
            <div className="about-mission-banner youtube-showcase-style">
                {/* Layered background */}
                <div className="about-mission-banner__bg" />
                <div className="about-mission-banner__noise" />

                {/* Decorative SVG elements */}
                <MandalaBackdrop className="about-mission-banner__mandala" />
                <SilkFlow className="about-mission-banner__silk" />
                <LotusBloom className="about-mission-banner__lotus about-mission-banner__lotus--left" />
                <LotusBloom className="about-mission-banner__lotus about-mission-banner__lotus--right" />

                {/* Floating orbs */}
                <div className="about-mission-banner__orb about-mission-banner__orb--1" />
                <div className="about-mission-banner__orb about-mission-banner__orb--2" />
                <div className="about-mission-banner__orb about-mission-banner__orb--3" />

                {/* Content */}
                <div className="container about-mission-banner__content">
                    <div className="about-mission-banner__centered-wrap" style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
                        <motion.div
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.3 }}
                            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                            className="about-mission-banner__inner"
                        >
                            {/* Label pill */}
                            <motion.div
                                className="about-mission-banner__pill badge badge-primary"
                                initial={{ opacity: 0, scale: 0.85 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                                style={{ marginBottom: 'var(--space-md)', marginInline: 'auto' }}
                            >
                                <span className="about-mission-banner__pill-dot" />
                                Our Mission
                            </motion.div>

                            {/* Heading */}
                            <h2 className="about-mission-banner__heading" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', color: 'var(--text-primary)', marginBottom: 'var(--space-md)', fontFamily: 'Playfair Display' }}>
                                Ancient Wisdom{' '}
                                <span className="text-gradient">
                                    Modern Wellness
                                </span>
                            </h2>

                            {/* Body text */}
                            <p className="about-mission-banner__body" style={{ color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: 'var(--space-lg)', fontSize: '1.1rem' }}>
                                At AMT, we believe in the body's innate ability to heal. Our therapy products bridge the gap between traditional healing wisdom and modern therapeutic science.
                            </p>

                            {/* Trust row */}
                            <div className="about-mission-banner__trust" style={{ display: 'flex', gap: 'var(--space-lg)', marginBottom: 'var(--space-xl)', flexWrap: 'wrap', justifyContent: 'center' }}>
                                {['Ayurvedic Roots', 'Science-Backed', 'Ethically Sourced'].map((item, i) => (
                                    <motion.span
                                        key={item}
                                        className="about-mission-banner__trust-item"
                                        initial={{ opacity: 0, y: 8 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: 0.5 + i * 0.1 }}
                                        style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 8 }}
                                    >
                                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--gold)' }} />
                                        {item}
                                    </motion.span>
                                ))}
                            </div>

                            {/* CTA */}
                            <MagneticButton to="/about" className="btn btn-gold about-mission-banner__cta">
                                Discover Our Story <FiArrowRight />
                            </MagneticButton>
                        </motion.div>
                    </div>
                </div>

                {/* Bottom fade */}
                <div className="about-mission-banner__fade-bottom" />
            </div>
        </>
    );
};

export default Home;