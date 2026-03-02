import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiShoppingCart, FiHeart, FiUser, FiSearch, FiMenu, FiX, FiSun, FiMoon, FiLogOut, FiSettings } from 'react-icons/fi';
import { FaYoutube } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useTheme } from '../../context/ThemeContext';
import API from '../../services/api';
import './Header.css';

const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/products', label: 'Products' },
    { to: '/about', label: 'About' },
    { to: '/blog', label: 'Blog' },
    { to: '/contact', label: 'Contact' },
];

const Header = () => {
    const { user, logout, isAdmin } = useAuth();
    const { cartCount } = useCart();
    const { wishlist } = useWishlist();
    const { theme, toggleTheme, isDark } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();

    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [loadingSuggestions, setLoadingSuggestions] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const searchRef = useRef(null);
    const userMenuRef = useRef(null);
    const mobileNavRef = useRef(null);
    const debounceRef = useRef(null);

    // Fetch suggestions with debouncing
    useEffect(() => {
        if (!searchQuery.trim()) {
            setSuggestions([]);
            return;
        }

        if (debounceRef.current) clearTimeout(debounceRef.current);

        debounceRef.current = setTimeout(async () => {
            try {
                setLoadingSuggestions(true);
                const res = await API.get(`/products/suggestions?query=${encodeURIComponent(searchQuery)}`);
                setSuggestions(res.data.suggestions || []);
            } catch (err) {
                console.error('Fetch suggestions error:', err);
            } finally {
                setLoadingSuggestions(false);
            }
        }, 300);

        return () => clearTimeout(debounceRef.current);
    }, [searchQuery]);

    // Close all menus on route change
    useEffect(() => {
        setUserMenuOpen(false);
        setMobileOpen(false);
        setSearchOpen(false);
    }, [location]);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (userMenuOpen && userMenuRef.current && !userMenuRef.current.contains(e.target)) setUserMenuOpen(false);
            if (searchOpen && searchRef.current && !searchRef.current.contains(e.target)) setSearchOpen(false);
            if (mobileOpen && mobileNavRef.current && !mobileNavRef.current.contains(e.target)) setMobileOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [userMenuOpen, searchOpen, mobileOpen]);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
            setSearchOpen(false);
            setSearchQuery('');
        }
    };

    const handleLogout = () => {
        logout();
        setUserMenuOpen(false);
        navigate('/');
    };

    return (
        <header className={`header ${scrolled ? 'header--scrolled' : ''}`}>
            <div className="container header__inner">
                {/* Logo */}
                <Link to="/" className="header__logo">
                    <div className="logo-mark">
                        <span className="logo-text">AMT</span>
                        <span className="logo-dot" />
                    </div>
                    <div className="logo-tagline">Advanced Medical Therapeutics</div>
                </Link>

                {/* Desktop Nav */}
                <nav className="header__nav hide-mobile">
                    {navLinks.map(link => (
                        <NavLink
                            key={link.to}
                            to={link.to}
                            end={link.to === '/'}
                            className={({ isActive }) => `header__nav-link ${isActive ? 'active' : ''}`}
                        >
                            {link.label}
                        </NavLink>
                    ))}
                </nav>

                {/* Actions */}
                <div className="header__actions">
                    {/* Search */}
                    <div className="search-wrapper" ref={searchRef}>
                        <button className="icon-btn" onClick={() => setSearchOpen(!searchOpen)} aria-label="Search">
                            <FiSearch />
                        </button>
                        <AnimatePresence>
                            {searchOpen && (
                                <motion.form
                                    className="search-dropdown"
                                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                    transition={{ duration: 0.2 }}
                                    onSubmit={handleSearch}
                                >
                                    <input
                                        autoFocus
                                        type="text"
                                        placeholder="Search products..."
                                        value={searchQuery}
                                        onChange={e => setSearchQuery(e.target.value)}
                                        className="search-input"
                                    />
                                    <button type="submit" className="search-btn"><FiSearch /></button>

                                    {/* Suggestions Dropdown */}
                                    <AnimatePresence>
                                        {suggestions.length > 0 && (
                                            <motion.div
                                                className="search-suggestions glass-card"
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: 10 }}
                                            >
                                                {suggestions.map(item => (
                                                    <div
                                                        key={item._id}
                                                        className="suggestion-item"
                                                        onClick={() => {
                                                            navigate(`/products/${item.slug}`);
                                                            setSearchOpen(false);
                                                            setSearchQuery('');
                                                        }}
                                                    >
                                                        <img
                                                            src={item.images?.[0]?.url?.replace('/upload/', '/upload/f_auto,q_auto,w_50/')}
                                                            alt={item.name}
                                                            className="suggestion-img"
                                                        />
                                                        <div className="suggestion-info">
                                                            <p className="suggestion-name">{item.name}</p>
                                                            <p className="suggestion-price">₹{item.discountPrice || item.price}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                                <button
                                                    className="suggestion-all"
                                                    onClick={() => {
                                                        navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
                                                        setSearchOpen(false);
                                                        setSearchQuery('');
                                                    }}
                                                >
                                                    View all results for "{searchQuery}"
                                                </button>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {loadingSuggestions && searchQuery && (
                                        <div className="search-loader" />
                                    )}
                                </motion.form>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* YouTube */}
                    <a
                        href="https://www.youtube.com/@Amrutamtsinghavi"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="icon-btn youtube-btn"
                        aria-label="YouTube"
                    >
                        <FaYoutube />
                    </a>

                    {/* Theme Toggle */}
                    <button className="icon-btn" onClick={toggleTheme} aria-label="Toggle theme">
                        {isDark ? <FiSun /> : <FiMoon />}
                    </button>

                    {/* Wishlist */}
                    {user && (
                        <Link to="/wishlist" className="icon-btn icon-btn--badge" aria-label="Wishlist">
                            <FiHeart />
                            {wishlist.length > 0 && <span className="badge-count">{wishlist.length}</span>}
                        </Link>
                    )}

                    {/* Cart */}
                    <Link to="/cart" className="icon-btn icon-btn--badge" aria-label="Cart">
                        <FiShoppingCart />
                        {cartCount > 0 && <span className="badge-count">{cartCount}</span>}
                    </Link>

                    {/* User Menu */}
                    <div className="user-menu-wrapper" ref={userMenuRef}>
                        <button className="icon-btn" onClick={() => setUserMenuOpen(!userMenuOpen)} aria-label="User menu">
                            {user?.avatar ? (
                                <img src={user.avatar} alt={user.name} className="user-avatar" />
                            ) : (
                                <FiUser />
                            )}
                        </button>
                        <AnimatePresence>
                            {userMenuOpen && (
                                <motion.div
                                    className="user-dropdown glass-card"
                                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    {user ? (
                                        <>
                                            <div className="user-dropdown__header">
                                                <p className="user-dropdown__name">{user.name}</p>
                                                <p className="user-dropdown__email">{user.email}</p>
                                            </div>
                                            <Link to="/profile" className="user-dropdown__item" onClick={() => setUserMenuOpen(false)}>
                                                <FiUser /> My Profile
                                            </Link>
                                            <Link to="/orders" className="user-dropdown__item" onClick={() => setUserMenuOpen(false)}>
                                                <FiShoppingCart /> My Orders
                                            </Link>
                                            {isAdmin && (
                                                <Link to="/admin" className="user-dropdown__item user-dropdown__item--admin" onClick={() => setUserMenuOpen(false)}>
                                                    <FiSettings /> Admin Panel
                                                </Link>
                                            )}
                                            <button className="user-dropdown__item user-dropdown__item--logout" onClick={handleLogout}>
                                                <FiLogOut /> Logout
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <Link to="/login" className="user-dropdown__item" onClick={() => setUserMenuOpen(false)}>Login</Link>
                                            <Link to="/register" className="user-dropdown__item" onClick={() => setUserMenuOpen(false)}>Register</Link>
                                        </>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Mobile Menu Toggle */}
                    <button className="icon-btn hide-desktop" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menu">
                        {mobileOpen ? <FiX /> : <FiMenu />}
                    </button>
                </div>
            </div>

            {/* Mobile Nav Overlay (tap-outside to close) */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        key="mobile-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setMobileOpen(false)}
                        style={{
                            position: 'fixed', inset: 0, zIndex: 998,
                            background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(2px)',
                        }}
                    />
                )}
            </AnimatePresence>
            {/* Mobile Nav */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        ref={mobileNavRef}
                        className="mobile-nav glass-card"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        style={{ position: 'relative', zIndex: 999 }}
                    >
                        {navLinks.map(link => (
                            <NavLink
                                key={link.to}
                                to={link.to}
                                end={link.to === '/'}
                                className={({ isActive }) => `mobile-nav__link ${isActive ? 'active' : ''}`}
                                onClick={() => setMobileOpen(false)}
                            >
                                {link.label}
                            </NavLink>
                        ))}
                        {!user && (
                            <>
                                <Link to="/login" className="mobile-nav__link" onClick={() => setMobileOpen(false)}>Login</Link>
                                <Link to="/register" className="mobile-nav__link" onClick={() => setMobileOpen(false)}>Register</Link>
                            </>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
};

export default Header;
