import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import API from '../services/api';

const STATUS_STEPS = ['Placed', 'Confirmed', 'Shipped', 'Out for Delivery', 'Delivered'];
const STATUS_COLORS = {
    Placed: 'var(--warning)', Confirmed: 'var(--info)', Shipped: 'var(--primary-light)',
    'Out for Delivery': 'var(--primary)', Delivered: 'var(--success)', Cancelled: 'var(--error)',
};

const OrderTracking = () => {
    const [orderId, setOrderId] = useState('');
    const [email, setEmail] = useState('');
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleTrack = async (e) => {
        e.preventDefault();
        setError(''); setOrder(null); setLoading(true);
        try {
            const res = await API.get(`/orders/track/${orderId.trim()}`, { params: { email: email.trim() } });
            setOrder(res.data.order);
        } catch (err) {
            setError(err.response?.data?.message || 'Order not found. Please check your Order ID and email.');
        } finally {
            setLoading(false);
        }
    };

    const statusIdx = order ? STATUS_STEPS.indexOf(order.orderStatus) : -1;

    return (
        <>
            <Helmet>
                <title>Track Your Order — AMT</title>
                <meta name="description" content="Track your AMT order status in real time using your order ID and email." />
            </Helmet>
            <div className="container" style={{ paddingTop: 'var(--space-3xl)', paddingBottom: 'var(--space-3xl)', maxWidth: 640 }}>
                <div style={{ textAlign: 'center', marginBottom: 'var(--space-2xl)' }}>
                    <span style={{ fontSize: '3rem' }}>📦</span>
                    <h1 style={{ marginTop: 'var(--space-sm)' }}>Track Your Order</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Enter your order ID and email to get real-time status.</p>
                </div>

                <form onSubmit={handleTrack} className="glass-card" style={{ padding: 'var(--space-xl)', display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                    <div className="form-group">
                        <label className="form-label">Order ID</label>
                        <input
                            id="order-id-input"
                            className="form-input"
                            placeholder="e.g. 64a1f2e3b5c6d7e8f9"
                            value={orderId}
                            onChange={e => setOrderId(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <input
                            id="tracking-email-input"
                            className="form-input"
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    {error && <p style={{ color: 'var(--error)', fontSize: '0.875rem' }}>{error}</p>}
                    <button className="btn btn-primary" type="submit" disabled={loading}>
                        {loading ? 'Tracking...' : '🔍 Track Order'}
                    </button>
                </form>

                {order && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-card"
                        style={{ padding: 'var(--space-xl)', marginTop: 'var(--space-lg)' }}
                    >
                        <div className="flex-between" style={{ marginBottom: 'var(--space-md)', flexWrap: 'wrap', gap: 'var(--space-sm)' }}>
                            <div>
                                <p style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: 'var(--text-muted)' }}>#{order._id.slice(-12)}</p>
                                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                                    Placed: {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                                </p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <span style={{ color: STATUS_COLORS[order.orderStatus] || 'var(--text-muted)', fontWeight: 700, fontSize: '1rem' }}>
                                    ● {order.orderStatus || 'Placed'}
                                </span>
                                <p style={{ fontWeight: 700 }}>₹{order.totalAmount?.toLocaleString('en-IN')}</p>
                            </div>
                        </div>

                        {/* Progress Stepper */}
                        {order.orderStatus !== 'Cancelled' && (
                            <div style={{ marginBottom: 'var(--space-lg)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 4, overflowX: 'auto', paddingBottom: 4 }}>
                                    {STATUS_STEPS.map((step, i) => (
                                        <div key={step} style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                                            <motion.div
                                                animate={{ scale: i === statusIdx ? [1, 1.2, 1] : 1 }}
                                                transition={{ repeat: i === statusIdx ? Infinity : 0, duration: 1.6 }}
                                                style={{
                                                    width: 14, height: 14, borderRadius: '50%',
                                                    background: i <= statusIdx ? 'var(--primary)' : 'var(--border)',
                                                    border: i === statusIdx ? '3px solid var(--primary-light)' : 'none',
                                                }}
                                            />
                                            <span style={{ fontSize: '0.7rem', color: i <= statusIdx ? 'var(--primary-light)' : 'var(--text-muted)', whiteSpace: 'nowrap' }}>{step}</span>
                                            {i < STATUS_STEPS.length - 1 && (
                                                <div style={{ width: 28, height: 2, background: i < statusIdx ? 'var(--primary)' : 'var(--border)', transition: 'background 0.4s' }} />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Tracking Info */}
                        {order.trackingInfo?.trackingId && (
                            <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-md)', padding: 'var(--space-md)', marginBottom: 'var(--space-md)', fontSize: '0.875rem' }}>
                                <p><strong>🚚 Carrier:</strong> {order.trackingInfo.carrier}</p>
                                <p><strong>AWB:</strong> {
                                    order.trackingInfo.trackingUrl
                                        ? <a href={order.trackingInfo.trackingUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--primary-light)' }}>{order.trackingInfo.trackingId}</a>
                                        : order.trackingInfo.trackingId
                                }</p>
                            </div>
                        )}

                        {/* Items */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {order.items?.map((item, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--surface)', padding: '8px 12px', borderRadius: 'var(--radius-md)', fontSize: '0.875rem' }}>
                                    <span>{item.name}</span>
                                    <span style={{ color: 'var(--text-muted)' }}>×{item.quantity} · ₹{item.price?.toLocaleString('en-IN')}</span>
                                </div>
                            ))}
                        </div>

                        {/* Shipping Address */}
                        {order.shippingAddress && (
                            <div style={{ marginTop: 'var(--space-md)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                📍 {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
                            </div>
                        )}
                    </motion.div>
                )}
            </div>
        </>
    );
};

export default OrderTracking;
