import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

const products = [
  {
    id: 1,
    name: "Organically Shaped Heart Hoop Earrings",
    priceNew: "$2,499.00",
    priceOld: "$2,899.00",
    images: ["images/p56 (2).jpg", "images/p56 (2).jpg"],
    badge: "30% OFF"
  },
  {
    id: 2,
    name: "Organically Shaped Infinity Ring",
    priceNew: "$2,499.00",
    images: ["images/products/product-62.jpg", "images/products/product-63.jpg"]
  }
];

function LookBook() {
  return (
    <section className="flat-spacing-3 px-xxl_15">
      <div className="">
        <div className="banner_lookbook">
          <div className="image-left">
            <div className="image">
              <img src="images/banner/banner-14.jpg" alt="Lookbook Banner" />
            </div>
            <a href="#prd-lb" className="lookbook-item position1 swiper-button" data-slide="0">
              <div className="dropup-center dropup">
                <div className="tf-pin-btn"><span></span></div>
              </div>
            </a>
            <a href="#prd-lb" className="lookbook-item position2 swiper-button" data-slide="1">
              <div className="dropup-center dropup">
                <div className="tf-pin-btn"><span></span></div>
              </div>
            </a>
          </div>

          <div className="product-right" id="prd-lb">
            <h2 className="s-title font-2 text-capitalize" data-aos="fade-up" data-aos-duration="800">
              Shop The <span className="fst-italic">Look</span>
            </h2>

            <Swiper
              modules={[Pagination]}
              spaceBetween={10}
              pagination={{ clickable: true }}
              breakpoints={{
                0: { slidesPerView: 2 },
                768: { slidesPerView: 1 },
                992: { slidesPerView: 2 }
              }}
              className="sw-look"
            >
              {products.map((product, index) => (
                <SwiperSlide key={product.id}>
                  <div 
                    className="card_product--V01 style_2"
                    data-aos="fade-up"
                    data-aos-delay={index * 200}
                    data-aos-duration="600"
                  >
                    <div className="card_product-wrapper">
                      <a href="#" className="product-img">
                        <img src={product.images[0]} alt={product.name} className="img-product" />
                        <img src={product.images[1]} alt={product.name} className="img-hover" />
                      </a>
                      <div className="card_product-info">
                        <a href="product-default.html" className="name-product h5 fw-normal link text-line-clamp-2">
                          {product.name}
                        </a>
                        <div className="price-wrap">
                          <span className="price-new h5 text-secondary">{product.priceNew}</span>
                          {product.priceOld && <span className="price-old fw-normal">{product.priceOld}</span>}
                        </div>
                        <ul className="rate-wrap">
                          {[...Array(5)].map((_, i) => (
                            <li key={i}><i className="icon-star"></i></li>
                          ))}
                        </ul>
                      </div>
                      <div className="card_product-btn">
                        <a href="#shoppingCart" data-bs-toggle="offcanvas" className="tf-btn hover-primary fw-medium w-100">
                          ADD TO CART
                        </a>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      </div>
    </section>
  );
}

export default LookBook;
