import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPackage, FiShoppingBag, FiTruck, FiCheck, FiX, FiChevronDown, FiChevronUp, FiArrowRight } from 'react-icons/fi';
import API from '../services/api';
import { useSocket } from '../context/SocketContext';
import { MandalaBackdrop, SilkFlow, LotusBloom } from '../components/ui/Decorations';

const STATUS_STEPS = ['Placed', 'Confirmed', 'Shipped', 'Out for Delivery', 'Delivered'];
const statusColor = {
    Placed: '#f59e0b', Confirmed: '#3b82f6', Shipped: '#8b5cf6',
    'Out for Delivery': '#10b981', Delivered: '#22c55e', Cancelled: '#ef4444',
};
const statusIcon = {
    Placed: '🛒', Confirmed: '✅', Shipped: '📦', 'Out for Delivery': '🚚', Delivered: '🎉', Cancelled: '❌',
};


const OrderCard = ({ order }) => {
    const [expanded, setExpanded] = useState(false);
    const statusIdx = STATUS_STEPS.indexOf(order.orderStatus || 'Placed');

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card"
            style={{ overflow: 'hidden' }}
        >
            {/* Header row */}
            <div
                onClick={() => setExpanded(e => !e)}
                style={{ padding: 'var(--space-lg)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 'var(--space-md)', flexWrap: 'wrap' }}
            >
                {/* Thumbnail strip */}
                <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                    {order.items?.slice(0, 3).map((item, i) => (
                        <div key={i} style={{ width: 48, height: 48, borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border)', background: 'var(--surface)', flexShrink: 0 }}>
                            {item.image
                                ? <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FiPackage style={{ color: 'var(--text-muted)', fontSize: 18 }} /></div>
                            }
                        </div>
                    ))}
                    {order.items?.length > 3 && (
                        <div style={{ width: 48, height: 48, borderRadius: 8, background: 'var(--surface)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', flexShrink: 0 }}>
                            +{order.items.length - 3}
                        </div>
                    )}
                </div>

                {/* Order meta */}
                <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        #{order._id?.slice(-10).toUpperCase()}
                    </p>
                    <p style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                        {order.items?.length} item{order.items?.length !== 1 ? 's' : ''}
                        &nbsp;·&nbsp;
                        {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                </div>

                {/* Status & amount */}
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <motion.span
                        key={order.orderStatus}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        style={{ color: statusColor[order.orderStatus] || 'var(--text-muted)', fontWeight: 600, fontSize: '0.875rem', display: 'block' }}
                    >
                        {statusIcon[order.orderStatus] || '📋'} {order.orderStatus || 'Placed'}
                    </motion.span>
                    <p style={{ fontWeight: 700, fontSize: '1.05rem' }}>₹{order.totalAmount?.toLocaleString('en-IN')}</p>
                </div>

                <div style={{ color: 'var(--text-muted)', flexShrink: 0 }}>
                    {expanded ? <FiChevronUp /> : <FiChevronDown />}
                </div>
            </div>

            {/* Expanded detail */}
            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        style={{ overflow: 'hidden' }}
                    >
                        <div style={{ padding: '0 var(--space-lg) var(--space-lg)', borderTop: '1px solid var(--border)', paddingTop: 'var(--space-md)' }}>
                            {/* Status Tracker */}
                            {order.orderStatus !== 'Cancelled' && (
                                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 'var(--space-md)', overflowX: 'auto', paddingBottom: 4, gap: 0 }}>
                                    {STATUS_STEPS.map((step, i) => (
                                        <div key={step} style={{ display: 'flex', alignItems: 'center', flex: i < STATUS_STEPS.length - 1 ? 1 : 'none' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                                                <div style={{
                                                    width: 24, height: 24, borderRadius: '50%',
                                                    background: i <= statusIdx ? 'var(--primary)' : 'var(--border)',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    color: '#fff', fontSize: '0.7rem', fontWeight: 700,
                                                    boxShadow: i === statusIdx ? '0 0 0 3px rgba(82,183,136,0.2)' : 'none',
                                                }}>
                                                    {i < statusIdx ? <FiCheck /> : i + 1}
                                                </div>
                                                <span style={{ fontSize: '0.6rem', color: i <= statusIdx ? 'var(--primary-light)' : 'var(--text-muted)', whiteSpace: 'nowrap' }}>{step}</span>
                                            </div>
                                            {i < STATUS_STEPS.length - 1 && (
                                                <div style={{ flex: 1, height: 2, background: i < statusIdx ? 'var(--primary)' : 'var(--border)', margin: '0 3px', marginBottom: 16 }} />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Tracking */}
                            {order.trackingInfo?.trackingId && (
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 'var(--space-sm)', padding: '8px 12px', background: 'var(--surface)', borderRadius: 'var(--radius-sm)' }}>
                                    <FiTruck style={{ verticalAlign: 'middle', marginRight: 6 }} />
                                    {order.trackingInfo.carrier} ·{' '}
                                    {order.trackingInfo.trackingUrl
                                        ? <a href={order.trackingInfo.trackingUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--primary-light)' }}>Track: {order.trackingInfo.trackingId}</a>
                                        : order.trackingInfo.trackingId}
                                </div>
                            )}

                            {/* Items list */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                                {order.items?.map((item, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', background: 'var(--surface)', padding: '10px 12px', borderRadius: 'var(--radius-md)' }}>
                                        <div style={{ width: 44, height: 44, borderRadius: 8, overflow: 'hidden', flexShrink: 0, background: 'var(--bg-tertiary)', border: '1px solid var(--border)' }}>
                                            {item.image
                                                ? <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                                : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FiPackage style={{ color: 'var(--text-muted)' }} /></div>
                                            }
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <p style={{ fontWeight: 600, fontSize: '0.875rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name || 'Product'}</p>
                                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Qty: {item.quantity}</p>
                                        </div>
                                        <p style={{ fontWeight: 700, color: 'var(--primary-light)', flexShrink: 0 }}>₹{((item.price || 0) * (item.quantity || 1)).toLocaleString('en-IN')}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Totals */}
                            <div style={{ marginTop: 'var(--space-md)', padding: 'var(--space-sm) var(--space-md)', background: 'var(--surface)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--text-muted)' }}>Order Total</span>
                                <span style={{ fontWeight: 700, color: 'var(--primary-light)' }}>₹{order.totalAmount?.toLocaleString('en-IN')}</span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

const OrderHistory = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const { socket } = useSocket();

    useEffect(() => {
        API.get('/orders/my')
            .then(res => setOrders(res.data.orders || []))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        if (!socket) return;
        const handler = ({ orderId, orderStatus, trackingInfo }) => {
            setOrders(prev => prev.map(o =>
                o._id === orderId ? { ...o, orderStatus, trackingInfo: trackingInfo || o.trackingInfo } : o
            ));
        };
        socket.on('order:status', handler);
        return () => socket.off('order:status', handler);
    }, [socket]);

    if (loading) return <div className="page-loader"><div className="spinner" /></div>;

    return (
        <>
            <Helmet><title>My Orders — AMT</title></Helmet>
            <div className="container" style={{ paddingTop: 'var(--space-2xl)', paddingBottom: 'var(--space-3xl)', position: 'relative', overflow: 'hidden' }}>
                {/* Luxury Background Elements */}
                <MandalaBackdrop style={{ position: 'absolute', top: '-10%', right: '-10%', width: '500px', color: 'var(--primary-light)', opacity: 0.08 }} />
                <SilkFlow style={{ position: 'absolute', bottom: '10%', left: '-5%', width: '110%', color: 'var(--gold)', opacity: 0.1 }} />
                <LotusBloom style={{ position: 'absolute', top: '15%', left: '5%', width: '140px', color: 'var(--primary-light)', opacity: 0.1 }} />
                <LotusBloom style={{ position: 'absolute', bottom: '20%', right: '10%', width: '100px', color: 'var(--gold)', opacity: 0.1 }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-xl)', flexWrap: 'wrap', gap: 'var(--space-md)', position: 'relative', zIndex: 1 }}>
                    <h1 style={{ margin: 0 }}>My Orders</h1>
                    {orders.length > 0 && (
                        <span style={{ background: 'var(--surface)', padding: '6px 14px', borderRadius: 999, fontSize: '0.875rem', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
                            {orders.length} order{orders.length !== 1 ? 's' : ''}
                        </span>
                    )}
                </div>

                {orders.length === 0 ? (
                    <div className="flex-center flex-col" style={{ minHeight: 300, gap: 'var(--space-md)' }}>
                        <FiShoppingBag style={{ fontSize: '3rem', color: 'var(--text-muted)' }} />
                        <h3>No orders yet</h3>
                        <p className="text-muted">Start shopping to see your orders here!</p>
                        <Link to="/products" className="btn btn-primary">Browse Products</Link>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                        <AnimatePresence>
                            {orders.map(order => <OrderCard key={order._id} order={order} />)}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </>
    );
};

export default OrderHistory;
