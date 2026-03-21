import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiTrash2, FiMinus, FiPlus, FiShoppingBag, FiPhoneCall, FiX, FiUser } from 'react-icons/fi';
import { Helmet } from 'react-helmet-async';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import toast from 'react-hot-toast';

const AMT_CONTACT = '9822843015';

const Cart = () => {
    const { cart, updateQuantity, removeFromCart, clearCart, cartTotal } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [bookingLoading, setBookingLoading] = useState(false);
    const [form, setForm] = useState({
        fullName: user?.name || '',
        phone: user?.phone || '',
        city: '',
        state: '',
    });

    const total = cartTotal;

    const handleBookNow = () => {
        if (!user) {
            navigate('/login?redirect=/cart');
            return;
        }
        setForm({ fullName: user?.name || '', phone: user?.phone || '', city: '', state: '' });
        setShowBookingModal(true);
    };

    const handleConfirmBooking = async () => {
        if (!form.fullName.trim() || !form.phone.trim()) {
            toast.error('Please enter your name and phone number');
            return;
        }
        if (!/^\d{10}$/.test(form.phone.replace(/\s/g, ''))) {
            toast.error('Please enter a valid 10-digit phone number');
            return;
        }
        try {
            setBookingLoading(true);
            const res = await API.post('/orders', {
                items: cart.map(i => ({
                    product: i.product._id,
                    name: i.product.name,
                    image: i.product.images?.[0]?.url || '',
                    quantity: i.quantity,
                    price: i.product.discountPrice || i.product.price,
                })),
                shippingAddress: {
                    fullName: form.fullName,
                    phone: form.phone,
                    street: '',
                    city: form.city,
                    state: form.state,
                    pincode: '',
                },
            });
            setShowBookingModal(false);
            toast.success('Booking confirmed! 🎉');
            navigate(`/order-confirmation/${res.data.order._id}`);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Booking failed. Please try again.');
        } finally {
            setBookingLoading(false);
        }
    };

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
                                        style={{ width: 80, height: 80, objectFit: 'contain', borderRadius: 'var(--radius-md)' }}
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
                                <span className="text-muted">Subtotal ({cart.length} item{cart.length !== 1 ? 's' : ''})</span>
                                <span>₹{total.toLocaleString('en-IN')}</span>
                            </div>
                            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 'var(--space-sm)' }} className="flex-between">
                                <span style={{ fontWeight: 700 }}>Total</span>
                                <span style={{ fontWeight: 700, fontSize: '1.2rem' }}>₹{total.toLocaleString('en-IN')}</span>
                            </div>
                        </div>

                        {/* Booking info banner */}
                        <div style={{
                            background: 'linear-gradient(135deg, rgba(82,183,136,0.08), rgba(201,168,76,0.08))',
                            border: '1px solid rgba(82,183,136,0.2)',
                            borderRadius: 'var(--radius-md)',
                            padding: 'var(--space-md)',
                            marginBottom: 'var(--space-lg)',
                            fontSize: '0.82rem',
                            color: 'var(--text-secondary)',
                            lineHeight: 1.55,
                        }}>
                            📞 <strong>No payment required to book.</strong> After booking, call or WhatsApp <strong style={{ color: 'var(--primary-light)' }}>{AMT_CONTACT}</strong> to complete your payment.
                        </div>

                        <button
                            className="btn btn-primary"
                            style={{ width: '100%' }}
                            onClick={handleBookNow}
                        >
                            <FiPhoneCall /> Book Now
                        </button>
                        <Link to="/products" className="btn btn-glass" style={{ width: '100%', marginTop: 'var(--space-sm)', justifyContent: 'center' }}>
                            Continue Shopping
                        </Link>
                    </div>
                </div>
            </div>

            {/* Booking Modal */}
            <AnimatePresence>
                {showBookingModal && (
                    <motion.div
                        className="modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => !bookingLoading && setShowBookingModal(false)}
                    >
                        <motion.div
                            className="glass-card"
                            style={{ padding: 'var(--space-xl)', width: 420, maxWidth: '95vw', position: 'relative' }}
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            onClick={e => e.stopPropagation()}
                        >
                            <button
                                onClick={() => setShowBookingModal(false)}
                                className="icon-btn"
                                style={{ position: 'absolute', top: 16, right: 16 }}
                                disabled={bookingLoading}
                            ><FiX /></button>

                            <h3 style={{ marginBottom: 4 }}>Confirm Booking</h3>
                            <p className="text-muted" style={{ fontSize: '0.85rem', marginBottom: 'var(--space-lg)' }}>
                                No payment now — we'll call you to confirm and collect payment.
                            </p>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)', marginBottom: 'var(--space-lg)' }}>
                                <div className="form-group">
                                    <label className="form-label">Full Name *</label>
                                    <input
                                        className="form-input"
                                        placeholder="Your full name"
                                        value={form.fullName}
                                        onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Phone Number * (for payment call)</label>
                                    <input
                                        className="form-input"
                                        placeholder="10-digit mobile number"
                                        value={form.phone}
                                        onChange={e => setForm(f => ({ ...f, phone: e.target.value.replace(/\D/g, '').slice(0, 10) }))}
                                        type="tel"
                                    />
                                </div>
                                <div className="grid-2" style={{ gap: 'var(--space-sm)' }}>
                                    <div className="form-group">
                                        <label className="form-label">City</label>
                                        <input
                                            className="form-input"
                                            placeholder="City (optional)"
                                            value={form.city}
                                            onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">State</label>
                                        <input
                                            className="form-input"
                                            placeholder="State (optional)"
                                            value={form.state}
                                            onChange={e => setForm(f => ({ ...f, state: e.target.value }))}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Items summary */}
                            <div className="glass-card" style={{ padding: 'var(--space-md)', marginBottom: 'var(--space-lg)', background: 'var(--surface)' }}>
                                {cart.map(item => (
                                    <div key={item.product._id} className="flex-between" style={{ fontSize: '0.85rem', padding: '4px 0' }}>
                                        <span className="text-muted">{item.product.name} × {item.quantity}</span>
                                        <span>₹{((item.product.discountPrice || item.product.price) * item.quantity).toLocaleString('en-IN')}</span>
                                    </div>
                                ))}
                                <div style={{ borderTop: '1px solid var(--border)', paddingTop: 8, marginTop: 8 }} className="flex-between">
                                    <strong>Total</strong>
                                    <strong style={{ color: 'var(--primary-light)' }}>₹{total.toLocaleString('en-IN')}</strong>
                                </div>
                            </div>

                            <div style={{
                                background: 'rgba(201,168,76,0.08)',
                                border: '1px solid rgba(201,168,76,0.25)',
                                borderRadius: 'var(--radius-md)',
                                padding: 'var(--space-md)',
                                fontSize: '0.82rem',
                                color: 'var(--text-secondary)',
                                marginBottom: 'var(--space-lg)',
                            }}>
                                📞 After booking, call or WhatsApp <strong style={{ color: 'var(--gold)' }}>{AMT_CONTACT}</strong> to make payment.
                            </div>

                            <button
                                className="btn btn-primary"
                                style={{ width: '100%' }}
                                onClick={handleConfirmBooking}
                                disabled={bookingLoading}
                            >
                                {bookingLoading ? 'Placing Booking...' : '✓ Confirm Booking (Free)'}
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default Cart;
