import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "./FeatureBoxes.css";

const featureData = [
  { iconClass: "icon-delivery", title: "Free Shipping", tag: "Global" },
  { iconClass: "icon-shield", title: "Secure Payment", tag: "Encrypted" },
  { iconClass: "icon-star", title: "Premium Quality", tag: "Certified" },
  { iconClass: "icon-gift", title: "Gift Wrapping", tag: "Luxury" },
];

const FeaturesSlider = () => {
  return (
    <section className="blade-section">
      <div className="blade-wrapper">
        <Swiper
          modules={[Pagination, Autoplay]}
          spaceBetween={24}
          slidesPerView={4}
          autoplay={{ delay: 4500, disableOnInteraction: false }}
          pagination={{ clickable: true, dynamicBullets: true }}
          breakpoints={{
            0: { slidesPerView: 1 },
            640: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
            1200: { slidesPerView: 4 },
          }}
          className="blade-swiper"
        >
          {featureData.map((item, index) => (
            <SwiperSlide key={index}>
              <div className="blade-card">
                <span className="blade-number">0{index + 1}</span>

                <div className="blade-icon-box">
                  <div className="blade-icon-aura"></div>
                  <i className={item.iconClass}></i>
                </div>

                <div className="blade-content">
                  <p className="blade-tag">{item.tag}</p>
                  <h3 className="blade-title">{item.title}</h3>
                  <span className="blade-line"></span>
                </div>

                <button className="blade-action">
                  Explore
                  <i className="icon-arrow-right"></i>
                </button>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
};

export default FeaturesSlider;
