import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiHeart, FiShoppingCart, FiStar, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import BlurImage from '../common/BlurImage';
import './ProductCard.css';

const ProductCard = ({ product }) => {
    const { addToCart } = useCart();
    const { toggleWishlist, isInWishlist } = useWishlist();
    const navigate = useNavigate();
    const inWishlist = isInWishlist(product._id);
    const discountPct = product.discountPrice
        ? Math.round((1 - product.discountPrice / product.price) * 100)
        : 0;

    const avgRating = product.avgRating ?? product.ratings?.average ?? 0;
    const numReviews = product.numReviews ?? product.ratings?.count ?? 0;

    // Multi-image carousel state
    const images = product.images?.length ? product.images : [{ url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400' }];
    const [imgIdx, setImgIdx] = useState(0);

    const prevImg = (e) => {
        e.preventDefault(); e.stopPropagation();
        setImgIdx(i => (i - 1 + images.length) % images.length);
    };
    const nextImg = (e) => {
        if (e) { e.preventDefault(); e.stopPropagation(); }
        setImgIdx(i => (i + 1) % images.length);
    };

    // Auto-scroll
    useEffect(() => {
        if (images.length <= 1) return;
        const interval = setInterval(() => nextImg(), 4000);
        return () => clearInterval(interval);
    }, [images.length]);

    const handleCardClick = (e) => {
        if (e.target.closest('button') || e.target.closest('a')) return;
        navigate(`/products/${product.slug}`);
    };

    return (
        <motion.div
            className="product-card glass-card"
            whileHover={{ y: -8, boxShadow: '0 20px 60px rgba(0,0,0,0.4)' }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            onClick={handleCardClick}
            style={{ cursor: 'pointer' }}
        >
            {/* Image Carousel */}
            <div className="product-card__image-wrapper">
                <Link to={`/products/${product.slug}`} tabIndex={-1} style={{ display: 'block', width: '100%', height: '100%' }}>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={imgIdx}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.25 }}
                            style={{ width: '100%', height: '100%' }}
                        >
                            <BlurImage
                                src={images[imgIdx].url}
                                alt={product.name}
                                style={{ width: '100%', height: '100%' }}
                            />
                        </motion.div>
                    </AnimatePresence>
                </Link>

                {/* Prev / Next arrows — only if multiple images */}
                {images.length > 1 && (
                    <>
                        <button
                            className="product-card__img-nav product-card__img-nav--prev"
                            onClick={prevImg}
                            aria-label="Previous image"
                        >
                            <FiChevronLeft />
                        </button>
                        <button
                            className="product-card__img-nav product-card__img-nav--next"
                            onClick={nextImg}
                            aria-label="Next image"
                        >
                            <FiChevronRight />
                        </button>

                        {/* Dot indicators */}
                        <div className="product-card__dots">
                            {images.map((_, i) => (
                                <button
                                    key={i}
                                    className={`product-card__dot ${i === imgIdx ? 'active' : ''}`}
                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setImgIdx(i); }}
                                    aria-label={`Image ${i + 1}`}
                                />
                            ))}
                        </div>
                    </>
                )}

                {discountPct > 0 && (
                    <span className="product-card__badge badge badge-primary">{discountPct}% OFF</span>
                )}
                {product.stock === 0 && (
                    <div className="product-card__out-of-stock">Out of Stock</div>
                )}
                <button
                    className={`product-card__wishlist ${inWishlist ? 'active' : ''}`}
                    onClick={(e) => { e.stopPropagation(); toggleWishlist(product); }}
                    aria-label="Toggle wishlist"
                >
                    <FiHeart />
                </button>
            </div>

            {/* Info */}
            <div className="product-card__info">
                <Link to={`/products/${product.slug}`} className="product-card__name" onClick={e => e.stopPropagation()}>
                    {product.name}
                </Link>

                {product.description && (
                    <p className="product-card__desc">
                        {product.description.length > 80
                            ? product.description.substring(0, 80) + '…'
                            : product.description}
                    </p>
                )}

                {/* Rating */}
                <div className="product-card__rating">
                    {[1, 2, 3, 4, 5].map(i => (
                        <FiStar
                            key={i}
                            className={i <= Math.round(avgRating) ? 'star-icon' : 'star-icon star-empty'}
                        />
                    ))}
                    {avgRating > 0 ? (
                        <>
                            <span style={{ marginLeft: 4 }}>{avgRating.toFixed(1)}</span>
                            <span className="rating-count">({numReviews})</span>
                        </>
                    ) : (
                        <span className="rating-count">No reviews yet</span>
                    )}
                </div>

                {/* Price */}
                <div className="price-display">
                    <span className="price-current">
                        ₹{(product.discountPrice || product.price).toLocaleString('en-IN')}
                    </span>
                    {product.discountPrice && (
                        <span className="price-original">₹{product.price.toLocaleString('en-IN')}</span>
                    )}
                </div>

                {/* Add to Cart */}
                <button
                    className="btn btn-primary product-card__cart-btn"
                    onClick={(e) => { e.stopPropagation(); addToCart(product); }}
                    disabled={product.stock === 0}
                >
                    <FiShoppingCart />
                    {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                </button>
            </div>
        </motion.div>
    );
};

export default ProductCard;
