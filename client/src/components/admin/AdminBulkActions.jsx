import { useState } from 'react';
import toast from 'react-hot-toast';
import API from '../../services/api';
import { FiCheckSquare, FiX } from 'react-icons/fi';

/**
 * AdminBulkActions — floating action bar + modal for bulk product updates.
 * Props:
 *   selectedIds: string[]  — array of product _ids
 *   onClose: fn            — clear selection
 *   onDone: fn             — refetch product list after update
 */
const AdminBulkActions = ({ selectedIds, onClose, onDone }) => {
    const [action, setAction] = useState('');
    const [value, setValue] = useState('');
    const [loading, setLoading] = useState(false);

    if (!selectedIds.length) return null;

    const handleApply = async () => {
        if (!action) return toast.error('Select an action');
        if (action !== 'delete' && !value) return toast.error('Enter a value');

        setLoading(true);
        try {
            const updates = selectedIds.map(id => {
                if (action === 'price') return { id, price: Number(value) };
                if (action === 'stock') return { id, stock: Number(value) };
                if (action === 'discount') return { id, discountPrice: Number(value) };
                if (action === 'visible') return { id, isVisible: value === 'true' };
                if (action === 'delete') return { id };
                return { id };
            });

            if (action === 'delete') {
                await Promise.all(updates.map(u => API.delete(`/products/${u.id}`)));
                toast.success(`${selectedIds.length} products deleted`);
            } else {
                await API.patch('/products/bulk-update', { updates });
                toast.success(`${selectedIds.length} products updated`);
            }
            onDone();
            onClose();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Bulk action failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* Floating Action Bar */}
            <div style={{
                position: 'fixed', bottom: 32, left: '50%', transform: 'translateX(-50%)',
                zIndex: 1000, display: 'flex', alignItems: 'center', gap: 12,
                background: 'var(--surface-elevated)', border: '1px solid var(--primary)',
                borderRadius: 'var(--radius-xl)', padding: '12px 20px',
                boxShadow: '0 8px 40px rgba(0,0,0,0.6)', backdropFilter: 'blur(24px)',
            }}>
                <FiCheckSquare style={{ color: 'var(--primary-light)', fontSize: 18 }} />
                <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                    {selectedIds.length} product{selectedIds.length > 1 ? 's' : ''} selected
                </span>

                <select
                    className="form-input"
                    value={action}
                    onChange={e => { setAction(e.target.value); setValue(''); }}
                    style={{ height: 36, fontSize: '0.85rem', width: 160 }}
                >
                    <option value="">Choose action…</option>
                    <option value="price">Set Price</option>
                    <option value="stock">Set Stock</option>
                    <option value="discount">Set Discount Price</option>
                    <option value="visible">Set Visibility</option>
                    <option value="delete">Delete</option>
                </select>

                {action && action !== 'delete' && (
                    action === 'visible' ? (
                        <select
                            className="form-input"
                            value={value}
                            onChange={e => setValue(e.target.value)}
                            style={{ height: 36, fontSize: '0.85rem', width: 120 }}
                        >
                            <option value="">Select…</option>
                            <option value="true">Visible</option>
                            <option value="false">Hidden</option>
                        </select>
                    ) : (
                        <input
                            className="form-input"
                            type="number"
                            placeholder="Value…"
                            value={value}
                            onChange={e => setValue(e.target.value)}
                            style={{ height: 36, fontSize: '0.85rem', width: 110 }}
                        />
                    )
                )}

                <button
                    className={`btn btn-sm ${action === 'delete' ? 'btn-outline' : 'btn-primary'}`}
                    onClick={handleApply}
                    disabled={loading}
                    style={action === 'delete' ? { borderColor: 'var(--error)', color: 'var(--error)' } : {}}
                >
                    {loading ? '…' : action === 'delete' ? '🗑 Delete' : 'Apply'}
                </button>

                <button className="icon-btn" onClick={onClose} aria-label="Clear selection">
                    <FiX />
                </button>
            </div>
        </>
    );
};

export default AdminBulkActions;
