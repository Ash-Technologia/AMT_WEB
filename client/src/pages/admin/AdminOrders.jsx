import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import API from '../../services/api';
import toast from 'react-hot-toast';
import { useSocket } from '../../context/SocketContext';

const STATUS_OPTIONS = ['Placed', 'Confirmed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'];
const STATUS_COLORS = {
    Placed: 'var(--warning)', Confirmed: 'var(--info)', Shipped: 'var(--primary-light)',
    'Out for Delivery': 'var(--primary)', Delivered: 'var(--success)', Cancelled: 'var(--error)',
};

const AdminOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [trackingModal, setTrackingModal] = useState(null); // { orderId, carrier, trackingId, trackingUrl }
    const { socket } = useSocket();

    useEffect(() => {
        API.get('/orders/admin/all')
            .then(res => setOrders(res.data.orders || []))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    // ── Real-time: new order notification ────────────────────────────────────
    useEffect(() => {
        if (!socket) return;
        const handler = ({ orderId, totalAmount, userName }) => {
            toast.success(
                `🛒 New order from ${userName}!\n₹${totalAmount?.toLocaleString('en-IN')}`,
                { duration: 6000, icon: '🛍️' }
            );
            // Refresh order list
            API.get('/orders/admin/all').then(res => setOrders(res.data.orders || [])).catch(() => { });
        };
        socket.on('order:new', handler);
        return () => socket.off('order:new', handler);
    }, [socket]);

    const updateStatus = async (id, orderStatus) => {
        try {
            await API.put(`/orders/${id}/status`, { orderStatus });
            setOrders(prev => prev.map(o => o._id === id ? { ...o, orderStatus } : o));
            toast.success('Order status updated');
        } catch {
            toast.error('Failed to update status');
        }
    };

    const saveTracking = async () => {
        if (!trackingModal) return;
        const { orderId, carrier, trackingId, trackingUrl } = trackingModal;
        try {
            await API.put(`/orders/${orderId}/status`, {
                trackingInfo: { carrier, trackingId, trackingUrl },
            });
            setOrders(prev => prev.map(o => o._id === orderId
                ? { ...o, trackingInfo: { carrier, trackingId, trackingUrl } } : o));
            toast.success('Tracking info saved');
            setTrackingModal(null);
        } catch {
            toast.error('Failed to save tracking info');
        }
    };

    return (
        <>
            <Helmet><title>Orders — AMT Admin</title></Helmet>
            <div>
                <div className="admin-page-header">
                    <h1 className="admin-page-title">Orders</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                        {orders.length} total · <span style={{ color: 'var(--primary-light)' }}>⚡ Live updates enabled</span>
                    </p>
                </div>
                <div className="glass-card admin-table-wrapper">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Customer</th>
                                <th>Items</th>
                                <th>Total</th>
                                <th>Status</th>
                                <th>Date</th>
                                <th>Update</th>
                                <th>Tracking</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={8} style={{ textAlign: 'center', padding: 'var(--space-xl)' }}>Loading...</td></tr>
                            ) : orders.map(order => (
                                <tr key={order._id}>
                                    <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>#{order._id.slice(-8)}</td>
                                    <td>
                                        <div style={{ fontWeight: 500 }}>{order.user?.name || 'Guest'}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{order.user?.email}</div>
                                    </td>
                                    <td>{order.items?.length || 0} item(s)</td>
                                    <td style={{ fontWeight: 600 }}>₹{order.totalAmount?.toLocaleString('en-IN')}</td>
                                    <td>
                                        <span style={{ color: STATUS_COLORS[order.orderStatus] || 'var(--text-muted)', fontWeight: 600 }}>
                                            ● {order.orderStatus || 'Placed'}
                                        </span>
                                    </td>
                                    <td style={{ fontSize: '0.8rem' }}>{new Date(order.createdAt).toLocaleDateString('en-IN')}</td>
                                    <td>
                                        <select
                                            value={order.orderStatus || 'Placed'}
                                            onChange={e => updateStatus(order._id, e.target.value)}
                                            className="form-input"
                                            style={{ padding: '6px 12px', fontSize: '0.85rem', width: 'auto', background: 'var(--bg-tertiary)', border: '1px solid var(--border)' }}
                                        >
                                            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </td>
                                    <td>
                                        <button
                                            className="btn btn-glass btn-sm"
                                            onClick={() => setTrackingModal({
                                                orderId: order._id,
                                                carrier: order.trackingInfo?.carrier || '',
                                                trackingId: order.trackingInfo?.trackingId || '',
                                                trackingUrl: order.trackingInfo?.trackingUrl || '',
                                            })}
                                        >
                                            🚚 Track
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Tracking Info Modal */}
                {trackingModal && (
                    <div className="modal-overlay" onClick={() => setTrackingModal(null)}>
                        <div className="glass-card" style={{ padding: 'var(--space-xl)', width: 420, maxWidth: '95vw' }} onClick={e => e.stopPropagation()}>
                            <h3 style={{ marginBottom: 'var(--space-lg)' }}>🚚 Set Tracking Info</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                                <input className="form-input" placeholder="Carrier (e.g. DTDC, Delhivery)" value={trackingModal.carrier}
                                    onChange={e => setTrackingModal(p => ({ ...p, carrier: e.target.value }))} />
                                <input className="form-input" placeholder="Tracking ID / AWB Number" value={trackingModal.trackingId}
                                    onChange={e => setTrackingModal(p => ({ ...p, trackingId: e.target.value }))} />
                                <input className="form-input" placeholder="Tracking URL (optional)" value={trackingModal.trackingUrl}
                                    onChange={e => setTrackingModal(p => ({ ...p, trackingUrl: e.target.value }))} />
                                <div className="flex gap-sm">
                                    <button className="btn btn-primary" style={{ flex: 1 }} onClick={saveTracking}>Save</button>
                                    <button className="btn btn-glass" onClick={() => setTrackingModal(null)}>Cancel</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default AdminOrders;
