import { Link } from 'react-router-dom';
import { FaInstagram, FaYoutube, FaFacebook, FaTwitter } from 'react-icons/fa';
import { FiMail, FiPhone, FiMapPin } from 'react-icons/fi';
import { useState } from 'react';
import API from '../../services/api';
import toast from 'react-hot-toast';
import './Footer.css';

const Footer = () => {
    const [email, setEmail] = useState('');
    const [subscribing, setSubscribing] = useState(false);

    const handleSubscribe = async (e) => {
        e.preventDefault();
        if (!email) return;
        try {
            setSubscribing(true);
            await API.post('/newsletter/subscribe', { email });
            toast.success('Subscribed successfully! 🌿');
            setEmail('');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Subscription failed');
        } finally {
            setSubscribing(false);
        }
    };

    return (
        <footer className="footer">
            <div className="footer__glow" />
            <div className="container">
                <div className="footer__grid">
                    {/* Brand */}
                    <div className="footer__brand">
                        <div className="footer__logo">
                            <span className="footer__logo-text">AMT</span>
                            <span className="footer__logo-dot" />
                        </div>
                        <p className="footer__tagline font-elegant">Advanced Medical Therapeutics</p>
                        <p className="footer__desc">
                            Pioneering health therapy solutions that harness the power of nature and science for your well-being.
                        </p>
                        <div className="footer__social">
                            <a href="https://www.instagram.com/amrut.singhavi" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="Instagram">
                                <FaInstagram />
                            </a>
                            <a href="https://www.youtube.com/@Amrutamtsinghavi" target="_blank" rel="noopener noreferrer" className="social-link social-link--youtube" aria-label="YouTube">
                                <FaYoutube />
                            </a>
                            <a href="#" className="social-link" aria-label="Facebook"><FaFacebook /></a>
                            <a href="#" className="social-link" aria-label="Twitter"><FaTwitter /></a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="footer__col">
                        <h4 className="footer__col-title">Quick Links</h4>
                        <ul className="footer__links">
                            <li><Link to="/">Home</Link></li>
                            <li><Link to="/products">Products</Link></li>
                            <li><Link to="/about">About Us</Link></li>
                            <li><Link to="/blog">Blog</Link></li>
                            <li><Link to="/contact">Contact</Link></li>
                        </ul>
                    </div>

                    {/* Policies */}
                    <div className="footer__col">
                        <h4 className="footer__col-title">Policies</h4>
                        <ul className="footer__links">
                            <li><Link to="/privacy-policy">Privacy Policy</Link></li>
                            <li><Link to="/terms">Terms & Conditions</Link></li>
                            <li><Link to="/shipping-policy">Shipping Policy</Link></li>
                            <li><Link to="/orders">Order History</Link></li>
                        </ul>
                    </div>

                    {/* Contact & Newsletter */}
                    <div className="footer__col">
                        <h4 className="footer__col-title">Get In Touch</h4>
                        <div className="footer__contact">
                            <a href="mailto:amrutsinghavi@gmail.com" className="footer__contact-item">
                                <FiMail /> amrutsinghavi@gmail.com
                            </a>
                            <a href="tel:9822843015" className="footer__contact-item">
                                <FiPhone /> +91 98228 43015
                            </a>
                            <div className="footer__contact-item">
                                <FiMapPin /> Amravati, Maharashtra, India
                            </div>
                        </div>
                        <div className="footer__newsletter">
                            <p className="footer__newsletter-label">Subscribe for health tips & offers</p>
                            <form className="footer__newsletter-form" onSubmit={handleSubscribe}>
                                <input
                                    type="email"
                                    placeholder="Your email address"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    className="footer__newsletter-input"
                                    required
                                />
                                <button type="submit" className="btn btn-primary btn-sm" disabled={subscribing}>
                                    {subscribing ? '...' : 'Subscribe'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="footer__bottom">
                    <p>© {new Date().getFullYear()} AMT — Advanced Medical Therapeutics. All rights reserved.</p>
                    <p>Made with 💚 in Amravati, Maharashtra</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
