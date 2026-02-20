import { Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Navbar from './components/Navbar/Navbar.jsx';
import Footer from './components/Footer/Footer.jsx';
import Watermark from './components/Watermark/Watermark.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import AdminLayout from './components/admin/AdminLayout/AdminLayout.jsx';
import Home from './pages/Home/Home.jsx';
import Login from './pages/Login/Login.jsx';
import Register from './pages/Register/Register.jsx';
import ProductDetails from './pages/ProductDetails/ProductDetails.jsx';
import Cart from './pages/Cart/Cart.jsx';
import Checkout from './pages/Checkout/Checkout.jsx';
import PaymentStatus from './pages/PaymentStatus/PaymentStatus.jsx';
import Orders from './pages/Orders/Orders.jsx';
import Profile from './pages/Profile/Profile.jsx';
import AdminDashboard from './pages/admin/Dashboard/Dashboard.jsx';
import AdminProducts from './pages/admin/Products.jsx';
import AdminUsers from './pages/admin/Users.jsx';
import AdminOrders from './pages/admin/Orders.jsx';
import AdminFeedback from './pages/admin/Feedback.jsx';
import About from './pages/Info/About.jsx';
import Contact from './pages/Info/Contact.jsx';
import Terms from './pages/Info/Terms.jsx';
import Privacy from './pages/Info/Privacy.jsx';
import RefundPolicy from './pages/Info/RefundPolicy.jsx';
import ShippingPolicy from './pages/Info/ShippingPolicy.jsx';
import Faq from './pages/Info/Faq.jsx';
import Support from './pages/Info/Support.jsx';
import Products from './pages/Products/Products.jsx';
import Categories from './pages/Categories/Categories.jsx';
import Wishlist from './pages/Wishlist/Wishlist.jsx';
import Notifications from './pages/Notifications/Notifications.jsx';
import SupportTickets from './pages/SupportTickets/SupportTickets.jsx';
import TicketDetail from './pages/SupportTickets/TicketDetail.jsx';
import Returns from './pages/Returns/Returns.jsx';
import { loadProfile } from './redux/slices/authSlice.js';
import ToastProvider from './components/Toast/ToastProvider.jsx';

/* Main layout — Navbar + Footer. Admins are always bounced to admin panel. */
const MainLayout = () => {
  const { user } = useSelector((s) => s.auth);
  if (user?.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  return (
    <div className="app-root app-wrapper">
      <Watermark />
      <Navbar />
      <main style={{ flex: 1, position: 'relative', zIndex: 1 }}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

/* Admin guard — outlet-based, checks admin role */
const AdminGuard = () => {
  const { user } = useSelector((s) => s.auth);
  const location = useLocation();
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  if (user.role !== 'admin') return <Navigate to="/" replace />;
  return <Outlet />;
};

const App = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const token = localStorage.getItem('eshop_token');
    if (token) dispatch(loadProfile());
  }, [dispatch]);

  return (
    <ToastProvider>
      <Routes>
        {/* ── Admin (isolated — no Navbar/Footer) ── */}
        <Route element={<AdminGuard />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="feedback" element={<AdminFeedback />} />
          </Route>
        </Route>

        {/* ── Main app (with Navbar + Footer) ── */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/products" element={<Products />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/products/:id" element={<ProductDetails />} />
          <Route path="/payment-status" element={<PaymentStatus />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/refund-policy" element={<RefundPolicy />} />
          <Route path="/shipping-policy" element={<ShippingPolicy />} />
          <Route path="/faq" element={<Faq />} />
          <Route path="/support" element={<Support />} />

          {/* Protected user routes */}
          <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
          <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
          <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
          <Route path="/support/tickets" element={<ProtectedRoute><SupportTickets /></ProtectedRoute>} />
          <Route path="/support/tickets/:id" element={<ProtectedRoute><TicketDetail /></ProtectedRoute>} />
          <Route path="/returns" element={<ProtectedRoute><Returns /></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </ToastProvider>
  );
};

export default App;

