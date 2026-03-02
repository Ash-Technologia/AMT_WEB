import { createContext, useContext, useState, useEffect } from 'react';
import API from '../services/api';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const WishlistContext = createContext(null);

export const WishlistProvider = ({ children }) => {
    const { user } = useAuth();
    const [wishlist, setWishlist] = useState([]);

    useEffect(() => {
        if (user) fetchWishlist();
        else setWishlist([]);
    }, [user]);

    const fetchWishlist = async () => {
        try {
            const res = await API.get('/wishlist');
            setWishlist(res.data.wishlist || []);
        } catch (err) {
            console.error('Failed to fetch wishlist:', err);
        }
    };

    const toggleWishlist = async (product) => {
        if (!user) {
            toast.error('Please login to save to wishlist');
            return;
        }
        try {
            const res = await API.post(`/wishlist/toggle/${product._id}`);
            if (res.data.action === 'added') {
                setWishlist(prev => [...prev, product]);
                toast.success('Added to wishlist ❤️');
            } else {
                setWishlist(prev => prev.filter(p => p._id !== product._id));
                toast.success('Removed from wishlist');
            }
        } catch (err) {
            toast.error('Failed to update wishlist');
        }
    };

    const isInWishlist = (productId) => wishlist.some(p => p._id === productId);

    return (
        <WishlistContext.Provider value={{ wishlist, toggleWishlist, isInWishlist, fetchWishlist }}>
            {children}
        </WishlistContext.Provider>
    );
};

export const useWishlist = () => {
    const ctx = useContext(WishlistContext);
    if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
    return ctx;
};
