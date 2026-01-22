import React, { useState, useEffect, useMemo } from 'react';
import { useCart } from '../context/CartContext';
import QuickView from './QuickView';
import { db } from './firebase';
import { collection, getDocs } from 'firebase/firestore';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { usePreloader } from '../context/PreloaderContext';
import { useSearchParams } from 'react-router-dom';

function Shop() {
  const { addToCart } = useCart();
  const { showPreloader, hidePreloader } = usePreloader();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortType, setSortType] = useState('default');
  const [categoryFilter, setCategoryFilter] = useState(['All']);
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingAddToCart, setLoadingAddToCart] = useState(null);

  const categories = ['All', 'New', 'Premium', 'Budget', 'Special edition'];

  // Initialize search term from URL parameters
  useEffect(() => {
    const searchFromUrl = searchParams.get('search');
    if (searchFromUrl) {
      setSearchTerm(searchFromUrl);
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      showPreloader();
      try {
        const querySnapshot = await getDocs(collection(db, 'products'));
        const items = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setProducts(items);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
      setLoading(false);
      hidePreloader();
    };
    fetchProducts();
  }, []);

  const handleCategoryChange = (cat) => {
    if (cat === 'All') {
      setCategoryFilter(['All']);
    } else {
      setCategoryFilter(prev => {
        const newCats = prev.includes(cat)
          ? prev.filter(c => c !== cat)
          : [...prev.filter(c => c !== 'All'), cat];
        return newCats.length === 0 ? ['All'] : newCats;
      });
    }
  };

  const handleSortChange = async (e) => {
    const value = e.target.value;
    showPreloader();
    setSortType(value);
    await new Promise(res => setTimeout(res, 400));
    hidePreloader();
  };

  const handleSearchChange = async (e) => {
    const value = e.target.value;
    showPreloader();
    setSearchTerm(value);
    
    // Update URL with search parameter
    if (value.trim()) {
      setSearchParams({ search: value });
    } else {
      setSearchParams({});
    }
    
    await new Promise(res => setTimeout(res, 400));
    hidePreloader();
  };

  const filteredProducts = useMemo(() => {
    let filtered = products.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    if (!categoryFilter.includes('All')) {
      filtered = filtered.filter(
        (product) =>
          categoryFilter.includes(product?.badge)
      );
    }
    switch (sortType) {
      case 'price-asc':
        return [...filtered].sort((a, b) => a.price - b.price);
      case 'price-desc':
        return [...filtered].sort((a, b) => b.price - a.price);
      case 'alpha-asc':
        return [...filtered].sort((a, b) => a.name.localeCompare(b.name));
      case 'alpha-desc':
        return [...filtered].sort((a, b) => b.name.localeCompare(a.name));
      default:
        return filtered;
    }
  }, [products, sortType, searchTerm, categoryFilter]);

  const formatPrice = (price) => {
    const num = typeof price === 'string' ? parseFloat(price) : price;
    return isNaN(num) ? '0.00' : num.toFixed(2);
  };

  // Helper to get 20ml size object
  function get20mlSize(product) {
    if (!Array.isArray(product.sizes)) return null;
    return product.sizes.find(sz => (typeof sz === 'object' && sz.size === '20ml')) || null;
  }

  const handleAddToCart = async (product) => {
    setLoadingAddToCart(product.id);
    await new Promise(res => setTimeout(res, 600));
    
    // Get 20ml size and add it to cart with the selected size
    const size20ml = get20mlSize(product);
    const productWithSize = {
      ...product,
      selectedSize: size20ml || { size: '', price: product.price, oldPrice: product.oldPrice }
    };
    
    addToCart(productWithSize);
    setLoadingAddToCart(null);
    const offcanvas = document.getElementById('shoppingCart');
    if (offcanvas && window.bootstrap) {
      const bsOffcanvas = window.bootstrap.Offcanvas.getOrCreateInstance(offcanvas);
      bsOffcanvas.show();
    }
  };

  const handleQuickView = async (product) => {
    showPreloader();
    await new Promise(res => setTimeout(res, 400));
    setSelectedProduct(product);
    hidePreloader();
  };

  const handleCloseQuickView = () => {
    setSelectedProduct(null);
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 400 }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container px-2 px-md-4">
      <section className="" style={{ backgroundColor: '#fdfaf7' }}>
        <div className="container pt-5">
          {/* Header */}
          <div className="text-center mb-5">
            <h2 className="fw-bold text-uppercase">Welcome To Our Shop</h2>
            <div className="mx-auto mt-3" style={{ width: '60px', height: '4px', backgroundColor: 'black', borderRadius: '2px' }}></div>
          </div>
        </div>
      </section>
      <div className="row">
        {/* Sidebar */}
        <div className="col-12 col-md-3 mb-4 mb-md-0">
          <div
            className="rounded-4 shadow-sm p-4 sticky-top"
            style={{
              top: 100,
              background: 'linear-gradient(135deg, #fff 80%, #f8f5f2 100%)',
              border: '1.5px solid #e7d7c1',
              boxShadow: '0 8px 32px rgba(123, 84, 33, 0.10)',
              zIndex: 1,
            }}
          >
            {/* Search */}
            <div className="mb-4">
              <label className="form-label fw-semibold" style={{ color: '#640d14' }}>Search</label>
              <input
                type="text"
                className="form-control custom-input"
                placeholder="Search products..."
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>

            {/* Sort */}
            <div className="mb-4">
              <label className="form-label fw-semibold" style={{ color: '#640d14' }}>Sort By</label>
              <select
                className="form-select custom-input"
                value={sortType}
                onChange={handleSortChange}
              >
                <option value="default">Default</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="alpha-asc">Alphabetical: A-Z</option>
                <option value="alpha-desc">Alphabetical: Z-A</option>
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <label className="form-label fw-semibold" style={{ color: '#640d14' }}>Categories</label>
              <div className="d-flex flex-column gap-2">
                {categories.map(cat => (
                  <div key={cat} className="form-check">
                    <input
                      className="form-check-input custom-checkboxs"
                      type="checkbox"
                      checked={categoryFilter.includes(cat)}
                      id={`cat-${cat}`}
                      onChange={() => handleCategoryChange(cat)}
                      disabled={cat === 'All' && categoryFilter.length > 1}
                    />
                    <label
                      className="form-check-label fw-semibold"
                      htmlFor={`cat-${cat}`}
                      style={{ color: '#640d14', fontSize: '1.05rem' }}
                    >
                      {cat}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="col-12 col-md-9">
          <div className="row g-4">
            {filteredProducts.length === 0 && (
              <div className="col-12 text-center py-5">
                <p className="h4 text-muted">No products found.</p>
              </div>
            )}
            {filteredProducts.map((product) => (
              <div key={product.id} className="col-12 col-sm-6 col-lg-4 mb-4 px-2">
                <div
                  className="card h-100 border-0 rounded-4 position-relative overflow-hidden product-card"
                  style={{
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  }}
                >
                  <div
                    className="position-relative overflow-hidden"
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleQuickView(product)}
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-100 product-img"
                      style={{
                        height: '260px',
                        objectFit: 'cover',
                        borderTopLeftRadius: '1rem',
                        borderTopRightRadius: '1rem',
                        transition: 'transform 0.5s ease',
                      }}
                    />
                    {product.hoverImage && (
                      <img
                        src={product.hoverImage}
                        alt="hover"
                        className="position-absolute top-0 start-0 w-100 h-100 product-hover-img"
                        style={{
                          objectFit: 'cover',
                          opacity: 0,
                          transition: 'opacity 0.5s ease',
                        }}
                      />
                    )}
                    {product.isOutOfStock && (
                      <span className="badge bg-danger position-absolute top-0 end-0 m-2 px-3 py-2 fs-6 rounded-pill">
                        Out of Stock
                      </span>
                    )}
                    {product.oldPrice && (
                      <span
                        className="position-absolute top-0 start-0 m-2 px-3 py-1 rounded-pill"
                        style={{
                          background: 'linear-gradient(135deg, #ff7e5f, #feb47b)',
                          color: '#fff',
                          fontWeight: 600,
                          fontSize: '0.8rem',
                        }}
                      >
                        {Math.round(100 - (product.price / product.oldPrice) * 100)}% OFF
                      </span>
                    )}
                  </div>
                  <div className="card-body d-flex flex-column p-3">
                    <h5
                      className="card-title mb-2 fw-semibold text-dark text-truncate"
                      style={{ cursor: 'pointer', fontSize: '1.1rem' }}
                      onClick={() => handleQuickView(product)}
                    >
                      {product.name}
                    </h5>

                    <div className="mb-3">
                      {(() => {
                        const size20ml = get20mlSize(product);
                        if (size20ml) {
                          return (
                            <>
                              <span className="fw-bold fs-5" style={{ color: '#640d14' }}>
                                ₹{formatPrice(size20ml.price)}
                              </span>
                              {size20ml.oldPrice && (
                                <span className="text-muted text-decoration-line-through ms-2">
                                  ₹{formatPrice(size20ml.oldPrice)}
                                </span>
                              )}
                            </>
                          );
                        } else {
                          return (
                            <span className="fw-bold fs-5" style={{ color: '#999', fontStyle: 'italic' }}>
                              Price not available
                            </span>
                          );
                        }
                      })()}
                    </div>

                    <div className="mt-auto d-flex gap-2">
                      {!product.isOutOfStock ? (
                        <button
                          className="tf-btn btn-fill fw-medium animate-btn w-100 text-decoration-none py-2 rounded-pill mt-2"
                          onClick={() => handleAddToCart(product)}
                        >
                          <i className="bi bi-cart me-1"></i> Add to Cart
                        </button>
                      ) : (
                        <button
                          className="btn w-100 text-white fw-medium py-2"
                          style={{
                            backgroundColor: '#640d14',
                            border: 'none',
                          }}
                        >
                          Notify Me
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Hover effects */}
                <style>
                  {`
      .product-card:hover {
        transform: translateY(-8px);
        box-shadow: 0 16px 32px rgba(0,0,0,0.15);
      }
      .product-card:hover .product-img {
        transform: scale(1.05);
      }
      .product-card:hover .product-hover-img {
        opacity: 1;
      }
    `}
                </style>
              </div>

            ))}
          </div>
        </div>
      </div>
      {selectedProduct && (
        <>
          <div className="quickview-backdrop"></div>
          <QuickView
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
          />
        </>
      )}
    </div>
  );
}

export default Shop; 