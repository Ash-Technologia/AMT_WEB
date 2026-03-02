import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { FiPlus, FiTrash2 } from 'react-icons/fi';
import API from '../../services/api';
import toast from 'react-hot-toast';

const AdminCoupons = () => {
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ code: '', discountType: 'percentage', discountValue: '', minOrderAmount: '', maxUses: '', expiresAt: '' });
    const [submitting, setSubmitting] = useState(false);

    const fetchCoupons = () => {
        setLoading(true);
        API.get('/coupons').then(res => setCoupons(res.data.coupons || [])).catch(console.error).finally(() => setLoading(false));
    };

    useEffect(() => { fetchCoupons(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            await API.post('/coupons', form);
            toast.success('Coupon created!');
            setShowForm(false);
            setForm({ code: '', discountType: 'percentage', discountValue: '', minOrderAmount: '', maxUses: '', expiresAt: '' });
            fetchCoupons();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to create coupon');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this coupon?')) return;
        try {
            await API.delete(`/coupons/${id}`);
            toast.success('Coupon deleted');
            fetchCoupons();
        } catch (err) {
            toast.error('Failed to delete');
        }
    };

    return (
        <>
            <Helmet><title>Coupons — AMT Admin</title></Helmet>
            <div>
                <div className="admin-page-header">
                    <h1 className="admin-page-title">Coupons</h1>
                    <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}><FiPlus /> Add Coupon</button>
                </div>

                {showForm && (
                    <div className="glass-card" style={{ padding: 'var(--space-xl)', marginBottom: 'var(--space-xl)' }}>
                        <h3 style={{ marginBottom: 'var(--space-lg)' }}>New Coupon</h3>
                        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-md)' }}>
                            <div className="form-group">
                                <label className="form-label">Code *</label>
                                <input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} className="form-input" placeholder="SAVE20" required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Discount Type</label>
                                <select value={form.discountType} onChange={e => setForm(f => ({ ...f, discountType: e.target.value }))} className="form-input">
                                    <option value="percentage">Percentage (%)</option>
                                    <option value="fixed">Fixed Amount (₹)</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Discount Value *</label>
                                <input type="number" value={form.discountValue} onChange={e => setForm(f => ({ ...f, discountValue: e.target.value }))} className="form-input" required min={1} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Min Order (₹)</label>
                                <input type="number" value={form.minOrderAmount} onChange={e => setForm(f => ({ ...f, minOrderAmount: e.target.value }))} className="form-input" min={0} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Max Uses</label>
                                <input type="number" value={form.maxUses} onChange={e => setForm(f => ({ ...f, maxUses: e.target.value }))} className="form-input" min={1} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Expires At</label>
                                <input type="date" value={form.expiresAt} onChange={e => setForm(f => ({ ...f, expiresAt: e.target.value }))} className="form-input" />
                            </div>
                            <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 'var(--space-md)' }}>
                                <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Creating...' : 'Create Coupon'}</button>
                                <button type="button" className="btn btn-glass" onClick={() => setShowForm(false)}>Cancel</button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="glass-card admin-table-wrapper">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Code</th>
                                <th>Discount</th>
                                <th>Min Order</th>
                                <th>Uses</th>
                                <th>Expires</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={7} style={{ textAlign: 'center', padding: 'var(--space-xl)' }}>Loading...</td></tr>
                            ) : coupons.map(coupon => (
                                <tr key={coupon._id}>
                                    <td style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--primary-light)' }}>{coupon.code}</td>
                                    <td>{coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `₹${coupon.discountValue}`}</td>
                                    <td>{coupon.minOrderAmount ? `₹${coupon.minOrderAmount}` : '—'}</td>
                                    <td>{coupon.usedCount || 0}{coupon.maxUses ? ` / ${coupon.maxUses}` : ''}</td>
                                    <td style={{ fontSize: '0.8rem' }}>{coupon.expiresAt ? new Date(coupon.expiresAt).toLocaleDateString('en-IN') : '—'}</td>
                                    <td>
                                        <span style={{ color: coupon.isActive ? 'var(--success)' : 'var(--error)' }}>
                                            {coupon.isActive ? '● Active' : '● Inactive'}
                                        </span>
                                    </td>
                                    <td>
                                        <button onClick={() => handleDelete(coupon._id)} className="icon-btn" style={{ color: 'var(--error)' }}><FiTrash2 /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
};

export default AdminCoupons;
