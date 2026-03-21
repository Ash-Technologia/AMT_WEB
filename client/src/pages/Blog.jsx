import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { FiClock, FiTag, FiArrowRight, FiBookOpen } from 'react-icons/fi';
import API from '../services/api';
import { MandalaBackdrop, SilkFlow, LotusBloom, OrnamentalDivider } from '../components/ui/Decorations';

const Blog = () => {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTag, setActiveTag] = useState('All');

    useEffect(() => {
        API.get('/blogs')
            .then(res => setBlogs(res.data.blogs || []))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const allTags = ['All', ...new Set(blogs.flatMap(b => b.tags || []))];
    const filtered = activeTag === 'All' ? blogs : blogs.filter(b => b.tags?.includes(activeTag));

    return (
        <>
            <Helmet>
                <title>Blog — AMT Advanced Medical Therapeutics</title>
                <meta name="description" content="Expert Ayurveda insights on herbs, wellness rituals, and holistic healing from AMT." />
            </Helmet>

            {/* ══════════════════════════════════════════
                BLOG HERO BANNER — Redesigned
            ══════════════════════════════════════════ */}
            {/* ── BLOG HERO BANNER — UNIFIED STYLING ── */}
            <div className="blog-hero-banner youtube-showcase-style">
                {/* Layered background */}
                <div className="blog-hero-banner__bg" />
                <div className="blog-hero-banner__noise" />

                {/* Decorative elements */}
                <MandalaBackdrop className="blog-hero-banner__mandala" />
                <SilkFlow className="blog-hero-banner__silk" />
                <LotusBloom className="blog-hero-banner__lotus blog-hero-banner__lotus--tl" />
                <LotusBloom className="blog-hero-banner__lotus blog-hero-banner__lotus--br" />

                {/* Floating orbs */}
                <div className="blog-hero-banner__orb blog-hero-banner__orb--1" />
                <div className="blog-hero-banner__orb blog-hero-banner__orb--2" />

                {/* Content */}
                <div className="container blog-hero-banner__content">
                    <div style={{ maxWidth: 850, margin: '0 auto', textAlign: 'center' }}>
                        <motion.div
                            className="blog-hero-banner__inner"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                        >
                            {/* Icon badge */}
                            <motion.div
                                className="blog-hero-banner__badge"
                                initial={{ opacity: 0, y: -12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.15 }}
                            >
                                <FiBookOpen className="blog-hero-banner__badge-icon" />
                                <span>Ayurveda Insights</span>
                            </motion.div>

                            <h1 className="blog-hero-banner__heading" style={{ fontSize: 'clamp(2.5rem, 6vw, 4.2rem)', textAlign: 'center', marginBottom: 'var(--space-md)' }}>
                                Wisdom for{' '}
                                <span className="blog-hero-banner__heading-accent text-gradient">
                                    Modern Healing
                                </span>
                            </h1>

                            <p className="blog-hero-banner__subtitle" style={{ textAlign: 'center', maxWidth: 700, marginBottom: 'var(--space-xl)', fontSize: '1.1rem' }}>
                                Ancient rituals and botanical wisdom reimagined for your contemporary lifestyle.
                                Explore our holistic guide to vital living.
                            </p>

                            {/* Stats row */}
                            <div className="blog-hero-banner__stats" style={{ justifyContent: 'center' }}>
                                {[
                                    { value: blogs.length || '20+', label: 'Articles' },
                                    { value: '8+', label: 'Topics' },
                                    { value: '5K+', label: 'Readers' },
                                ].map((s) => (
                                    <div key={s.label} className="blog-hero-banner__stat glass-card" style={{ padding: '10px 24px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 'var(--radius-md)', backdropFilter: 'blur(8px)' }}>
                                        <span className="blog-hero-banner__stat-value" style={{ fontSize: '1.3rem', color: 'var(--primary-light)', fontWeight: 800 }}>{s.value}</span>
                                        <span className="blog-hero-banner__stat-label" style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>{s.label}</span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Bottom fade */}
                <div className="blog-hero-banner__fade" />
            </div>

            {/* ══════════════════════════════════════════
                Blog Content
            ══════════════════════════════════════════ */}
            <div className="container" style={{ paddingBottom: 'var(--space-3xl)' }}>

                {/* ── Tag Filter ── */}
                {!loading && blogs.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 'var(--space-2xl)', justifyContent: 'center' }}
                    >
                        {allTags.map(tag => (
                            <button
                                key={tag}
                                onClick={() => setActiveTag(tag)}
                                style={{
                                    padding: '7px 16px', borderRadius: 999, fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
                                    background: activeTag === tag ? 'var(--primary)' : 'var(--surface)',
                                    color: activeTag === tag ? '#fff' : 'var(--text-secondary)',
                                    border: `1px solid ${activeTag === tag ? 'var(--primary)' : 'var(--border)'}`,
                                }}
                            >
                                {tag === 'All' ? '🌿 All' : tag}
                            </button>
                        ))}
                    </motion.div>
                )}

                {/* ── Blog Grid ── */}
                {loading ? (
                    <div className="grid-3">
                        {[...Array(6)].map((_, i) => <div key={i} className="skeleton" style={{ height: 340, borderRadius: 20 }} />)}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="flex-center flex-col" style={{ minHeight: 300, gap: 'var(--space-md)' }}>
                        <span style={{ fontSize: '3rem' }}>🌿</span>
                        <h3>No articles found</h3>
                        <p className="text-muted">Try selecting a different tag above.</p>
                    </div>
                ) : (
                    <div className="grid-3" style={{ gap: 'var(--space-xl)' }}>
                        {filtered.map((blog, i) => (
                            <motion.div
                                key={blog._id}
                                className="glass-card"
                                style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: (i % 3) * 0.1 }}
                                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                            >
                                {/* Cover image */}
                                <div style={{ height: 200, overflow: 'hidden', position: 'relative', background: 'linear-gradient(135deg, #1b4332, #2d6a4f)' }}>
                                    {blog.coverImage ? (
                                        <img
                                            src={blog.coverImage?.url || blog.coverImage}
                                            alt={blog.title}
                                            style={{ width: '100%', height: '100%', objectFit: 'contain', transition: 'transform 0.5s' }}
                                            onMouseOver={e => e.target.style.transform = 'scale(1.05)'}
                                            onMouseOut={e => e.target.style.transform = 'scale(1)'}
                                        />
                                    ) : (
                                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem' }}>🌿</div>
                                    )}
                                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 60%)' }} />
                                </div>

                                {/* Content */}
                                <div style={{ padding: 'var(--space-lg)', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 'var(--space-sm)' }}>
                                        {blog.tags?.slice(0, 2).map(tag => (
                                            <span key={tag} style={{ background: 'rgba(82,183,136,0.12)', color: 'var(--primary-light)', border: '1px solid rgba(82,183,136,0.2)', padding: '2px 10px', borderRadius: 999, fontSize: '0.72rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                                                <FiTag style={{ fontSize: '0.65rem' }} /> {tag}
                                            </span>
                                        ))}
                                    </div>

                                    <Link
                                        to={`/blog/${blog.slug}`}
                                        style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-primary)', lineHeight: 1.4, display: 'block', marginBottom: 'var(--space-sm)', textDecoration: 'none' }}
                                    >
                                        {blog.title}
                                    </Link>
                                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.7, flex: 1, marginBottom: 'var(--space-md)' }}>
                                        {blog.excerpt || blog.content?.substring(0, 130)}...
                                    </p>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: 'var(--space-sm)', marginTop: 'auto' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                            <FiClock />
                                            {new Date(blog.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </div>
                                        <Link
                                            to={`/blog/${blog.slug}`}
                                            style={{ fontSize: '0.875rem', color: 'var(--primary-light)', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4, transition: 'gap 0.2s' }}
                                        >
                                            Read More →
                                        </Link>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* ── Blog Explore Banner — UNIFIED STYLING ── */}
                {!loading && (
                    <motion.div
                        className="blog-explore-banner youtube-showcase-style"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.3 }}
                        transition={{ duration: 0.8 }}
                        style={{ background: 'none', marginTop: 'var(--space-3xl)' }}
                    >
                        <div className="glass-card" style={{ padding: 'var(--space-3xl)', position: 'relative', overflow: 'hidden', border: '1px solid var(--primary-light)' }}>
                            {/* Background layers */}
                            <div className="blog-explore-banner__bg" style={{ opacity: 0.8, borderRadius: 0 }} />

                            <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 10 }}>
                                <div className="blog-explore-banner__content" style={{ textAlign: 'center', alignItems: 'center', maxWidth: '100%' }}>
                                    <h2 className="blog-explore-banner__heading" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', textAlign: 'center', fontFamily: 'Playfair Display' }}>
                                        Explore Our{' '}
                                        <span className="blog-explore-banner__heading-accent text-gradient">
                                            Ayurvedic Products
                                        </span>
                                    </h2>

                                    <p className="blog-explore-banner__body" style={{ textAlign: 'center', margin: 'var(--space-md) 0 var(--space-xl)', color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: 1.8, maxWidth: 600 }}>
                                        Put wellness wisdom into practice with our range of authentic Ayurvedic formulations. Crafted with care for the modern soul.
                                    </p>

                                    <Link to="/products" className="btn btn-gold blog-explore-banner__cta" style={{ borderRadius: 'var(--radius-full)', padding: '16px 40px', display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none', fontSize: '1rem' }}>
                                        Shop All Products
                                        <FiArrowRight />
                                    </Link>
                                </div>
                            </div>
                        </div>

                        <OrnamentalDivider style={{ opacity: 0.2, marginTop: 'var(--space-xl)' }} />
                    </motion.div>
                )}
            </div>

            {/* Inline styles for Blog banners */}
            <style>{`
                /* ── Blog Hero Banner ── */
                .blog-hero-banner {
                    position: relative;
                    min-height: 520px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: calc(var(--header-height) + var(--space-2xl)) 0 var(--space-3xl);
                    overflow: hidden;
                    isolation: isolate;
                }

                .blog-hero-banner__bg {
                    position: absolute;
                    inset: 0;
                    background: #000;
                    z-index: 0;
                }

                .blog-hero-banner__noise {
                    position: absolute;
                    inset: 0;
                    opacity: 0.035;
                    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
                    z-index: 0;
                    pointer-events: none;
                }

                .blog-hero-banner__grid {
                    position: absolute;
                    inset: 0;
                    background-image: radial-gradient(circle at 1.5px 1.5px, rgba(255,255,255,0.025) 1px, transparent 0);
                    background-size: 36px 36px;
                    mask-image: radial-gradient(ellipse 80% 60% at 50% 0%, black 0%, transparent 80%);
                    -webkit-mask-image: radial-gradient(ellipse 80% 60% at 50% 0%, black 0%, transparent 80%);
                    z-index: 1;
                    pointer-events: none;
                }

                .blog-hero-banner__orb {
                    position: absolute;
                    border-radius: 50%;
                    filter: blur(70px);
                    pointer-events: none;
                    z-index: 0;
                }

                .blog-hero-banner__orb--1 {
                    width: 600px;
                    height: 300px;
                    background: radial-gradient(circle, rgba(45, 106, 79, 0.35) 0%, transparent 70%);
                    top: -80px;
                    left: 50%;
                    transform: translateX(-50%);
                }

                .blog-hero-banner__orb--2 {
                    width: 300px;
                    height: 300px;
                    background: radial-gradient(circle, rgba(201, 168, 76, 0.12) 0%, transparent 70%);
                    bottom: 10%;
                    right: 5%;
                }

                .blog-hero-banner__mandala {
                    position: absolute;
                    top: -20%;
                    right: -12%;
                    width: 600px;
                    color: var(--primary-light);
                    opacity: 0.05;
                    pointer-events: none;
                    z-index: 1;
                    animation: slowSpin 90s linear infinite;
                }

                .blog-hero-banner__silk {
                    position: absolute;
                    bottom: 20%;
                    left: -5%;
                    width: 110%;
                    color: var(--gold);
                    opacity: 0.07;
                    pointer-events: none;
                    z-index: 1;
                }

                .blog-hero-banner__lotus {
                    position: absolute;
                    pointer-events: none;
                    z-index: 1;
                }

                .blog-hero-banner__lotus--tl {
                    top: 10%;
                    left: 5%;
                    width: 130px;
                    color: var(--primary-light);
                    opacity: 0.09;
                }

                .blog-hero-banner__lotus--br {
                    bottom: 12%;
                    right: 6%;
                    width: 100px;
                    color: var(--gold);
                    opacity: 0.07;
                }

                .blog-hero-banner__content {
                    position: relative;
                    z-index: 10;
                    text-align: center;
                }

                .blog-hero-banner__inner {
                    max-width: 720px;
                    margin: 0 auto;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }

                .blog-hero-banner__badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 9px;
                    padding: 8px 20px;
                    background: rgba(82, 183, 136, 0.08);
                    border: 1px solid rgba(82, 183, 136, 0.25);
                    border-radius: var(--radius-full);
                    font-size: 0.73rem;
                    font-weight: 800;
                    color: var(--primary-light);
                    letter-spacing: 2.5px;
                    text-transform: uppercase;
                    margin-bottom: var(--space-lg);
                    backdrop-filter: blur(12px);
                    -webkit-backdrop-filter: blur(12px);
                    box-shadow: 0 4px 24px rgba(45, 106, 79, 0.18), inset 0 1px 0 rgba(255,255,255,0.05);
                }

                .blog-hero-banner__badge-icon {
                    color: var(--gold);
                    font-size: 1rem;
                }

                .blog-hero-banner__heading {
                    font-size: clamp(2.8rem, 8vw, 4.8rem);
                    font-weight: 800;
                    line-height: 1.1;
                    color: var(--text-primary);
                    letter-spacing: -0.03em;
                    margin-bottom: var(--space-lg);
                    font-family: 'Playfair Display', serif;
                }

                .blog-hero-banner__heading-accent {
                    display: block;
                    background: linear-gradient(135deg, var(--primary-light) 0%, var(--gold-light) 50%, var(--gold) 100%);
                    background-size: 200% 200%;
                    animation: gradientPan 5s ease-in-out infinite;
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }

                .blog-hero-banner__divider {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    margin-bottom: var(--space-lg);
                }

                .blog-hero-banner__divider-line {
                    display: block;
                    height: 1px;
                    width: 48px;
                    background: linear-gradient(90deg, transparent, rgba(201, 168, 76, 0.4), transparent);
                }

                .blog-hero-banner__divider-dot {
                    width: 5px;
                    height: 5px;
                    border-radius: 50%;
                    background: var(--primary-light);
                    opacity: 0.6;
                }

                .blog-hero-banner__divider-dot--gold {
                    width: 7px;
                    height: 7px;
                    background: var(--gold);
                    opacity: 0.8;
                    box-shadow: 0 0 10px var(--gold);
                }

                .blog-hero-banner__subtitle {
                    font-size: clamp(0.95rem, 2vw, 1.1rem);
                    color: var(--text-secondary);
                    max-width: 580px;
                    line-height: 1.8;
                    margin-bottom: var(--space-xl);
                    opacity: 0.9;
                }

                .blog-hero-banner__stats {
                    display: flex;
                    gap: var(--space-2xl);
                    justify-content: center;
                    flex-wrap: wrap;
                }

                .blog-hero-banner__stat {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 4px;
                    padding: 12px 20px;
                    background: var(--surface);
                    border: 1px solid var(--border);
                    border-radius: var(--radius-md);
                    backdrop-filter: blur(8px);
                    -webkit-backdrop-filter: blur(8px);
                }

                .blog-hero-banner__stat-value {
                    font-size: 1.4rem;
                    font-weight: 800;
                    color: var(--primary-light);
                    font-family: 'Playfair Display', serif;
                }

                .blog-hero-banner__stat-label {
                    font-size: 0.72rem;
                    font-weight: 600;
                    color: var(--text-muted);
                    letter-spacing: 1.5px;
                    text-transform: uppercase;
                }

                .blog-hero-banner__fade {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    height: 130px;
                    background: linear-gradient(to top, var(--bg-primary), transparent);
                    z-index: 5;
                    pointer-events: none;
                }

                /* ── Blog Explore Banner ── */
                .blog-explore-banner {
                    position: relative;
                    margin-top: var(--space-3xl);
                    border-radius: var(--radius-xl);
                    padding: var(--space-2xl) var(--space-lg);
                    text-align: center;
                    overflow: hidden;
                    isolation: isolate;
                }

                .blog-explore-banner__bg {
                    position: absolute;
                    inset: 0;
                    background: #000;
                    border-radius: var(--radius-xl);
                    z-index: 0;
                }

                .blog-explore-banner__shimmer {
                    position: absolute;
                    inset: 0;
                    border-radius: var(--radius-xl);
                    background: linear-gradient(
                        105deg,
                        transparent 30%,
                        rgba(82, 183, 136, 0.04) 50%,
                        transparent 70%
                    );
                    background-size: 200% 100%;
                    animation: bannerShimmer 6s ease-in-out infinite;
                    z-index: 0;
                }

                @keyframes bannerShimmer {
                    0%, 100% { background-position: 200% 0; }
                    50% { background-position: -200% 0; }
                }

                .blog-explore-banner__mandala {
                    position: absolute;
                    top: -60%;
                    left: -10%;
                    width: 280px;
                    color: var(--primary-light);
                    opacity: 0.08;
                    pointer-events: none;
                    z-index: 1;
                    animation: slowSpin 70s linear infinite;
                }

                .blog-explore-banner__lotus {
                    position: absolute;
                    pointer-events: none;
                    z-index: 1;
                }

                .blog-explore-banner__lotus--left {
                    top: -10%;
                    left: 5%;
                    width: 100px;
                    color: var(--primary-light);
                    opacity: 0.1;
                }

                .blog-explore-banner__lotus--right {
                    bottom: -15%;
                    right: 5%;
                    width: 80px;
                    color: var(--gold);
                    opacity: 0.12;
                }

                .blog-explore-banner__orb {
                    position: absolute;
                    border-radius: 50%;
                    filter: blur(60px);
                    pointer-events: none;
                    z-index: 0;
                }

                .blog-explore-banner__orb--1 {
                    width: 250px;
                    height: 250px;
                    background: radial-gradient(circle, rgba(45, 106, 79, 0.4) 0%, transparent 70%);
                    top: -40px;
                    left: -20px;
                }

                .blog-explore-banner__orb--2 {
                    width: 180px;
                    height: 180px;
                    background: radial-gradient(circle, rgba(201, 168, 76, 0.2) 0%, transparent 70%);
                    bottom: -20px;
                    right: 10%;
                }

                .blog-explore-banner__border-top {
                    position: absolute;
                    top: 0;
                    left: 8%;
                    right: 8%;
                    height: 1px;
                    background: linear-gradient(90deg, transparent, rgba(82, 183, 136, 0.5), rgba(201, 168, 76, 0.4), transparent);
                    border-radius: var(--radius-xl);
                    z-index: 2;
                }

                .blog-explore-banner__border-bottom {
                    position: absolute;
                    bottom: 0;
                    left: 8%;
                    right: 8%;
                    height: 1px;
                    background: linear-gradient(90deg, transparent, rgba(82, 183, 136, 0.25), rgba(201, 168, 76, 0.2), transparent);
                    border-radius: var(--radius-xl);
                    z-index: 2;
                }

                .blog-explore-banner__content {
                    position: relative;
                    z-index: 10;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    max-width: 540px;
                    margin: 0 auto;
                }

                .blog-explore-banner__icon-wrap {
                    font-size: 2.8rem;
                    margin-bottom: var(--space-md);
                    filter: drop-shadow(0 4px 16px rgba(82, 183, 136, 0.3));
                }

                .blog-explore-banner__heading {
                    font-size: clamp(1.6rem, 4vw, 2.4rem);
                    font-weight: 800;
                    color: var(--text-primary);
                    margin-bottom: var(--space-sm);
                    letter-spacing: -0.02em;
                    font-family: 'Playfair Display', serif;
                    line-height: 1.2;
                }

                .blog-explore-banner__heading-accent {
                    background: linear-gradient(135deg, var(--primary-light) 0%, var(--gold) 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }

                .blog-explore-banner__rule {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    margin: var(--space-md) 0;
                }

                .blog-explore-banner__rule > span:not(.blog-explore-banner__rule-gem) {
                    display: block;
                    height: 1px;
                    width: 48px;
                    background: linear-gradient(90deg, transparent, rgba(201, 168, 76, 0.45), transparent);
                }

                .blog-explore-banner__rule-gem {
                    color: var(--gold);
                    font-size: 0.7rem;
                    opacity: 0.75;
                }

                .blog-explore-banner__body {
                    color: var(--text-secondary);
                    font-size: 0.975rem;
                    line-height: 1.8;
                    margin-bottom: var(--space-xl);
                }

                .blog-explore-banner__cta {
                    display: inline-flex;
                    align-items: center;
                    gap: 10px;
                    padding: 14px 32px;
                    background: linear-gradient(135deg, #fff 0%, rgba(240, 248, 243, 0.95) 100%);
                    color: var(--primary-dark);
                    font-weight: 700;
                    font-size: 0.925rem;
                    border-radius: var(--radius-full);
                    text-decoration: none;
                    letter-spacing: 0.02em;
                    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
                    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255,255,255,0.8);
                }

                .blog-explore-banner__cta:hover {
                    transform: translateY(-3px) scale(1.03);
                    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(82, 183, 136, 0.3);
                    color: var(--primary);
                }

                .blog-explore-banner__cta-arrow {
                    transition: transform 0.25s ease;
                }

                .blog-explore-banner__cta:hover .blog-explore-banner__cta-arrow {
                    transform: translateX(4px);
                }

                /* Shared animation */
                @keyframes gradientPan {
                    0%, 100% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                }
                @keyframes slowSpin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }

                /* Responsive */
                @media (max-width: 768px) {
                    .blog-hero-banner {
                        min-height: 400px;
                        padding-bottom: var(--space-2xl);
                    }
                    .blog-hero-banner__heading { font-size: 2.4rem; }
                    .blog-hero-banner__stats { gap: var(--space-md); }
                    .blog-explore-banner { padding: var(--space-xl) var(--space-md); }
                    .blog-explore-banner__heading { font-size: 1.6rem; }
                }
            `}</style>
        </>
    );
};

export default Blog;