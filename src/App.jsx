import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import Navbar from './components/Navbar/Navbar.jsx';
import Footer from './components/Footer/Footer.jsx';
import Watermark from './components/Watermark/Watermark.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Home from './pages/Home/Home.jsx';
import Login from './pages/Login/Login.jsx';
import Register from './pages/Register/Register.jsx';
import ProductDetails from './pages/ProductDetails/ProductDetails.jsx';
import Cart from './pages/Cart/Cart.jsx';
import Checkout from './pages/Checkout/Checkout.jsx';
import PaymentStatus from './pages/PaymentStatus/PaymentStatus.jsx';
import Orders from './pages/Orders/Orders.jsx';
import Profile from './pages/Profile/Profile.jsx';
import Dashboard from './pages/admin/Dashboard/Dashboard.jsx';
import AdminProducts from './pages/admin/Products.jsx';
import AdminUsers from './pages/admin/Users.jsx';
import AdminOrders from './pages/admin/Orders.jsx';
import LoadCalculator from './pages/LoadCalculator/LoadCalculator.jsx';
import About from './pages/Info/About.jsx';
import Contact from './pages/Info/Contact.jsx';
import Terms from './pages/Info/Terms.jsx';
import Privacy from './pages/Info/Privacy.jsx';
import RefundPolicy from './pages/Info/RefundPolicy.jsx';
import ShippingPolicy from './pages/Info/ShippingPolicy.jsx';
import Faq from './pages/Info/Faq.jsx';
import Support from './pages/Info/Support.jsx';
import { loadProfile } from './redux/slices/authSlice.js';
import ToastProvider from './components/Toast/ToastProvider.jsx';

const App = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const token = localStorage.getItem('eshop_token');
    if (token) {
      dispatch(loadProfile());
    }
  }, [dispatch]);

  return (
    <ToastProvider>
      <div className="app-root app-wrapper">
        <Watermark />
        <Navbar />
        <main style={{ flex: 1, position: 'relative', zIndex: 1 }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/products/:id" element={<ProductDetails />} />
            <Route
              path="/cart"
              element={
                <ProtectedRoute>
                  <Cart />
                </ProtectedRoute>
              }
            />
            <Route
              path="/checkout"
              element={
                <ProtectedRoute>
                  <Checkout />
                </ProtectedRoute>
              }
            />
            <Route
              path="/orders"
              element={
                <ProtectedRoute>
                  <Orders />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route path="/payment-status" element={<PaymentStatus />} />
            <Route path="/load-calculator" element={<LoadCalculator />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/refund-policy" element={<RefundPolicy />} />
            <Route path="/shipping-policy" element={<ShippingPolicy />} />
            <Route path="/faq" element={<Faq />} />
            <Route path="/support" element={<Support />} />
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute requireAdmin>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/products"
              element={
                <ProtectedRoute requireAdmin>
                  <AdminProducts />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute requireAdmin>
                  <AdminUsers />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/orders"
              element={
                <ProtectedRoute requireAdmin>
                  <AdminOrders />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </ToastProvider>
  );
};

export default App;
