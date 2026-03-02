import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMapPin, FiCreditCard, FiTag, FiCheck } from 'react-icons/fi';
import { Helmet } from 'react-helmet-async';
import API from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { useEffect } from 'react';

const Checkout = () => {
    const { cart, cartTotal, clearCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();

    const shipping = cartTotal >= 999 ? 0 : 60;
    const [couponCode, setCouponCode] = useState('');
    const [coupon, setCoupon] = useState(null);
    const [loading, setLoading] = useState(false);
    const [addresses, setAddresses] = useState([]);
    const [showAddressList, setShowAddressList] = useState(false);

    useEffect(() => {
        const fetchAddresses = async () => {
            try {
                const res = await API.get('/auth/addresses');
                if (res.data.success) {
                    setAddresses(res.data.addresses);
                    const defaultAddr = res.data.addresses.find(a => a.isDefault);
                    if (defaultAddr) {
                        setAddress({
                            fullName: defaultAddr.fullName,
                            phone: defaultAddr.phone,
                            street: defaultAddr.street,
                            city: defaultAddr.city,
                            state: defaultAddr.state,
                            pincode: defaultAddr.pincode,
                        });
                    }
                }
            } catch (err) {
                console.error('Failed to fetch addresses', err);
            }
        };
        if (user) fetchAddresses();
    }, [user]);

    const [address, setAddress] = useState({
        fullName: user?.name || '',
        phone: user?.phone || '',
        street: '',
        city: '',
        state: '',
        pincode: '',
    });

    const discount = coupon
        ? coupon.discountType === 'percentage'
            ? Math.round(cartTotal * coupon.discountValue / 100)
            : coupon.discountValue
        : 0;

    const total = cartTotal + shipping - discount;

    const handleAddressChange = e => setAddress(a => ({ ...a, [e.target.name]: e.target.value }));

    const applyCoupon = async () => {
        if (!couponCode.trim()) return;
        try {
            setCouponLoading(true);
            const res = await API.post('/coupons/validate', { code: couponCode, orderAmount: cartTotal });
            setCoupon(res.data.coupon);
            toast.success(`Coupon applied! You save ₹${res.data.discount}`);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Invalid coupon');
        } finally {
            setCouponLoading(false);
        }
    };

    const handlePayment = async () => {
        // Validate address
        if (!address.fullName || !address.street || !address.city || !address.state || !address.pincode) {
            toast.error('Please fill in all address fields');
            return;
        }
        if (!address.phone) {
            toast.error('Please enter a phone number');
            return;
        }

        if (!total || total <= 0) {
            toast.error('Invalid order total. Please try refreshing the page.');
            return;
        }

        try {
            setLoading(true);

            if (total < 1) {
                toast.error('Order amount must be at least ₹1');
                setLoading(false);
                return;
            }

            // Create Razorpay order (amount in rupees, backend multiplies by 100)
            const razorpayRes = await API.post('/orders/razorpay/create', { amount: total });
            const rzpOrder = razorpayRes.data.order;

            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                amount: rzpOrder.amount,
                currency: rzpOrder.currency || 'INR',
                name: 'AMT — Advanced Medical Therapeutics',
                description: 'Health Therapy Products',
                order_id: rzpOrder.id,
                handler: async (response) => {
                    try {
                        const orderRes = await API.post('/orders', {
                            items: cart.map(i => ({
                                product: i.product._id,
                                name: i.product.name,
                                quantity: i.quantity,
                                price: i.product.discountPrice || i.product.price,
                            })),
                            shippingAddress: address,
                            paymentMethod: 'razorpay',
                            razorpayOrderId: response.razorpay_order_id,
                            razorpayPaymentId: response.razorpay_payment_id,
                            couponCode: coupon?.code || '',
                        });
                        await clearCart();
                        toast.success('Order placed successfully! 🎉');
                        navigate(`/order-confirmation/${orderRes.data.order._id}`);
                    } catch {
                        toast.error('Order creation failed. Please contact support.');
                    }
                },
                prefill: {
                    name: address.fullName,
                    email: user?.email,
                    contact: address.phone,
                },
                theme: { color: '#2D6A4F' },
                modal: {
                    ondismiss: () => setLoading(false),
                },
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', () => {
                toast.error('Payment failed. Please try again.');
                setLoading(false);
            });
            rzp.open();
        } catch (err) {
            console.error('Razorpay error:', err);
            toast.error(err.response?.data?.message || 'Failed to initiate payment. Check Razorpay credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Helmet><title>Checkout — AMT Advanced Medical Therapeutics</title></Helmet>
            <div className="container" style={{ paddingTop: 'var(--space-2xl)', paddingBottom: 'var(--space-3xl)' }}>
                <h1 style={{ marginBottom: 'var(--space-xl)' }}>Checkout</h1>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 'var(--space-xl)', alignItems: 'start' }}>
                    {/* Left: Address */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
                        <div className="glass-card" style={{ padding: 'var(--space-xl)' }}>
                            <div className="flex-between" style={{ marginBottom: 'var(--space-lg)' }}>
                                <h3 className="flex gap-sm" style={{ alignItems: 'center' }}>
                                    <FiMapPin style={{ color: 'var(--primary-light)' }} /> Delivery Address
                                </h3>
                                {addresses.length > 0 && (
                                    <button
                                        className="btn btn-outline btn-sm"
                                        onClick={() => setShowAddressList(!showAddressList)}
                                    >
                                        {showAddressList ? 'Enter Manually' : 'Select Saved'}
                                    </button>
                                )}
                            </div>

                            {showAddressList ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                                    {addresses.map(addr => (
                                        <div
                                            key={addr._id}
                                            className="glass-card"
                                            style={{
                                                padding: 'var(--space-md)',
                                                cursor: 'pointer',
                                                border: address.pincode === addr.pincode && address.street === addr.street ? '1px solid var(--gold)' : '1px solid var(--border)'
                                            }}
                                            onClick={() => {
                                                setAddress({
                                                    fullName: addr.fullName,
                                                    phone: addr.phone,
                                                    street: addr.street,
                                                    city: addr.city,
                                                    state: addr.state,
                                                    pincode: addr.pincode,
                                                });
                                                setShowAddressList(false);
                                            }}
                                        >
                                            <div style={{ fontWeight: 600 }}>{addr.fullName}</div>
                                            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                                {addr.street}, {addr.city}, {addr.state} - {addr.pincode}
                                            </div>
                                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{addr.phone}</div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="grid-2" style={{ gap: 'var(--space-md)' }}>

                                    <div className="form-group">
                                        <label className="form-label">Full Name</label>
                                        <input name="fullName" value={address.fullName} onChange={handleAddressChange} className="form-input" placeholder="Full name" required />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Phone</label>
                                        <input name="phone" value={address.phone} onChange={handleAddressChange} className="form-input" placeholder="+91 XXXXX XXXXX" required />
                                    </div>
                                    <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                        <label className="form-label">Street Address</label>
                                        <input name="street" value={address.street} onChange={handleAddressChange} className="form-input" placeholder="House no, Street, Area" required />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">City</label>
                                        <input name="city" value={address.city} onChange={handleAddressChange} className="form-input" placeholder="City" required />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">State</label>
                                        <input name="state" value={address.state} onChange={handleAddressChange} className="form-input" placeholder="State" required />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Pincode</label>
                                        <input name="pincode" value={address.pincode} onChange={handleAddressChange} className="form-input" placeholder="6-digit pincode" maxLength={6} required />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right: Summary */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                        {/* Order Items */}
                        <div className="glass-card" style={{ padding: 'var(--space-lg)' }}>
                            <h4 style={{ marginBottom: 'var(--space-md)' }}>Order Items ({cart.length})</h4>
                            {cart.map(item => (
                                <div key={item.product._id} className="flex-between" style={{ padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: '0.875rem' }}>
                                    <span style={{ color: 'var(--text-secondary)' }}>{item.product.name} × {item.quantity}</span>
                                    <span>₹{((item.product.discountPrice || item.product.price) * item.quantity).toLocaleString('en-IN')}</span>
                                </div>
                            ))}
                        </div>

                        {/* Coupon */}
                        <div className="glass-card" style={{ padding: 'var(--space-lg)' }}>
                            <h4 className="flex gap-sm" style={{ marginBottom: 'var(--space-md)', alignItems: 'center' }}>
                                <FiTag style={{ color: 'var(--gold)' }} /> Coupon Code
                            </h4>
                            {coupon ? (
                                <div className="flex-between">
                                    <span className="badge badge-primary">✓ {coupon.code}</span>
                                    <button className="btn btn-glass btn-sm" onClick={() => { setCoupon(null); setCouponCode(''); }}>Remove</button>
                                </div>
                            ) : (
                                <div className="flex gap-sm">
                                    <input
                                        type="text"
                                        value={couponCode}
                                        onChange={e => setCouponCode(e.target.value.toUpperCase())}
                                        className="form-input"
                                        placeholder="Enter coupon code"
                                        style={{ flex: 1 }}
                                    />
                                    <button className="btn btn-outline btn-sm" onClick={applyCoupon} disabled={couponLoading}>
                                        {couponLoading ? '...' : 'Apply'}
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Price Summary */}
                        <div className="glass-card" style={{ padding: 'var(--space-lg)' }}>
                            <h4 style={{ marginBottom: 'var(--space-md)' }}>Price Details</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                                <div className="flex-between" style={{ fontSize: '0.9rem' }}>
                                    <span className="text-muted">Subtotal</span>
                                    <span>₹{cartTotal.toLocaleString('en-IN')}</span>
                                </div>
                                <div className="flex-between" style={{ fontSize: '0.9rem' }}>
                                    <span className="text-muted">Shipping</span>
                                    <span style={{ color: shipping === 0 ? 'var(--success)' : undefined }}>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span>
                                </div>
                                {discount > 0 && (
                                    <div className="flex-between" style={{ fontSize: '0.9rem' }}>
                                        <span className="text-muted">Discount</span>
                                        <span style={{ color: 'var(--success)' }}>-₹{discount.toLocaleString('en-IN')}</span>
                                    </div>
                                )}
                                <div style={{ borderTop: '1px solid var(--border)', paddingTop: 'var(--space-sm)' }} className="flex-between">
                                    <span style={{ fontWeight: 700 }}>Total</span>
                                    <span style={{ fontWeight: 700, fontSize: '1.2rem' }}>₹{total.toLocaleString('en-IN')}</span>
                                </div>
                            </div>
                            <button
                                className="btn btn-primary"
                                style={{ width: '100%', marginTop: 'var(--space-lg)' }}
                                onClick={handlePayment}
                                disabled={loading}
                            >
                                <FiCreditCard />
                                {loading ? 'Processing...' : `Pay ₹${total.toLocaleString('en-IN')}`}
                            </button>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: 'var(--space-sm)' }}>
                                🔒 Secured by Razorpay
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Checkout;
