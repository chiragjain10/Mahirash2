import React, { useState } from 'react';
import { db } from './firebase';
import { collection, addDoc } from 'firebase/firestore';
import axios from 'axios';

const genderOptions = ['men', 'women', 'unisex'];
const perfumeNotes = ['Woody', 'Citrus', 'Flower', 'Aromatic'];

const UploadItemForm = ({ onUploadSuccess }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    customBrand: '', // This will hold the user-entered brand
    data: '',
    badge: '',
    isOutOfStock: false,
    tags: [],
    gender: [],
    note: '',
  });
  const [sizes, setSizes] = useState([
    { size: '', brand: '', price: '', oldPrice: '', customSize: '', stock: 0, imagesFiles: [], imagesPreview: [], isOutOfStock: false }
  ]);

  // Static brand list for dropdown
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

  const handleChange = (e) => {
    const { name, type, value, checked } = e.target;

    setFormData(prev => {
      // Handle special case for brand selection
      if (name === 'brand') {
        const newState = {
          ...prev,
          brand: value,
        };
        // Clear customBrand if a regular brand is selected
        if (value !== 'custom') {
          newState.customBrand = '';
        }
        return newState;
      }
      
      // Handle other fields as before
      if (name === 'tags') {
        const tagValue = value;
        const newTags = prev.tags.includes(tagValue)
          ? prev.tags.filter(tag => tag !== tagValue)
          : [...prev.tags, tagValue];
        return { ...prev, tags: newTags };
      }
      
      if (name === 'gender') {
        const genderValue = value;
        if (genderValue === 'unisex') {
          return { ...prev, gender: ['unisex'] };
        }
        const withoutUnisex = prev.gender.filter(g => g !== 'unisex');
        const isSelected = withoutUnisex.includes(genderValue);
        const updated = isSelected
          ? withoutUnisex.filter(g => g !== genderValue)
          : [...withoutUnisex, genderValue];
        return { ...prev, gender: updated };
      }
      
      return {
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      };
    });
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.files[0],
    }));
  };

  const handleSizeChange = (idx, field, value) => {
    setSizes(prev => prev.map((s, i) => {
      if (i !== idx) return s;
      if (field === 'size' && value !== 'custom') {
        // Clear custom size when selecting a predefined size
        return { ...s, [field]: value, customSize: '' };
      }
      if (field === 'isOutOfStock') {
        return { ...s, isOutOfStock: Boolean(value) };
      }
      return { ...s, [field]: value };
    }));
  };

  const handleSizeImagesChange = (idx, filesList) => {
    const newFiles = Array.from(filesList);
    setSizes(prev => prev.map((s, i) => {
      if (i !== idx) return s;
      const existingFiles = s.imagesFiles || [];
      const combined = [...existingFiles, ...newFiles].slice(0, 4);
      const previews = combined.map(f => (typeof f === 'string' ? f : URL.createObjectURL(f)));
      return { ...s, imagesFiles: combined, imagesPreview: previews };
    }));
  };

  const handleRemoveSizeImage = (idx, imgIdx) => {
    setSizes(prev => prev.map((s, i) => {
      if (i !== idx) return s;
      const files = [...(s.imagesFiles || [])];
      const previews = [...(s.imagesPreview || [])];
      files.splice(imgIdx, 1);
      previews.splice(imgIdx, 1);
      return { ...s, imagesFiles: files, imagesPreview: previews };
    }));
  };

  const addMoreSizes = () => {
    setSizes(prev => [...prev, { size: '', price: '', oldPrice: '', customSize: '', stock: 0, imagesFiles: [], imagesPreview: [], isOutOfStock: false }]);
  };

  const uploadToCloudinary = async (file) => {
    const data = new FormData();
    data.append('file', file);
    data.append('upload_preset', 'Mahirash');

    const res = await axios.post('https://api.cloudinary.com/v1_1/djmfxpemz/image/upload', data);
    return res.data.secure_url;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUploading(true);

    try {
      // Compute gender: if none or both selected => 'unisex'; if one selected => that one
      const selectedGenders = Array.isArray(formData.gender) ? formData.gender : [];
      let finalGender = 'unisex';
      if (selectedGenders.includes('unisex')) {
        finalGender = 'unisex';
      } else if (selectedGenders.length === 1) {
        finalGender = selectedGenders[0].toLowerCase();
      }
      const finalBrand = formData.brand === 'custom' 
        ? formData.customBrand 
        : formData.brand;

      // Validate that a brand name exists if 'custom' was selected
      if (formData.brand === 'custom' && !formData.customBrand.trim()) {
        throw new Error('Please enter a new brand name.');
      }

      // Build sizes with uploaded images (1 required, up to 4)
      const preparedSizes = [];
      for (const s of sizes) {
        if (!(s.size && s.price)) continue;
        if (!s.imagesFiles || s.imagesFiles.length === 0) {
          throw new Error('Please upload at least 1 image for each size.');
        }

        // Handle custom size
        let finalSize = s.size;
        if (s.size === 'custom' && s.customSize) {
          finalSize = s.customSize;
        }

        const uploadedUrls = [];
        for (const file of s.imagesFiles.slice(0, 4)) {
          const url = await uploadToCloudinary(file);
          uploadedUrls.push(url);
        }
        const numericStock = Number(s.stock || 0);
        preparedSizes.push({ size: finalSize, price: s.price, oldPrice: s.oldPrice || '', stock: isNaN(numericStock) ? 0 : numericStock, images: uploadedUrls, isOutOfStock: !!s.isOutOfStock || (numericStock <= 0) });
      }

      if (preparedSizes.length === 0) {
        throw new Error('Please add at least one valid size with image(s).');
      }

      const derivedProductOutOfStock = formData.isOutOfStock || preparedSizes.every(sz => (sz.isOutOfStock || (Number(sz.stock || 0) <= 0)));

      await addDoc(collection(db, 'products'), {
        name: formData.name,
        brand: finalBrand, // Use the final brand here
        data: formData.data,
        badge: formData.badge,
        isOutOfStock: derivedProductOutOfStock,
        tags: formData.tags,
        gender: finalGender,
        note: formData.note || '',
        sizes: preparedSizes,
      });

      alert('Product uploaded successfully!');
      setFormData({
        name: '',
        brand: '',
        customBrand: '', // Reset the custom brand field
        data: '',
        badge: '',
        isOutOfStock: false,
        tags: [],
        gender: [],
        note: '',
      });
      setSizes([{ size: '', price: '', oldPrice: '', customSize: '', stock: 0, imagesFiles: [], imagesPreview: [], isOutOfStock: false }]);
      if (onUploadSuccess) onUploadSuccess();
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload product. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
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
        fontFamily: 'serif',
        textAlign: 'center'
      }}>
        <i className="fas fa-plus-circle me-2" style={{ color: '#640d14' }}></i>
        Add New Product
      </h3>

      <form onSubmit={handleSubmit}>
        <div className="row g-4">
          {/* Product Name */}
          <div className="col-12">
            <label style={{
              display: 'block',
              color: '#3B2F2F',
              fontSize: '14px',
              fontWeight: '600',
              marginBottom: '8px'
            }}>
              <i className="fas fa-tag me-2" style={{ color: '#640d14' }}></i>
              Product Name *
            </label>
            <input
              name="name"
              placeholder="Enter product name"
              className="form-control"
              onChange={handleChange}
              required
              style={{
                border: '2px solid #E8EBDD',
                borderRadius: '12px',
                padding: '15px 20px',
                fontSize: '16px',
                background: '#F8F5F2',
                transition: 'all 0.3s ease'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#640d14';
                e.target.style.background = '#fff';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#E8EBDD';
                e.target.style.background = '#F8F5F2';
              }}
            />
          </div>

          <div className="col-12">
            <label style={{
              display: 'block',
              color: '#3B2F2F',
              fontSize: '14px',
              fontWeight: '600',
              marginBottom: '8px'
            }}>
              <i className="fas fa-tag me-2" style={{ color: '#640d14' }}></i>
              Product Brand *
            </label>
            <select
              name="brand"
              className="form-select"
              value={formData.brand}
              onChange={handleChange}
              required
              style={{
                border: '2px solid #E8EBDD',
                borderRadius: '12px',
                padding: '15px 20px',
                fontSize: '16px',
                background: '#F8F5F2',
                transition: 'all 0.3s ease'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#640d14';
                e.target.style.background = '#fff';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#E8EBDD';
                e.target.style.background = '#F8F5F2';
              }}
            >
              <option value="" disabled>-- Select Brand --</option>
              {brands.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
              <option value="custom">-- Add New Brand --</option>
            </select>

            {/* Conditionally render the new brand input field */}
            {formData.brand === 'custom' && (
              <div className="mt-3">
                <input
                  type="text"
                  name="customBrand"
                  placeholder="Enter new brand name"
                  className="form-control"
                  value={formData.customBrand}
                  onChange={handleChange}
                  required // Make it required when this field is visible
                  style={{
                    border: '2px solid #E8EBDD',
                    borderRadius: '12px',
                    padding: '15px 20px',
                    fontSize: '16px',
                    background: '#F8F5F2',
                    transition: 'all 0.3s ease'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#640d14';
                    e.target.style.background = '#fff';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#E8EBDD';
                    e.target.style.background = '#F8F5F2';
                  }}
                />
              </div>
            )}
          </div>

          <div className="col-12">
            <label style={{
              display: 'block',
              color: '#3B2F2F',
              fontSize: '14px',
              fontWeight: '600',
              marginBottom: '8px'
            }}>
              <i className="fas fa-leaf me-2" style={{ color: '#640d14' }}></i>
              Perfume Note *
            </label>
            <select
              name="note"
              className="form-select"
              value={formData.note}
              onChange={handleChange}
              required
              style={{
                border: '2px solid #E8EBDD',
                borderRadius: '12px',
                padding: '15px 20px',
                fontSize: '16px',
                background: '#F8F5F2',
                transition: 'all 0.3s ease'
              }}
            >
              <option value="" disabled>-- Select Perfume Note --</option>
              {perfumeNotes.map(note => (
                <option key={note} value={note}>{note}</option>
              ))}
            </select>
          </div>

          {/* Price and Old Price */}
          <div className="row g-4">

            {/* Price & Old Price */}


            {/* Category */}
            <div className="col-md-6">
              <label className="form-label fw-semibold text-dark" style={{ color: '#3B2F2F' }}>
                <i className="fas fa-layer-group me-2" style={{ color: '#640d14' }}></i>
                Category *
              </label>
              <select
                name="badge"
                className="form-select"
                required
                onChange={handleChange}
                style={{
                  border: '2px solid #E8EBDD',
                  borderRadius: '12px',
                  padding: '15px 20px',
                  fontSize: '16px',
                  background: '#F8F5F2',
                  transition: 'all 0.3s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#640d14';
                  e.target.style.background = '#fff';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#E8EBDD';
                  e.target.style.background = '#F8F5F2';
                }}
              >
                <option value="">-- Select Category --</option>
                <option value="New">New</option>
                <option value="Premium">Premium</option>
                <option value="Budget">Budget</option>
                <option value="Clearence">Clearence</option>
                <option value="Special Edition">Special Edition</option> 
                <option value="Sale">Sale</option> 
              </select>
            </div>

            {/* Sizes Section */}
            <div className="col-12">
              <label className="form-label fw-semibold text-dark" style={{ color: '#3B2F2F' }}>
                <i className="fas fa-ruler me-2" style={{ color: '#640d14' }}></i>
                Sizes & Prices
              </label>
              <div style={{ fontSize: '13px', color: '#888', marginBottom: 8 }}>
                Adding more than one size is optional.
              </div>
              {sizes.map((sz, idx) => (
                <div key={idx} className="row g-2 align-items-end mb-2">
                  <div className="col-md-4">
                    <select
                      className="form-select"
                      value={sz.size}
                      onChange={e => handleSizeChange(idx, 'size', e.target.value)}
                      required
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
                        value={sz.customSize}
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
                      required
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
                        id={`size-oos-${idx}`}
                        checked={!!sz.isOutOfStock}
                        onChange={e => handleSizeChange(idx, 'isOutOfStock', e.target.checked)}
                        style={{ transform: 'scale(1.1)' }}
                      />
                      <label className="form-check-label ms-2" htmlFor={`size-oos-${idx}`} style={{ color: '#3B2F2F', fontSize: '13px', fontWeight: 500 }}>
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
                      required={!(sz.imagesFiles && sz.imagesFiles.length > 0)}
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
                        onClick={() => setSizes(prev => prev.filter((_, i) => i !== idx))}
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
                onClick={addMoreSizes}
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
            </div>

            {/* Gender (Optional) */}
            <div className="col-12">
              <div
                className="d-flex align-items-center justify-content-between flex-wrap gap-4 p-3"
                style={{
                  background: '#',
                  border: '2px solid #E8EBDD',
                  borderRadius: '12px'
                }}
              >
                <div className="d-flex flex-wrap align-items-center gap-4">
                  <label
                    className="form-label m-0 fw-semibold"
                    style={{ color: '#3B2F2F', fontSize: '14px' }}
                  >
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
                        id={`gender-${g}`}
                        checked={Array.isArray(formData.gender) && formData.gender.includes(g)}
                        onChange={handleChange}
                        style={{ transform: 'scale(1.1)' }}
                      />
                      <label
                        className="form-check-label ms-2"
                        htmlFor={`gender-${g}`}
                        style={{ color: '#3B2F2F', fontSize: '14px' }}
                      >
                      {g === 'men' ? 'Men' : g === 'women' ? 'Women' : 'Unisex'}
                      </label>
                    </div>
                  ))}
                  <small className="text-muted ms-2" style={{ fontSize: '12px' }}>
                  Select Men, Women or choose Unisex to mark for everyone
                  </small>
                </div>
              </div>
            </div>

            {/* Stock Status */}
            <div className="col-12">
              <div
                className="d-flex align-items-center justify-content-between flex-wrap gap-4 p-3"
                style={{
                  background: '#',
                  border: '2px solid #E8EBDD',
                  borderRadius: '12px'
                }}
              >
                {/* Out of Stock Toggle */}
                <div className="form-check form-switch m-0 d-flex align-items-center">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    name="isOutOfStock"
                    id="outOfStockSwitch"
                    onChange={handleChange}
                    style={{ transform: 'scale(1.3)' }}
                  />
                  <label
                    className="form-check-label ms-2"
                    htmlFor="outOfStockSwitch"
                    style={{
                      color: '#3B2F2F',
                      fontWeight: '600',
                      fontSize: '16px',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    <i className="fas fa-exclamation-triangle me-2" style={{ color: '#D32F2F' }}></i>
                    Out of Stock
                  </label>
                </div>

                {/* Product Tags */}
                <div className="d-flex flex-wrap align-items-center gap-4">
                  <label
                    className="form-label m-0 fw-semibold"
                    style={{ color: '#3B2F2F', fontSize: '14px' }}
                  >
                    <i className="fas fa-star me-2" style={{ color: '#640d14' }}></i>
                    Tags:
                  </label>
                  {['Top Sales', 'New Arrivals', 'Top Ratings'].map(tag => (
                    <div className="form-check m-0" key={tag}>
                      <input
                        className="form-check-input"
                        type="checkbox"
                        name="tags"
                        value={tag}
                        id={`tag-${tag}`}
                        checked={formData.tags.includes(tag)}
                        onChange={handleChange}
                        style={{ transform: 'scale(1.1)' }}
                      />
                      <label
                        className="form-check-label ms-2"
                        htmlFor={`tag-${tag}`}
                        style={{ color: '#3B2F2F', fontSize: '14px' }}
                      >
                        {tag}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>


            {/* Product Description */}
            <div className="col-12">
              <label className="form-label fw-semibold text-dark" style={{ color: '#3B2F2F' }}>
                <i className="fas fa-align-left me-2" style={{ color: '#640d14' }}></i>
                Product Description
              </label>
              <textarea
                name="data"
                className="form-control"
                placeholder="Enter detailed product description..."
                rows="4"
                onChange={handleChange}
                style={{
                  border: '2px solid #E8EBDD',
                  borderRadius: '12px',
                  padding: '15px 20px',
                  fontSize: '16px',
                  background: '#F8F5F2',
                  transition: 'all 0.3s ease',
                  resize: 'vertical'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#640d14';
                  e.target.style.background = '#fff';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#E8EBDD';
                  e.target.style.background = '#F8F5F2';
                }}
              />
            </div>

          </div>

          {/* Images moved per-size. Product-level images removed as requested */}
        </div>

        {/* Submit Button */}
        <div className="text-center mt-5 d-flex flex-column align-items-center gap-3">
          <button
            type="submit"
            disabled={isUploading}
            style={{
              background: isUploading ? '#C9B37E' : 'linear-gradient(135deg, #640d14, #9b7645)',
              color: '#fff',
              border: 'none',
              borderRadius: '15px',
              padding: '18px 40px',
              fontSize: '18px',
              fontWeight: '600',
              cursor: isUploading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 10px 30px rgba(123, 84, 33, 0.3)',
              minWidth: '200px'
            }}
            onMouseEnter={(e) => {
              if (!isUploading) {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 15px 40px rgba(123, 84, 33, 0.4)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isUploading) {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 10px 30px rgba(123, 84, 33, 0.3)';
              }
            }}
          >
            {isUploading ? (
              <span>
                <i className="fas fa-spinner fa-spin me-2"></i>
                Uploading...
              </span>
            ) : (
              <span>
                <i className="fas fa-cloud-upload-alt me-2"></i>
                Upload Product
              </span>
            )}
          </button>

        </div>
      </form>
    </div>
  );
};

export default UploadItemForm;
