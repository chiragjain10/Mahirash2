import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay } from 'swiper/modules';
import { Link } from 'react-router-dom';
import 'swiper/css';
import 'swiper/css/pagination';
import './CollectionsGallery.css';

function Collections() {
  const items = [
    { src: 'images/p (7).png', title: 'Woody' },
    { src: 'images/p (9).png', title: 'Citrus'},
    { src: 'images/p (10).png', title: 'Flower'},
    { src: 'images/p (8).png', title: 'Aromatic'},
  ];

  return (
    <section className="exhibit-section">
      <div className="">
        {/* DO NOT CHANGE: Your Original Title Design */}
        <h2 className="s-title font-2 text-capitalize mb-5" data-aos="fade-up" data-aos-duration="800">
          Our <span className="">Collections</span>
        </h2>

        <Swiper
          modules={[Pagination, Autoplay]}
          slidesPerView={4}
          spaceBetween={30}
          pagination={{ clickable: true }}
          autoplay={{ delay: 4000 }}
          breakpoints={{
            0: { slidesPerView: 1.2, spaceBetween: 20 },
            640: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
            1200: { slidesPerView: 4 },
          }}
          className="exhibit-swiper"
        >
          {items.map((item, index) => (
            <SwiperSlide key={index}>
              <Link
                to={{
                  pathname: `/category/${encodeURIComponent(item.title)}`,
                  search: `?note=${encodeURIComponent(item.title)}`
                }}
                className="exhibit-card"
                data-aos="fade-up"
                data-aos-delay={index * 150}
              >
                <div className="exhibit-media">
                  <img src={item.src} alt={item.title} className="exhibit-img" />
                  
                  {/* The Discovery Layer */}
                  <div className="exhibit-overlay">
                    <span className="exhibit-btn">View Discovery</span>
                  </div>
                  
                  {/* Premium Tag */}
                  {/* <div className="exhibit-badge">{item.count}</div> */}
                </div>

                <div className="exhibit-info">
                  <h3 className="exhibit-name">{item.title}</h3>
                  <div className="exhibit-line"></div>
                </div>
              </Link>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}

export default Collections;