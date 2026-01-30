// App.jsx
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { AdminAuthProvider } from './context/AdminAuthContext';
import { WishlistProvider } from './context/WishlistContext';
import { ToastProvider } from './context/ToastContext';
import ToastContainer from './components/ToastContainer';
// import AdminLogin from './components/AdminLogin';
import UploadItemForm from './components/UploadItemForm';
import Header from './components/Header/index';
import Footer from './assets/Footer';
import Chart from './components/Chart';
import Home from './components/HomePages/Home';
import MiniCart from './components/MiniCart';
import WhatsAppButton from './components/Whatsapp';
import Login from './components/Login';
import Signup from './components/Signup';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';
import AdminLogin from './components/AdminLogin'
import AdminDashboard from './components/AdminDashboard';
import 'owl.carousel/dist/assets/owl.carousel.css';
import 'owl.carousel/dist/assets/owl.theme.default.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import About from './components/About/About';
import Shop from './components/Shop';
import Contact from './components/Contact/Contact';
import BlogList from './components/BlogList';
import Checkout from './components/Checkout';
import ScrollToTop from './components/Scroll';
import NotFound from './components/NotFound';
// import RouteChangePreloader from './components/RouteChangePreloader';
import Category from './components/Category';
import ProductDetails from './components/ProductDetails';
import Menu, { BottomHeader } from './components/Header/Menu';
import NewArrivalsPage from './pages/NewArrivals';
import Wishlist from './pages/Wishlist';
import PerformanceMonitor from './components/PerformanceMonitor';
import ErrorBoundary from './components/ErrorBoundary';
import Orders from './pages/Orders';
import Shipping from './pages/Shipping';
import Refund from './components/Refund';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Terms from './pages/Terms';
import Account from './pages/Account';

function App() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(() => typeof window !== 'undefined' ? window.innerWidth > 991 : true);

  useEffect(() => {
    function handleResize() {
      setIsDesktop(window.innerWidth > 991);
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <AuthProvider>
      <AdminAuthProvider>
        <CartProvider>
          <WishlistProvider>
            <ToastProvider>
              <Router>
                {/* Route change preloader disabled per request */}
                <ToastContainer />
                <ScrollToTop />
                {/* <PerformanceMonitor /> */}
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/admin" element={<AdminLogin />} />
                  <Route
                    path="/bsgvbgfyhkegy4169dashboard"
                    element={
                      <AdminRoute>
                        <AdminDashboard />
                      </AdminRoute>
                    }
                  />
                  {/* Public routes */}
                  <Route
                    path="/"
                    element={
                      <ErrorBoundary>
                        <>
                          <Header />
                          <Home />
                          <Footer />
                          <MiniCart />
                        </>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path="/chart"
                    element={
                      <ErrorBoundary>
                        <>
                          <Header />
                          <Chart />
                          <Footer />
                          <MiniCart />
                        </>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path="/mini"
                    element={
                      <>
                        <Header />
                        <MiniCart />
                        <Footer />
                      </>
                    }
                  />
                  <Route
                    path="/about"
                    element={
                      <>
                        <Header />
                        <About />
                        <Footer />
                      </>
                    }
                  />
                  <Route
                    path="/category/:badge?"
                    element={
                      <>
                        <Header />
                        <Category />
                        <MiniCart />
                        <Footer />
                      </>
                    }
                  />
                  <Route
                    path="/shop"
                    element={
                      <>
                        <Header />
                        <Shop />
                        <MiniCart />
                        <Footer />
                      </>
                    }
                  />
                  <Route
                    path="/contact"
                    element={
                      <>
                        <Header />
                        <Contact />
                        <Footer />
                      </>
                    }
                  />
                  <Route
                    path="/blog"
                    element={
                      <>
                        <Header />
                        <BlogList />
                        <Footer />
                      </>
                    }
                  />
                  <Route
                    path="/product/:id"
                    element={
                      <>
                        <Header />
                        <ProductDetails />
                        <Footer />
                        <MiniCart />
                      </>
                    }
                  />
                  <Route
                    path="/new-arrivals"
                    element={
                      <>
                        <Header />
                        <NewArrivalsPage />
                        <Footer />
                      </>
                    }
                  />
                  <Route
                    path="/wishlist"
                    element={
                      <>
                        <Header />
                        <Wishlist />
                        <Footer />
                      </>
                    }
                  />
                  <Route
                    path="/orders"
                    element={
                      <>
                        <Header />
                        <Orders />
                        <Footer />
                      </>
                    }
                  />
                  <Route
                    path="/account"
                    element={
                      <>
                        <Header />
                        <Account />
                        <Footer />
                      </>
                    }
                  />

                  <Route
                    path="/shipping"
                    element={
                      <>
                        <Header />
                        <Shipping />
                        <Footer />
                      </>
                    }
                  />
                  <Route
                    path="/terms"
                    element={
                      <>
                        <Header />
                        <Terms />
                        <Footer />
                      </>
                    }
                  />
                  <Route
                    path="/privacy-policy"
                    element={
                      <>
                        <Header />
                        <PrivacyPolicy />
                        <Footer />
                      </>
                    }
                  />
                  <Route
                    path="/refund"
                    element={
                      <>
                        <Header />
                        <Refund />
                        <Footer />
                      </>
                    }
                  />
                  {/* Protected routes */}
                  <Route element={<PrivateRoute />}>
                    <Route
                      path="/checkout"
                      element={
                        <>
                          <Header />
                          <Checkout />
                          <Footer />
                        </>
                      }
                    />
                  </Route>
                  <Route
                    path="*"
                    element={
                      <>
                        <Header />
                        <NotFound />
                        <Footer />
                      </>
                    }
                  />
                </Routes>
                {!isDesktop && <BottomHeader />}
                <WhatsAppButton />
              </Router>
            </ToastProvider>
          </WishlistProvider>
        </CartProvider>
      </AdminAuthProvider>
    </AuthProvider>
  );
}

export default App;
