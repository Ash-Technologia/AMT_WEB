import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiTrash2, FiMinus, FiPlus, FiShoppingBag, FiArrowRight } from 'react-icons/fi';
import { Helmet } from 'react-helmet-async';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const Cart = () => {
    const { cart, updateQuantity, removeFromCart, clearCart, cartTotal } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();
    const shipping = cartTotal >= 999 ? 0 : 60;
    const total = cartTotal + shipping;

    if (cart.length === 0) {
        return (
            <div className="container flex-center flex-col" style={{ minHeight: '70vh', gap: 'var(--space-lg)' }}>
                <Helmet><title>Cart — AMT</title></Helmet>
                <span style={{ fontSize: '4rem' }}>🛒</span>
                <h2>Your cart is empty</h2>
                <p className="text-muted">Add some therapy products to get started</p>
                <Link to="/products" className="btn btn-primary btn-lg">
                    <FiShoppingBag /> Shop Now
                </Link>
            </div>
        );
    }

    return (
        <>
            <Helmet><title>Cart — AMT Advanced Medical Therapeutics</title></Helmet>
            <div className="container" style={{ paddingTop: 'var(--space-2xl)', paddingBottom: 'var(--space-3xl)' }}>
                <h1 style={{ marginBottom: 'var(--space-xl)' }}>Shopping Cart</h1>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 'var(--space-xl)', alignItems: 'start' }}>
                    {/* Cart Items */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                        {cart.map((item, i) => (
                            <motion.div
                                key={item.product._id}
                                className="glass-card"
                                style={{ padding: 'var(--space-md)', display: 'flex', gap: 'var(--space-md)', alignItems: 'center' }}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05 }}
                                exit={{ opacity: 0, x: -20 }}
                            >
                                <Link to={`/products/${item.product.slug}`}>
                                    <img
                                        src={item.product.images?.[0]?.url}
                                        alt={item.product.name}
                                        style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 'var(--radius-md)' }}
                                    />
                                </Link>
                                <div style={{ flex: 1 }}>
                                    <Link to={`/products/${item.product.slug}`} style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                                        {item.product.name}
                                    </Link>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: 4 }}>
                                        ₹{(item.product.discountPrice || item.product.price).toLocaleString('en-IN')} each
                                    </p>
                                </div>
                                <div className="flex gap-sm" style={{ alignItems: 'center' }}>
                                    <button
                                        onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                                        className="icon-btn"
                                        style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', width: 32, height: 32 }}
                                    ><FiMinus size={14} /></button>
                                    <span style={{ minWidth: 28, textAlign: 'center', fontWeight: 600 }}>{item.quantity}</span>
                                    <button
                                        onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                                        className="icon-btn"
                                        style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', width: 32, height: 32 }}
                                    ><FiPlus size={14} /></button>
                                </div>
                                <p style={{ fontWeight: 700, minWidth: 80, textAlign: 'right' }}>
                                    ₹{((item.product.discountPrice || item.product.price) * item.quantity).toLocaleString('en-IN')}
                                </p>
                                <button
                                    onClick={() => removeFromCart(item.product._id)}
                                    className="icon-btn"
                                    style={{ color: 'var(--error)' }}
                                ><FiTrash2 /></button>
                            </motion.div>
                        ))}
                        <button onClick={clearCart} className="btn btn-glass btn-sm" style={{ alignSelf: 'flex-start' }}>
                            <FiTrash2 /> Clear Cart
                        </button>
                    </div>

                    {/* Order Summary */}
                    <div className="glass-card" style={{ padding: 'var(--space-xl)', position: 'sticky', top: 'calc(var(--header-height) + 20px)' }}>
                        <h3 style={{ marginBottom: 'var(--space-lg)' }}>Order Summary</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)', marginBottom: 'var(--space-lg)' }}>
                            <div className="flex-between">
                                <span className="text-muted">Subtotal</span>
                                <span>₹{cartTotal.toLocaleString('en-IN')}</span>
                            </div>
                            <div className="flex-between">
                                <span className="text-muted">Shipping</span>
                                <span style={{ color: shipping === 0 ? 'var(--success)' : undefined }}>
                                    {shipping === 0 ? 'FREE' : `₹${shipping}`}
                                </span>
                            </div>
                            {shipping > 0 && (
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                    Add ₹{(999 - cartTotal).toLocaleString('en-IN')} more for free shipping
                                </p>
                            )}
                            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 'var(--space-sm)' }} className="flex-between">
                                <span style={{ fontWeight: 700 }}>Total</span>
                                <span style={{ fontWeight: 700, fontSize: '1.2rem' }}>₹{total.toLocaleString('en-IN')}</span>
                            </div>
                        </div>
                        <button
                            className="btn btn-primary"
                            style={{ width: '100%' }}
                            onClick={() => user ? navigate('/checkout') : navigate('/login?redirect=/checkout')}
                        >
                            {user ? 'Proceed to Checkout' : 'Login to Checkout'} <FiArrowRight />
                        </button>
                        <Link to="/products" className="btn btn-glass" style={{ width: '100%', marginTop: 'var(--space-sm)', justifyContent: 'center' }}>
                            Continue Shopping
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Cart;
