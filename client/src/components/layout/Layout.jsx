import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Header from './Header';
import Footer from './Footer';
import MobileSidebar from './MobileSidebar';
import ChatWidget from '../chat/ChatWidget';
import NewsletterPopup from '../home/NewsletterPopup';
import { FiMenu } from 'react-icons/fi';
import './MobileSidebar.css';

const Layout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();

    return (
        <>
            {/* Desktop Header */}
            <Header />

            {/* Mobile Sidebar Trigger (fixed button) */}
            <button
                className="mobile-sidebar-trigger"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open menu"
            >
                <FiMenu />
            </button>

            {/* Mobile Sidebar */}
            <MobileSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <AnimatePresence mode="wait">
                <motion.main 
                    key={location.pathname}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    style={{ minHeight: '80vh', paddingTop: 'var(--header-height)' }}
                >
                    <Outlet />
                </motion.main>
            </AnimatePresence>
            <Footer />
            <ChatWidget />
            <NewsletterPopup />
        </>
    );
};

export default Layout;
