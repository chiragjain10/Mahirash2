// SliderComponent.js
import React from 'react';
import OwlCarousel from 'react-owl-carousel';
import 'owl.carousel/dist/assets/owl.carousel.css';
import 'owl.carousel/dist/assets/owl.theme.default.css';

const sliderData = [
  {
    id: 1,
    img: 'images/bnr (4).jpg',
    title: (
      <>
        <span className="fst-italic text-white">Awaken</span> Your <br /> Senses
      </>
    ),
    btnStyle: 'black',
  },
  {
    id: 2,
    img: 'images/bnr (1).jpg',
    title: (
      <>
        <span className="fst-italic text-white">Fragrance</span> that <br /> Defines You
      </>
    ),
    btnStyle: 'black',
  },
  {
    id: 3,
    img: 'images/bnr (2).jpg',
    title: (
      <>
        <span className="fst-italic text-white">Perfumes</span> <br /> That Speak
      </>
    ),
    btnStyle: 'black',
  },
];

const Bannerslider = () => {
  return (
    <div className="tf-slideshow ">
      <OwlCarousel
        className="owl-theme"
        items={1}
        loop
        autoplay
        autoplayTimeout={3000}
        smartSpeed={1000}
        animateOut="fadeOut"
        dots
      >
        {sliderData.map((slide) => (
          <div className="slider_wrap  " key={slide.id}>
            <div className="sld-image">
              <img src={slide.img} alt={`slider-${slide.id}`} />
            </div>
            <div className="sld-content">
              <div className="container">
                <div className="row">
                  <div className="col-12">
                    <div
                      className={`content-sld text-start ${slide.id === 2 ? 'text-white' : 'text-white'
                        }`}
                      data-aos="fade-up"
                      data-aos-duration="800"
                      data-aos-delay="300"
                    >
                      <p className={`title-sld-2 font-2 ${slide.id === 2 ? 'text-white' : 'text-white'}`} data-aos="fade-up" data-aos-duration="800" data-aos-delay="500">
                        {slide.title}
                      </p>
                      <a
                        href="/category"
                        className="btn-new-arrivals text-decoration-none border-white text-white"
                        data-aos="fade-up"
                        data-aos-duration="800"
                        data-aos-delay="700"
                      >
                        new arrivals <i className="icon-arrow-right fs-24"></i>
                      </a>

                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

      </OwlCarousel>
    </div>
  );
};

export default Bannerslider;
