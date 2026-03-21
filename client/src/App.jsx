import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import Layout from './components/layout/Layout';
import AdminLayout from './components/admin/AdminLayout';
import MaintenanceGuard from './components/common/MaintenanceGuard';

// ─── Lazy-loaded Pages ────────────────────────────────────────────────────────
const Home = lazy(() => import('./pages/Home'));
const Products = lazy(() => import('./pages/Products'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Cart = lazy(() => import('./pages/Cart'));

const OrderConfirmation = lazy(() => import('./pages/OrderConfirmation'));
const OrderHistory = lazy(() => import('./pages/OrderHistory'));
const Wishlist = lazy(() => import('./pages/Wishlist'));
const Profile = lazy(() => import('./pages/Profile'));
const About = lazy(() => import('./pages/About'));
const Blog = lazy(() => import('./pages/Blog'));
const BlogDetail = lazy(() => import('./pages/BlogDetail'));
const Contact = lazy(() => import('./pages/Contact'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const TermsOfService = lazy(() => import('./pages/TermsOfService'));
const ShippingPolicy = lazy(() => import('./pages/ShippingPolicy'));
const NotFound = lazy(() => import('./pages/NotFound'));
const OrderTracking = lazy(() => import('./pages/OrderTracking'));

// ─── Admin Pages ──────────────────────────────────────────────────────────────
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminProducts = lazy(() => import('./pages/admin/AdminProducts'));
const AdminOrders = lazy(() => import('./pages/admin/AdminOrders'));
const AdminCustomers = lazy(() => import('./pages/admin/AdminCustomers'));
const AdminBlogs = lazy(() => import('./pages/admin/AdminBlogs'));
const AdminCoupons = lazy(() => import('./pages/admin/AdminCoupons'));
const AdminQueries = lazy(() => import('./pages/admin/AdminQueries'));
const AdminNewsletter = lazy(() => import('./pages/admin/AdminNewsletter'));
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings'));

// ─── Route Guards ─────────────────────────────────────────────────────────────
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="page-loader"><div className="spinner" /></div>;
  return user ? children : <Navigate to="/login" replace />;
};

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="page-loader"><div className="spinner" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
};

const GuestRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? <Navigate to="/" replace /> : children;
};

// ─── Page Loader ──────────────────────────────────────────────────────────────
const PageLoader = () => (
  <div className="page-loader">
    <div className="spinner" />
  </div>
);

// ─── App ──────────────────────────────────────────────────────────────────────
const App = () => {
  return (
    <SocketProvider>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* ─── Public Routes (with Layout) ─────────────────────────────────── */}
          <Route element={<Layout />}>

            {/* Maintenance Protected Routes (Home, Products, etc.) */}
            <Route element={<MaintenanceGuard><Outlet /></MaintenanceGuard>}>
              <Route path="/" element={<Home />} />
              <Route path="/products" element={<Products />} />
              <Route path="/products/:slug" element={<ProductDetail />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/about" element={<About />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:slug" element={<BlogDetail />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<TermsOfService />} />
              <Route path="/shipping-policy" element={<ShippingPolicy />} />


              <Route path="/order-confirmation/:id" element={<ProtectedRoute><OrderConfirmation /></ProtectedRoute>} />
              <Route path="/orders" element={<ProtectedRoute><OrderHistory /></ProtectedRoute>} />
              <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/track-order" element={<OrderTracking />} />
            </Route>

            {/* Guest-only Routes (Always Accessible) */}
            <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
            <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
            <Route path="/forgot-password" element={<GuestRoute><ForgotPassword /></GuestRoute>} />
            <Route path="/reset-password/:token" element={<GuestRoute><ResetPassword /></GuestRoute>} />
          </Route>

          {/* ─── Admin Routes (with AdminLayout) ─────────────────────────────── */}
          <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
            <Route index element={<AdminDashboard />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="customers" element={<AdminCustomers />} />
            <Route path="blogs" element={<AdminBlogs />} />
            <Route path="coupons" element={<AdminCoupons />} />
            <Route path="queries" element={<AdminQueries />} />
            <Route path="newsletter" element={<AdminNewsletter />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>

          {/* ─── 404 ─────────────────────────────────────────────────────────── */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </SocketProvider>
  );
};

export default App;
