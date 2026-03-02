import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';
import BlurImage from '../common/BlurImage';
import { FiSearch } from 'react-icons/fi';

/**
 * SearchBar — debounced product search with live suggestion dropdown.
 * Usage: <SearchBar onSearch={fn} placeholder="Search..." />
 */
const SearchBar = ({ onSearch, placeholder = 'Search products…', autoFocus = false }) => {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const timerRef = useRef(null);
    const wrapperRef = useRef(null);
    const navigate = useNavigate();

    // Close dropdown on outside click
    useEffect(() => {
        const handler = (e) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const fetchSuggestions = (q) => {
        if (!q.trim() || q.length < 2) { setSuggestions([]); setOpen(false); return; }
        setLoading(true);
        API.get(`/products/suggestions?q=${encodeURIComponent(q)}`)
            .then(res => {
                setSuggestions(res.data.products || []);
                setOpen(true);
            })
            .catch(() => setSuggestions([]))
            .finally(() => setLoading(false));
    };

    const handleChange = (e) => {
        const val = e.target.value;
        setQuery(val);
        clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => fetchSuggestions(val), 300);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!query.trim()) return;
        setOpen(false);
        if (onSearch) onSearch(query.trim());
        else navigate(`/products?search=${encodeURIComponent(query.trim())}`);
    };

    const handleSelect = (product) => {
        setOpen(false);
        setQuery('');
        navigate(`/products/${product.slug}`);
    };

    return (
        <div ref={wrapperRef} style={{ position: 'relative', width: '100%', maxWidth: 440 }}>
            <form onSubmit={handleSubmit}>
                <div style={{ position: 'relative' }}>
                    <FiSearch style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                    <input
                        id="search-bar-input"
                        className="form-input"
                        type="text"
                        value={query}
                        onChange={handleChange}
                        onFocus={() => suggestions.length > 0 && setOpen(true)}
                        placeholder={placeholder}
                        autoFocus={autoFocus}
                        autoComplete="off"
                        style={{ paddingLeft: 40, paddingRight: loading ? 36 : 16 }}
                    />
                    {loading && (
                        <div className="spinner" style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', width: 18, height: 18, borderWidth: 2 }} />
                    )}
                </div>
            </form>

            {/* Suggestions Dropdown */}
            {open && suggestions.length > 0 && (
                <div
                    className="glass-card"
                    style={{
                        position: 'absolute', top: 'calc(100% + 8px)', left: 0, right: 0,
                        zIndex: 1000, overflow: 'hidden', maxHeight: 360, overflowY: 'auto',
                        borderRadius: 'var(--radius-md)', padding: 'var(--space-xs)',
                    }}
                >
                    {suggestions.map(p => (
                        <button
                            key={p._id}
                            onClick={() => handleSelect(p)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: 12, width: '100%',
                                padding: '10px 12px', borderRadius: 'var(--radius-sm)', background: 'none',
                                cursor: 'pointer', transition: 'background var(--transition-fast)', textAlign: 'left',
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-hover)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'none'}
                        >
                            <BlurImage
                                src={p.images?.[0]?.url || ''}
                                alt={p.name}
                                width="44px"
                                height="44px"
                                style={{ borderRadius: 'var(--radius-sm)', flexShrink: 0 }}
                            />
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <p style={{ fontWeight: 500, fontSize: '0.875rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {p.name}
                                </p>
                                <p style={{ color: 'var(--primary-light)', fontSize: '0.8rem', fontWeight: 600 }}>
                                    ₹{(p.discountPrice || p.price)?.toLocaleString('en-IN')}
                                </p>
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SearchBar;
