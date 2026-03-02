import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { FiArrowLeft, FiClock, FiEye, FiUser } from 'react-icons/fi';
import API from '../services/api';

const BlogDetail = () => {
    const { slug } = useParams();
    const [blog, setBlog] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        API.get(`/blogs/${slug}`)
            .then(res => setBlog(res.data.blog))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [slug]);

    if (loading) return <div className="page-loader"><div className="spinner" /></div>;

    if (!blog) return (
        <div className="container" style={{ paddingTop: 'var(--space-3xl)', paddingBottom: 'var(--space-3xl)', textAlign: 'center' }}>
            <span style={{ fontSize: '3rem', display: 'block', marginBottom: 'var(--space-lg)' }}>🌿</span>
            <h2 style={{ marginBottom: 'var(--space-md)' }}>Blog not found</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-xl)' }}>The article you're looking for doesn't exist or may have been moved.</p>
            <Link to="/blog" className="btn btn-primary">
                <FiArrowLeft /> Back to Blog
            </Link>
        </div>
    );

    return (
        <>
            <Helmet>
                <title>{blog.title} — AMT Blog</title>
                <meta name="description" content={blog.excerpt || blog.content?.substring(0, 160)} />
            </Helmet>

            {/* ══════════════════════════════════════════
                BLOG DETAIL HERO — Redesigned
            ══════════════════════════════════════════ */}
            <div className="blog-detail-hero">
                {/* Background */}
                {blog.coverImage ? (
                    <div
                        className="blog-detail-hero__cover"
                        style={{
                            backgroundImage: `url(${blog.coverImage?.url || blog.coverImage})`,
                        }}
                    />
                ) : (
                    <div className="blog-detail-hero__cover blog-detail-hero__cover--fallback" />
                )}
                <div className="blog-detail-hero__overlay" />
                <div className="blog-detail-hero__vignette" />

                {/* Subtle grid */}
                <div className="blog-detail-hero__grid" />

                {/* Content */}
                <div className="container blog-detail-hero__content">
                    <motion.div
                        className="blog-detail-hero__inner"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    >
                        {/* Back link */}
                        <Link to="/blog" className="blog-detail-hero__back">
                            <FiArrowLeft />
                            <span>Back to Blog</span>
                        </Link>

                        {/* Tags */}
                        {blog.tags?.length > 0 && (
                            <div className="blog-detail-hero__tags">
                                {blog.tags.slice(0, 3).map(tag => (
                                    <span key={tag} className="blog-detail-hero__tag">{tag}</span>
                                ))}
                            </div>
                        )}

                        {/* Title */}
                        <h1 className="blog-detail-hero__title">{blog.title}</h1>

                        {/* Meta row */}
                        <div className="blog-detail-hero__meta">
                            <span className="blog-detail-hero__meta-item">
                                <FiUser />
                                {blog.author?.name || 'AMT Team'}
                            </span>
                            <span className="blog-detail-hero__meta-sep">·</span>
                            <span className="blog-detail-hero__meta-item">
                                <FiClock />
                                {new Date(blog.createdAt).toLocaleDateString('en-IN', {
                                    day: 'numeric', month: 'long', year: 'numeric'
                                })}
                            </span>
                            {blog.viewCount > 0 && (
                                <>
                                    <span className="blog-detail-hero__meta-sep">·</span>
                                    <span className="blog-detail-hero__meta-item">
                                        <FiEye />
                                        {blog.viewCount.toLocaleString()} views
                                    </span>
                                </>
                            )}
                        </div>
                    </motion.div>
                </div>

                {/* Bottom fade into content */}
                <div className="blog-detail-hero__fade" />
            </div>

            {/* ══════════════════════════════════════════
                BLOG CONTENT
            ══════════════════════════════════════════ */}
            <motion.div
                className="blog-detail-body container"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
                {/* Article content */}
                <article className="blog-detail-article">
                    <div className="blog-detail-article__text">
                        {blog.content}
                    </div>
                </article>

                {/* Footer */}
                <div className="blog-detail-footer">
                    {blog.tags?.length > 0 && (
                        <div className="blog-detail-footer__tags">
                            {blog.tags.map(tag => (
                                <span key={tag} className="badge badge-primary">{tag}</span>
                            ))}
                        </div>
                    )}
                    <Link to="/blog" className="btn btn-outline">
                        <FiArrowLeft />
                        Back to Blog
                    </Link>
                </div>
            </motion.div>

            {/* Inline styles */}
            <style>{`
                /* ── Blog Detail Hero ── */
                .blog-detail-hero {
                    position: relative;
                    min-height: 500px;
                    display: flex;
                    align-items: flex-end;
                    overflow: hidden;
                }

                .blog-detail-hero__cover {
                    position: absolute;
                    inset: 0;
                    background-size: cover;
                    background-position: center;
                    transform: scale(1.05);
                    transition: transform 0.6s ease;
                    z-index: 0;
                }

                .blog-detail-hero__cover--fallback {
                    background: linear-gradient(135deg, var(--bg-tertiary) 0%, var(--primary-dark) 50%, var(--primary) 100%);
                }

                .blog-detail-hero__overlay {
                    position: absolute;
                    inset: 0;
                    background:
                        linear-gradient(to top, color-mix(in srgb, var(--bg-primary) 97%, transparent) 0%, color-mix(in srgb, var(--bg-primary) 60%, transparent) 40%, color-mix(in srgb, var(--bg-primary) 25%, transparent) 100%),
                        linear-gradient(135deg, color-mix(in srgb, var(--primary) 40%, transparent) 0%, transparent 60%);
                    z-index: 1;
                }

                .blog-detail-hero__vignette {
                    position: absolute;
                    inset: 0;
                    background: radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.35) 100%);
                    z-index: 1;
                    pointer-events: none;
                }

                .blog-detail-hero__grid {
                    position: absolute;
                    inset: 0;
                    background-image: radial-gradient(circle at 1.5px 1.5px, rgba(255,255,255,0.02) 1px, transparent 0);
                    background-size: 32px 32px;
                    mask-image: linear-gradient(to top, transparent 0%, black 60%);
                    -webkit-mask-image: linear-gradient(to top, transparent 0%, black 60%);
                    z-index: 2;
                    pointer-events: none;
                }

                .blog-detail-hero__content {
                    position: relative;
                    z-index: 10;
                    padding-top: calc(var(--header-height) + var(--space-2xl));
                    padding-bottom: var(--space-2xl);
                }

                .blog-detail-hero__inner {
                    max-width: 760px;
                }

                /* Back link */
                .blog-detail-hero__back {
                    display: inline-flex;
                    align-items: center;
                    gap: 7px;
                    color: var(--text-secondary);
                    font-size: 0.82rem;
                    font-weight: 600;
                    text-decoration: none;
                    margin-bottom: var(--space-lg);
                    transition: color 0.2s, gap 0.2s;
                    letter-spacing: 0.02em;
                    text-transform: uppercase;
                }

                .blog-detail-hero__back:hover {
                    color: var(--primary-light);
                    gap: 10px;
                }

                /* Tags */
                .blog-detail-hero__tags {
                    display: flex;
                    gap: 8px;
                    flex-wrap: wrap;
                    margin-bottom: var(--space-md);
                }

                .blog-detail-hero__tag {
                    display: inline-flex;
                    align-items: center;
                    padding: 4px 14px;
                    background: rgba(82, 183, 136, 0.15);
                    border: 1px solid rgba(82, 183, 136, 0.3);
                    border-radius: var(--radius-full);
                    font-size: 0.72rem;
                    font-weight: 700;
                    color: var(--primary-light);
                    letter-spacing: 0.05em;
                    text-transform: uppercase;
                    backdrop-filter: blur(8px);
                    -webkit-backdrop-filter: blur(8px);
                }

                /* Title */
                .blog-detail-hero__title {
                    font-size: clamp(1.9rem, 5vw, 3rem);
                    font-weight: 800;
                    color: var(--text-primary);
                    line-height: 1.18;
                    margin-bottom: var(--space-lg);
                    letter-spacing: -0.025em;
                    font-family: 'Playfair Display', serif;
                    text-shadow: 0 2px 20px rgba(0,0,0,0.1);
                }

                /* Meta row */
                .blog-detail-hero__meta {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    flex-wrap: wrap;
                }

                .blog-detail-hero__meta-item {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 0.8rem;
                    color: var(--text-secondary);
                    font-weight: 500;
                }

                .blog-detail-hero__meta-sep {
                    color: var(--text-muted);
                    font-size: 0.9rem;
                }

                /* Hero bottom fade */
                .blog-detail-hero__fade {
                    position: absolute;
                    bottom: -2px;
                    left: 0;
                    right: 0;
                    height: 80px;
                    background: linear-gradient(to top, var(--bg-primary), transparent);
                    z-index: 5;
                    pointer-events: none;
                }

                /* ── Blog Detail Body ── */
                .blog-detail-body {
                    max-width: 780px;
                    padding-top: var(--space-xl);
                    padding-bottom: var(--space-3xl);
                }

                .blog-detail-article {
                    padding: var(--space-2xl);
                    background: var(--glass-bg);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    border: 1px solid var(--glass-border);
                    border-radius: var(--radius-xl);
                    box-shadow: var(--glass-shadow);
                    position: relative;
                    overflow: hidden;
                }

                /* Top accent line */
                .blog-detail-article::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 10%;
                    right: 10%;
                    height: 2px;
                    background: linear-gradient(90deg, transparent, var(--primary-light), var(--gold), transparent);
                    border-radius: 2px;
                }

                .blog-detail-article__text {
                    color: var(--text-secondary);
                    font-size: 1.02rem;
                    line-height: 1.95;
                    white-space: pre-wrap;
                }

                /* ── Footer ── */
                .blog-detail-footer {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    flex-wrap: wrap;
                    gap: var(--space-md);
                    margin-top: var(--space-xl);
                    padding-top: var(--space-lg);
                    border-top: 1px solid var(--border);
                }

                .blog-detail-footer__tags {
                    display: flex;
                    gap: 8px;
                    flex-wrap: wrap;
                }

                /* Responsive */
                @media (max-width: 768px) {
                    .blog-detail-hero {
                        min-height: 380px;
                    }
                    .blog-detail-hero__title {
                        font-size: 1.75rem;
                    }
                    .blog-detail-article {
                        padding: var(--space-lg);
                    }
                    .blog-detail-footer {
                        flex-direction: column;
                        align-items: flex-start;
                    }
                }
            `}</style>
        </>
    );
};

export default BlogDetail;