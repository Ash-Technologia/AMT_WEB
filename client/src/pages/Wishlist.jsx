import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { FiHeart, FiShoppingCart } from 'react-icons/fi';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/products/ProductCard';

const Wishlist = () => {
    const { wishlist } = useWishlist();
    const { addToCart } = useCart();

    return (
        <>
            <Helmet><title>Wishlist — AMT</title></Helmet>
            <div className="container" style={{ paddingTop: 'var(--space-2xl)', paddingBottom: 'var(--space-3xl)' }}>
                <h1 style={{ marginBottom: 'var(--space-xl)' }}>My Wishlist</h1>
                {wishlist.length === 0 ? (
                    <div className="flex-center flex-col" style={{ minHeight: 300, gap: 'var(--space-md)' }}>
                        <FiHeart size={48} style={{ color: 'var(--text-muted)' }} />
                        <h3>Your wishlist is empty</h3>
                        <Link to="/products" className="btn btn-primary">Explore Products</Link>
                    </div>
                ) : (
                    <div className="grid-3">
                        {wishlist.map(product => <ProductCard key={product._id} product={product} />)}
                    </div>
                )}
            </div>
        </>
    );
};

export default Wishlist;
