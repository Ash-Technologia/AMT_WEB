import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiGrid, FiPackage, FiShoppingBag, FiUsers, FiFileText,
    FiTag, FiMail, FiSettings, FiMenu, FiX, FiLogOut, FiMessageSquare, FiHome
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import './AdminLayout.css';

const navItems = [
    { path: '/admin', label: 'Dashboard', icon: <FiGrid />, exact: true },
    { path: '/admin/products', label: 'Products', icon: <FiPackage /> },
    { path: '/admin/orders', label: 'Orders', icon: <FiShoppingBag /> },
    { path: '/admin/customers', label: 'Customers', icon: <FiUsers /> },
    { path: '/admin/blogs', label: 'Blogs', icon: <FiFileText /> },
    { path: '/admin/coupons', label: 'Coupons', icon: <FiTag /> },
    { path: '/admin/queries', label: 'Queries', icon: <FiMessageSquare /> },
    { path: '/admin/newsletter', label: 'Newsletter', icon: <FiMail /> },
    { path: '/admin/settings', label: 'Settings', icon: <FiSettings /> },
];

const AdminLayout = () => {
    const { logout, user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const isActive = (item) => item.exact
        ? location.pathname === item.path
        : location.pathname.startsWith(item.path);

    const handleLogout = () => { logout(); navigate('/'); };

    const currentPage = navItems.find(item => isActive(item))?.label || 'Admin';

    return (
        <div className="admin-layout">
            {/* Sidebar */}
            <aside className={`admin-sidebar ${sidebarOpen ? 'open' : 'collapsed'}`}>
                <div className="admin-sidebar__header">
                    <Link to="/admin" className="admin-logo">
                        {sidebarOpen && <span>AMT Admin</span>}
                    </Link>
                    <button className="icon-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
                        {sidebarOpen ? <FiX /> : <FiMenu />}
                    </button>
                </div>

                <nav className="admin-nav">
                    {navItems.map(item => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`admin-nav-item ${isActive(item) ? 'active' : ''}`}
                            title={!sidebarOpen ? item.label : undefined}
                        >
                            <span className="admin-nav-icon">{item.icon}</span>
                            <AnimatePresence>
                                {sidebarOpen && (
                                    <motion.span
                                        className="admin-nav-label"
                                        initial={{ opacity: 0, width: 0 }}
                                        animate={{ opacity: 1, width: 'auto' }}
                                        exit={{ opacity: 0, width: 0 }}
                                    >
                                        {item.label}
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </Link>
                    ))}
                </nav>

                <div className="admin-sidebar__bottom">
                    <Link to="/" className="admin-nav-item home-link" title={!sidebarOpen ? 'Back to Home' : undefined}>
                        <span className="admin-nav-icon"><FiHome /></span>
                        <AnimatePresence>
                            {sidebarOpen && (
                                <motion.span
                                    className="admin-nav-label"
                                    initial={{ opacity: 0, width: 0 }}
                                    animate={{ opacity: 1, width: 'auto' }}
                                    exit={{ opacity: 0, width: 0 }}
                                >
                                    Back to Home
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </Link>
                    <button className="admin-logout" onClick={handleLogout} title={!sidebarOpen ? 'Logout' : undefined}>
                        <FiLogOut />
                        {sidebarOpen && <span>Logout</span>}
                    </button>
                </div>
            </aside>

            {/* Main */}
            <main className="admin-main">
                <div className="admin-topbar">
                    <h2 className="admin-topbar__title">{currentPage}</h2>
                    <div className="admin-topbar__user">
                        <span>👤 {user?.name || 'Admin'}</span>
                    </div>
                </div>
                <div className="admin-content">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
