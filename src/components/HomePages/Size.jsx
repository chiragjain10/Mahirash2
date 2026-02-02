import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay } from 'swiper/modules';
import { Link } from 'react-router-dom';
import 'swiper/css';
import 'swiper/css/pagination';
import './SizeGallery.css';

function SizeGallery() {
  // Map size ranges to Category.jsx SIZE_RANGES IDs
  const getSizeFilterId = (range) => {
    switch (range) {
      case '< 10ml':
        return '1-10';
      case '10-50ml':
        return '20-50'; // Closest match to 10-50ml range
      case '50-100ml':
        return '50-100';
      case '>100ml':
        return '100+';
      default:
        return 'all';
    }
  };

  const sizes = [
    { src: 'images/size-1.png', title: 'Discovery', range: '< 10ml', label: 'Travel Essentials' },
    { src: 'images/size-2.png', title: 'Petite', range: '10-50ml', label: 'Daily Companion' },
    { src: 'images/size-3.png', title: 'Signature', range: '50-100ml', label: 'The Standard' },
    { src: 'images/size-4.png', title: 'Grand', range: '>100ml', label: 'Connoisseur' },
  ];

  return (
    <section className="size-section">
      <div className="">
        <h2 className="s-title font-2 text-capitalize mb-5" data-aos="fade-up">
          Shop by <span className="">Volume</span>
        </h2>

        <Swiper
          modules={[Pagination, Autoplay]}
          slidesPerView={4}
          spaceBetween={40}
          pagination={{ clickable: true }}
          autoplay={{ delay: 5000 }}
          breakpoints={{
            0: { slidesPerView: 1.2, spaceBetween: 20 },
            768: { slidesPerView: 2.5 },
            1024: { slidesPerView: 4 },
          }}
          className="size-swiper"
        >
          {sizes.map((item, index) => (
            <SwiperSlide key={index}>
              <Link
                to={`/category?size=${getSizeFilterId(item.range)}`}
                className="size-card"
                data-aos="fade-up"
                data-aos-delay={index * 100}
              >
                <div className="size-image-wrapper">
                  <div className="size-frame"></div>
                  <img src={item.src} alt={item.title} className="size-img" />
                  <div className="size-tag">{item.range}</div>
                </div>

                <div className="size-content">
                  <span className="size-sub">{item.label}</span>
                  <h3 className="size-title">{item.title}</h3>
                  <div className="size-explore">Explore Selection</div>
                </div>
              </Link>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}

export default SizeGallery;