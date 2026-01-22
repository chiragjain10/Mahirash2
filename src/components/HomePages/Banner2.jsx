import React from 'react'
import { Link } from 'react-router-dom'
function Banner2() {
  return (
    <div>
      <div className="tf-slideshow">
            <div className="container-full-2">
                <div dir="ltr" className="swiper tf-swiper sw-slide-show slider_effect_fade" data-auto="true" data-loop="true" data-effect="fade"
                    data-delay="3000">
                    <div className="swiper-wrapper">
                        {/* <!-- item 1 --> */}
                        <div className="swiper-slide">
                            <div className="slider_wrap">
                                <div className="sld-image">
                                    <img src="images/slider/slider-10.jpg" data-src="images/slider/slider-10.jpg" alt="" className="lazyload"/>
                                </div>
                                <div className="sld-content">
                                    <div className="container">
                                        <div className="row">
                                            <div className="col-12">
                                                <div className="content-sld">
                                                    <p className="title-sld-2 font-2 fade-item fade-item-1">
                                                        <span className="fst-italic">Elevate</span> Your <br/>
                                                        Elegance
                                                    </p>
                                                    <div className="fade-item fade-item-2">
                                                        <Link to="/category" className="tf-btn type-large style-white-2">
                                                            new arrivals
                                                            <i className="icon-arrow-right fs-24"></i>
                                                        </Link>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* <!-- item 2 --> */}
                        <div className="swiper-slide">
                            <div className="slider_wrap">
                                <div className="sld-image">
                                    <img src="images/slider/slider-12.jpg" data-src="images/slider/slider-12.jpg" alt="" className="lazyload"/>
                                </div>
                                <div className="sld-content">
                                    <div className="container">
                                        <div className="row">
                                            <div className="col-12">
                                                <div className="content-sld">
                                                    <p className="title-sld-2 font-2 fade-item fade-item-1 text-main">
                                                        <span className="fst-italic">Elegance,</span> <br/>
                                                        Redefined
                                                    </p>
                                                    <div className="fade-item fade-item-2">
                                                        <Link to="/category" className="tf-btn type-large">
                                                            new arrivals
                                                            <i className="icon-arrow-right fs-24"></i>
                                                        </Link>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* <!-- item 3 --> */}
                        <div className="swiper-slide">
                            <div className="slider_wrap">
                                <div className="sld-image">
                                    <img src="images/slider/slider-11.jpg" data-src="images/slider/slider-11.jpg" alt="" className="lazyload"/>
                                </div>
                                <div className="sld-content">
                                    <div className="container">
                                        <div className="content-sld">
                                            <p className="title-sld-2 font-2 fade-item fade-item-1">
                                                <span className="fst-italic">Jewels</span><br/>
                                                That Speak
                                            </p>
                                            <div className="fade-item fade-item-2">
                                                <Link to="/category" className="tf-btn type-large style-white-2">
                                                    new arrivals
                                                    <i className="icon-arrow-right fs-24"></i>
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="sw-dot-default style-white tf-sw-pagination"></div>
                </div>
            </div>
        </div>
        {/* <!-- /Banner Slider -->
        <!-- Icon Box --> */}
        <div className="themesFlat">
            <div className="container">
                <div className="line-bt py-20">
                    <div dir="ltr" className="swiper tf-swiper" data-preview="4" data-tablet="3" data-mobile-sm="2" data-mobile="1" data-space-lg="48"
                        data-space-md="30" data-space="15" data-pagination="1" data-pagination-sm="2" data-pagination-md="3" data-pagination-lg="4">
                        <div className="swiper-wrapper">
                            {/* <!-- item 1 --> */}
                            <div className="swiper-slide">
                                <div className="box_icon--V02 style_2 border-0">
                                    <span className="icon">
                                        <i className="icon-box"></i>
                                    </span>
                                    <div className="content">
                                        <h5 className="title">Free Shipping</h5>
                                        <p className="text">Enjoy free shipping on all orders</p>
                                    </div>
                                </div>
                            </div>
                            {/* <!-- item 2 --> */}
                            <div className="swiper-slide">
                                <div className="box_icon--V02 style_2 border-0">
                                    <span className="icon">
                                        <i className="icon-credit-card"></i>
                                    </span>
                                    <div className="content">
                                        <h5 className="title">Secured Payment</h5>
                                        <p className="text">Secured payment</p>
                                    </div>
                                </div>
                            </div>
                            {/* <!-- item 3 --> */}
                            <div className="swiper-slide">
                                <div className="box_icon--V02 style_2 border-0">
                                    <span className="icon">
                                        <i className="icon-return"></i>
                                    </span>
                                    <div className="content">
                                        <h5 className="title">14 - Days Return</h5>
                                        <p className="text">Free return in 14 days</p>
                                    </div>
                                </div>
                            </div>
                            {/* <!-- item 4 --> */}
                            <div className="swiper-slide">
                                <div className="box_icon--V02 style_2 border-0">
                                    <span className="icon">
                                        <i className="icon-headphone"></i>
                                    </span>
                                    <div className="content">
                                        <h5 className="title">Premium Support</h5>
                                        <p className="text">Enjoy our support 24/7</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="sw-dot-default tf-sw-pagination"></div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  )
}

export default Banner2
