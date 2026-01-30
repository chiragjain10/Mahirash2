import React from 'react'
import { Link } from 'react-router-dom'
import './BannerImg.css'

function BannerImg() {
  return (
    <section className="hero-wrapper">
      <div className="hero-grid">

        {/* Image Side */}
        <div className="hero-media">
          <img
            src="images/15.png"
            alt="Mahirash Perfume"
            loading="lazy"
          />
        </div>

        {/* Content Side */}
        <div className="hero-content-bg">
          <div className="hero-content-inner">
            <h6>EXCLUSIVE OFFER</h6>

            <p className="title text-hero-2 font-2">
              Unveil Your Essence,<br />
              <span>Wear Mahirash</span>
            </p>

            <p className="sub-title py-5">
              Discover the art of fragrance with Mahirash. From bold signatures
              to subtle elegance, find the scent that defines you.
            </p>

            <Link
              to="/category"
              className="tf-btn btn-fill animate-btn type-large text-uppercase text-decoration-none"
            >
              Explore Scents <i className="icon-arrow-right-2 fs-24"></i>
            </Link>
          </div>
        </div>

      </div>
    </section>
  )
}

export default BannerImg
