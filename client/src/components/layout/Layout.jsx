import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import MobileSidebar from './MobileSidebar';
import ChatWidget from '../chat/ChatWidget';
import NewsletterPopup from '../home/NewsletterPopup';
import { FiMenu } from 'react-icons/fi';
import './MobileSidebar.css';

const Layout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

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

            <main style={{ minHeight: '80vh', paddingTop: 'var(--header-height)' }}>
                <Outlet />
            </main>
            <Footer />
            <ChatWidget />
            <NewsletterPopup />
        </>
    );
};

export default Layout;
