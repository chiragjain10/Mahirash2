import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { db } from './firebase';
import { collection, getDocs } from 'firebase/firestore';
import { usePreloader } from '../context/PreloaderContext';
import QuickView from './QuickView';
import WishlistButton from './WishlistButton';
import { useCart } from '../context/CartContext';
import './WishlistButton.css';

const BADGES = ['All', 'New', 'Premium', 'Budget', 'Clearence', 'Special Edition', 'Sale'];
const COLLECTIONS = ['Woody', 'Citrus', 'Flower', 'Aromatic'];
const CATEGORIES = ['All', 'New', 'Premium', 'Budget', 'Clearence', 'Special Edition', 'Sale'];
const ITEMS_PER_PAGE = 9;
const GENDERS = ['All', 'Men', 'Women', 'Unisex'];
const PERFUME_NOTES = ['Woody', 'Citrus', 'Flower', 'Aromatic'];
const SIZE_RANGES = [
  { id: 'all', label: 'All Sizes', min: 0, max: Infinity },
  { id: '1-10', label: '1-10ml', min: 1, max: 10 },
  { id: '10-20', label: '10-20ml', min: 10, max: 20 },
  { id: '20-50', label: '20-50ml', min: 20, max: 50 },
  { id: '50-100', label: '50-100ml', min: 50, max: 100 },
  { id: '100+', label: '>100ml', min: 101, max: Infinity }
];

const Category = () => {
  const { badge } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { showPreloader, hidePreloader } = usePreloader();
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeBadge, setActiveBadge] = useState(badge ? decodeURIComponent(badge) : 'All');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  // Sidebar states
  const [sortType, setSortType] = useState('default');
  const [categoryFilter, setCategoryFilter] = useState(['All']);
  const [searchTerm, setSearchTerm] = useState('');
  const [genderFilter, setGenderFilter] = useState('All');
  const [sizeFilter, setSizeFilter] = useState('all');
  const [priceFilter, setPriceFilter] = useState('');
  const [noteFilter, setNoteFilter] = useState('');
  // Loading states for action buttons
  const [loadingQuickView, setLoadingQuickView] = useState(null);
  const [loadingAddToCart, setLoadingAddToCart] = useState(null);

  // Initialize search term from URL parameters
  useEffect(() => {
    const searchFromUrl = searchParams.get('search');
    if (searchFromUrl) {
      setSearchTerm(searchFromUrl);
    }
  }, [searchParams]);

  useEffect(() => {
    setActiveBadge(badge ? decodeURIComponent(badge) : 'All');
    setCurrentPage(1); // Reset to first page when badge changes
  }, [badge]);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, 'products'));
        const items = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setProducts(items);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Cleanup preloader when component unmounts
  useEffect(() => {
    return () => {
      hidePreloader();
    };
  }, [hidePreloader]);

  // Read price filter from query string
  useEffect(() => {
    const p = (searchParams.get('price') || '').trim();
    if (p) setPriceFilter(p); else setPriceFilter('');
  }, [searchParams]);

  useEffect(() => {
    const noteParam = (searchParams.get('note') || '').trim();
    setNoteFilter(noteParam);
  }, [searchParams]);

  // Read gender filter from query string
  useEffect(() => {
    const genderParam = (searchParams.get('gender') || '').trim();
    if (genderParam && GENDERS.includes(genderParam)) {
      setGenderFilter(genderParam);
    }
  }, [searchParams]);

  // Read size filter from query string
  useEffect(() => {
    const sizeParam = (searchParams.get('size') || '').trim();
    if (sizeParam) {
      // Check if the size parameter matches any of the SIZE_RANGES IDs
      const validSizeId = SIZE_RANGES.find(range => range.id === sizeParam);
      if (validSizeId) {
        setSizeFilter(sizeParam);
      } else {
        setSizeFilter('all');
      }
    } else {
      setSizeFilter('all');
    }
  }, [searchParams]);

  // Apply brand pre-filter from query param if present
  useEffect(() => {
    const urlBrand = (searchParams.get('brand') || '').trim();
    if (urlBrand) {
      // Repurpose activeBadge to reflect brand chip in header if needed
      setActiveBadge('All');
      // Add brand to search to leverage existing search filter path
      setSearchTerm(urlBrand);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Sidebar handlers
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
    setCurrentPage(1); // Reset to first page when filter changes
  };

  const handleSortChange = async (e) => {
    const value = e.target.value;
    setSortType(value);
    setCurrentPage(1); // Reset to first page when sort changes
  };

  const handleGenderChange = (g) => {
    setGenderFilter(g);
    setCurrentPage(1);
  };

  const handleSizeChange = (sizeId) => {
    setSizeFilter(sizeId);
    setCurrentPage(1);
    // Update URL with size parameter
    if (sizeId === 'all') {
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('size');
      setSearchParams(newParams);
    } else {
      setSearchParams({ ...Object.fromEntries(searchParams), size: sizeId });
    }
  };

  const handleSearchChange = async (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page when search changes

    // Update URL with search parameter
    if (value.trim()) {
      setSearchParams({ search: value });
    } else {
      setSearchParams({});
    }
  };

  // Get the lowest price from all available sizes
  const getLowestPrice = (product) => {
    if (!product.sizes || !Array.isArray(product.sizes) || product.sizes.length === 0) {
      // Fallback to product.price if sizes array doesn't exist
      const fallbackPrice = typeof product.price === 'string' ? parseFloat(product.price) : product.price;
      return typeof fallbackPrice === 'number' && !isNaN(fallbackPrice) ? fallbackPrice : Infinity;
    }

    const prices = product.sizes
      .map(size => {
        const price = typeof size.price === 'string' ? parseFloat(size.price) : size.price;
        return typeof price === 'number' && !isNaN(price) ? price : null;
      })
      .filter(price => price !== null);

    if (prices.length === 0) {
      // Fallback to product.price if no valid prices in sizes
      const fallbackPrice = typeof product.price === 'string' ? parseFloat(product.price) : product.price;
      return typeof fallbackPrice === 'number' && !isNaN(fallbackPrice) ? fallbackPrice : Infinity;
    }

    return Math.min(...prices);
  };

  // Filtering, sorting, and search logic
  const filteredProducts = useMemo(() => {
    let filtered = products;
    // Badge/collection filter (top bar)
    const appliedNote = noteFilter || (PERFUME_NOTES.includes(activeBadge) ? activeBadge : '');
    if (appliedNote) {
      filtered = filtered.filter(
        (product) => (product?.note || '').toString().toLowerCase() === appliedNote.toLowerCase()
      );
    } else if (activeBadge !== 'All') {
      if (BADGES.includes(activeBadge)) {
        filtered = filtered.filter(
          (product) => product?.badge?.toLowerCase() === activeBadge.toLowerCase()
        );
      } else {
        filtered = filtered.filter(
          (product) =>
            product?.data &&
            product.data.toLowerCase().includes(activeBadge.toLowerCase())
        );
      }
    }
    // Brand filter via query param: prioritize exact brand match if provided
    const brandParam = (searchParams.get('brand') || '').trim();
    if (brandParam) {
      filtered = filtered.filter(product => (product?.brand || '').toString().toLowerCase() === brandParam.toLowerCase());
    } else {
      // Sidebar search
      if (searchTerm) {
        filtered = filtered.filter(product =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (product.brand && product.brand.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      }
    }
    // Sidebar category filter
    if (!categoryFilter.includes('All')) {
      filtered = filtered.filter(
        (product) =>
          categoryFilter.includes(product?.badge)
      );
    }
    // Gender filter (optional)
    if (genderFilter !== 'All') {
      filtered = filtered.filter(product => {
        const g = (product?.gender || '').toString().toLowerCase();
        return g === genderFilter.toLowerCase();
      });
    }
    // Price filter by selected size price
    if (priceFilter) {
      filtered = filtered.filter(product => {
        if (!product.sizes || !Array.isArray(product.sizes)) return false;
        const prices = product.sizes
          .map(s => (typeof s.price === 'string' ? parseFloat(s.price) : s.price))
          .filter(p => typeof p === 'number' && !isNaN(p));
        if (prices.length === 0) return false;
        const inAny = (min, max) => prices.some(p => p >= min && p <= max);
        switch (priceFilter) {
          case 'lt1000':
            return prices.some(p => p < 1000);
          case '1000-2500':
            return inAny(1000, 2500);
          case '2500-5000':
            return inAny(2500, 5000);
          case '5000-10000':
            return inAny(5000, 10000);
          case '10000+':
            return prices.some(p => p >= 10000);
          default:
            return true;
        }
      });
    }

    // Size filter
    if (sizeFilter !== 'all') {
      filtered = filtered.filter(product => {
        if (!product.sizes || !Array.isArray(product.sizes)) return false;

        const selectedRange = SIZE_RANGES.find(range => range.id === sizeFilter);
        if (!selectedRange) return false;

        // Check if any size in the product matches the selected range
        return product.sizes.some(size => {
          if (!size.size) return false;

          // Extract numeric value from size string (e.g., "50ml" -> 50)
          const sizeMatch = size.size.toString().match(/(\d+(?:\.\d+)?)/);
          if (!sizeMatch) return false;

          const sizeValue = parseFloat(sizeMatch[1]);
          return sizeValue >= selectedRange.min && sizeValue <= selectedRange.max;
        });
      });
    }
    // Sidebar sort
    switch (sortType) {
      case 'price-asc':
        return [...filtered].sort((a, b) => {
          const priceA = getLowestPrice(a);
          const priceB = getLowestPrice(b);
          return priceA - priceB;
        });
      case 'price-desc':
        return [...filtered].sort((a, b) => {
          const priceA = getLowestPrice(a);
          const priceB = getLowestPrice(b);
          return priceB - priceA;
        });
      case 'alpha-asc':
        return [...filtered].sort((a, b) => a.name.localeCompare(b.name));
      case 'alpha-desc':
        return [...filtered].sort((a, b) => b.name.localeCompare(a.name));
      default:
        return filtered;
    }
  }, [products, activeBadge, searchTerm, categoryFilter, sortType, genderFilter, sizeFilter, priceFilter, noteFilter]);

  // Pagination logic
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const formatPrice = (price) => {
    if (!price) return '0.00';
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return isNaN(numPrice) ? '0.00' : numPrice.toFixed(2);
  };

  // Get the appropriate size based on current size filter and product
  const getSelectedSize = (product) => {
    if (!product.sizes || !Array.isArray(product.sizes) || product.sizes.length === 0) {
      return null;
    }

    // If size filter is set to a specific range, find the best matching size
    if (sizeFilter !== 'all') {
      const selectedRange = SIZE_RANGES.find(range => range.id === sizeFilter);
      if (selectedRange) {
        // Find sizes within the selected range
        const sizesInRange = product.sizes.filter(size => {
          if (!size.size) return false;
          const sizeMatch = size.size.toString().match(/(\d+(?:\.\d+)?)/);
          if (!sizeMatch) return false;
          const sizeValue = parseFloat(sizeMatch[1]);
          return sizeValue >= selectedRange.min && sizeValue <= selectedRange.max;
        });

        if (sizesInRange.length > 0) {
          // Return the first available size in the range (usually the smallest)
          return sizesInRange[0];
        }
      }
    }

    // Default: Try to get 50ml first, then fallback to lowest available size
    const size50ml = product.sizes.find(size => size.size === '50ml');
    if (size50ml) {
      return size50ml;
    }

    // If no 50ml, get the lowest available size
    const sortedSizes = product.sizes
      .filter(size => size.size && size.price)
      .sort((a, b) => {
        const aMatch = a.size.toString().match(/(\d+(?:\.\d+)?)/);
        const bMatch = b.size.toString().match(/(\d+(?:\.\d+)?)/);
        if (!aMatch || !bMatch) return 0;
        return parseFloat(aMatch[1]) - parseFloat(bMatch[1]);
      });

    return sortedSizes[0] || null;
  };

  // Get the primary image based on selected size
  const getPrimaryImage = (product) => {
    const selectedSize = getSelectedSize(product);
    if (selectedSize && Array.isArray(selectedSize.images) && selectedSize.images[0]) {
      return selectedSize.images[0];
    }
    // Fallback to first available image from any size
    if (product.sizes && Array.isArray(product.sizes)) {
      for (const size of product.sizes) {
        if (size.images && Array.isArray(size.images) && size.images[0]) {
          return size.images[0];
        }
      }
    }
    return product.image; // Final fallback
  };

  // Get the price information for the selected size
  const getSelectedSizePrice = (product) => {
    const selectedSize = getSelectedSize(product);
    if (!selectedSize) {
      return { price: null, oldPrice: null, size: null };
    }
    return {
      price: selectedSize.price,
      oldPrice: selectedSize.oldPrice,
      size: selectedSize.size
    };
  };

  // Get available sizes for display
  const getAvailableSizes = (product) => {
    if (!product.sizes || !Array.isArray(product.sizes)) return [];
    return product.sizes
      .filter(size => size.size && size.price)
      .map(size => size.size)
      .sort((a, b) => {
        const aNum = parseFloat(a.toString().match(/(\d+(?:\.\d+)?)/)?.[1] || 0);
        const bNum = parseFloat(b.toString().match(/(\d+(?:\.\d+)?)/)?.[1] || 0);
        return aNum - bNum;
      });
  };

  // Handle add to cart with selected size
  const handleAddToCart = async (product) => {
    setLoadingAddToCart(product.id);
    await new Promise(res => setTimeout(res, 600));

    const selectedSize = getSelectedSize(product);
    const productWithSize = {
      ...product,
      selectedSize: selectedSize || { size: '', price: product.price, oldPrice: product.oldPrice }
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
    setLoadingQuickView(product.id);
    await new Promise(res => setTimeout(res, 400));
    setSelectedProduct(product);
    setLoadingQuickView(null);
  };

  // Helper function to get category icon and color
  const getCategoryInfo = (badge) => {
    if (!badge) return { icon: 'fa-tag', color: '#640d14', bg: '#640d14' };
    
    const badgeLower = badge.toLowerCase();
    switch (badgeLower) {
      case 'new':
        return { icon: 'fa-star', color: '#fff', bg: 'linear-gradient(135deg, #3FC53A, #4CAF50)' };
      case 'premium':
        return { icon: 'fa-crown', color: '#fff', bg: 'linear-gradient(135deg, #C9B37E, #D4B04C)' };
      case 'budget':
        return { icon: 'fa-tags', color: '#fff', bg: 'linear-gradient(135deg, #2196F3, #1976D2)' };
      case 'clearence':
        return { icon: 'fa-fire', color: '#fff', bg: 'linear-gradient(135deg, #FF6B35, #F7931E)' };
      case 'special edition':
        return { icon: 'fa-gem', color: '#fff', bg: 'linear-gradient(135deg, #A63A27, #D32F2F)' };
      case 'sale':
        return { icon: 'fa-percent', color: '#fff', bg: 'linear-gradient(135deg, #E91E63, #C2185B)' };
      default:
        return { icon: 'fa-tag', color: '#fff', bg: 'linear-gradient(135deg, #640d14, #9b7645)' };
    }
  };

  return (
    <div className="container pb-4 px-2 px-md-4">
      <section className="pt-5">
        <div className="container">
          {/* Header */}
          <div className="text-center mb-5 ">
            <h2 className="fw-bold text-uppercase">Shop by Category</h2>
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
              background: 'linear-gradient(145deg, #ffffff 0%, #fafafa 100%)',
              border: '2px solid #e7d7c1',
              boxShadow: '0 12px 40px rgba(127, 89, 40, 0.12)',
              zIndex: 10,
              backdropFilter: 'blur(10px)',
            }}
          >
            {/* Header */}
            <div className="text-center mb-4 pb-3 border-bottom border-2" style={{ borderColor: '#e7d7c1' }}>
              <h5 className="fw-bold mb-0" style={{ color: '#640d14', fontSize: '1.1rem' }}>
                <i className="fas fa-filter me-2"></i>
                Filters & Search
              </h5>
              <div className="mt-2" style={{ width: '40px', height: '3px', backgroundColor: '#640d14', borderRadius: '2px', margin: '0 auto' }}></div>
            </div>

            {/* Search Section */}
            <div className="filter-section mb-4">
              <label className="form-label fw-semibold mb-3" style={{ color: '#640d14', fontSize: '0.95rem' }}>
                <i className="fas fa-search me-2"></i>Search Products
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="Search by product name..."
                value={searchTerm}
                onChange={handleSearchChange}
                style={{
                  border: '2px solid #e7d7c1',
                  borderRadius: '10px',
                  padding: '10px 14px',
                  fontSize: '0.9rem',
                  background: '#fff',
                  transition: 'all 0.3s ease',
                }}
              />
            </div>

            <div className="filter-section mb-4">
              <label className="form-label fw-semibold mb-3" style={{ color: '#640d14', fontSize: '0.95rem' }}>
                <i className="fas fa-sort me-2"></i>Sort By
              </label>
              <div className="d-flex flex-column gap-2">
                {[
                  { value: 'default', label: 'Default', icon: 'fas fa-th' },
                  { value: 'price-asc', label: 'Price: Low to High', icon: 'fas fa-sort-amount-down' },
                  { value: 'price-desc', label: 'Price: High to Low', icon: 'fas fa-sort-amount-up' },
                  { value: 'alpha-asc', label: 'Name: A to Z', icon: 'fas fa-sort-alpha-down' },
                  { value: 'alpha-desc', label: 'Name: Z to A', icon: 'fas fa-sort-alpha-up' }
                ].map(option => (
                  <div key={option.value} className="sort-option">
                    <input
                      type="radio"
                      className="btn-check"
                      name="sortOptions"
                      id={`sort-${option.value}`}
                      value={option.value}
                      checked={sortType === option.value}
                      onChange={handleSortChange}
                    />
                    <label
                      className="btn btn-outline-light w-100 text-start"
                      htmlFor={`sort-${option.value}`}
                      style={{
                        border: '2px solid #e7d7c1',
                        borderRadius: '10px',
                        padding: '10px 14px',
                        fontSize: '0.85rem',
                        color: sortType === option.value ? '#fff' : '#640d14',
                        background: sortType === option.value ? '#640d14' : '#fff',
                        transition: 'all 0.3s ease',
                        cursor: 'pointer',
                        fontWeight: sortType === option.value ? '600' : '500',
                      }}
                    >
                      <i className={`${option.icon} me-2`} style={{ fontSize: '0.8rem' }}></i>
                      {option.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Category Filter Section */}
            <div className="filter-section">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <label className="form-label fw-semibold mb-0" style={{ color: '#640d14', fontSize: '0.95rem' }}>
                  <i className="fas fa-tags me-2"></i>Categories
                </label>
                {categoryFilter.length > 1 && (
                  <button
                    onClick={() => setCategoryFilter(['All'])}
                    className="btn btn-sm p-0"
                    style={{ color: '#640d14', fontSize: '0.8rem' }}
                  >
                    <small>Clear all</small>
                  </button>
                )}
              </div>

              <div className="d-flex flex-column gap-2">
                {CATEGORIES.map(cat => (
                  <div key={cat} className="category-option">
                    <div className="form-check d-flex align-items-center">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={categoryFilter.includes(cat)}
                        id={`cat-${cat}`}
                        onChange={() => handleCategoryChange(cat)}
                        disabled={cat === 'All' && categoryFilter.length > 1}
                        style={{
                          width: '18px',
                          height: '18px',
                          border: '2px solid #640d14',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          marginRight: '12px',
                        }}
                      />
                      <label
                        className="form-check-label d-flex align-items-center justify-content-between w-100"
                        htmlFor={`cat-${cat}`}
                        style={{
                          color: categoryFilter.includes(cat) ? '#640d14' : '#640d14',
                          fontSize: '0.9rem',
                          fontWeight: categoryFilter.includes(cat) ? '600' : '500',
                          cursor: 'pointer',
                          padding: '8px 0',
                          transition: 'all 0.3s ease',
                        }}
                      >
                        <span>
                          <i className={`fas ${cat === 'All' ? 'fa-th-large' : cat === 'New' ? 'fa-star' : cat === 'Premium' ? 'fa-crown' : cat === 'Budget' ? 'fa-tags' : cat === 'Clearence' ? 'fa-fire' : cat === 'Sale' ? 'fa-percent' : 'fa-gem'} me-2`} style={{ fontSize: '0.8rem' }}></i>
                          {cat}
                        </span>
                        {categoryFilter.includes(cat) && cat !== 'All' && (
                          <span className="badge rounded-pill" style={{
                            background: '#640d14',
                            fontSize: '0.7rem',
                            padding: '4px 8px'
                          }}>
                            Active
                          </span>
                        )}
                      </label>
                    </div>
                  </div>
                ))}
              </div>

              {/* Active Filters Summary */}
              {categoryFilter.length > 1 && (
                <div className="mt-3 p-3 rounded-3" style={{
                  background: 'linear-gradient(135deg, #f8f5f2 0%, #fff 100%)',
                  border: '1px solid #e7d7c1'
                }}>
                  <small className="fw-semibold" style={{ color: '#640d14' }}>
                    <i className="fas fa-filter me-1"></i>
                    Active filters: {categoryFilter.filter(cat => cat !== 'All').join(', ')}
                  </small>
                </div>
              )}
            </div>

            {/* Gender Filter Section */}
            <div className="filter-section mt-4">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <label className="form-label fw-semibold mb-0" style={{ color: '#640d14', fontSize: '0.95rem' }}>
                  <i className="fas fa-venus-mars me-2"></i>Gender
                </label>
              </div>
              <div className="d-flex flex-wrap gap-2">
                {GENDERS.map(g => (
                  <button
                    key={g}
                    className={`btn btn-sm ${genderFilter === g ? 'btn-dark' : 'btn-outline-light'}`}
                    onClick={() => handleGenderChange(g)}
                    style={{
                      border: '2px solid #e7d7c1',
                      borderRadius: '10px',
                      color: genderFilter === g ? '#fff' : '#640d14',
                      background: genderFilter === g ? '#640d14' : '#fff',
                      padding: '6px 12px',
                      fontSize: '0.8rem'
                    }}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* Size Filter Section */}
            <div className="filter-section mt-4">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <label className="form-label fw-semibold mb-0" style={{ color: '#640d14', fontSize: '0.95rem' }}>
                  <i className="fas fa-ruler-combined me-2"></i>Size Filter
                </label>
                {sizeFilter !== 'all' && (
                  <button
                    onClick={() => setSizeFilter('all')}
                    className="btn btn-sm p-0"
                    style={{ color: '#640d14', fontSize: '0.8rem' }}
                  >
                    <small>Clear size</small>
                  </button>
                )}
              </div>
              <div className="d-flex flex-wrap gap-2">
                {SIZE_RANGES.map(range => (
                  <button
                    key={range.id}
                    className={`btn btn-sm size-filter-btn ${sizeFilter === range.id ? 'btn-dark' : 'btn-outline-light'}`}
                    onClick={() => handleSizeChange(range.id)}
                    style={{
                      border: '2px solid #e7d7c1',
                      borderRadius: '10px',
                      color: sizeFilter === range.id ? '#fff' : '#640d14',
                      background: sizeFilter === range.id ? '#640d14' : '#fff',
                      padding: '6px 12px',
                      fontSize: '0.8rem',
                      transition: 'all 0.3s ease'
                    }}
                    title={`Show products with sizes ${range.label}`}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
              {sizeFilter !== 'all' && (
                <div className="mt-2 p-2 rounded-3" style={{
                  background: 'linear-gradient(135deg, #f8f5f2 0%, #fff 100%)',
                  border: '1px solid #e7d7c1',
                  fontSize: '0.8rem'
                }}>
                  <small className="fw-semibold" style={{ color: '#640d14' }}>
                    <i className="fas fa-info-circle me-1"></i>
                    Showing products with sizes {SIZE_RANGES.find(r => r.id === sizeFilter)?.label}
                  </small>
                </div>
              )}
            </div>

            {/* Results Summary */}
            <div className="mt-4 pt-3 border-top border-2" style={{ borderColor: '#e7d7c1' }}>
              <div className="d-flex justify-content-between align-items-center">
                <small className="text-muted">
                  <i className="fas fa-info-circle me-1"></i>
                  {filteredProducts.length} products
                  {sizeFilter !== 'all' && (
                    <span className="ms-2" style={{ color: '#640d14', fontWeight: '600' }}>
                      • {SIZE_RANGES.find(r => r.id === sizeFilter)?.label}
                    </span>
                  )}
                </small>
                {(searchTerm || sortType !== 'default' || !categoryFilter.includes('All') || genderFilter !== 'All' || sizeFilter !== 'all') && (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setSortType('default');
                      setCategoryFilter(['All']);
                      setGenderFilter('All');
                      setSizeFilter('all');
                    }}
                    className="btn btn-sm"
                    style={{
                      background: 'transparent',
                      border: '1px solid #640d14',
                      color: '#640d14',
                      borderRadius: '8px',
                      fontSize: '0.8rem',
                      padding: '4px 12px',
                    }}
                  >
                    <i className="fas fa-undo me-1"></i>
                    Reset
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Enhanced Styles */}
          <style>
            {`
              .filter-section {
                transition: all 0.3s ease;
              }
              
                                   .sort-option label:hover {
                       transform: translateY(-1px);
                       box-shadow: 0 4px 12px rgba(100, 13, 20, 0.15);
                     }
              
                                   .category-option label:hover {
                       color: #640d14 !important;
                       transform: translateX(2px);
                     }
              
                              .form-check-input:checked {
                  background-color: #640d14 !important;
                  border-color: #640d14 !important;
                }
              
                              .form-check-input:focus {
                  box-shadow: 0 0 0 0.2rem rgba(100, 13, 20, 0.25) !important;
                }
              
                              input[type="text"]:focus {
                  border-color: #640d14 !important;
                  box-shadow: 0 0 0 0.2rem rgba(100, 13, 20, 0.25) !important;
                }
              
                              .btn-check:checked + .btn {
                  background-color: #640d14 !important;
                  border-color: #640d14 !important;
                  transform: scale(1.02);
                }
              
              /* Animation for filter changes */
              .filter-section {
                animation: fadeInUp 0.4s ease;
              }
              
              @keyframes fadeInUp {
                from {
                  opacity: 0;
                  transform: translateY(10px);
                }
                to {
                  opacity: 1;
                  transform: translateY(0);
                }
              }
              
              /* Responsive adjustments */
              @media (max-width: 768px) {
                .sticky-top {
                  position: relative !important;
                  top: 0 !important;
                }
              }
              
              /* Size filter button styles */
              .size-filter-btn {
                transition: all 0.3s ease;
              }
              
              .size-filter-btn:hover {
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(100, 13, 20, 0.15);
              }
              
              /* Size badge styles */
              .size-badge {
                transition: all 0.3s ease;
                border: 1px solid rgba(100, 13, 20, 0.2);
              }
              
              .size-badge:hover {
                background: rgba(100, 13, 20, 0.2) !important;
                transform: scale(1.05);
              }
              
              /* Active size filter indicator */
              .size-filter-btn.active {
                position: relative;
                overflow: hidden;
              }
              
              .size-filter-btn.active::after {
                content: '';
                position: absolute;
                bottom: 0;
                left: 0;
                width: 100%;
                height: 3px;
                background: #fff;
                border-radius: 2px;
              }
              
              /* Available sizes display */
              .available-sizes {
                opacity: 0.8;
                transition: opacity 0.3s ease;
              }
              
              .product-card:hover .available-sizes {
                opacity: 1;
              }
            `}
          </style>
        </div>
        {/* Main Content */}
        <div className="col-12 col-md-9">
          {/* Top badge navigation */}


          {/* Results Info */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div className="d-flex align-items-center gap-3">
              <p className="text-muted mb-0">
                Showing {startIndex + 1}-{Math.min(endIndex, filteredProducts.length)} of {filteredProducts.length} products
              </p>
              {(sizeFilter !== 'all' || priceFilter) && (
                <span className="badge" style={{
                  background: 'linear-gradient(135deg, #640d14, #9b7645)',
                  color: '#fff',
                  fontSize: '0.75rem',
                  padding: '6px 12px',
                  borderRadius: '20px',
                  border: '1px solid rgba(255,255,255,0.2)'
                }}>
                  <i className="fas fa-ruler me-1"></i>
                  {sizeFilter !== 'all' ? SIZE_RANGES.find(r => r.id === sizeFilter)?.label : null}
                  {priceFilter ? (sizeFilter !== 'all' ? ' • ' : '') + `Price: ${priceFilter === 'lt1000' ? '< ₹1000' :
                    priceFilter === '1000-2500' ? '₹1000-₹2500' :
                      priceFilter === '2500-5000' ? '₹2500-₹5000' :
                        priceFilter === '5000-10000' ? '₹5000-₹10000' :
                          '₹10000+'
                    }` : null}
                </span>
              )}
            </div>
            {(sizeFilter !== 'all' || priceFilter) && (
              <button
                onClick={() => { setSizeFilter('all'); setPriceFilter(''); setSearchParams({}); }}
                className="btn btn-sm"
                style={{
                  background: 'transparent',
                  border: '1px solid #640d14',
                  color: '#640d14',
                  borderRadius: '8px',
                  fontSize: '0.8rem',
                  padding: '4px 12px',
                }}
              >
                <i className="fas fa-times me-1"></i>
                Clear Filters
              </button>
            )}
          </div>

          <div className="row g-4 mx-1">
            {loading && (
              Array.from({ length: ITEMS_PER_PAGE }).map((_, idx) => (
                <div className="col-12 col-md-6 col-lg-4 mb-4 px-2" key={`skeleton-${idx}`}>
                  <div
                    className="h-100 position-relative"
                    style={{
                      cursor: 'default',
                      background: 'linear-gradient(145deg, #ffffff 0%, #fafafa 100%)',
                      borderRadius: '20px',
                      boxShadow: '0 8px 25px rgba(0,0,0,0.08)',
                      border: '1px solid rgba(231, 215, 193, 0.3)',
                      overflow: 'hidden',
                    }}
                  >
                    <div className="position-relative" style={{ height: 280 }}>
                      <div
                        className="skeleton shimmer"
                        style={{ width: '100%', height: '100%' }}
                      ></div>
                    </div>
                    <div className="px-3 py-4">
                      <div className="skeleton shimmer" style={{ height: 16, width: '60%', borderRadius: 6 }}></div>
                      <div className="skeleton shimmer mt-2" style={{ height: 14, width: '80%', borderRadius: 6 }}></div>
                      <div className="d-flex align-items-center gap-2 mt-3">
                        <div className="skeleton shimmer" style={{ height: 18, width: 90, borderRadius: 6 }}></div>
                        <div className="skeleton shimmer" style={{ height: 14, width: 60, borderRadius: 6 }}></div>
                        <div className="skeleton shimmer ms-2" style={{ height: 16, width: 40, borderRadius: 4 }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
            {currentProducts.length === 0 && !loading && (
              <div className="col-12 text-center py-5">
                <p className="h4 text-muted">No products found in this category.</p>
              </div>
            )}
            {!loading && currentProducts.map(product => (
              <div className="col-12 col-md-6 col-lg-4 mb-4 px-2" key={product.id}>
                <div
                  className="product-card h-100 position-relative"
                  onClick={(e) => {
                    // Only navigate if the click is not on an action button
                    if (!e.target.closest('.action-btn') && !e.target.closest('.quick-actions')) {
                      navigate(`/product/${product.id}`);
                    }
                  }}
                  style={{
                    cursor: 'pointer',
                    background: 'linear-gradient(145deg, #ffffff 0%, #fafafa 100%)',
                    borderRadius: '20px',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.08)',
                    transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                    border: '1px solid rgba(231, 215, 193, 0.3)',
                    overflow: 'hidden',
                  }}
                >
                  {/* Product Image Container */}
                  <div className="product-image-container position-relative" style={{ height: 280 }}>
                    <img
                      src={getPrimaryImage(product)}
                      alt={product.name}
                      className="product-image w-100 h-100"
                      style={{
                        objectFit: 'cover',
                        transition: 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                        filter: product.isOutOfStock ? 'grayscale(0.6) opacity(0.85)' : undefined,
                      }}
                    />

                    {/* Badge with Icon */}
                    {product.badge && (() => {
                      const categoryInfo = getCategoryInfo(product.badge);
                      return (
                        <div
                          className="badge-container position-absolute top-0 start-0 m-3 d-flex align-items-center gap-2"
                          style={{
                            background: categoryInfo.bg,
                            color: categoryInfo.color,
                            fontWeight: 700,
                            fontSize: '0.75rem',
                            padding: '8px 16px',
                            borderRadius: '25px',
                            boxShadow: '0 4px 15px rgba(127, 89, 40, 0.3)',
                            letterSpacing: '0.5px',
                            textTransform: 'uppercase',
                          }}
                        >
                          <i className={`fas ${categoryInfo.icon}`} style={{ fontSize: '0.7rem' }}></i>
                          <span>{product.badge}</span>
                        </div>
                      );
                    })()}

                    {/* Out of Stock Overlay */}
                    {product.isOutOfStock && (
                      <div
                        className="out-of-stock-overlay position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
                        style={{
                          background: 'rgba(0,0,0,0.45)',
                          color: '#fff',
                          fontWeight: 700,
                          letterSpacing: '0.5px',
                          textTransform: 'uppercase',
                          zIndex: 12,
                        }}
                      >
                        <span style={{
                          background: 'rgba(255,255,255,0.15)',
                          padding: '8px 14px',
                          borderRadius: '999px',
                          border: '1px solid rgba(255,255,255,0.3)'
                        }}>
                          Out of Stock
                        </span>
                      </div>
                    )}

                    {/* Quick Actions Overlay */}
                    <div className="quick-actions position-absolute top-0 end-0 m-3 d-flex flex-column gap-2" style={{ zIndex: 10 }}>
                      <WishlistButton
                        product={product}
                        className="action-btn"
                        style={{
                          opacity: 0,
                          transform: 'translateX(20px)',
                          zIndex: 15,
                          minWidth: '40px',
                          minHeight: '40px',
                        }}
                      />
                      <button
                        className="action-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          if (product.isOutOfStock) return;
                          handleQuickView(product);
                        }}
                        disabled={product.isOutOfStock || loadingQuickView === product.id}
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          background: 'rgba(255, 255, 255, 0.95)',
                          border: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                          transition: 'all 0.3s ease',
                          opacity: 0,
                          transform: 'translateX(20px)',
                          cursor: (product.isOutOfStock || loadingQuickView === product.id) ? 'not-allowed' : 'pointer',
                          zIndex: 15,
                          minWidth: '40px',
                          minHeight: '40px',
                        }}
                        title={product.isOutOfStock ? 'Out of Stock' : 'Quick View'}
                      >
                        {product.isOutOfStock ? (
                          <i className="fas fa-ban" style={{ color: '#a1a1a1', fontSize: '14px' }}></i>
                        ) : (
                          loadingQuickView === product.id ? (
                            <div className="spinner-border spinner-border-sm" role="status" style={{ width: '14px', height: '14px' }}>
                              <span className="visually-hidden">Loading...</span>
                            </div>
                          ) : (
                            <i className="fas fa-eye" style={{ color: '#640d14', fontSize: '14px' }}></i>
                          ))}
                      </button>

                      <button
                        className="action-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          if (product.isOutOfStock) return;
                          handleAddToCart(product);
                        }}
                        disabled={product.isOutOfStock || loadingAddToCart === product.id}
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          background: 'rgba(255, 255, 255, 0.95)',
                          border: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                          transition: 'all 0.3s ease',
                          opacity: 0,
                          transform: 'translateX(20px)',
                          cursor: (product.isOutOfStock || loadingAddToCart === product.id) ? 'not-allowed' : 'pointer',
                          zIndex: 15,
                          minWidth: '40px',
                          minHeight: '40px',
                        }}
                        title={product.isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                      >
                        {product.isOutOfStock ? (
                          <i className="fas fa-ban" style={{ color: '#a1a1a1', fontSize: '14px' }}></i>
                        ) : (
                          loadingAddToCart === product.id ? (
                            <div className="spinner-border spinner-border-sm" role="status" style={{ width: '14px', height: '14px' }}>
                              <span className="visually-hidden">Loading...</span>
                            </div>
                          ) : (
                            <i className="fas fa-shopping-cart" style={{ color: '#640d14', fontSize: '14px' }}></i>
                          ))}
                      </button>
                    </div>

                    {/* Gradient Overlay */}
                    <div
                      className="gradient-overlay position-absolute bottom-0 start-0 w-100"
                      style={{
                        height: '60px',
                        background: 'linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 100%)',
                        opacity: 0,
                        transition: 'opacity 0.3s ease',
                      }}
                    ></div>
                  </div>

                  {/* Product Info */}
                  <div className="product-info px-3 py-4" style={{ minHeight: 70 }}>
                    {/* Product Name */}
                    <h4
                      className="product-title my-0"
                      style={{
                        fontSize: '1.0rem',
                        lineHeight: '1',
                        color: '#1a1a1a',
                        fontWeight: 500,
                        height: '2.2em',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        letterSpacing: '0.2px',
                        fontFamily: 'inherit',
                      }}
                    >
                      {product.brand}
                    </h4>
                    <h5
                      className="product-title my-0"
                      style={{
                        fontSize: '0.9rem',
                        lineHeight: '1.2',
                        color: '#1a1a1a',
                        fontWeight: 500,
                        height: '2.2em',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        letterSpacing: '0.2px',
                        fontFamily: 'inherit',
                      }}
                    >
                      {product.name}
                    </h5>

                    {/* Price */}
                    <div className="price-section">
                      <div className="d-flex align-items-center gap-1 flex-wrap">
                        {(() => {
                          const selectedSizeInfo = getSelectedSizePrice(product);
                          if (selectedSizeInfo.price) {
                            return (
                              <>
                                <span
                                  className="current-price"
                                  style={{
                                    color: '#2c2c2c',
                                    fontSize: '1rem',
                                    fontWeight: 600,
                                    letterSpacing: '0.3px',
                                  }}
                                >
                                  ₹{formatPrice(selectedSizeInfo.price)}
                                </span>
                                {selectedSizeInfo.oldPrice && (
                                  <span
                                    className="old-price"
                                    style={{
                                      fontSize: '0.8rem',
                                      color: '#888',
                                      textDecoration: 'line-through',
                                      fontWeight: 400,
                                    }}
                                  >
                                    ₹{formatPrice(selectedSizeInfo.oldPrice)}
                                  </span>
                                )}
                                {selectedSizeInfo.oldPrice && (
                                  <span
                                    className="discount-percentage"
                                    style={{
                                      fontSize: '0.7rem',
                                      color: '#640d14',
                                      fontWeight: 600,
                                    }}
                                  >
                                    {Math.round(((selectedSizeInfo.oldPrice - selectedSizeInfo.price) / selectedSizeInfo.oldPrice) * 100)}% OFF
                                  </span>
                                )}
                                <span
                                  className="size-badge ms-2"
                                  style={{
                                    fontSize: '0.7rem',
                                    color: '#640d14',
                                    fontWeight: 600,
                                    background: 'rgba(100, 13, 20, 0.1)',
                                    padding: '2px 6px',
                                    borderRadius: '4px',
                                  }}
                                >
                                  {selectedSizeInfo.size}
                                </span>
                              </>
                            );
                          } else {
                            return (
                              <span
                                className="current-price"
                                style={{
                                  color: '#999',
                                  fontStyle: 'italic',
                                  fontSize: '1rem',
                                  fontWeight: 600,
                                  letterSpacing: '0.3px',
                                }}
                              >
                                Price not available
                              </span>
                            );
                          }
                        })()}
                      </div>

                      {/* Available Sizes */}
                      <div className="available-sizes mt-2">
                        <small className="text-muted" style={{ fontSize: '0.75rem' }}>
                          <i className="fas fa-ruler me-1"></i>
                          Available: {getAvailableSizes(product).join(', ')}
                        </small>
                        {sizeFilter !== 'all' && (() => {
                          const selectedSize = getSelectedSize(product);
                          if (selectedSize) {
                            return (
                              <div className="mt-1">
                                <small className="text-success fw-semibold" style={{ fontSize: '0.7rem' }}>
                                  <i className="fas fa-check-circle me-1"></i>
                                  Displaying: {selectedSize.size} - ₹{formatPrice(selectedSize.price)}
                                </small>
                              </div>
                            );
                          }
                          return null;
                        })()}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Enhanced Hover Effects */}
                <style>
                  {`
                                         .product-card:hover {
                       transform: translateY(-12px) scale(1.02);
                       box-shadow: 0 20px 40px rgba(100, 13, 20, 0.15);
                       border-color: rgba(100, 13, 20, 0.2);
                     }
                    
                    .product-card:hover .product-image {
                      transform: scale(1.08);
                      filter: brightness(1.1) contrast(1.05);
                    }
                    
                                         .product-card:hover .action-btn {
                       opacity: 1 !important;
                       transform: translateX(0) !important;
                     }
                     
                     /* Show action buttons by default on mobile */
                     @media (max-width: 768px) {
                       .action-btn {
                         opacity: 1 !important;
                         transform: translateX(0) !important;
                       }
                       
                       .quick-actions {
                         opacity: 1 !important;
                       }
                     }
                     
                     /* Always show action buttons on touch devices */
                     @media (hover: none) {
                       .action-btn {
                         opacity: 1 !important;
                         transform: translateX(0) !important;
                       }
                     }
                     
                     /* Ensure buttons are clickable even when hidden */
                     .action-btn {
                       pointer-events: auto !important;
                       user-select: none;
                     }
                     
                     /* Add focus styles for accessibility */
                     .action-btn:focus {
                       outline: 2px solid #640d14;
                       outline-offset: 2px;
                     }
                     
                     /* Custom spinner styles */
                     .action-btn .spinner-border {
                       border-color: #ffffff;
                       border-right-color: transparent;
                       animation: spinner-border 0.75s linear infinite;
                     }
                     
                     /* Disabled button styles */
                     .action-btn:disabled {
                       opacity: 0.7;
                       transform: scale(0.95);
                     }
                     
                     .action-btn:disabled:hover {
                       transform: scale(0.95);
                     }
                     
                     /* Ensure action buttons are always clickable */
                     .action-btn {
                       pointer-events: auto !important;
                     }
                     
                     /* Make sure quick actions container is always accessible */
                     .quick-actions {
                       pointer-events: auto !important;
                     }
                    
                    .product-card:hover .gradient-overlay {
                      opacity: 1 !important;
                    }
                    
                  
                 
                    .action-btn:hover {
                      background: #640d14 !important;
                      transform: scale(1.1) !important;
                    }
                    
                    .action-btn:hover i {
                      color: #fff !important;
                    }
                    
                    .add-to-cart-btn:hover {
                      transform: translateY(-2px);
                    }
                    
                    .product-title {
                      transition: color 0.3s ease;
                    }
                    
                 
                    
                    /* Loading animation for cards */
                    .product-card {
                      animation: fadeInUp 0.6s ease forwards;
                    }
                    
                    @keyframes fadeInUp {
                      from {
                        opacity: 0;
                        transform: translateY(30px);
                      }
                      to {
                        opacity: 1;
                        transform: translateY(0);
                      }
                    }
                    
                    /* Stagger animation for multiple cards */
                    .product-card:nth-child(1) { animation-delay: 0.1s; }
                    .product-card:nth-child(2) { animation-delay: 0.2s; }
                    .product-card:nth-child(3) { animation-delay: 0.3s; }
                    .product-card:nth-child(4) { animation-delay: 0.4s; }
                    .product-card:nth-child(5) { animation-delay: 0.5s; }
                    .product-card:nth-child(6) { animation-delay: 0.6s; }
                  `}
                </style>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="d-flex justify-content-center mt-5">
              <nav aria-label="Product pagination">
                <ul className="pagination">
                  {/* Previous Button */}
                  <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                    <button
                      className="page-link"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      style={{
                        border: '1px solid #e7d7c1',
                        color: currentPage === 1 ? '#ccc' : '#640d14',
                        background: 'white',
                        borderRadius: '8px',
                        margin: '0 2px',
                        padding: '8px 12px',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      <i className="fas fa-chevron-left"></i>
                    </button>
                  </li>

                  {/* Page Numbers */}
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <li key={page} className="page-item">
                      <button
                        className={`page-link ${currentPage === page ? 'active' : ''}`}
                        onClick={() => handlePageChange(page)}
                        style={{
                          border: '1px solid #e7d7c1',
                          color: currentPage === page ? '#fff' : '#640d14',
                          background: currentPage === page ? '#640d14' : 'white',
                          borderRadius: '8px',
                          margin: '0 2px',
                          padding: '8px 12px',
                          transition: 'all 0.3s ease',
                          minWidth: '40px'
                        }}
                      >
                        {page}
                      </button>
                    </li>
                  ))}

                  {/* Next Button */}
                  <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                    <button
                      className="page-link"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      style={{
                        border: '1px solid #e7d7c1',
                        color: currentPage === totalPages ? '#ccc' : '#640d14',
                        background: 'white',
                        borderRadius: '8px',
                        margin: '0 2px',
                        padding: '8px 12px',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      <i className="fas fa-chevron-right"></i>
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          )}
        </div>
      </div>
      {selectedProduct && (
        <QuickView
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
      {/* Skeleton styles */}
      <style>
        {`
          .skeleton {
            position: relative;
            background-color: #eee; 
          }
          .shimmer::after {
            content: '';
            position: absolute;
            top: 0;
            left: -150px;
            height: 100%;
            width: 150px;
            background: linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.6), rgba(255,255,255,0));
            animation: shimmer 1.2s ease-in-out infinite;
          }
          @keyframes shimmer {
            0% { transform: translateX(0); }
            100% { transform: translateX(300%); }
          }
        `}
      </style>
    </div>
  );
};

export default Category;

