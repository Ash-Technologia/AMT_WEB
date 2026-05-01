import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { FiCheck, FiTrash2, FiSearch } from 'react-icons/fi';
import API from '../../services/api';
import toast from 'react-hot-toast';

const AdminReviews = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        try {
            setLoading(true);
            const res = await API.get('/reviews/admin/all');
            setReviews(res.data.reviews || []);
        } catch (error) {
            toast.error('Failed to load reviews');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id, currentStatus) => {
        try {
            await API.patch(`/reviews/${id}/approve`, { isApproved: !currentStatus });
            toast.success('Review status updated');
            fetchReviews();
        } catch (err) {
            toast.error('Failed to update status');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this review?')) return;
        try {
            await API.delete(`/reviews/${id}`);
            toast.success('Review deleted');
            fetchReviews();
        } catch (err) {
            toast.error('Failed to delete review');
        }
    };

    const filtered = reviews.filter(r => 
        (r.comment || '').toLowerCase().includes(search.toLowerCase()) ||
        (r.user?.name || '').toLowerCase().includes(search.toLowerCase()) ||
        (r.product?.name || '').toLowerCase().includes(search.toLowerCase())
    );

    return (
        <>
            <Helmet><title>Manage Reviews — Admin</title></Helmet>
            <div className="admin-page-header">
                <div>
                    <h1 className="admin-page-title">Product Reviews</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Manage and moderate customer reviews</p>
                </div>
                <div className="search-bar">
                    <FiSearch className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search reviews..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="search-input"
                    />
                </div>
            </div>

            <div className="glass-card">
                {loading ? (
                    <div className="page-loader"><div className="spinner" /></div>
                ) : (
                    <div className="admin-table-wrapper">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Product</th>
                                    <th>User</th>
                                    <th>Rating</th>
                                    <th>Comment</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" style={{ textAlign: 'center', padding: 'var(--space-xl)' }}>
                                            No reviews found.
                                        </td>
                                    </tr>
                                ) : filtered.map(review => (
                                    <tr key={review._id}>
                                        <td>{review.product?.name || 'Deleted Product'}</td>
                                        <td>{review.user?.name || 'Unknown'}</td>
                                        <td>
                                            <span style={{ color: 'var(--gold)', fontWeight: 'bold' }}>★ {review.rating}</span>
                                        </td>
                                        <td>
                                            <p style={{ maxWidth: 300, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {review.comment}
                                            </p>
                                        </td>
                                        <td>
                                            <span className={`badge badge-${review.isApproved ? 'success' : 'warning'}`}>
                                                {review.isApproved ? 'Approved' : 'Pending'}
                                            </span>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button
                                                    onClick={() => handleApprove(review._id, review.isApproved)}
                                                    className="btn-icon"
                                                    title={review.isApproved ? 'Unapprove' : 'Approve'}
                                                    style={{ color: review.isApproved ? 'var(--warning)' : 'var(--success)' }}
                                                >
                                                    <FiCheck />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(review._id)}
                                                    className="btn-icon"
                                                    title="Delete"
                                                    style={{ color: 'var(--error)' }}
                                                >
                                                    <FiTrash2 />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </>
    );
};

export default AdminReviews;
