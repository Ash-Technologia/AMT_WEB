import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { FiShoppingBag, FiPackage, FiUsers, FiDollarSign } from 'react-icons/fi';
import { AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from 'recharts';
import API from '../../services/api';
import { useSocket } from '../../context/SocketContext';
import '../../components/admin/AdminLayout.css';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const { socket } = useSocket();

    const fetchStats = () => {
        API.get('/admin/stats').then(res => setStats(res.data)).catch(console.error).finally(() => setLoading(false));
    };

    useEffect(() => { fetchStats(); }, []);

    // ── Real-time: refresh when admin gets dashboard:refresh event ────────────
    useEffect(() => {
        if (!socket) return;
        socket.on('dashboard:refresh', fetchStats);
        return () => socket.off('dashboard:refresh', fetchStats);
    }, [socket]);

    const statCards = stats ? [
        { label: 'Total Revenue', value: `₹${(stats.totalRevenue || 0).toLocaleString('en-IN')}`, icon: <FiDollarSign />, color: 'var(--gold)' },
        { label: 'Total Orders', value: stats.totalOrders || 0, icon: <FiShoppingBag />, color: 'var(--primary-light)' },
        { label: 'Total Products', value: stats.totalProducts || 0, icon: <FiPackage />, color: 'var(--info)' },
        { label: 'Total Customers', value: stats.totalCustomers || 0, icon: <FiUsers />, color: 'var(--success)' },
    ] : [];

    return (
        <>
            <Helmet><title>Admin Dashboard — AMT</title></Helmet>
            <div>
                <div className="admin-page-header">
                    <h1 className="admin-page-title">Dashboard</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                        {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                </div>

                {loading ? (
                    <div className="admin-stats-grid">
                        {[...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: 100, borderRadius: 16 }} />)}
                    </div>
                ) : (
                    <div className="admin-stats-grid">
                        {statCards.map(card => (
                            <div key={card.label} className="glass-card admin-stat-card">
                                <div className="admin-stat-icon" style={{ background: `${card.color}22`, border: `1px solid ${card.color}44`, color: card.color }}>
                                    {card.icon}
                                </div>
                                <div>
                                    <p className="admin-stat-value">{card.value}</p>
                                    <p className="admin-stat-label">{card.label}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Revenue Chart */}
                {stats?.revenueByMonth && (
                    <div className="glass-card" style={{ padding: 'var(--space-xl)', marginBottom: 'var(--space-xl)' }}>
                        <h3 style={{ marginBottom: 'var(--space-lg)' }}>Monthly Revenue</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={stats.revenueByMonth}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                                <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={12} />
                                <YAxis stroke="var(--text-muted)" fontSize={12} />
                                <Tooltip
                                    contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8 }}
                                    formatter={v => [`₹${v.toLocaleString('en-IN')}`, 'Revenue']}
                                />
                                <Area type="monotone" dataKey="revenue" stroke="var(--primary-light)" fill="url(#colorRevenue)" strokeWidth={2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                )}

                <div className="grid-2">
                    {/* User Growth Chart */}
                    {stats?.newUsersOverTime && (
                        <div className="glass-card" style={{ padding: 'var(--space-xl)', marginBottom: 'var(--space-xl)' }}>
                            <h3 style={{ marginBottom: 'var(--space-lg)' }}>User Growth</h3>
                            <ResponsiveContainer width="100%" height={250}>
                                <LineChart data={stats.newUsersOverTime}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                                    <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={12} />
                                    <YAxis stroke="var(--text-muted)" fontSize={12} />
                                    <Tooltip
                                        contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8 }}
                                    />
                                    <Line type="monotone" dataKey="users" stroke="var(--success)" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    )}

                    {/* Top Products Chart */}
                    {stats?.topSellingProducts && (
                        <div className="glass-card" style={{ padding: 'var(--space-xl)', marginBottom: 'var(--space-xl)' }}>
                            <h3 style={{ marginBottom: 'var(--space-lg)' }}>Top 5 Products (Sales)</h3>
                            <ResponsiveContainer width="100%" height={250}>
                                <BarChart data={stats.topSellingProducts}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                                    <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={10} hide />
                                    <YAxis stroke="var(--text-muted)" fontSize={12} />
                                    <Tooltip
                                        contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8 }}
                                        formatter={(v, name, props) => [v, `Sales (${props.payload.name})`]}
                                    />
                                    <Bar dataKey="sales" radius={[4, 4, 0, 0]}>
                                        {stats.topSellingProducts.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={['var(--primary)', 'var(--gold)', 'var(--info)', 'var(--success)', 'var(--error)'][index % 5]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>

                {/* Recent Orders */}
                {stats?.recentOrders?.length > 0 && (
                    <div className="glass-card" style={{ padding: 'var(--space-xl)' }}>
                        <h3 style={{ marginBottom: 'var(--space-lg)' }}>Recent Orders</h3>
                        <div className="admin-table-wrapper">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Order ID</th>
                                        <th>Customer</th>
                                        <th>Amount</th>
                                        <th>Status</th>
                                        <th>Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stats.recentOrders.map(order => (
                                        <tr key={order._id}>
                                            <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>#{order._id.slice(-8)}</td>
                                            <td>{order.user?.name || 'Guest'}</td>
                                            <td>₹{order.total?.toLocaleString('en-IN')}</td>
                                            <td><span style={{ color: 'var(--primary-light)', textTransform: 'capitalize' }}>{order.status}</span></td>
                                            <td>{new Date(order.createdAt).toLocaleDateString('en-IN')}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default AdminDashboard;
