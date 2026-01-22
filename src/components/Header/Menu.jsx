import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getCategories } from '../../api/categories';
import './Header.css';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';

const navLinks = [
  { label: 'Home', to: '/', icon: (
    <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M9 22V12h6v10" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ) },
  { label: 'Categories', icon: (
    <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
      <rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round"/>
      <rect x="14" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round"/>
      <rect x="14" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round"/>
      <rect x="3" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round"/>
    </svg>
  ), megaMenu: true },
  { label: 'Shop', to: '/category', icon: (
    <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
      <path d="M6 6h15l-1.5 9h-13L4 2H1" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="9" cy="20" r="1" stroke="currentColor" strokeWidth="0.9"/>
      <circle cx="18" cy="20" r="1" stroke="currentColor" strokeWidth="0.9"/>
    </svg>
  ) },
  
 
  { label: 'Our Story', to: '/about', icon: (
    <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round"/>
      <path d="M12 16v-4" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round"/>
      <path d="M12 8h.01" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ) },
  { label: 'Contact Us', to: '/contact', icon: (
    <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M22 6l-10 7L2 6" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ) },
];

export default function Menu({ drawerOpen, setDrawerOpen }) {
  const location = useLocation();
  const [showMegaMenu, setShowMegaMenu] = useState(false);
  const [mobileCategoriesOpen, setMobileCategoriesOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const categories = getCategories();
  const [brands, setBrands] = useState([]);

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      setIsScrolled(scrollTop > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch unique brands from Firestore products
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'products'));
        const all = snapshot.docs
          .map(d => (d.data()?.brand || '').toString().trim())
          .filter(Boolean);
        const unique = Array.from(new Set(all)).sort((a, b) => a.localeCompare(b));
        setBrands(unique);
      } catch (e) {
        setBrands([]);
      }
    };
    fetchBrands();
  }, []);

  // Helper to detect mobile
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 991;

  // Hamburger icon (moved to BottomHeader)
  const Hamburger = (
    <button
      className="mahirash-hamburger"
      aria-label="Open menu"
      onClick={() => setDrawerOpen(true)}
    >
      <span></span>
      <span></span>
      <span></span>
    </button>
  );

  // Mobile Drawer
  const Drawer = (
    <div className={`mahirash-mobile-drawer${drawerOpen ? ' open' : ''}`}>
      <button
        className="mahirash-drawer-close"
        aria-label="Close menu"
        onClick={() => setDrawerOpen(false)}
      >
        &times;
      </button>
      <ul className="mahirash-mobile-menu-list border">
        {navLinks.map(link => (
          <li key={link.label}>
            {link.megaMenu ? (
              <>
                <button
                  className="mahirash-mobile-accordion-btn"
                  onClick={() => setMobileCategoriesOpen(open => !open)}
                  aria-expanded={mobileCategoriesOpen}
                >
                  {link.label}
                  <span className={`arrow${mobileCategoriesOpen ? ' open' : ''}`}></span>
                </button>
                {mobileCategoriesOpen && (
                  <div className="mahirash-mobile-accordion-panel">
                    {categories.map(category => (
                      <div className="mahirash-mobile-accordion-col" key={category.name}>
                        <div className="mahirash-mobile-accordion-title">{category.name}</div>
                        {category.subcategories.map(sub => (
                          <div key={sub.name} className="mahirash-mobile-accordion-subcat">
                            <div className="mahirash-mobile-accordion-subcat-title">{sub.name}</div>
                            <ul>
                              {sub.items.map(item => (
                                <li key={item}>
                                  <Link to="#" className="mahirash-mobile-accordion-link">{item}</Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <Link
                to={link.to}
                className={
                  'mahirash-nav-link' + (location.pathname === link.to ? ' active' : '')
                }
                onClick={() => setDrawerOpen(false)}
              >
                {link.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <nav className={`mahirash-menu-bar ${isScrolled ? 'scrolled' : ''}`}>
      <div className="container">
        {/* Main nav for desktop */}
        <ul className="mahirash-menu-list">
          {navLinks.map(link => (
            <li
              key={link.label}
              className={link.megaMenu ? 'mahirash-categories-nav' : ''}
              onMouseEnter={link.megaMenu ? () => setShowMegaMenu(true) : undefined}
              onMouseLeave={link.megaMenu ? () => setShowMegaMenu(false) : undefined}
              style={{ position: 'relative' }}
            >
              <Link
                to={link.to}
                className={
                  'mahirash-nav-link' + (location.pathname === link.to ? ' active' : '')
                }
                // Remove the onClick handler for toggling megamenu
              >
                {link.label}
                {link.megaMenu && <i className="mahirash-dropdown-icon">▼</i>}
              </Link>
              {/* MegaMenu */}
              {link.megaMenu && showMegaMenu && (
                <div
                  className="mahirash-megamenu"
                  onMouseEnter={() => setShowMegaMenu(true)}
                  onMouseLeave={() => setShowMegaMenu(false)}
                >
                  <div className="mahirash-megamenu-container">
                    <div className="mahirash-megamenu-header">
                     
                      <p className="mahirash-megamenu-subtitle">Discover luxury fragrances for every occasion</p>
                    </div>
                    <div className="mahirash-megamenu-content">
                      {/* Price filter column */}
                      <div className="mahirash-megamenu-col">
                        <div className="mahirash-megamenu-category-header">
                         
                          <h4 className="mahirash-megamenu-title">Filter by Price</h4>
                        </div>
                        <div className="mahirash-megamenu-category-content">
                          <div className="mahirash-megamenu-subcat">
                            <div className="mahirash-megamenu-subcat-title">Price Range</div>
                            <ul className="mahirash-megamenu-items">
                              {[
                                { id: 'lt1000', label: 'Less than ₹1000', to: '/category?price=lt1000' },
                                { id: '1000-2500', label: '₹1000 - ₹2500', to: '/category?price=1000-2500' },
                                { id: '2500-5000', label: '₹2500 - ₹5000', to: '/category?price=2500-5000' },
                                { id: '5000-10000', label: '₹5000 - ₹10000', to: '/category?price=5000-10000' },
                                { id: '10000+', label: '₹10000+', to: '/category?price=10000-100000' },
                              ].map(range => (
                                <li key={range.id}>
                                  <Link to={range.to} className="mahirash-megamenu-link">
                                    <span className="mahirash-megamenu-link-text">{range.label}</span>
                                    <i className="mahirash-megamenu-link-arrow">→</i>
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                      {/* Brands column */}
                      {brands.length > 0 && (
                        <div className="mahirash-megamenu-col">
                          <div className="mahirash-megamenu-category-header">
                           
                            <h4 className="mahirash-megamenu-title">Brands</h4>
                          </div>
                          <div className="mahirash-megamenu-category-content">
                            <div className="mahirash-megamenu-subcat">
                              <div className="mahirash-megamenu-subcat-title">Popular Brands</div>
                              <ul className="mahirash-megamenu-items">
                                {brands.slice(0, 20).map(b => (
                                  <li key={b}>
                                    <Link to={`/category?brand=${encodeURIComponent(b)}`} className="mahirash-megamenu-link">
                                      <span className="mahirash-megamenu-link-text">{b}</span>
                                      <i className="mahirash-megamenu-link-arrow">→</i>
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      )}
                      {categories.map(category => (
                        <div className="mahirash-megamenu-col" key={category.name}>
                          <div className="mahirash-megamenu-category-header">
                           
                            <h4 className="mahirash-megamenu-title">{category.name}</h4>
                          </div>
                          <div className="mahirash-megamenu-category-content">
                            {category.subcategories.map(sub => (
                              <div key={sub.name} className="mahirash-megamenu-subcat">
                                <div className="mahirash-megamenu-subcat-title">{sub.name}</div>
                                <ul className="mahirash-megamenu-items">
                                  {sub.items.map(item => (
                                    <li key={item}>
                                      <Link to={`/category?search=${encodeURIComponent(item)}`} className="mahirash-megamenu-link">
                                        <span className="mahirash-megamenu-link-text">{item}</span>
                                        <i className="mahirash-megamenu-link-arrow">→</i>
                                      </Link>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mahirash-megamenu-footer">
                      <div className="mahirash-megamenu-featured">
                        <div className="mahirash-megamenu-featured-item">
                          <div className="mahirash-megamenu-featured-icon">✨</div>
                          <span>New Arrivals</span>
                        </div>
                        <div className="mahirash-megamenu-featured-item">
                          <div className="mahirash-megamenu-featured-icon">🔥</div>
                          <span>Best Sellers</span>
                        </div>
                        <div className="mahirash-megamenu-featured-item">
                          <div className="mahirash-megamenu-featured-icon">💎</div>
                          <span>Luxury Collection</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
        {/* Mobile Drawer */}
        {Drawer}
      </div>
    </nav>
  );
}

// BottomHeader component for mobile only
export function BottomHeader() {
  const location = useLocation();
  const [showCategories, setShowCategories] = useState(false);
  const categories = getCategories();
  const [brands, setBrands] = useState([]);

  // Fetch unique brands for bottom sheet as well
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'products'));
        const all = snapshot.docs
          .map(d => (d.data()?.brand || '').toString().trim())
          .filter(Boolean);
        const unique = Array.from(new Set(all)).sort((a, b) => a.localeCompare(b));
        setBrands(unique);
      } catch (e) {
        setBrands([]);
      }
    };
    fetchBrands();
  }, []);

  // Filter out 'Home' for mobile bottom header
const mobileNavLinks = navLinks.filter(link => link.label !== 'Home');


  return (
    <>
      <div className="mahirash-bottom-header">
        <div className="mahirash-bottom-header-inner">
          {mobileNavLinks.map(link =>
            link.megaMenu ? (
              <button
                key={link.label}
                className={"mahirash-bottom-header-btn" + (showCategories ? " active" : "")}
                onClick={() => setShowCategories(open => !open)}
                aria-expanded={showCategories}
              >
                {link.icon}
                <span>{link.label}</span>
              </button>
            ) : (
              <Link
                key={link.label}
                to={link.to}
                className={"mahirash-bottom-header-btn" + (location.pathname === link.to ? " active" : "")}
              >
                {link.icon}
                <span>{link.label}</span>
              </Link>
            )
          )}
        </div>
      </div>
      {/* Categories bottom sheet/expandable */}
      {showCategories && (
        <div className="mahirash-bottom-categories-sheet" onClick={() => setShowCategories(false)}>
          <div className="mahirash-bottom-categories-sheet-inner" onClick={e => e.stopPropagation()}>
            <h4>Categories</h4>
            <div className="mahirash-bottom-categories-list">
              {/* Price Filter */}
              <div className="mahirash-bottom-category">
                <div className="mahirash-bottom-category-title">Filter by Price</div>
                <div className="mahirash-bottom-category-subcat">
                  <div className="mahirash-bottom-category-subcat-title">Price Range</div>
                  <ul>
                    {[
                      { id: 'lt1000', label: 'Less than ₹1000', to: '/category?price=lt1000' },
                      { id: '1000-2500', label: '₹1000 - ₹2500', to: '/category?price=1000-2500' },
                      { id: '2500-5000', label: '₹2500 - ₹5000', to: '/category?price=2500-5000' },
                      { id: '5000-10000', label: '₹5000 - ₹10000', to: '/category?price=5000-10000' },
                      { id: '10000+', label: '₹10000+', to: '/category?price=10000-100000' },
                    ].map(range => (
                      <li key={range.id}>
                        <Link
                          to={range.to}
                          className="mahirash-megamenu-link"
                          onClick={() => setShowCategories(false)}
                        >
                          {range.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Brands */}
              {brands.length > 0 && (
                <div className="mahirash-bottom-category">
                  <div className="mahirash-bottom-category-title">Brands</div>
                  <div className="mahirash-bottom-category-subcat">
                    <div className="mahirash-bottom-category-subcat-title">Popular Brands</div>
                    <ul>
                      {brands.slice(0, 20).map(b => (
                        <li key={b}>
                          <Link
                            to={`/category?brand=${encodeURIComponent(b)}`}
                            className="mahirash-megamenu-link"
                            onClick={() => setShowCategories(false)}
                          >
                            {b}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Categories */}
              {categories.map(category => (
                <div key={category.name} className="mahirash-bottom-category">
                  <div className="mahirash-bottom-category-title">{category.name}</div>
                  {category.subcategories.map(sub => (
                    <div key={sub.name} className="mahirash-bottom-category-subcat">
                      <div className="mahirash-bottom-category-subcat-title">{sub.name}</div>
                      <ul>
                        {sub.items.map(item => (
                          <li key={item}>
                            <Link
                              to={`/category?search=${encodeURIComponent(item)}`}
                              className="mahirash-megamenu-link"
                              onClick={() => setShowCategories(false)}
                            >
                              {item}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              ))}
            </div>
            <button className="mahirash-bottom-categories-close" onClick={() => setShowCategories(false)}>&times;</button>
          </div>
        </div>
      )}
    </>
  );
} 