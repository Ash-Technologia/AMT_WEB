import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiHeart, FiShoppingCart, FiStar, FiChevronLeft, FiChevronRight, FiMinus, FiPlus } from 'react-icons/fi';
import { Helmet } from 'react-helmet-async';
import API from '../services/api';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const ProductDetail = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const { toggleWishlist, isInWishlist } = useWishlist();
    const { user } = useAuth();

    const [product, setProduct] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeImg, setActiveImg] = useState(0);
    const [qty, setQty] = useState(1);
    const [activeTab, setActiveTab] = useState('description');
    const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
    const [submittingReview, setSubmittingReview] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [prodRes, revRes] = await Promise.all([
                    API.get(`/products/${slug}`),
                    API.get(`/reviews/${slug}`).catch(() => ({ data: { reviews: [] } })),
                ]);
                setProduct(prodRes.data.product);
                setReviews(revRes.data.reviews || []);
            } catch (err) {
                toast.error('Product not found');
                navigate('/products');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [slug]);

    const handleAddToCart = () => {
        if (product.stock === 0) return;
        for (let i = 0; i < qty; i++) addToCart(product, 1);
        if (qty > 1) toast.success(`${qty} items added to cart! 🛒`);
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        if (!user) { toast.error('Please login to submit a review'); return; }
        try {
            setSubmittingReview(true);
            await API.post(`/reviews/${product._id}`, reviewForm);
            toast.success('Review submitted! It will appear after approval.');
            setReviewForm({ rating: 5, comment: '' });
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to submit review');
        } finally {
            setSubmittingReview(false);
        }
    };

    if (loading) return <div className="page-loader"><div className="spinner" /></div>;
    if (!product) return null;

    const inWishlist = isInWishlist(product._id);
    const discountPct = product.discountPrice
        ? Math.round((1 - product.discountPrice / product.price) * 100)
        : 0;

    return (
        <>
            <Helmet>
                <title>{product.name} — AMT Advanced Medical Therapeutics</title>
                <meta name="description" content={product.description?.substring(0, 160)} />
            </Helmet>

            <div className="container" style={{ paddingTop: 'var(--space-2xl)', paddingBottom: 'var(--space-3xl)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-2xl)', alignItems: 'start' }}>
                    {/* ─── Images ─────────────────────────────────────────────────────── */}
                    <div>
                        <div className="glass-card" style={{ overflow: 'hidden', aspectRatio: '1', position: 'relative' }}>
                            <img
                                src={product.images?.[activeImg]?.url || 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800'}
                                alt={product.name}
                                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                            />
                            {product.images?.length > 1 && (
                                <>
                                    <button
                                        onClick={() => setActiveImg(i => (i - 1 + product.images.length) % product.images.length)}
                                        style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-primary)' }}
                                    ><FiChevronLeft /></button>
                                    <button
                                        onClick={() => setActiveImg(i => (i + 1) % product.images.length)}
                                        style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-primary)' }}
                                    ><FiChevronRight /></button>
                                </>
                            )}
                        </div>
                        {/* Thumbnails */}
                        {product.images?.length > 1 && (
                            <div style={{ display: 'flex', gap: 'var(--space-sm)', marginTop: 'var(--space-sm)', flexWrap: 'wrap' }}>
                                {product.images.map((img, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setActiveImg(i)}
                                        style={{
                                            width: 72, height: 72, borderRadius: 'var(--radius-md)', overflow: 'hidden',
                                            border: `2px solid ${activeImg === i ? 'var(--primary)' : 'var(--border)'}`,
                                            cursor: 'pointer', background: 'none', padding: 0,
                                        }}
                                    >
                                        <img src={img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* ─── Info ───────────────────────────────────────────────────────── */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
                        <div>
                            <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', marginBottom: 'var(--space-sm)' }}>{product.name}</h1>
                            {product.avgRating > 0 && (
                                <div className="flex gap-sm" style={{ alignItems: 'center', marginBottom: 'var(--space-sm)' }}>
                                    <div className="stars">
                                        {[...Array(5)].map((_, i) => (
                                            <FiStar key={i} style={{ fill: i < Math.round(product.avgRating) ? 'var(--gold)' : 'none', color: 'var(--gold)' }} />
                                        ))}
                                    </div>
                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                                        {product.avgRating.toFixed(1)} ({product.numReviews} reviews)
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Price */}
                        <div className="price-display">
                            <span className="price-current">₹{(product.discountPrice || product.price).toLocaleString('en-IN')}</span>
                            {product.discountPrice && (
                                <>
                                    <span className="price-original">₹{product.price.toLocaleString('en-IN')}</span>
                                    <span className="price-discount">{discountPct}% OFF</span>
                                </>
                            )}
                        </div>
                        {product.requiresExtraDeliveryCharge && (
                            <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '-8px', fontStyle: 'italic' }}>
                                * Extra delivery charge required (no amount) to be paid at time of delivery
                            </div>
                        )}

                        {/* Stock */}
                        <div>
                            {product.stock > 0 ? (
                                <span className="badge badge-primary">✓ In Stock ({product.stock} available)</span>
                            ) : (
                                <span className="badge badge-error">Out of Stock</span>
                            )}
                        </div>

                        {/* Quantity */}
                        {product.stock > 0 && (
                            <div className="flex gap-md" style={{ alignItems: 'center' }}>
                                <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Quantity:</span>
                                <div className="flex gap-sm" style={{ alignItems: 'center' }}>
                                    <button
                                        onClick={() => setQty(q => Math.max(1, q - 1))}
                                        className="icon-btn"
                                        style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}
                                    ><FiMinus /></button>
                                    <span style={{ minWidth: 32, textAlign: 'center', fontWeight: 600 }}>{qty}</span>
                                    <button
                                        onClick={() => setQty(q => Math.min(product.stock, q + 1))}
                                        className="icon-btn"
                                        style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}
                                    ><FiPlus /></button>
                                </div>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-md">
                            <button
                                className="btn btn-primary btn-lg"
                                style={{ flex: 1 }}
                                onClick={handleAddToCart}
                                disabled={product.stock === 0}
                            >
                                <FiShoppingCart />
                                {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                            </button>
                            <button
                                className={`btn btn-glass ${inWishlist ? 'btn-outline' : ''}`}
                                onClick={() => toggleWishlist(product)}
                                style={{ color: inWishlist ? 'var(--error)' : undefined }}
                            >
                                <FiHeart style={{ fill: inWishlist ? 'var(--error)' : 'none' }} />
                            </button>
                        </div>

                        {/* Tags */}
                        {product.tags?.length > 0 && (
                            <div className="flex gap-sm" style={{ flexWrap: 'wrap' }}>
                                {product.tags.map(tag => (
                                    <span key={tag} className="badge badge-primary">{tag}</span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>


                {/* ─── Tabs ─────────────────────────────────────────────────────────── */}
                <div style={{ marginTop: 'var(--space-3xl)' }}>
                    <div className="flex gap-sm" style={{ borderBottom: '1px solid var(--border)', marginBottom: 'var(--space-xl)', overflowX: 'auto' }}>
                        {['description', 'howToUse', ...(product.videoUrl ? ['video'] : []), 'reviews'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                style={{
                                    padding: '12px 20px',
                                    background: 'none',
                                    border: 'none',
                                    borderBottom: `2px solid ${activeTab === tab ? 'var(--primary)' : 'transparent'}`,
                                    color: activeTab === tab ? 'var(--primary-light)' : 'var(--text-muted)',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    transition: 'all var(--transition-fast)',
                                    textTransform: 'capitalize',
                                    fontSize: '0.95rem',
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                {tab === 'howToUse' ? 'How to Use' : tab === 'reviews' ? `Reviews (${reviews.length})` : tab === 'video' ? '▶ Video' : 'Description'}
                            </button>
                        ))}
                    </div>
                    {activeTab === 'video' && (() => {
                        const getYouTubeId = (url) => {
                            if (!url) return null;
                            const patterns = [
                                /[?&]v=([a-zA-Z0-9_-]{11})/,
                                /youtu\.be\/([a-zA-Z0-9_-]{11})/,
                                /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
                                /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
                            ];
                            for (const p of patterns) {
                                const m = url.match(p);
                                if (m) return m[1];
                            }
                            return url.split('/').pop()?.split('?')[0] || null;
                        };
                        const videoId = getYouTubeId(product.videoUrl);
                        if (!videoId) return (
                            <div className="glass-card" style={{ padding: 'var(--space-xl)', textAlign: 'center', maxWidth: 800 }}>
                                <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: 'var(--space-md)' }}>🎬</span>
                                <p style={{ color: 'var(--text-muted)' }}>No demonstration video available for this product.</p>
                            </div>
                        );
                        return (
                            <div className="product-video-window glass-card" style={{ maxWidth: 800, padding: 'var(--space-lg)', position: 'relative', border: '1px solid var(--primary-light)', boxShadow: '0 0 40px rgba(82, 183, 136, 0.1)' }}>
                                <div className="video-window-header" style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 'var(--space-md)', paddingBottom: 'var(--space-sm)', borderBottom: '1px solid var(--border)' }}>
                                    <div style={{ width: 12, height: 12, borderRadius: 6, background: '#ff5f56' }} />
                                    <div style={{ width: 12, height: 12, borderRadius: 6, background: '#ffbd2e' }} />
                                    <div style={{ width: 12, height: 12, borderRadius: 6, background: '#27c93f' }} />
                                    <span style={{ marginLeft: 'auto', fontSize: '0.75rem', fontWeight: 700, color: 'var(--gold)', letterSpacing: 1, textTransform: 'uppercase' }}>Showcase Window</span>
                                </div>
                                <div style={{ aspectRatio: '16/9', borderRadius: 'var(--radius-md)', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.4)' }}>
                                    <iframe
                                        width="100%" height="100%"
                                        src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&autoplay=0`}
                                        title={`${product.name} Demo Video`}
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                        style={{ display: 'block' }}
                                    />
                                </div>
                                <div style={{ marginTop: 'var(--space-md)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                                        Experience the <span style={{ color: 'var(--gold)' }}>{product.name}</span> in action.
                                    </p>
                                    <a href={product.videoUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.75rem', color: 'var(--primary-light)', fontWeight: 700, textDecoration: 'none' }}>WATCH ON YOUTUBE →</a>
                                </div>
                            </div>
                        );
                    })()}

                    {activeTab === 'description' && (
                        <div style={{ color: 'var(--text-secondary)', lineHeight: 1.9, maxWidth: 800 }}>
                            <p>{product.description}</p>
                            {product.instructions && (
                                <div style={{ marginTop: 'var(--space-lg)', padding: 'var(--space-lg)', background: 'var(--surface)', borderRadius: 'var(--radius-md)', borderLeft: '3px solid var(--primary)' }}>
                                    <h4 style={{ marginBottom: 'var(--space-sm)', color: 'var(--text-primary)' }}>⚠️ Important Instructions</h4>
                                    <p>{product.instructions}</p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'howToUse' && (
                        <div style={{ color: 'var(--text-secondary)', lineHeight: 1.9, maxWidth: 800 }}>
                            <p>{product.howToUse || 'Please refer to the product manual for usage instructions.'}</p>
                        </div>
                    )}

                    {activeTab === 'reviews' && (
                        <div style={{ maxWidth: 800 }}>
                            {reviews.length === 0 ? (
                                <p style={{ color: 'var(--text-muted)' }}>No reviews yet. Be the first to review!</p>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)', marginBottom: 'var(--space-xl)' }}>
                                    {reviews.map(review => (
                                        <div key={review._id} className="glass-card" style={{ padding: 'var(--space-md)' }}>
                                            <div className="flex-between" style={{ marginBottom: 'var(--space-sm)' }}>
                                                <div>
                                                    <p style={{ fontWeight: 600 }}>{review.user?.name || 'Anonymous'}</p>
                                                    <div className="stars">
                                                        {[...Array(5)].map((_, i) => (
                                                            <FiStar key={i} style={{ fill: i < review.rating ? 'var(--gold)' : 'none', color: 'var(--gold)', fontSize: '0.8rem' }} />
                                                        ))}
                                                    </div>
                                                </div>
                                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                                    {new Date(review.createdAt).toLocaleDateString('en-IN')}
                                                </span>
                                            </div>
                                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{review.comment}</p>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Review Form */}
                            {user && (
                                <div className="glass-card" style={{ padding: 'var(--space-xl)' }}>
                                    <h3 style={{ marginBottom: 'var(--space-lg)' }}>Write a Review</h3>
                                    <form onSubmit={handleReviewSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                                        <div className="form-group">
                                            <label className="form-label">Rating</label>
                                            <div className="flex gap-sm">
                                                {[1, 2, 3, 4, 5].map(r => (
                                                    <button
                                                        key={r}
                                                        type="button"
                                                        onClick={() => setReviewForm(f => ({ ...f, rating: r }))}
                                                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem', color: r <= reviewForm.rating ? 'var(--gold)' : 'var(--border)' }}
                                                    >★</button>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Your Review</label>
                                            <textarea
                                                className="form-input"
                                                value={reviewForm.comment}
                                                onChange={e => setReviewForm(f => ({ ...f, comment: e.target.value }))}
                                                placeholder="Share your experience with this product..."
                                                required
                                            />
                                        </div>
                                        <button type="submit" className="btn btn-primary" disabled={submittingReview}>
                                            {submittingReview ? 'Submitting...' : 'Submit Review'}
                                        </button>
                                    </form>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default ProductDetail;
