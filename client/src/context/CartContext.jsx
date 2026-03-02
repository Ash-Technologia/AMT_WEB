import { createContext, useContext, useState, useEffect } from 'react';
import API from '../services/api';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
    const { user } = useAuth();
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(false);

    // Load cart from server if logged in, else from localStorage
    useEffect(() => {
        if (user) {
            fetchCart();
        } else {
            const saved = localStorage.getItem('amt_cart');
            setCart(saved ? JSON.parse(saved) : []);
        }
    }, [user]);

    // Persist guest cart to localStorage
    useEffect(() => {
        if (!user) {
            localStorage.setItem('amt_cart', JSON.stringify(cart));
        }
    }, [cart, user]);

    const fetchCart = async () => {
        try {
            const res = await API.get('/cart');
            setCart(res.data.cart || []);
        } catch (err) {
            console.error('Failed to fetch cart:', err);
        }
    };

    const addToCart = async (product, quantity = 1) => {
        if (user) {
            try {
                setLoading(true);
                const res = await API.post('/cart/add', { productId: product._id, quantity });
                setCart(res.data.cart);
                toast.success('Added to cart! 🛒');
            } catch (err) {
                toast.error(err.response?.data?.message || 'Failed to add to cart');
            } finally {
                setLoading(false);
            }
        } else {
            // Guest cart
            setCart(prev => {
                const existing = prev.find(i => i.product._id === product._id);
                if (existing) {
                    return prev.map(i => i.product._id === product._id ? { ...i, quantity: i.quantity + quantity } : i);
                }
                return [...prev, { product, quantity }];
            });
            toast.success('Added to cart! 🛒');
        }
    };

    const updateQuantity = async (productId, quantity) => {
        if (user) {
            try {
                const res = await API.put('/cart/update', { productId, quantity });
                setCart(res.data.cart);
            } catch (err) {
                toast.error('Failed to update cart');
            }
        } else {
            if (quantity <= 0) {
                removeFromCart(productId);
            } else {
                setCart(prev => prev.map(i => i.product._id === productId ? { ...i, quantity } : i));
            }
        }
    };

    const removeFromCart = async (productId) => {
        if (user) {
            try {
                await API.delete(`/cart/remove/${productId}`);
                setCart(prev => prev.filter(i => i.product._id !== productId));
                toast.success('Removed from cart');
            } catch (err) {
                toast.error('Failed to remove item');
            }
        } else {
            setCart(prev => prev.filter(i => i.product._id !== productId));
        }
    };

    const clearCart = async () => {
        if (user) {
            await API.delete('/cart/clear');
        }
        setCart([]);
        localStorage.removeItem('amt_cart');
    };

    const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartTotal = cart.reduce((sum, item) => {
        const price = item.product?.discountPrice || item.product?.price || 0;
        return sum + price * item.quantity;
    }, 0);

    return (
        <CartContext.Provider value={{ cart, loading, addToCart, updateQuantity, removeFromCart, clearCart, cartCount, cartTotal, fetchCart }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error('useCart must be used within CartProvider');
    return ctx;
};
