import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { FiPackage, FiShoppingBag, FiHome, FiMapPin, FiPhoneCall, FiCheck } from 'react-icons/fi';
import API from '../services/api';

const AMT_CONTACT = '9822843015';

const statusSteps = ['Placed', 'Confirmed', 'Shipped', 'Out for Delivery', 'Delivered'];
const statusColors = {
    Placed: '#f59e0b', Confirmed: '#3b82f6', Shipped: '#8b5cf6',
    'Out for Delivery': '#10b981', Delivered: '#22c55e', Cancelled: '#ef4444',
};

const AyurvedaLeaf = ({ style }) => (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ opacity: 0.05, ...style }}>
        <path d="M60 10 C20 10 5 60 30 90 C50 110 90 100 100 70 C115 40 100 10 60 10Z" fill="currentColor" />
        <path d="M60 10 L60 90" stroke="currentColor" strokeWidth="2" />
        <path d="M60 30 Q75 45 90 40" stroke="currentColor" strokeWidth="1.5" />
        <path d="M60 50 Q75 65 85 55" stroke="currentColor" strokeWidth="1.5" />
        <path d="M60 40 Q45 55 30 50" stroke="currentColor" strokeWidth="1.5" />
        <path d="M60 60 Q45 75 35 65" stroke="currentColor" strokeWidth="1.5" />
    </svg>
);

const OrderConfirmation = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        API.get(`/orders/${id}`)
            .then(res => setOrder(res.data.order))
            .catch(() => navigate('/orders'))
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) return <div className="page-loader"><div className="spinner" /></div>;
    if (!order) return null;

    const statusIdx = statusSteps.indexOf(order.orderStatus || 'Placed');

    return (
        <>
            <Helmet><title>Booking Confirmed — AMT</title></Helmet>
            <div className="container" style={{ paddingTop: 'var(--space-2xl)', paddingBottom: 'var(--space-3xl)', maxWidth: 720, position: 'relative', overflow: 'hidden' }}>
                {/* Decorative Elements */}
                <AyurvedaLeaf style={{ position: 'absolute', top: '5%', left: '-20px', color: 'var(--primary-light)', width: 140, height: 140, transform: 'rotate(-30deg)' }} />
                <AyurvedaLeaf style={{ position: 'absolute', bottom: '10%', right: '-20px', color: 'var(--gold)', width: 180, height: 180, transform: 'rotate(150deg)' }} />

                {/* ── Success Header ── */}
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 200 }}
                    style={{ textAlign: 'center', marginBottom: 'var(--space-2xl)' }}
                >
                    <motion.div
                        animate={{ rotate: [0, -10, 10, -5, 5, 0] }}
                        transition={{ delay: 0.3, duration: 0.6 }}
                        style={{ fontSize: '4rem', display: 'inline-block', marginBottom: 'var(--space-md)' }}
                    >
                        🎉
                    </motion.div>
                    <h1 className="gradient-text" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', marginBottom: 'var(--space-sm)' }}>
                        Booking Confirmed!
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', maxWidth: 480, margin: '0 auto' }}>
                        Your order has been placed successfully — no payment required now. We'll reach out to confirm.
                    </p>
                </motion.div>

                {/* ── Payment Call-to-action Banner ── */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.15 }}
                    style={{
                        background: 'linear-gradient(135deg, rgba(201,168,76,0.12), rgba(82,183,136,0.08))',
                        border: '1px solid rgba(201,168,76,0.35)',
                        borderRadius: 'var(--radius-lg)',
                        padding: 'var(--space-lg)',
                        marginBottom: 'var(--space-lg)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--space-md)',
                    }}
                >
                    <div style={{ fontSize: '2.2rem', flexShrink: 0 }}>📞</div>
                    <div>
                        <h4 style={{ color: 'var(--gold)', marginBottom: 4 }}>Complete Your Payment</h4>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                            Call or WhatsApp us at{' '}
                            <a href={`tel:${AMT_CONTACT}`} style={{ color: 'var(--primary-light)', fontWeight: 700, textDecoration: 'none' }}>
                                {AMT_CONTACT}
                            </a>{' '}
                            to complete payment for your booking.
                        </p>
                        <a
                            href={`https://wa.me/91${AMT_CONTACT}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-primary"
                            style={{ marginTop: 12, display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: '0.875rem' }}
                        >
                            <FiPhoneCall /> WhatsApp {AMT_CONTACT}
                        </a>
                    </div>
                </motion.div>

                {/* ── Order Summary Card ── */}
                <motion.div
                    className="glass-card"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.25 }}
                    style={{ padding: 'var(--space-xl)', marginBottom: 'var(--space-lg)' }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-lg)', flexWrap: 'wrap', gap: 'var(--space-sm)' }}>
                        <div>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>Booking ID</p>
                            <p style={{ fontWeight: 700, fontFamily: 'monospace', fontSize: '1.05rem' }}>#{order._id?.slice(-10).toUpperCase()}</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>Date</p>
                            <p style={{ fontWeight: 600 }}>{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                        </div>
                    </div>

                    {/* Status tracker */}
                    {order.orderStatus !== 'Cancelled' && (
                        <div style={{ marginBottom: 'var(--space-lg)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 0, overflowX: 'auto', paddingBottom: 4 }}>
                                {statusSteps.map((step, i) => (
                                    <div key={step} style={{ display: 'flex', alignItems: 'center', flex: i < statusSteps.length - 1 ? '1' : 'none' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                                            <div style={{
                                                width: 28, height: 28, borderRadius: '50%',
                                                background: i <= statusIdx ? 'var(--primary)' : 'var(--border)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                color: i <= statusIdx ? '#fff' : 'var(--text-muted)',
                                                fontSize: '0.75rem', fontWeight: 700,
                                                transition: 'all 0.4s',
                                                boxShadow: i === statusIdx ? '0 0 0 4px rgba(82,183,136,0.2)' : 'none',
                                            }}>
                                                {i < statusIdx ? <FiCheck /> : i + 1}
                                            </div>
                                            <span style={{ fontSize: '0.65rem', color: i <= statusIdx ? 'var(--primary-light)' : 'var(--text-muted)', whiteSpace: 'nowrap', textAlign: 'center' }}>{step}</span>
                                        </div>
                                        {i < statusSteps.length - 1 && (
                                            <div style={{ flex: 1, height: 2, background: i < statusIdx ? 'var(--primary)' : 'var(--border)', transition: 'background 0.4s', margin: '0 4px', marginBottom: 18 }} />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Summary row */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                        <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-md)', padding: 'var(--space-md)' }}>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4 }}>Order Total</p>
                            <p style={{ fontWeight: 700, fontSize: '1.3rem', color: 'var(--primary-light)' }}>₹{(order.totalAmount || order.total)?.toLocaleString('en-IN')}</p>
                        </div>
                        <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-md)', padding: 'var(--space-md)' }}>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4 }}>Payment Status</p>
                            <p style={{ fontWeight: 600, color: order.paymentStatus === 'paid' ? 'var(--success)' : 'var(--warning)' }}>
                                {order.paymentStatus === 'paid' ? '✓ Paid' : '⏳ Pending Payment'}
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* ── Items ── */}
                {order.items?.length > 0 && (
                    <motion.div
                        className="glass-card"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.35 }}
                        style={{ padding: 'var(--space-xl)', marginBottom: 'var(--space-lg)' }}
                    >
                        <h3 style={{ marginBottom: 'var(--space-lg)', display: 'flex', alignItems: 'center', gap: 8 }}>
                            <FiPackage /> Items Booked ({order.items.length})
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                            {order.items.map((item, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', padding: 'var(--space-sm)', background: 'var(--surface)', borderRadius: 'var(--radius-md)' }}>
                                    {item.image ? (
                                        <img src={item.image} alt={item.name} style={{ width: 56, height: 56, objectFit: 'contain', borderRadius: 'var(--radius-sm)', flexShrink: 0 }} />
                                    ) : (
                                        <div style={{ width: 56, height: 56, background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                            <FiPackage style={{ color: 'var(--text-muted)' }} />
                                        </div>
                                    )}
                                    <div style={{ flex: 1 }}>
                                        <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{item.name}</p>
                                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Qty: {item.quantity}</p>
                                    </div>
                                    <p style={{ fontWeight: 700, color: 'var(--primary-light)' }}>₹{((item.price || 0) * (item.quantity || 1)).toLocaleString('en-IN')}</p>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* ── Shipping Address ── */}
                {order.shippingAddress?.fullName && (
                    <motion.div
                        className="glass-card"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.45 }}
                        style={{ padding: 'var(--space-xl)', marginBottom: 'var(--space-lg)' }}
                    >
                        <h3 style={{ marginBottom: 'var(--space-md)', display: 'flex', alignItems: 'center', gap: 8 }}>
                            <FiMapPin /> Contact Details
                        </h3>
                        <div style={{ color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                            <p style={{ fontWeight: 600 }}>{order.shippingAddress.fullName}</p>
                            {order.shippingAddress.phone && <p>📞 {order.shippingAddress.phone}</p>}
                            {order.shippingAddress.city && <p>{order.shippingAddress.city}{order.shippingAddress.state ? `, ${order.shippingAddress.state}` : ''}</p>}
                        </div>
                    </motion.div>
                )}

                {/* ── Wellness Tip ── */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 }}
                    style={{
                        background: 'linear-gradient(135deg, rgba(82, 183, 136, 0.1), rgba(201, 168, 76, 0.1))',
                        border: '1px solid rgba(82, 183, 136, 0.2)',
                        borderRadius: 'var(--radius-lg)',
                        padding: 'var(--space-lg)',
                        marginBottom: 'var(--space-xl)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--space-md)'
                    }}
                >
                    <div style={{ fontSize: '2rem' }}>🌿</div>
                    <div>
                        <h4 style={{ color: 'var(--primary-light)', marginBottom: 4 }}>Did you know?</h4>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                            Ayurveda emphasizes "Prana" or life energy. Our products are designed to harmonize this energy and restore your body's natural vitality.
                        </p>
                    </div>
                </motion.div>

                {/* ── Actions ── */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.55 }}
                    style={{ display: 'flex', gap: 'var(--space-md)', flexWrap: 'wrap' }}
                >
                    <Link to="/orders" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center', minWidth: 160 }}>
                        <FiShoppingBag /> My Bookings
                    </Link>
                    <Link to="/products" className="btn btn-glass" style={{ flex: 1, justifyContent: 'center', minWidth: 160 }}>
                        <FiHome /> Continue Shopping
                    </Link>
                </motion.div>
            </div>
        </>
    );
};

export default OrderConfirmation;
