// src/components/AdminDashboard.jsx
import React, { useEffect, useState } from 'react';
import { collection, getDocs, deleteDoc, doc, updateDoc, getDoc, setDoc, deleteField } from 'firebase/firestore';
import { db } from './firebase';
import { Link, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';
import UploadItemForm from './UploadItemForm';
import axios from 'axios';

const genderOptions = ['men', 'women', 'unisex'];
const perfumeNotes = ['Woody', 'Citrus', 'Flower', 'Aromatic'];

const AdminDashboard = () => {
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [reviews, setReviews] = useState([]);
  const [orders, setOrders] = useState([]);
  const [isOrdersLoading, setIsOrdersLoading] = useState(false);
  const [isReviewsLoading, setIsReviewsLoading] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [heroVideoUrl, setHeroVideoUrl] = useState('');
  const [stageVideoUrl, setStageVideoUrl] = useState('');
  const [isVideoUpdating, setIsVideoUpdating] = useState(false);
  const [videoSaveWarning, setVideoSaveWarning] = useState('');
  const [fullBannerUrl, setFullBannerUrl] = useState('');
  const [isBannerUpdating, setIsBannerUpdating] = useState(false);
  const [bannerSaveWarning, setBannerSaveWarning] = useState('');
  const { adminUser, adminLogout } = useAdminAuth();
  const navigate = useNavigate();

  // Static brand list for dropdown (same as UploadItemForm)
  const brands = [
    "ACQUA DI PARMA",
    "AFNAN",
    "AJMAL",
    "ANNA SUI",
    "ANTONIO BANDERAS",
    "AQUOLINA",
    "ARD AL ZAAFRAN",
    "ARIANA GRANDE",
    "ARMAF",
    "AZZARO",
    "BENTLEY",
    "BOUCHERON",
    "BRITNEY SPEARS",
    "BURBERRY",
    "BVLGARI",
    "BYREDO",
    "CAROLINA HERRERA",
    "CARTIER",
    "CHANEL",
    "CHLOE",
    "CHOPARD",
    "CALVIN KLEIN",
    "CLINIQUE",
    "COACH",
    "DAVID BECKHAM",
    "DAVIDOFF",
    "DIOR",
    "DIRHAM",
    "DKNY",
    "DOLCE & GABBANA",
    "DUNHILL",
    "ELIE SAAB",
    "ELIZABETH ARDEN",
    "EMPER",
    "ESCADA",
    "ESTEE LAUDER",
    "FENDI",
    "FERRARI",
    "GIORGIO ARMANI",
    "GIVENCHY",
    "GUCCI",
    "GUERLAIN PARIS",
    "GUESS",
    "GUY LAROCHE",
    "HALLOWEEN",
    "HERMES",
    "HUGO BOSS",
    "ISSEY MIYAKE",
    "JAGUAR",
    "JEAN PAUL GAULTIER",
    "JENNIFER LOPEZ",
    "JIMMY CHOO",
    "JO MALONE",
    "JOHN VARVATOS",
    "JUICY COUTURE",
    "JULIETTE HAS A GUN",
    "KENNETH COLE",
    "KENZO",
    "LACOSTE",
    "LANCOME",
    "LANVIN",
    "LATTAFA",
    "LE CHAMEAU",
    "MAISON ALHAMBRA",
    "MAJESTIC",
    "MANCERA",
    "MARC JACOBS",
    "MERCEDEZ BENZ",
    "MICHAEL KORS",
    "MONT BLANC",
    "MOSCHINO",
    "MUGLER",
    "NARCISO RODRIGUEZ",
    "NAUTICA",
    "NINA RICCI",
    "NISHANE",
    "PACO RABANNE",
    "PARFUMS DE MARLY",
    "PARIS HILTON",
    "POLO",
    "PRADA",
    "RALPH LAUREN",
    "RASASI",
    "REPLICA",
    "RIHANNA",
    "RIIFFS",
    "RUE BROCA",
    "SALVATORE FERRAGAMO",
    "SARAH JESSICA PARKER",
    "ST DUPONT",
    "TOM FORD",
    "TOMMY HILFIGER",
    "UCB",
    "VERSACE",
    "VIKTOR & ROLF",
    "VICTORIA SECRET",
    "YVES SAINT LAURENT"
  ];

  // Helper function to safely format price
  const formatPrice = (price) => {
    if (!price) return '0.00';
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return isNaN(numPrice) ? '0.00' : numPrice.toFixed(2);
  };

  const fetchOrders = async () => {
    try {
      setIsOrdersLoading(true);
      const snapshot = await getDocs(collection(db, 'orders'));
      const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setOrders(list.sort((a,b) => (b?.createdAt?.seconds || 0) - (a?.createdAt?.seconds || 0)));
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setIsOrdersLoading(false);
    }
  };

  // Helper function to get category icon and color
  const getCategoryInfo = (badge) => {
    if (!badge) return { icon: 'fa-tag', bg: 'linear-gradient(135deg, #640d14, #9b7645)' };
    
    const badgeLower = badge.toLowerCase();
    switch (badgeLower) {
      case 'new':
        return { icon: 'fa-star', bg: 'linear-gradient(135deg, #3FC53A, #4CAF50)' };
      case 'premium':
        return { icon: 'fa-crown', bg: 'linear-gradient(135deg, #C9B37E, #D4B04C)' };
      case 'budget':
        return { icon: 'fa-tags', bg: 'linear-gradient(135deg, #2196F3, #1976D2)' };
      case 'clearence':
        return { icon: 'fa-fire', bg: 'linear-gradient(135deg, #FF6B35, #F7931E)' };
      case 'special edition':
        return { icon: 'fa-gem', bg: 'linear-gradient(135deg, #A63A27, #D32F2F)' };
      case 'sale':
        return { icon: 'fa-percent', bg: 'linear-gradient(135deg, #E91E63, #C2185B)' };
      default:
        return { icon: 'fa-tag', bg: 'linear-gradient(135deg, #640d14, #9b7645)' };
    }
  };

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const querySnapshot = await getDocs(collection(db, 'products'));
      const productList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setProducts(productList);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      setIsReviewsLoading(true);
      const snapshot = await getDocs(collection(db, 'reviews'));
      const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setReviews(list);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setIsReviewsLoading(false);
    }
  };

  // Fetch homepage videos configuration
  const fetchVideoConfig = async () => {
    try {
      const ref = doc(db, 'siteConfig', 'videos');
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        setHeroVideoUrl(data.heroVideoUrl || '');
        setStageVideoUrl(data.stageVideoUrl || '');
      }
    } catch (error) {
      console.error('Error fetching video config:', error);
    }
  };

  // Fetch homepage banners configuration
  const fetchBannerConfig = async () => {
    try {
      const ref = doc(db, 'siteConfig', 'banners');
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        setFullBannerUrl(data.fullBannerUrl || '');
      } else {
        setFullBannerUrl('');
      }
    } catch (error) {
      console.error('Error fetching banner config:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) return;
    try {
      await deleteDoc(doc(db, 'products', id));
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Failed to delete product. Please try again.');
    }
  };

  const handleDeleteReview = async (id) => {
    if (!window.confirm('Delete this testimonial?')) return;
    try {
      await deleteDoc(doc(db, 'reviews', id));
      setReviews(prev => prev.filter(r => r.id !== id));
    } catch (error) {
      console.error('Error deleting review:', error);
      alert('Failed to delete review. Please try again.');
    }
  };

  const handleEditClick = (item) => {
    setEditItem(item);
    // Normalize gender to array for checkbox UI
    const normalizedGenderArray = genderOptions.includes(item.gender) ? [item.gender] : [];
    // Enhance sizes with imagesFiles and imagesPreview and customSize handling
    const enhancedSizes = Array.isArray(item.sizes)
      ? item.sizes.map(s => ({
          size: s.size || '',
          price: s.price || '',
          oldPrice: s.oldPrice || '',
          customSize: '',
          imagesFiles: Array.isArray(s.images) ? [...s.images] : [],
          imagesPreview: Array.isArray(s.images) ? [...s.images] : [],
          stock: typeof s.stock === 'number' ? s.stock : Number(s.stock || 0) || 0,
          isOutOfStock: !!s.isOutOfStock
        }))
      : [];
    setFormData({ ...item, brand: item.brand || '', gender: normalizedGenderArray, sizes: enhancedSizes, note: item.note || '' });
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleGenderChange = (e) => {
    const value = e.target.value;
    setFormData(prev => {
      const current = Array.isArray(prev.gender) ? prev.gender : [];
      if (value === 'unisex') {
        return { ...prev, gender: ['unisex'] };
      }
      const withoutUnisex = current.filter(g => g !== 'unisex');
      const exists = withoutUnisex.includes(value);
      const updated = exists ? withoutUnisex.filter(g => g !== value) : [...withoutUnisex, value];
      return { ...prev, gender: updated };
    });
  };

  const handleSizeChange = (idx, field, value) => {
    setFormData(prev => {
      const sizes = Array.isArray(prev.sizes) ? [...prev.sizes] : [];
      if (!sizes[idx]) return prev;
      if (field === 'size' && value !== 'custom') {
        sizes[idx] = { ...sizes[idx], size: value, customSize: '' };
      } else if (field === 'isOutOfStock') {
        sizes[idx] = { ...sizes[idx], isOutOfStock: Boolean(value) };
      } else {
        sizes[idx] = { ...sizes[idx], [field]: value };
      }
      return { ...prev, sizes };
    });
  };

  const handleSizeImagesChange = (idx, filesList) => {
    const newFiles = Array.from(filesList);
    setFormData(prev => {
      const sizes = Array.isArray(prev.sizes) ? [...prev.sizes] : [];
      if (!sizes[idx]) return prev;
      const existingFiles = sizes[idx].imagesFiles || [];
      const combined = [...existingFiles, ...newFiles].slice(0, 4);
      const previews = combined.map(f => (typeof f === 'string' ? f : URL.createObjectURL(f)));
      sizes[idx] = { ...sizes[idx], imagesFiles: combined, imagesPreview: previews };
      return { ...prev, sizes };
    });
  };

  const handleRemoveSizeImage = (idx, imgIdx) => {
    setFormData(prev => {
      const sizes = Array.isArray(prev.sizes) ? [...prev.sizes] : [];
      if (!sizes[idx]) return prev;
      const files = [...(sizes[idx].imagesFiles || [])];
      const previews = [...(sizes[idx].imagesPreview || [])];
      files.splice(imgIdx, 1);
      previews.splice(imgIdx, 1);
      sizes[idx] = { ...sizes[idx], imagesFiles: files, imagesPreview: previews };
      return { ...prev, sizes };
    });
  };

  const uploadToCloudinary = async (file) => {
    const data = new FormData();
    data.append('file', file);
    data.append('upload_preset', 'Mahirash');
    const res = await axios.post('https://api.cloudinary.com/v1_1/djmfxpemz/image/upload', data);
    return res.data.secure_url;
  };

  // Upload video to Cloudinary
  const uploadVideoToCloudinary = async (file) => {
    const data = new FormData();
    data.append('file', file);
    data.append('upload_preset', 'Mahirash');
    const res = await axios.post('https://api.cloudinary.com/v1_1/djmfxpemz/video/upload', data);
    return res.data.secure_url;
  };

  // Handle homepage full banner upload
  const handleBannerUpload = async (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    try {
      setIsBannerUpdating(true);
      setBannerSaveWarning('');

      const secureUrl = await uploadToCloudinary(file);

      // Update UI immediately
      setFullBannerUrl(secureUrl);
      try { localStorage.setItem('siteConfig.fullBannerUrl', secureUrl); } catch (_) {}

      // Persist in Firestore
      const ref = doc(db, 'siteConfig', 'banners');
      await setDoc(ref, { fullBannerUrl: secureUrl }, { merge: true });

      alert('Banner updated and saved successfully.');
    } catch (error) {
      console.error('Error uploading banner:', error);
      setBannerSaveWarning(
        'Uploaded to Cloudinary, but could not save to Firestore (Missing/insufficient permissions). Fix Firestore rules so it stays after refresh.'
      );
      alert('Upload finished, but saving to database failed. Please fix Firestore permissions.');
    } finally {
      setIsBannerUpdating(false);
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  const handleRemoveBanner = async () => {
    try {
      setIsBannerUpdating(true);
      setBannerSaveWarning('');

      // Update UI immediately
      setFullBannerUrl('');
      try { localStorage.removeItem('siteConfig.fullBannerUrl'); } catch (_) {}

      // Remove from Firestore so it stays removed after refresh
      const ref = doc(db, 'siteConfig', 'banners');
      await setDoc(ref, { fullBannerUrl: deleteField() }, { merge: true });

      alert('Banner removed successfully.');
    } catch (error) {
      console.error('Error removing banner:', error);
      setBannerSaveWarning(
        'Removed locally, but could not update Firestore (Missing/insufficient permissions). Fix Firestore rules so it stays removed after refresh.'
      );
      alert('Remove failed to save to database. Please fix Firestore permissions.');
    } finally {
      setIsBannerUpdating(false);
    }
  };

  // Handle homepage videos upload (hero + cinematic)
  const handleVideoUpload = async (event, type) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    try {
      setIsVideoUpdating(true);
      setVideoSaveWarning('');
      const secureUrl = await uploadVideoToCloudinary(file);

      const ref = doc(db, 'siteConfig', 'videos');
      const payload =
        type === 'hero'
          ? { heroVideoUrl: secureUrl }
          : { stageVideoUrl: secureUrl };

      // Update UI immediately (so you can see the result even before persistence completes)
      if (type === 'hero') {
        setHeroVideoUrl(secureUrl);
        try { localStorage.setItem('siteConfig.heroVideoUrl', secureUrl); } catch (_) {}
      } else {
        setStageVideoUrl(secureUrl);
        try { localStorage.setItem('siteConfig.stageVideoUrl', secureUrl); } catch (_) {}
      }

      // Persist in Firestore (required for it to "stay" after refresh)
      await setDoc(ref, payload, { merge: true });

      alert('Video updated and saved successfully.');
    } catch (error) {
      console.error('Error uploading video:', error);
      // If Cloudinary succeeded but Firestore failed, the URL will show in UI,
      // but it will NOT persist after refresh until rules are fixed.
      setVideoSaveWarning(
        'Uploaded to Cloudinary, but could not save to Firestore (Missing/insufficient permissions). Fix Firestore rules so it stays after refresh.'
      );
      alert('Upload finished, but saving to database failed. Please fix Firestore permissions.');
    } finally {
      setIsVideoUpdating(false);
      // reset input so same file can be chosen again if needed
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  const handleRemoveVideo = async (type) => {
    try {
      setIsVideoUpdating(true);
      setVideoSaveWarning('');

      // Update UI immediately
      if (type === 'hero') {
        setHeroVideoUrl('');
        try { localStorage.removeItem('siteConfig.heroVideoUrl'); } catch (_) {}
      }
      if (type === 'stage') {
        setStageVideoUrl('');
        try { localStorage.removeItem('siteConfig.stageVideoUrl'); } catch (_) {}
      }

      // Remove from Firestore so it stays removed after refresh
      const ref = doc(db, 'siteConfig', 'videos');
      const payload = type === 'hero' ? { heroVideoUrl: deleteField() } : { stageVideoUrl: deleteField() };
      await setDoc(ref, payload, { merge: true });
      alert('Video removed successfully.');
    } catch (error) {
      console.error('Error removing video:', error);
      setVideoSaveWarning(
        'Removed locally, but could not update Firestore (Missing/insufficient permissions). Fix Firestore rules so it stays removed after refresh.'
      );
      alert('Remove failed to save to database. Please fix Firestore permissions.');
    } finally {
      setIsVideoUpdating(false);
    }
  };

  const handleUpdate = async () => {
    try {
      setIsUpdating(true);
      // Compute gender string
      const selected = Array.isArray(formData.gender) ? formData.gender : [];
      let finalGender = 'unisex';
      if (selected.includes('unisex')) {
        finalGender = 'unisex';
      } else if (selected.length === 1) {
        finalGender = selected[0];
      }

      // Prepare sizes and upload new images
      const preparedSizes = [];
      for (const s of (Array.isArray(formData.sizes) ? formData.sizes : [])) {
        if (!(s.size && s.price)) continue;
        const imagesFiles = s.imagesFiles || [];
        if (imagesFiles.length === 0) {
          throw new Error('Each size must have at least 1 image.');
        }
        let finalSize = s.size;
        if (s.size === 'custom' && s.customSize) {
          finalSize = s.customSize;
        }
        const uploadedUrls = [];
        for (const f of imagesFiles.slice(0, 4)) {
          if (typeof f === 'string') {
            uploadedUrls.push(f);
          } else {
            const url = await uploadToCloudinary(f);
            uploadedUrls.push(url);
          }
        }
        const numericStock = Number(s.stock || 0);
        preparedSizes.push({ size: finalSize, price: s.price, oldPrice: s.oldPrice || '', stock: isNaN(numericStock) ? 0 : numericStock, images: uploadedUrls, isOutOfStock: !!s.isOutOfStock || (numericStock <= 0) });
      }

      const payload = {
        name: formData.name || '',
        brand: formData.brand || '',
        data: formData.data || '',
        badge: formData.badge || '',
        isOutOfStock: !!formData.isOutOfStock || (preparedSizes.length > 0 && preparedSizes.every(sz => (sz.isOutOfStock || (Number(sz.stock || 0) <= 0)))),
        tags: Array.isArray(formData.tags) ? formData.tags : [],
        gender: finalGender,
        note: formData.note || '',
        sizes: preparedSizes
      };

      const itemRef = doc(db, 'products', editItem.id);
      await updateDoc(itemRef, payload);
      setEditItem(null);
      fetchProducts();
    } catch (error) {
      console.error('Error updating item:', error);
      alert(error?.message || 'Failed to update product. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleLogout = () => {
    adminLogout();
    navigate('/admin');
  };

  useEffect(() => {
    fetchProducts();
    fetchReviews();
    fetchOrders();
    fetchVideoConfig();
    fetchBannerConfig();
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #F8F5F2 0%, #EFE8DC 100%)',
      padding: '20px'
    }}>
      <div className="container-fluid">
        {/* Header */}
        <div style={{
          background: '#fff',
          borderRadius: '20px',
          padding: '30px',
          marginBottom: '30px',
          boxShadow: '0 10px 40px rgba(123, 84, 33, 0.1)',
          border: '1px solid rgba(201, 179, 126, 0.2)'
        }}>
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div>
              <h1 style={{
                color: '#3B2F2F',
                fontSize: '32px',
                fontWeight: '600',
                margin: 0,
                fontFamily: 'serif'
              }}>
                <i className="fas fa-crown me-3" style={{ color: '#640d14' }}></i>
                Admin Dashboard
              </h1>
              <p style={{
                color: '#640d14',
                fontSize: '14px',
                margin: '8px 0 0 0',
                opacity: 0.8
              }}>
                Welcome back, {adminUser?.displayName || 'Administrator'}
              </p>
            </div>
            <div className="d-flex gap-2">
              <button 
                className="btn" 
                onClick={() => setShowUploadModal(true)}
                style={{
                  background: 'linear-gradient(135deg, #640d14, #9b7645)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '12px 24px',
                  fontWeight: '600',
                  boxShadow: '0 8px 25px rgba(123, 84, 33, 0.3)',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 12px 35px rgba(123, 84, 33, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 8px 25px rgba(123, 84, 33, 0.3)';
                }}
              >
                <i className="fas fa-plus me-2"></i>
                Add Product
              </button>
              <button 
                className="btn" 
                onClick={handleLogout}
                style={{
                  background: '#fff',
                  color: '#640d14',
                  border: '2px solid #640d14',
                  borderRadius: '12px',
                  padding: '12px 24px',
                  fontWeight: '600',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#640d14';
                  e.target.style.color = '#fff';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = '#fff';
                  e.target.style.color = '#640d14';
                }}
              >
                <i className="fas fa-sign-out-alt me-2"></i>
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="row mb-4">
          <div className="col-md-3 col-sm-6 mb-3">
            <div style={{
              background: '#fff',
              borderRadius: '16px',
              padding: '25px',
              textAlign: 'center',
              boxShadow: '0 8px 25px rgba(123, 84, 33, 0.1)',
              border: '1px solid rgba(201, 179, 126, 0.2)'
            }}>
              <div style={{
                width: '60px',
                height: '60px',
                background: 'linear-gradient(135deg, #640d14, #9b7645)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 15px'
              }}>
                <i className="fas fa-box" style={{ color: '#fff', fontSize: '24px' }}></i>
              </div>
              <h3 style={{ color: '#3B2F2F', fontSize: '28px', margin: '0 0 5px 0' }}>
                {products.length}
              </h3>
              <p style={{ color: '#640d14', fontSize: '14px', margin: 0 }}>Total Products</p>
            </div>
          </div>
          <div className="col-md-3 col-sm-6 mb-3">
            <div style={{
              background: '#fff',
              borderRadius: '16px',
              padding: '25px',
              textAlign: 'center',
              boxShadow: '0 8px 25px rgba(123, 84, 33, 0.1)',
              border: '1px solid rgba(201, 179, 126, 0.2)'
            }}>
              <div style={{
                width: '60px',
                height: '60px',
                background: 'linear-gradient(135deg, #C9B37E, #D4B04C)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 15px'
              }}>
                <i className="fas fa-star" style={{ color: '#fff', fontSize: '24px' }}></i>
              </div>
              <h3 style={{ color: '#3B2F2F', fontSize: '28px', margin: '0 0 5px 0' }}>
                {products.filter(p => p.badge === 'Premium').length}
              </h3>
              <p style={{ color: '#640d14', fontSize: '14px', margin: 0 }}>Premium Products</p>
            </div>
          </div>
          <div className="col-md-3 col-sm-6 mb-3">
            <div style={{
              background: '#fff',
              borderRadius: '16px',
              padding: '25px',
              textAlign: 'center',
              boxShadow: '0 8px 25px rgba(123, 84, 33, 0.1)',
              border: '1px solid rgba(201, 179, 126, 0.2)'
            }}>
              <div style={{
                width: '60px',
                height: '60px',
                background: 'linear-gradient(135deg, #A63A27, #D32F2F)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 15px'
              }}>
                <i className="fas fa-exclamation-triangle" style={{ color: '#fff', fontSize: '24px' }}></i>
              </div>
              <h3 style={{ color: '#3B2F2F', fontSize: '28px', margin: '0 0 5px 0' }}>
                {products.filter(p => p.isOutOfStock).length}
              </h3>
              <p style={{ color: '#640d14', fontSize: '14px', margin: 0 }}>Out of Stock</p>
            </div>
          </div>
          <div className="col-md-3 col-sm-6 mb-3">
            <div style={{
              background: '#fff',
              borderRadius: '16px',
              padding: '25px',
              textAlign: 'center',
              boxShadow: '0 8px 25px rgba(123, 84, 33, 0.1)',
              border: '1px solid rgba(201, 179, 126, 0.2)'
            }}>
              <div style={{
                width: '60px',
                height: '60px',
                background: 'linear-gradient(135deg, #3FC53A, #4CAF50)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 15px'
              }}>
                <i className="fas fa-check-circle" style={{ color: '#fff', fontSize: '24px' }}></i>
              </div>
              <h3 style={{ color: '#3B2F2F', fontSize: '28px', margin: '0 0 5px 0' }}>
                {products.filter(p => !p.isOutOfStock).length}
              </h3>
              <p style={{ color: '#640d14', fontSize: '14px', margin: 0 }}>In Stock</p>
            </div>
          </div>
        </div>

        {/* Homepage Videos */}
        <div className="mt-4" style={{
          background: '#fff',
          borderRadius: '20px',
          padding: '24px 30px',
          boxShadow: '0 10px 40px rgba(123, 84, 33, 0.08)',
          border: '1px solid rgba(201, 179, 126, 0.2)'
        }}>
          <h3 style={{
            color: '#3B2F2F',
            fontSize: '20px',
            fontWeight: '600',
            marginBottom: '18px',
            fontFamily: 'serif'
          }}>
            <i className="fas fa-film me-2" style={{ color: '#640d14' }}></i>
            Homepage Videos
          </h3>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label" style={{ color: '#3B2F2F', fontWeight: '600', fontSize: 14 }}>
                Hero Video (top banner)
              </label>
              <p style={{ fontSize: 12, color: '#777', marginBottom: 6 }}>
                {heroVideoUrl ? 'Using custom uploaded video.' : 'No custom video uploaded. Using default video2.mp4.'}
              </p>
              <input
                type="file"
                accept="video/*"
                className="form-control"
                onChange={(e) => handleVideoUpload(e, 'hero')}
                disabled={isVideoUpdating}
                style={{ borderRadius: 12, border: '2px solid #E8EBDD', background: '#F8F5F2' }}
              />
              <div className="d-flex gap-2 mt-2">
                <button
                  type="button"
                  className="btn btn-sm"
                  onClick={() => handleRemoveVideo('hero')}
                  disabled={isVideoUpdating || !heroVideoUrl}
                  style={{
                    background: '#fff',
                    color: '#D32F2F',
                    border: '2px solid #D32F2F',
                    borderRadius: 10,
                    padding: '6px 12px',
                    fontWeight: 700
                  }}
                >
                  Remove Hero Video
                </button>
              </div>
              {heroVideoUrl && (
                <div className="mt-2">
                  <div style={{ fontSize: 12, color: '#555', wordBreak: 'break-all' }}>
                    <strong>Current URL:</strong> {heroVideoUrl}
                  </div>
                  <video src={heroVideoUrl} controls style={{ width: '100%', borderRadius: 12, marginTop: 8 }} />
                </div>
              )}
            </div>
            <div className="col-md-6">
              <label className="form-label" style={{ color: '#3B2F2F', fontWeight: '600', fontSize: 14 }}>
                Cinematic Stage Video
              </label>
              <p style={{ fontSize: 12, color: '#777', marginBottom: 6 }}>
                {stageVideoUrl ? 'Using custom uploaded video.' : 'No custom video uploaded. Using default video3.mp4.'}
              </p>
              <input
                type="file"
                accept="video/*"
                className="form-control"
                onChange={(e) => handleVideoUpload(e, 'stage')}
                disabled={isVideoUpdating}
                style={{ borderRadius: 12, border: '2px solid #E8EBDD', background: '#F8F5F2' }}
              />
              <div className="d-flex gap-2 mt-2">
                <button
                  type="button"
                  className="btn btn-sm"
                  onClick={() => handleRemoveVideo('stage')}
                  disabled={isVideoUpdating || !stageVideoUrl}
                  style={{
                    background: '#fff',
                    color: '#D32F2F',
                    border: '2px solid #D32F2F',
                    borderRadius: 10,
                    padding: '6px 12px',
                    fontWeight: 700
                  }}
                >
                  Remove Stage Video
                </button>
              </div>
              {stageVideoUrl && (
                <div className="mt-2">
                  <div style={{ fontSize: 12, color: '#555', wordBreak: 'break-all' }}>
                    <strong>Current URL:</strong> {stageVideoUrl}
                  </div>
                  <video src={stageVideoUrl} controls style={{ width: '100%', borderRadius: 12, marginTop: 8 }} />
                </div>
              )}
            </div>
          </div>
          {isVideoUpdating && (
            <div className="mt-2" style={{ fontSize: 12, color: '#640d14' }}>
              <i className="fas fa-spinner fa-spin me-1"></i>
              Uploading video...
            </div>
          )}
          {videoSaveWarning && (
            <div className="mt-2" style={{ fontSize: 12, color: '#D32F2F', fontWeight: 600 }}>
              {videoSaveWarning}
            </div>
          )}
        </div>

        {/* Homepage Full Banner */}
        <div className="mt-4" style={{
          background: '#fff',
          borderRadius: '20px',
          padding: '24px 30px',
          boxShadow: '0 10px 40px rgba(123, 84, 33, 0.08)',
          border: '1px solid rgba(201, 179, 126, 0.2)'
        }}>
          <h3 style={{
            color: '#3B2F2F',
            fontSize: '20px',
            fontWeight: '600',
            marginBottom: '18px',
            fontFamily: 'serif'
          }}>
            <i className="fas fa-image me-2" style={{ color: '#640d14' }}></i>
            Homepage Full Banner
          </h3>

          <label className="form-label" style={{ color: '#3B2F2F', fontWeight: '600', fontSize: 14 }}>
            Full Banner Image (shown on Home)
          </label>
          <p style={{ fontSize: 12, color: '#777', marginBottom: 6 }}>
            {fullBannerUrl ? 'Using custom uploaded banner.' : 'No custom banner uploaded. Using default fb.png.'}
          </p>

          <input
            type="file"
            accept="image/*"
            className="form-control"
            onChange={handleBannerUpload}
            disabled={isBannerUpdating}
            style={{ borderRadius: 12, border: '2px solid #E8EBDD', background: '#F8F5F2' }}
          />

          <div className="d-flex gap-2 mt-2">
            <button
              type="button"
              className="btn btn-sm"
              onClick={handleRemoveBanner}
              disabled={isBannerUpdating || !fullBannerUrl}
              style={{
                background: '#fff',
                color: '#D32F2F',
                border: '2px solid #D32F2F',
                borderRadius: 10,
                padding: '6px 12px',
                fontWeight: 700
              }}
            >
              Remove Banner
            </button>
          </div>

          {isBannerUpdating && (
            <div className="mt-2" style={{ fontSize: 12, color: '#640d14' }}>
              <i className="fas fa-spinner fa-spin me-1"></i>
              Uploading banner...
            </div>
          )}

          {bannerSaveWarning && (
            <div className="mt-2" style={{ fontSize: 12, color: '#D32F2F', fontWeight: 600 }}>
              {bannerSaveWarning}
            </div>
          )}

          {fullBannerUrl && (
            <div className="mt-2">
              <div style={{ fontSize: 12, color: '#555', wordBreak: 'break-all' }}>
                <strong>Current URL:</strong> {fullBannerUrl}
              </div>
              <img
                src={fullBannerUrl}
                alt="Full banner preview"
                style={{ width: '100%', borderRadius: 12, marginTop: 8, border: '1px solid #E8EBDD' }}
              />
            </div>
          )}
        </div>

        {/* Products Table */}
        <div style={{
          background: '#fff',
          borderRadius: '20px',
          padding: '30px',
          boxShadow: '0 10px 40px rgba(123, 84, 33, 0.1)',
          border: '1px solid rgba(201, 179, 126, 0.2)'
        }}>
          <h3 style={{
            color: '#3B2F2F',
            fontSize: '24px',
            fontWeight: '600',
            marginBottom: '25px',
            fontFamily: 'serif'
          }}>
            <i className="fas fa-list me-2" style={{ color: '#640d14' }}></i>
            Product Management
          </h3>

          <div className="row g-2 mb-3">
            <div className="col-md-6">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by product name or brand..."
                className="form-control"
                style={{ border: '2px solid #E8EBDD', borderRadius: '12px', padding: '12px 14px', background: '#F8F5F2' }}
              />
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-5">
              <div style={{
                width: '60px',
                height: '60px',
                background: 'linear-gradient(135deg, #640d14, #9b7645)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
                animation: 'spin 1s linear infinite'
              }}>
                <i className="fas fa-spinner" style={{ color: '#fff', fontSize: '24px' }}></i>
              </div>
              <p style={{ color: '#640d14', fontSize: '16px' }}>Loading products...</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover" style={{ margin: 0 }}>
                <thead>
                  <tr style={{
                    background: 'linear-gradient(135deg, #F8F5F2, #EFE8DC)',
                    border: 'none'
                  }}>
                    <th style={{
                      border: 'none',
                      color: '#3B2F2F',
                      fontWeight: '600',
                      padding: '15px',
                      fontSize: '14px'
                    }}>Image</th>
                    <th style={{
                      border: 'none',
                      color: '#3B2F2F',
                      fontWeight: '600',
                      padding: '15px',
                      fontSize: '14px'
                    }}>Name</th>
                    <th style={{
                      border: 'none',
                      color: '#3B2F2F',
                      fontWeight: '600',
                      padding: '15px',
                      fontSize: '14px'
                    }}>Brand</th>
                   
                    <th style={{
                      border: 'none',
                      color: '#3B2F2F',
                      fontWeight: '600',
                      padding: '15px',
                      fontSize: '14px'
                    }}>Category</th>
                    <th style={{
                      border: 'none',
                      color: '#3B2F2F',
                      fontWeight: '600',
                      padding: '15px',
                      fontSize: '14px'
                    }}>Stock</th>
                    {/* <th style={{
                      border: 'none',
                      color: '#3B2F2F',
                      fontWeight: '600',
                      padding: '15px',
                      fontSize: '14px'
                    }}>Sizes</th> */}
                    <th style={{
                      border: 'none',
                      color: '#3B2F2F',
                      fontWeight: '600',
                      padding: '15px',
                      fontSize: '14px'
                    }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.filter(p => {
                    if (!searchQuery) return true;
                    const q = searchQuery.toLowerCase();
                    return (p.name || '').toLowerCase().includes(q) || (p.brand || '').toLowerCase().includes(q);
                  }).length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-5">
                        <div style={{
                          color: '#640d14',
                          fontSize: '16px',
                          opacity: 0.7
                        }}>
                          <i className="fas fa-box-open mb-3" style={{ fontSize: '48px', display: 'block' }}></i>
                          No products found. Add your first product to get started.
                        </div>
                      </td>
                    </tr>
                  ) : products.filter(p => {
                    if (!searchQuery) return true;
                    const q = searchQuery.toLowerCase();
                    return (p.name || '').toLowerCase().includes(q) || (p.brand || '').toLowerCase().includes(q);
                  }).map(product => {
                    const sizeList = Array.isArray(product.sizes) ? product.sizes : [];
                    const sizeOutCount = sizeList.filter(sz => sz?.isOutOfStock).length;
                    const allSizesOut = sizeList.length > 0 && sizeOutCount === sizeList.length;
                    const someSizesOut = sizeList.length > 0 && sizeOutCount > 0 && !allSizesOut;
                    const finalOutOfStock = product.isOutOfStock || allSizesOut;
                    const stockLabel = finalOutOfStock
                      ? '❌ All sizes OOS'
                      : someSizesOut
                        ? `⚠️ ${sizeOutCount}/${sizeList.length} sizes OOS`
                        : '✅ Available';
                    const stockColor = finalOutOfStock ? '#D32F2F' : someSizesOut ? '#E6A800' : '#4CAF50';
                    return (
                      <tr key={product.id} style={{
                        borderBottom: '1px solid #E8EBDD',
                        transition: 'all 0.3s ease'
                      }}>
                        <td style={{ padding: '15px' }}>
                          <img
                            src={(Array.isArray(product.sizes) && product.sizes.find(s => s.size === '50ml' && Array.isArray(s.images) && s.images[0])?.images?.[0])
                              || (Array.isArray(product.sizes) && product.sizes[0] && Array.isArray(product.sizes[0].images) && product.sizes[0].images[0])
                              || product.image}
                            alt={product.name}
                            style={{
                              width: '60px',
                              height: '60px',
                              objectFit: 'cover',
                              borderRadius: '8px',
                              border: '2px solid #E8EBDD'
                            }} />
                        </td>
                        <td style={{
                          padding: '15px',
                          color: '#3B2F2F',
                          fontWeight: '500'
                        }}>
                          {product.name}
                        </td>
                        <td style={{
                          padding: '15px',
                          color: '#3B2F2F',
                          fontWeight: '500'
                        }}>
                          {product.brand}
                        </td>
                        
                        
                        <td style={{ padding: '15px' }}>
                          {(() => {
                            const categoryInfo = getCategoryInfo(product.badge);
                            return (
                              <span style={{
                                background: categoryInfo.bg,
                                color: '#fff',
                                padding: '4px 12px',
                                borderRadius: '20px',
                                fontSize: '12px',
                                fontWeight: '500',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px'
                              }}>
                                <i className={`fas ${categoryInfo.icon}`} style={{ fontSize: '10px' }}></i>
                                {product.badge || 'Standard'}
                              </span>
                            );
                          })()}
                        </td>
                        <td style={{ padding: '15px' }}>
                          <span style={{
                            color: stockColor,
                            fontWeight: '600'
                          }}>
                            {stockLabel}
                          </span>
                        </td>
                        {/* <td style={{ padding: '15px' }}>
              {product.data ? (
                <span style={{ color: '#3B2F2F', fontWeight: 400, fontSize: '13px' }}>
                  {product.data}
                </span>
              ) : (
                <span style={{ color: '#aaa', fontSize: '12px' }}>-</span>
              )}
            </td> */}

                        <td style={{ padding: '15px' }}>
                          <div className="d-flex gap-2">
                            <button
                              className="btn btn-sm"
                              onClick={() => handleEditClick(product)}
                              style={{
                                background: 'linear-gradient(135deg, #640d14, #9b7645)',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '8px',
                                padding: '8px 16px',
                                fontSize: '12px',
                                fontWeight: '500',
                                transition: 'all 0.3s ease'
                              }}
                              onMouseEnter={(e) => {
                                e.target.style.transform = 'translateY(-1px)';
                              } }
                              onMouseLeave={(e) => {
                                e.target.style.transform = 'translateY(0)';
                              } }
                            >
                              <i className="fas fa-edit me-1"></i>
                              Edit
                            </button>
                            <button
                              className="btn btn-sm"
                              onClick={() => handleDelete(product.id)}
                              style={{
                                background: '#fff',
                                color: '#D32F2F',
                                border: '2px solid #D32F2F',
                                borderRadius: '8px',
                                padding: '8px 16px',
                                fontSize: '12px',
                                fontWeight: '500',
                                transition: 'all 0.3s ease'
                              }}
                              onMouseEnter={(e) => {
                                e.target.style.background = '#D32F2F';
                                e.target.style.color = '#fff';
                              } }
                              onMouseLeave={(e) => {
                                e.target.style.background = '#fff';
                                e.target.style.color = '#D32F2F';
                              } }
                            >
                              <i className="fas fa-trash me-1"></i>
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Purchases & Payments */}
        <div className="mt-4" style={{
          background: '#fff',
          borderRadius: '20px',
          padding: '30px',
          boxShadow: '0 10px 40px rgba(123, 84, 33, 0.1)',
          border: '1px solid rgba(201, 179, 126, 0.2)'
        }}>
          <h3 style={{
            color: '#3B2F2F',
            fontSize: '24px',
            fontWeight: '600',
            marginBottom: '20px',
            fontFamily: 'serif'
          }}>
            <i className="fas fa-receipt me-2" style={{ color: '#640d14' }}></i>
            Purchases & Payments
          </h3>
          {isOrdersLoading ? (
            <div className="text-center py-4" style={{ color: '#640d14' }}>
              <i className="fas fa-spinner fa-spin me-2"></i>
              Loading orders...
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover" style={{ margin: 0 }}>
                <thead>
                  <tr style={{ background: 'linear-gradient(135deg, #F8F5F2, #EFE8DC)' }}>
                    <th style={{ border: 'none', padding: '12px', fontSize: 14, color: '#3B2F2F' }}>Date</th>
                    <th style={{ border: 'none', padding: '12px', fontSize: 14, color: '#3B2F2F' }}>Customer</th>
                    <th style={{ border: 'none', padding: '12px', fontSize: 14, color: '#3B2F2F' }}>Items</th>
                    <th style={{ border: 'none', padding: '12px', fontSize: 14, color: '#3B2F2F' }}>Total</th>
                    <th style={{ border: 'none', padding: '12px', fontSize: 14, color: '#3B2F2F' }}>Status</th>
                    <th style={{ border: 'none', padding: '12px', fontSize: 14, color: '#3B2F2F' }}>Payment ID</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-4" style={{ color: '#640d14' }}>
                        No orders yet
                      </td>
                    </tr>
                  ) : (
                    orders.map(o => {
                      const dt = o.createdAt && o.createdAt.seconds ? new Date(o.createdAt.seconds * 1000) : null;
                      const name = `${o?.customerInfo?.firstName || ''} ${o?.customerInfo?.lastName || ''}`.trim() || (o?.customerInfo?.email || 'Guest');
                      const itemCount = Array.isArray(o.items) ? o.items.reduce((n, it) => n + (Number(it.quantity||1)), 0) : 0;
                      return (
                        <tr key={o.id} style={{ borderBottom: '1px solid #E8EBDD' }}>
                          <td style={{ padding: '12px', color: '#3B2F2F' }}>{dt ? dt.toLocaleString() : '-'}</td>
                          <td style={{ padding: '12px', color: '#3B2F2F' }}>{name}</td>
                          <td style={{ padding: '12px', color: '#3B2F2F' }}>{itemCount}</td>
                          <td style={{ padding: '12px', color: '#3B2F2F', fontWeight: 600 }}>₹{formatPrice(o.total)}</td>
                          <td style={{ padding: '12px' }}>
                            <span style={{
                              background: o.status === 'paid' ? 'linear-gradient(135deg, #3FC53A, #4CAF50)' : 'linear-gradient(135deg, #E91E63, #C2185B)',
                              color: '#fff', padding: '4px 10px', borderRadius: 16, fontSize: 12, fontWeight: 600
                            }}>
                              {o.status || 'pending'}
                            </span>
                          </td>
                          <td style={{ padding: '12px', color: '#3B2F2F' }}>{o.paymentId || '-'}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Testimonials Management */}
        <div className="mt-4" style={{
          background: '#fff',
          borderRadius: '20px',
          padding: '30px',
          boxShadow: '0 10px 40px rgba(123, 84, 33, 0.1)',
          border: '1px solid rgba(201, 179, 126, 0.2)'
        }}>
          <h3 style={{
            color: '#3B2F2F',
            fontSize: '24px',
            fontWeight: '600',
            marginBottom: '20px',
            fontFamily: 'serif'
          }}>
            <i className="fas fa-comments me-2" style={{ color: '#640d14' }}></i>
            Testimonials
          </h3>

          {isReviewsLoading ? (
            <div className="text-center py-4" style={{ color: '#640d14' }}>
              <i className="fas fa-spinner fa-spin me-2"></i> Loading testimonials...
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-4" style={{ color: '#640d14', opacity: 0.8 }}>
              No testimonials found.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover" style={{ margin: 0 }}>
                <thead>
                  <tr style={{ background: 'linear-gradient(135deg, #F8F5F2, #EFE8DC)' }}>
                    <th style={{ border: 'none', padding: '12px', fontSize: '14px', color: '#3B2F2F' }}>User</th>
                    <th style={{ border: 'none', padding: '12px', fontSize: '14px', color: '#3B2F2F' }}>Rating</th>
                    <th style={{ border: 'none', padding: '12px', fontSize: '14px', color: '#3B2F2F' }}>Message</th>
                    <th style={{ border: 'none', padding: '12px', fontSize: '14px', color: '#3B2F2F' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reviews.map(r => (
                    <tr key={r.id} style={{ borderBottom: '1px solid #E8EBDD' }}>
                      <td style={{ padding: '12px' }}>
                        <div className="d-flex align-items-center gap-2">
                          {r.image ? (
                            <img src={r.image} alt={r.name} style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', border: '1px solid #E8EBDD' }} />
                          ) : (
                            <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#f3ede2' }}></div>
                          )}
                          <span style={{ color: '#3B2F2F', fontWeight: 500 }}>{r.name || 'Anonymous'}</span>
                        </div>
                      </td>
                      <td style={{ padding: '12px', color: '#640d14', fontWeight: 600 }}>{r.rating || 0}/5</td>
                      <td style={{ padding: '12px', color: '#3B2F2F' }}>
                        <span style={{ display: 'inline-block', maxWidth: 480, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {r.message}
                        </span>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <button
                          className="btn btn-sm"
                          onClick={() => handleDeleteReview(r.id)}
                          style={{ background: '#fff', color: '#D32F2F', border: '2px solid #D32F2F', borderRadius: '8px', padding: '6px 12px', fontSize: '12px' }}
                        >
                          <i className="fas fa-trash me-1"></i>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ 
          background: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(10px)'
        }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content" style={{
              borderRadius: '20px',
              border: '1px solid rgba(201, 179, 126, 0.2)',
              boxShadow: '0 20px 60px rgba(123, 84, 33, 0.2)'
            }}>
              <div className="modal-header" style={{
                borderBottom: '1px solid #E8EBDD',
                padding: '25px 30px'
              }}>
                <h5 className="modal-title" style={{
                  color: '#3B2F2F',
                  fontWeight: '600',
                  fontSize: '20px'
                }}>
                  <i className="fas fa-plus me-2" style={{ color: '#640d14' }}></i>
                  Add New Product
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowUploadModal(false)}
                  style={{ fontSize: '18px' }}
                />
              </div>
              <div className="modal-body" style={{ padding: '30px' }}>
                <UploadItemForm onUploadSuccess={() => {
                  fetchProducts();
                  setShowUploadModal(false);
                }} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editItem && (
        <div className="modal show d-block" tabIndex="-1" style={{ 
          background: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(10px)',
          zIndex: 1050
        }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content" style={{
              borderRadius: '24px',
              border: '1px solid #e0d6c3',
              boxShadow: '0 16px 48px rgba(123, 84, 33, 0.18)',
              background: 'linear-gradient(135deg, #fff 80%, #f8f5f2 100%)',
              overflow: 'hidden'
            }}>
              <div className="modal-header" style={{
                borderBottom: '1px solid #f3ede2',
                padding: '32px 36px',
                background: 'linear-gradient(90deg, #f8f5f2 60%, #efe8dc 100%)'
              }}>
                <h4 className="modal-title" style={{
                  color: '#3B2F2F',
                  fontWeight: '700',
                  fontSize: '22px',
                  letterSpacing: '0.5px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  <i className="fas fa-edit" style={{ color: '#640d14', fontSize: 22 }}></i>
                  Edit Product
                </h4>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setEditItem(null)}
                  style={{ fontSize: '20px', outline: 'none' }}
                />
              </div>
              <div className="modal-body" style={{ padding: '36px 36px 24px 36px', background: '#fff' }}>
                <form>
                  <div className="row g-4">
                    {/* Name */}
                    <div className="col-md-6">
                      <label className="form-label" style={{ color: '#3B2F2F', fontWeight: '600', fontSize: 15 }}>
                        <i className="fas fa-tag me-2" style={{ color: '#640d14' }}></i>
                        Name
                      </label>
                      <input 
                        className="form-control" 
                        name="name" 
                        value={formData.name || ''} 
                        onChange={handleFormChange} 
                        style={{
                          border: '2px solid #E8EBDD',
                          borderRadius: '14px',
                          padding: '15px 18px',
                          fontSize: '16px',
                          background: '#F8F5F2',
                          boxShadow: '0 2px 8px rgba(123, 84, 33, 0.04)'
                        }}
                      />
                    </div>
                    {/* Brand */}
                    <div className="col-md-6">
                      <label className="form-label" style={{ color: '#3B2F2F', fontWeight: '600', fontSize: 15 }}>
                        <i className="fas fa-tag me-2" style={{ color: '#640d14' }}></i>
                        Brand
                      </label>
                      <select
                        className="form-select"
                        name="brand"
                        value={formData.brand || ''}
                        onChange={handleFormChange}
                        style={{
                          border: '2px solid #E8EBDD',
                          borderRadius: '14px',
                          padding: '15px 18px',
                          fontSize: '16px',
                          background: '#F8F5F2',
                          boxShadow: '0 2px 8px rgba(123, 84, 33, 0.04)'
                        }}
                      >
                        <option value="">-- Select Brand --</option>
                        {brands.map(b => (
                          <option key={b} value={b}>{b}</option>
                        ))}
                      </select>
                    </div>
                    {/* Category */}
                    <div className="col-md-4">
                      <label className="form-label" style={{ color: '#3B2F2F', fontWeight: '600', fontSize: 15 }}>
                        <i className="fas fa-layer-group me-2" style={{ color: '#640d14' }}></i>
                        Category
                      </label>
                      <select 
                        className="form-select" 
                        name="badge" 
                        value={formData.badge || ''} 
                        onChange={handleFormChange}
                        style={{
                          border: '2px solid #E8EBDD',
                          borderRadius: '14px',
                          padding: '15px 18px',
                          fontSize: '16px',
                          background: '#F8F5F2',
                          boxShadow: '0 2px 8px rgba(123, 84, 33, 0.04)'
                        }}
                      >
                        <option value="">Select Category</option>
                        <option value="New">New</option>
                        <option value="Premium">Premium</option>
                        <option value="Budget">Budget</option>
                        <option value="Clearence">Clearence</option>
                        <option value="Special Edition">Special Edition</option>
                        <option value="Sale">Sale</option>
                      </select>
                    </div>
                    {/* Perfume Note */}
                    <div className="col-md-4">
                      <label className="form-label" style={{ color: '#3B2F2F', fontWeight: '600', fontSize: 15 }}>
                        <i className="fas fa-leaf me-2" style={{ color: '#640d14' }}></i>
                        Perfume Note
                      </label>
                      <select
                        className="form-select"
                        name="note"
                        value={formData.note || ''}
                        onChange={handleFormChange}
                        style={{
                          border: '2px solid #E8EBDD',
                          borderRadius: '14px',
                          padding: '15px 18px',
                          fontSize: '16px',
                          background: '#F8F5F2',
                          boxShadow: '0 2px 8px rgba(123, 84, 33, 0.04)'
                        }}
                      >
                        <option value="">Select Note</option>
                        {perfumeNotes.map(note => (
                          <option key={note} value={note}>{note}</option>
                        ))}
                      </select>
                    </div>
                    {/* Sizes & Prices with Images */}
                    <div className="col-12">
                      <label className="form-label" style={{ color: '#3B2F2F', fontWeight: '600', fontSize: 15 }}>
                        <i className="fas fa-ruler me-2" style={{ color: '#640d14' }}></i>
                        Sizes & Prices
                      </label>
                      <div style={{ fontSize: '13px', color: '#888', marginBottom: 8 }}>
                        Adding more than one size is optional.
                      </div>
                      {Array.isArray(formData.sizes) && formData.sizes.length > 0 ? (
                        <>
                          {formData.sizes.map((sz, idx) => (
                            <div key={idx} className="row g-2 align-items-end mb-2">
                              <div className="col-md-4">
                                <select
                                  className="form-select"
                                  value={sz.size}
                                  onChange={e => handleSizeChange(idx, 'size', e.target.value)}
                                  style={{ border: '2px solid #E8EBDD', borderRadius: '12px', padding: '10px 15px', fontSize: '16px', background: '#F8F5F2', transition: 'all 0.3s ease' }}
                                >
                                  <option value="">-- Select Size --</option>
                                  <option value="10ml">10ml</option>
                                  <option value="20ml">20ml</option>
                                  <option value="50ml">50ml</option>
                                  <option value="100ml">100ml</option>
                                  <option value="custom">Custom Size</option>
                                </select>
                              </div>
                              {sz.size === 'custom' && (
                                <div className="col-md-4">
                                  <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Enter custom size (e.g., 150ml)"
                                    value={sz.customSize || ''}
                                    onChange={e => handleSizeChange(idx, 'customSize', e.target.value)}
                                    style={{ border: '2px solid #E8EBDD', borderRadius: '12px', padding: '10px 15px', fontSize: '16px', background: '#F8F5F2', transition: 'all 0.3s ease' }}
                                  />
                                </div>
                              )}
                              <div className="col-md-3">
                                <input
                                  type="number"
                                  className="form-control"
                                  placeholder="Price"
                                  value={sz.price}
                                  onChange={e => handleSizeChange(idx, 'price', e.target.value)}
                                  style={{ border: '2px solid #E8EBDD', borderRadius: '12px', padding: '10px 15px', fontSize: '16px', background: '#F8F5F2', transition: 'all 0.3s ease' }}
                                />
                              </div>
                              <div className="col-md-3">
                                <input
                                  type="number"
                                  className="form-control"
                                  placeholder="Old Price (Optional)"
                                  value={sz.oldPrice}
                                  onChange={e => handleSizeChange(idx, 'oldPrice', e.target.value)}
                                  style={{ border: '2px solid #E8EBDD', borderRadius: '12px', padding: '10px 15px', fontSize: '16px', background: '#F8F5F2', transition: 'all 0.3s ease' }}
                                />
                              </div>
                              <div className="col-md-2">
                                <input
                                  type="number"
                                  className="form-control"
                                  placeholder="Stock"
                                  value={sz.stock}
                                  min={0}
                                  onChange={e => handleSizeChange(idx, 'stock', e.target.value)}
                                  style={{ border: '2px solid #E8EBDD', borderRadius: '12px', padding: '10px 15px', fontSize: '16px', background: '#F8F5F2', transition: 'all 0.3s ease' }}
                                />
                              </div>
                              <div className="col-md-2 d-flex align-items-center">
                                <div className="form-check mt-3">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                    id={`edit-size-oos-${idx}`}
                                    checked={!!sz.isOutOfStock}
                                    onChange={e => handleSizeChange(idx, 'isOutOfStock', e.target.checked)}
                                    style={{ transform: 'scale(1.1)' }}
                                  />
                                  <label className="form-check-label ms-2" htmlFor={`edit-size-oos-${idx}`} style={{ color: '#3B2F2F', fontSize: '13px', fontWeight: 500 }}>
                                    Out of Stock
                                  </label>
                                </div>
                              </div>
                              <div className="col-12 col-md-9">
                                <label className="form-label fw-semibold" style={{ color: '#3B2F2F', fontSize: '14px' }}>
                                  <i className="fas fa-images me-2" style={{ color: '#640d14' }}></i>
                                  Upload up to 4 images for this size (min 1 required)
                                </label>
                                <input
                                  type="file"
                                  accept="image/*"
                                  multiple
                                  className="form-control"
                                  onChange={e => handleSizeImagesChange(idx, e.target.files)}
                                  style={{ border: '2px solid #E8EBDD', borderRadius: '12px', padding: '10px 15px', background: '#F8F5F2' }}
                                />
                                {sz.imagesPreview && sz.imagesPreview.length > 0 && (
                                  <div className="d-flex flex-wrap gap-2 mt-2">
                                    {sz.imagesPreview.map((src, i) => (
                                      <div key={i} className="position-relative" style={{ width: 60, height: 60 }}>
                                        <img src={src} alt="preview" style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 8, border: '1px solid #E8EBDD' }} />
                                        <button
                                          type="button"
                                          className="btn btn-sm btn-light position-absolute"
                                          style={{ top: -8, right: -8, borderRadius: '50%', width: 22, height: 22, padding: 0, border: '1px solid #ddd' }}
                                          onClick={() => handleRemoveSizeImage(idx, i)}
                                          aria-label="Remove image"
                                        >
                                          ×
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                              {idx > 0 && (
                                <div className="col-md-1 d-flex align-items-center">
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-danger"
                                    style={{ borderRadius: 8, fontSize: 14, padding: '4px 10px', marginLeft: 4 }}
                                    onClick={() => setFormData(prev => ({ ...prev, sizes: prev.sizes.filter((_, i) => i !== idx) }))}
                                    tabIndex={-1}
                                  >
                                    Remove
                                  </button>
                                </div>
                              )}
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, sizes: [...(prev.sizes || []), { size: '', price: '', oldPrice: '', customSize: '', stock: 0, imagesFiles: [], imagesPreview: [] }] }))}
                            style={{
                              background: '#fff',
                              color: '#640d14',
                              border: '2px solid #C9B37E',
                              borderRadius: '10px',
                              padding: '10px 30px',
                              fontSize: '16px',
                              fontWeight: '500',
                              marginTop: '10px',
                              boxShadow: '0 2px 10px rgba(123, 84, 33, 0.08)',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease'
                            }}
                          >
                            <i className="fas fa-plus me-2"></i>
                            Add More Sizes
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => setFormData(prev => ({ ...prev, sizes: [{ size: '', price: '', oldPrice: '', customSize: '', stock: 0, imagesFiles: [], imagesPreview: [] }] }))}
                        >
                          Initialize Sizes
                        </button>
                      )}
                    </div>
                    {/* Stock Status */}
                    <div className="col-md-4 d-flex align-items-center">
                      <div className="form-check mt-4">
                        <input 
                          className="form-check-input" 
                          type="checkbox" 
                          name="isOutOfStock" 
                          checked={formData.isOutOfStock} 
                          onChange={handleFormChange}
                          style={{ transform: 'scale(1.2)' }}
                        />
                        <label className="form-check-label" style={{ color: '#3B2F2F', fontWeight: '600', fontSize: 15 }}>
                          <i className="fas fa-exclamation-triangle me-2" style={{ color: '#D32F2F' }}></i>
                          Out of Stock
                        </label>
                      </div>
                    </div>
                    {/* Gender */}
                    <div className="col-md-8 d-flex align-items-center">
                        <div className="d-flex align-items-center gap-4 mt-4 flex-wrap">
                        <label className="form-label m-0" style={{ color: '#3B2F2F', fontWeight: '600', fontSize: 15 }}>
                          <i className="fas fa-venus-mars me-2" style={{ color: '#640d14' }}></i>
                          Gender (optional)
                        </label>
                        {genderOptions.map(g => (
                          <div className="form-check m-0" key={g}>
                            <input
                              className="form-check-input"
                              type="checkbox"
                              name="gender"
                              value={g}
                              id={`edit-gender-${g}`}
                              checked={Array.isArray(formData.gender) && formData.gender.includes(g)}
                              onChange={handleGenderChange}
                              style={{ transform: 'scale(1.1)' }}
                            />
                            <label className="form-check-label ms-2" htmlFor={`edit-gender-${g}`} style={{ color: '#3B2F2F', fontSize: '14px' }}>
                              {g === 'men' ? 'Men' : g === 'women' ? 'Women' : 'Unisex'}
                            </label>
                          </div>
                        ))}
                        <small className="text-muted" style={{ fontSize: '12px' }}>
                          Select Men, Women or mark Unisex to target everyone
                        </small>
                      </div>
                    </div>
                    {/* Description */}
                    <div className="col-12">
                      <label className="form-label" style={{ color: '#3B2F2F', fontWeight: '600', fontSize: 15 }}>
                        <i className="fas fa-align-left me-2" style={{ color: '#640d14' }}></i>
                        Description
                      </label>
                      <textarea 
                        className="form-control" 
                        name="data" 
                        value={formData.data} 
                        onChange={handleFormChange}
                        rows="3"
                        style={{
                          border: '2px solid #E8EBDD',
                          borderRadius: '14px',
                          padding: '15px 18px',
                          fontSize: '16px',
                          background: '#F8F5F2',
                          boxShadow: '0 2px 8px rgba(123, 84, 33, 0.04)'
                        }}
                      />
                    </div>
                    {/* Tags */}
                    <div className="col-12">
                      <label className="form-label" style={{ color: '#3B2F2F', fontWeight: '600', fontSize: 15 }}>
                        <i className="fas fa-star me-2" style={{ color: '#640d14' }}></i>
                        Tags
                      </label>
                      <div style={{ display: 'flex', gap: '24px', marginBottom: '10px', flexWrap: 'wrap' }}>
                        {["Top Sales", "New Arrivals", "Top Ratings"].map(tag => (
                          <div className="form-check" key={tag}>
                            <input
                              className="form-check-input"
                              type="checkbox"
                              name="tags"
                              value={tag}
                              id={`edit-tag-${tag.replace(/\s+/g, '-').toLowerCase()}`}
                              checked={Array.isArray(formData.tags) && formData.tags.includes(tag)}
                              onChange={e => {
                                const tagValue = e.target.value;
                                setFormData(prev => {
                                  let newTags = prev.tags && prev.tags.includes(tagValue)
                                    ? prev.tags.filter(t => t !== tagValue)
                                    : [...(prev.tags || []), tagValue];
                                  return {
                                    ...prev,
                                    tags: newTags,
                                  };
                                });
                              }}
                              style={{ transform: 'scale(1.1)' }}
                            />
                            <label className="form-check-label" htmlFor={`edit-tag-${tag.replace(/\s+/g, '-').toLowerCase()}`}
                              style={{ marginLeft: '8px', color: '#3B2F2F', fontSize: '14px', fontWeight: 500 }}>
                              {tag}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </form>
              </div>
              <div className="modal-footer" style={{
                borderTop: '1px solid #f3ede2',
                padding: '28px 36px',
                background: '#f8f5f2'
              }}>
                <button 
                  className="btn" 
                  onClick={() => setEditItem(null)}
                  style={{
                    background: '#fff',
                    color: '#640d14',
                    border: '2px solid #640d14',
                    borderRadius: '14px',
                    padding: '12px 28px',
                    fontWeight: '700',
                    fontSize: '16px',
                    marginRight: '10px',
                    boxShadow: '0 2px 8px rgba(123, 84, 33, 0.04)'
                  }}
                >
                  Cancel
                </button>
                <button 
                  className="btn" 
                  onClick={handleUpdate}
                  disabled={isUpdating}
                  style={{
                    background: 'linear-gradient(135deg, #640d14, #9b7645)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '14px',
                    padding: '12px 28px',
                    fontWeight: '700',
                    fontSize: '16px',
                    boxShadow: '0 4px 16px rgba(123, 84, 33, 0.10)'
                  }}
                >
                  {isUpdating ? (
                    <>
                      <i className="fas fa-spinner fa-spin me-2"></i>
                      Saving...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-save me-2"></i>
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;
