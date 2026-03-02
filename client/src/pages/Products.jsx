import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiFilter } from 'react-icons/fi';
import { Helmet } from 'react-helmet-async';
import API from '../services/api';
import ProductCard from '../components/products/ProductCard';
import SearchBar from '../components/common/SearchBar';

const Products = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [searchParams, setSearchParams] = useSearchParams();
    const [sort, setSort] = useState('newest');
    const [page, setPage] = useState(1);
    const limit = 9;

    // ── Filter state ─────────────────────────────────────────────────────────
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [inStock, setInStock] = useState(false);
    const [showFilters, setShowFilters] = useState(false);

    // Fetch products whenever filters / sort / page change
    useEffect(() => {
        fetchProducts();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams, sort, page]);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({ page, limit, sort });
            if (searchParams.get('search')) params.set('search', searchParams.get('search'));
            if (searchParams.get('category')) params.set('category', searchParams.get('category'));
            if (searchParams.get('minPrice')) params.set('minPrice', searchParams.get('minPrice'));
            if (searchParams.get('maxPrice')) params.set('maxPrice', searchParams.get('maxPrice'));
            if (searchParams.get('inStock')) params.set('inStock', searchParams.get('inStock'));
            const res = await API.get(`/products?${params}`);
            setProducts(res.data.products || []);
            setTotal(res.data.total || 0);
        } catch (err) {
            console.error('Products fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        setPage(1);
        const next = {};
        if (searchParams.get('search')) next.search = searchParams.get('search');
        if (minPrice) next.minPrice = minPrice;
        if (maxPrice) next.maxPrice = maxPrice;
        if (inStock) next.inStock = 'true';
        setSearchParams(next);
        setShowFilters(false);
    };

    const resetFilters = () => {
        setMinPrice('');
        setMaxPrice('');
        setInStock(false);
        setPage(1);
        const next = {};
        if (searchParams.get('search')) next.search = searchParams.get('search');
        setSearchParams(next);
    };

    const handleSearch = (q) => {
        setPage(1);
        const next = q ? { search: q } : {};
        if (category) next.category = category;
        if (inStock) next.inStock = 'true';
        setSearchParams(next);
    };

    const clearSearch = () => {
        resetFilters();
        setSearchParams({});
    };

    const totalPages = Math.ceil(total / limit);

    return (
        <>
            <Helmet>
                <title>Products — AMT Advanced Medical Therapeutics</title>
            </Helmet>

            <div className="container" style={{ paddingTop: 'var(--space-2xl)', paddingBottom: 'var(--space-3xl)' }}>

                {/* Header */}
                <div className="section-header">
                    <span className="section-label">Our Collection</span>
                    <h1 className="section-title">Therapy Products</h1>
                    <div className="divider" />
                    <p className="section-subtitle">Discover our range of premium health therapy products</p>
                </div>

                {/* Search & Sort Bar */}
                <div className="flex-between" style={{ marginBottom: 'var(--space-xl)', flexWrap: 'wrap', gap: 'var(--space-md)' }}>
                    <div className="flex gap-sm" style={{ flex: 1, maxWidth: 520 }}>
                        <SearchBar onSearch={handleSearch} placeholder="Search products..." />
                        <button className="btn btn-glass btn-sm" onClick={() => setShowFilters(!showFilters)}>
                            <FiFilter /> Filters
                        </button>
                    </div>

                    <select
                        value={sort}
                        onChange={e => { setSort(e.target.value); setPage(1); }}
                        className="form-input"
                        style={{ width: 'auto' }}
                    >
                        <option value="newest">Newest First</option>
                        <option value="price_asc">Price: Low to High</option>
                        <option value="price_desc">Price: High to Low</option>
                        <option value="rating">Top Rated</option>
                    </select>
                </div>

                {/* Main grid: sidebar + products */}
                <div style={{ display: 'grid', gridTemplateColumns: showFilters ? '250px 1fr' : '1fr', gap: 'var(--space-2xl)', alignItems: 'start' }}>

                    {/* Sidebar Filters */}
                    {showFilters && (
                        <aside style={{ position: 'sticky', top: 100 }}>
                            <div className="glass-card" style={{ padding: 'var(--space-lg)' }}>
                                <div className="flex-between" style={{ marginBottom: 'var(--space-md)' }}>
                                    <h4 style={{ margin: 0 }}>Filters</h4>
                                    <button onClick={resetFilters} style={{ fontSize: '0.8rem', color: 'var(--primary-light)', background: 'none', cursor: 'pointer' }}>Reset</button>
                                </div>

                                <div className="divider" style={{ margin: 'var(--space-md) 0' }} />


                                {/* Price Range */}
                                <div style={{ marginBottom: 'var(--space-xl)' }}>
                                    <h5 style={{ marginBottom: 'var(--space-sm)', fontSize: '0.9rem' }}>Price Range (₹)</h5>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                        <input type="number" placeholder="Min" value={minPrice} onChange={e => setMinPrice(e.target.value)} className="form-input" style={{ height: 36, fontSize: '0.85rem' }} />
                                        <input type="number" placeholder="Max" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} className="form-input" style={{ height: 36, fontSize: '0.85rem' }} />
                                    </div>
                                </div>

                                {/* In Stock */}
                                <div style={{ marginBottom: 'var(--space-md)' }}>
                                    <label style={{ fontSize: '0.9rem', cursor: 'pointer', display: 'flex', gap: 8 }}>
                                        <input type="checkbox" checked={inStock} onChange={e => setInStock(e.target.checked)} style={{ accentColor: 'var(--primary)' }} />
                                        In Stock Only
                                    </label>
                                </div>

                                <button className="btn btn-primary btn-sm" style={{ width: '100%', marginTop: 'var(--space-md)' }} onClick={applyFilters}>
                                    Apply Filters
                                </button>
                            </div>
                        </aside>
                    )}

                    {/* Products Area */}
                    <div>
                        {/* Results count */}
                        {!loading && (
                            <p style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-lg)', fontSize: '0.9rem' }}>
                                Showing {products.length} of {total} products
                                {searchParams.get('search') && ` for "${searchParams.get('search')}"`}
                            </p>
                        )}

                        {/* Products Grid */}
                        {loading ? (
                            <div className="grid-3">
                                {[...Array(9)].map((_, i) => (
                                    <div key={i} className="skeleton" style={{ height: 380, borderRadius: 20 }} />
                                ))}
                            </div>
                        ) : products.length === 0 ? (
                            <div className="flex-center flex-col" style={{ minHeight: 300, gap: 'var(--space-md)' }}>
                                <span style={{ fontSize: '3rem' }}>🔍</span>
                                <h3>No products found</h3>
                                <p className="text-muted">Try a different search or adjust your filters</p>
                                <button className="btn btn-outline" onClick={clearSearch}>View All Products</button>
                            </div>
                        ) : (
                            <div className="grid-3">
                                {products.map((product, i) => (
                                    <motion.div
                                        key={product._id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                    >
                                        <ProductCard product={product} />
                                    </motion.div>
                                ))}
                            </div>
                        )}

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex-center gap-sm" style={{ marginTop: 'var(--space-2xl)' }}>
                                <button
                                    className="btn btn-glass btn-sm"
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                >
                                    Previous
                                </button>
                                {[...Array(totalPages)].map((_, i) => (
                                    <button
                                        key={i}
                                        className={`btn btn-sm ${page === i + 1 ? 'btn-primary' : 'btn-glass'}`}
                                        onClick={() => setPage(i + 1)}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                                <button
                                    className="btn btn-glass btn-sm"
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default Products;
