import React, { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import { db } from "../firebase";
import { collection, addDoc, getDocs, serverTimestamp, orderBy, query } from "firebase/firestore";
import axios from "axios";
import "./ReviewsPremium.css";

const uploadToCloudinary = async (file) => {
  const data = new FormData();
  data.append("file", file);
  data.append("upload_preset", "Mahirash");
  const res = await axios.post("https://api.cloudinary.com/v1_1/djmfxpemz/image/upload", data);
  return res.data.secure_url;
};

const ReviewsSwiper = () => {
  const [reviews, setReviews] = useState([]);
  const [form, setForm] = useState({ name: "", message: "", image: null, rating: 5 });
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    const fetchReviews = async () => {
      const q = query(collection(db, "reviews"), orderBy("timestamp", "desc"));
      const snapshot = await getDocs(q);
      setReviews(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchReviews();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let imageUrl = form.image ? await uploadToCloudinary(form.image) : "";
      await addDoc(collection(db, "reviews"), { ...form, image: imageUrl, timestamp: serverTimestamp() });
      setForm({ name: "", message: "", image: null, rating: 5 });
      setImagePreview(null);
      setShowForm(false);
      const snapshot = await getDocs(query(collection(db, "reviews"), orderBy("timestamp", "desc")));
      setReviews(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  return (
    <section className="rev-pr-section">
      <div className="">
        {/* Title: Preserved your exact style */}
        <div className="rev-pr-header">
          <h2 className="s-title font-2 text-capitalize">
            Customer <span className="">Reviews</span>
          </h2>
        </div>

        <Swiper
          modules={[Pagination, Autoplay]}
          spaceBetween={20}
          slidesPerView={3}
          pagination={{ clickable: true, el: '.rev-pr-pagination' }}
          autoplay={{ delay: 5000 }}
          breakpoints={{
            0: { slidesPerView: 1 },
            768: { slidesPerView: 2 },
            1100: { slidesPerView: 3 },
          }}
          className="rev-pr-swiper"
        >
          {reviews.map((rev) => (
            <SwiperSlide key={rev.id}>
              <div className="rev-pr-card">
                <div className="rev-pr-card-inner">
                  <div className="rev-pr-user-box">
                    {rev.image ? (
                      <img src={rev.image} alt="" className="rev-pr-avatar" />
                    ) : (
                      <div className="rev-pr-avatar-alt">{rev.name[0]}</div>
                    )}
                    <div className="rev-pr-meta">
                      <span className="rev-pr-name">{rev.name}</span>
                      <div className="rev-pr-stars">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className={i < rev.rating ? "active" : ""}>★</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="rev-pr-text">"{rev.message}"</p>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
        
        <div className="rev-pr-pagination"></div>

        {/* The Premium Button */}
        <div className="rev-pr-action">
          <button 
            className={`rev-pr-btn-main ${showForm ? 'is-open' : ''}`}
            onClick={() => setShowForm(!showForm)}
          >
            <span className="btn-text">{showForm ? "Close Form" : "Share Your Story"}</span>
            <span className="btn-line"></span>
          </button>
        </div>

        {showForm && (
          <div className="rev-pr-form-wrap">
            <form onSubmit={handleSubmit} className="rev-pr-form">
              <input 
                className="rev-pr-input" 
                placeholder="Your Name" 
                value={form.name} 
                onChange={e => setForm({...form, name: e.target.value})} 
                required 
              />
              <textarea 
                className="rev-pr-input" 
                placeholder="Your Message" 
                rows="3" 
                value={form.message} 
                onChange={e => setForm({...form, message: e.target.value})} 
                required 
              />
              <div className="rev-pr-form-footer">
                <div className="rev-pr-rating-input">
                  {[...Array(5)].map((_, i) => (
                    <span 
                      key={i} 
                      onClick={() => setForm({...form, rating: i+1})}
                      className={i < form.rating ? "active" : ""}
                    >★</span>
                  ))}
                </div>
                <button type="submit" className="rev-pr-submit" disabled={loading}>
                  {loading ? "Sending..." : "Post Review"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </section>
  );
};

export default ReviewsSwiper;