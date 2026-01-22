import React from 'react';

const Contact = () => {
  return (
    <div>
      <section className="s-contact-us py-5 ">
        <div className="container ">
          <div className="text-center mb-5">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-main uppercase">Contact Us</h2>
              <div className="w-16 h-1 bg-main mx-auto mt-4"></div>
            </div>
            <p className="sub-title text-muted mt-3">We are here to help. Please feel free to contact us with any questions or concerns.</p>
          </div>
          <div className="row align-items-stretch">
            <div className="col-lg-6 mb-4 mb-lg-0">
              <div className="p-4 bg-white rounded shadow-sm h-100">
                <h4 className="mb-3 text-main">Get in Touch</h4>
                <form action="#" className="form-contact">
                  <div className="form-group mb-3">
                    <input type="text" className="form-control" placeholder="Your Name" />
                  </div>
                  <div className="form-group mb-3">
                    <input type="email" className="form-control" placeholder="Your Email" />
                  </div>
                  <div className="form-group mb-3">
                    <textarea className="form-control" rows="5" placeholder="Your Message"></textarea>
                  </div>
                  <button type="submit" className="tf-btn btn-fill animate-btn type-large text-uppercase text-decoration-none ">Send Message</button>
                </form>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="p-4 bg-white rounded shadow-sm h-100 d-flex flex-column justify-content-between">
                <div>
                  <h4 className="mb-3 text-main">Contact Information</h4>
                  <div className="store-info-list mb-4">
                    <p className="mb-2"><i className="icon-map-pin me-2"></i> Kashi Mension, Lalitpur Colony, Gwalior, Madhya Pradesh - 474009</p>
                    <p className="mb-2"><i className="icon-phone me-2"></i> +91 9584826112</p>
                    <p className="mb-2"><i className="icon-mail me-2"></i> support@mahirash.com</p>
                  </div>
                </div>
                <div className="map-container mt-4">
                  
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d7159.986055378405!2d78.15843204078905!3d26.196905085151283!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3976c43226858deb%3A0x39334434001ffbab!2sLalitpur%20Colony%2C%20Lashkar%2C%20Gwalior%2C%20Madhya%20Pradesh%20474009!5e0!3m2!1sen!2sin!4v1758118990896!5m2!1sen!2sin"
                    width="100%"
                    height="315"
                    style={{ border: 0, borderRadius: '8px' }}
                    allowFullScreen=""
                    loading="lazy"
                    title="Store Location"
                  ></iframe>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact; 