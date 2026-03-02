import { useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiX, FiHome, FiShoppingBag, FiInfo, FiBookOpen, FiMail,
    FiShoppingCart, FiHeart, FiUser, FiLogOut, FiSettings,
    FiSun, FiMoon
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useTheme } from '../../context/ThemeContext';
import './MobileSidebar.css';

const navLinks = [
    { to: '/', label: 'Home', icon: <FiHome /> },
    { to: '/products', label: 'Products', icon: <FiShoppingBag /> },
    { to: '/about', label: 'About', icon: <FiInfo /> },
    { to: '/blog', label: 'Blog', icon: <FiBookOpen /> },
    { to: '/contact', label: 'Contact', icon: <FiMail /> },
];

const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.25 } },
    exit: { opacity: 0, transition: { duration: 0.2 } },
};

const sidebarVariants = {
    hidden: { x: '-100%' },
    visible: { x: 0, transition: { type: 'spring', damping: 28, stiffness: 300 } },
    exit: { x: '-100%', transition: { duration: 0.22, ease: 'easeIn' } },
};

const MobileSidebar = ({ open, onClose }) => {
    const { user, logout, isAdmin } = useAuth();
    const { cartCount } = useCart();
    const { wishlist } = useWishlist();
    const { isDark, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();

    // Close on route change
    useEffect(() => {
        onClose();
    }, [location.pathname]);

    // Lock body scroll when open
    useEffect(() => {
        if (open) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [open]);

    const handleLogout = () => {
        logout();
        onClose();
        navigate('/');
    };

    const userInitial = user?.name?.charAt(0)?.toUpperCase() || '?';

    return (
        <AnimatePresence>
            {open && (
                <>
                    {/* Overlay */}
                    <motion.div
                        className="mobile-sidebar-overlay"
                        variants={overlayVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        onClick={onClose}
                    />

                    {/* Sidebar Panel */}
                    <motion.aside
                        className="mobile-sidebar"
                        variants={sidebarVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                    >
                        {/* Header */}
                        <div className="sidebar-header">
                            <Link to="/" className="sidebar-logo" onClick={onClose}>
                                <div className="sidebar-logo-mark">AMT</div>
                                <div className="sidebar-logo-text">
                                    <strong>AMT</strong>
                                    Advanced Medical
                                </div>
                            </Link>
                            <button className="sidebar-close" onClick={onClose} aria-label="Close menu">
                                <FiX />
                            </button>
                        </div>

                        {/* User Info */}
                        {user ? (
                            <div className="sidebar-user">
                                <div className="sidebar-user__avatar">
                                    {user.avatar
                                        ? <img src={user.avatar} alt={user.name} />
                                        : userInitial
                                    }
                                </div>
                                <div className="sidebar-user__info">
                                    <div className="sidebar-user__name">{user.name}</div>
                                    <div className="sidebar-user__email">{user.email || user.phone}</div>
                                </div>
                            </div>
                        ) : (
                            <div className="sidebar-user">
                                <div className="sidebar-user__avatar">
                                    <FiUser />
                                </div>
                                <div className="sidebar-user__info">
                                    <div className="sidebar-user__name">Guest</div>
                                    <div className="sidebar-user__email">Sign in to your account</div>
                                </div>
                            </div>
                        )}

                        {/* Navigation */}
                        <nav className="sidebar-nav">
                            <div className="sidebar-nav-label">Navigation</div>
                            {navLinks.map((link, i) => (
                                <motion.div
                                    key={link.to}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.05 + i * 0.05 }}
                                >
                                    <NavLink
                                        to={link.to}
                                        end={link.to === '/'}
                                        className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`}
                                        onClick={onClose}
                                    >
                                        {link.icon}
                                        {link.label}
                                    </NavLink>
                                </motion.div>
                            ))}

                            {user && (
                                <>
                                    <div className="sidebar-nav-divider" />
                                    <div className="sidebar-nav-label">Account</div>
                                    <NavLink to="/profile" className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`} onClick={onClose}>
                                        <FiUser /> My Profile
                                    </NavLink>
                                    <NavLink to="/orders" className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`} onClick={onClose}>
                                        <FiShoppingBag /> My Orders
                                    </NavLink>
                                    {isAdmin && (
                                        <NavLink to="/admin" className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`} onClick={onClose}>
                                            <FiSettings /> Admin Panel
                                        </NavLink>
                                    )}
                                </>
                            )}
                        </nav>

                        {/* Footer Actions */}
                        <div className="sidebar-footer">
                            <div className="sidebar-footer-actions">
                                {/* Theme */}
                                <button className="sidebar-icon-btn" onClick={toggleTheme} aria-label="Toggle theme">
                                    {isDark ? <FiSun /> : <FiMoon />}
                                </button>
                                {/* Cart */}
                                <Link to="/cart" className="sidebar-icon-btn" onClick={onClose} aria-label="Cart">
                                    <FiShoppingCart />
                                    {cartCount > 0 && <span className="badge-count">{cartCount}</span>}
                                </Link>
                                {/* Wishlist */}
                                {user && (
                                    <Link to="/wishlist" className="sidebar-icon-btn" onClick={onClose} aria-label="Wishlist">
                                        <FiHeart />
                                        {wishlist.length > 0 && <span className="badge-count">{wishlist.length}</span>}
                                    </Link>
                                )}
                            </div>

                            {/* Auth */}
                            {user ? (
                                <button className="sidebar-logout-btn" onClick={handleLogout}>
                                    <FiLogOut /> Sign Out
                                </button>
                            ) : (
                                <div className="sidebar-auth-btns">
                                    <Link to="/login" className="btn btn-primary" onClick={onClose}>Login</Link>
                                    <Link to="/register" className="btn btn-glass" onClick={onClose}>Register</Link>
                                </div>
                            )}
                        </div>
                    </motion.aside>
                </>
            )}
        </AnimatePresence>
    );
};

export default MobileSidebar;
