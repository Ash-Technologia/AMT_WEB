import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { FiShield, FiShieldOff, FiTrash2, FiChevronDown, FiChevronUp, FiUser } from 'react-icons/fi';
import API from '../../services/api';
import toast from 'react-hot-toast';

const GENDER_LABELS = { male: 'Male', female: 'Female', other: 'Other', prefer_not_to_say: 'Prefer not to say' };

const CustomerRow = ({ customer, onToggleAdmin, onDelete }) => {
    const [expanded, setExpanded] = useState(false);
    const hasDetails = customer.shareProfileWithAdmin && (customer.profession || customer.age || customer.gender || customer.bio);

    return (
        <>
            <tr>
                {/* Avatar + Name */}
                <td style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        {customer.avatar
                            ? <img src={customer.avatar} alt="" style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--border)' }} />
                            : <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--primary-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.85rem', fontWeight: 700, flexShrink: 0 }}>
                                {customer.name?.charAt(0).toUpperCase()}
                            </div>
                        }
                        <div>
                            <div>{customer.name}</div>
                            {customer.shareProfileWithAdmin && (
                                <div style={{ fontSize: '0.72rem', color: 'var(--primary-light)' }}>🔓 Profile shared</div>
                            )}
                        </div>
                    </div>
                </td>
                <td>{customer.email}</td>
                <td>{customer.phone || '—'}</td>
                <td>
                    <span className={`badge ${customer.role === 'admin' ? 'badge-primary' : ''}`}
                        style={{ background: customer.role !== 'admin' ? 'var(--surface)' : undefined, color: customer.role !== 'admin' ? 'var(--text-muted)' : undefined }}>
                        {customer.role}
                    </span>
                </td>
                <td style={{ fontSize: '0.8rem' }}>{new Date(customer.createdAt).toLocaleDateString('en-IN')}</td>
                <td>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        {hasDetails && (
                            <button className="icon-btn" onClick={() => setExpanded(e => !e)} title="View profile details" style={{ color: 'var(--gold)' }}>
                                {expanded ? <FiChevronUp /> : <FiChevronDown />}
                            </button>
                        )}
                        <button onClick={() => onToggleAdmin(customer._id, customer.role === 'admin')} className="icon-btn"
                            style={{ color: customer.role === 'admin' ? 'var(--error)' : 'var(--primary-light)' }}
                            title={customer.role === 'admin' ? 'Revoke Admin' : 'Make Admin'}>
                            {customer.role === 'admin' ? <FiShieldOff /> : <FiShield />}
                        </button>
                        <button onClick={() => onDelete(customer._id)} className="icon-btn" style={{ color: 'var(--error)' }} title="Delete Customer">
                            <FiTrash2 />
                        </button>
                    </div>
                </td>
            </tr>
            {/* Expanded profile details row */}
            {expanded && hasDetails && (
                <tr>
                    <td colSpan={6} style={{ padding: '0 12px 12px', background: 'rgba(82,183,136,0.04)' }}>
                        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', padding: '12px 16px', background: 'var(--surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', fontSize: '0.84rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', marginBottom: 6, width: '100%', fontWeight: 600 }}>
                                <FiUser style={{ color: 'var(--primary-light)' }} /> Profile Details <span style={{ fontSize: '0.72rem', color: 'var(--primary-light)', fontWeight: 400 }}>(shared by user)</span>
                            </div>
                            {customer.profession && <div><span style={{ color: 'var(--text-muted)' }}>Profession:</span> <b>{customer.profession}</b></div>}
                            {customer.age && <div><span style={{ color: 'var(--text-muted)' }}>Age:</span> <b>{customer.age}</b></div>}
                            {customer.gender && <div><span style={{ color: 'var(--text-muted)' }}>Gender:</span> <b>{GENDER_LABELS[customer.gender] || customer.gender}</b></div>}
                            {customer.bio && <div style={{ width: '100%' }}><span style={{ color: 'var(--text-muted)' }}>Bio:</span> {customer.bio}</div>}
                        </div>
                    </td>
                </tr>
            )}
        </>
    );
};

const AdminCustomers = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        API.get('/admin/customers').then(res => setCustomers(res.data.customers || [])).catch(console.error).finally(() => setLoading(false));
    }, []);

    const toggleAdmin = async (id, isAdmin) => {
        try {
            await API.patch(`/admin/customers/${id}/role`, { role: isAdmin ? 'user' : 'admin' });
            setCustomers(prev => prev.map(c => c._id === id ? { ...c, role: isAdmin ? 'user' : 'admin' } : c));
            toast.success('Role updated');
        } catch { toast.error('Failed to update role'); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this customer? This action cannot be undone.')) return;
        try {
            await API.delete(`/admin/customers/${id}`);
            setCustomers(prev => prev.filter(c => c._id !== id));
            toast.success('Customer deleted successfully');
        } catch { toast.error('Failed to delete customer'); }
    };

    const sharedCount = customers.filter(c => c.shareProfileWithAdmin).length;

    return (
        <>
            <Helmet><title>Customers — AMT Admin</title></Helmet>
            <div>
                <div className="admin-page-header">
                    <h1 className="admin-page-title">Customers</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                        {customers.length} total · <span style={{ color: 'var(--primary-light)' }}>{sharedCount} shared profile{sharedCount !== 1 ? 's' : ''}</span>
                    </p>
                </div>
                <div className="glass-card admin-table-wrapper">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Role</th>
                                <th>Joined</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={6} style={{ textAlign: 'center', padding: 'var(--space-xl)' }}>Loading...</td></tr>
                            ) : customers.map(customer => (
                                <CustomerRow key={customer._id} customer={customer} onToggleAdmin={toggleAdmin} onDelete={handleDelete} />
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
};

export default AdminCustomers;
