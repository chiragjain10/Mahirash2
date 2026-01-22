import React from "react";
import { Link } from "react-router-dom";
function Footer() {
  return (
    <div>
      <div className="bg-surface-2">
        <div id="wrapper">
          <footer className="tf-footer">
            <div className="footer-body p-xl-0">
              <div className="container-full-2">
                <div className="row-footer">
                  <div className="col-s1">
                    <div className="footer-inner-wrap flex-lg-nowrap align-items-end">
                      <div className="box-title">
                        <img src="images/logom2.png" alt="" className="logo-footer mb-4" />

                      </div>
                      <div className="box-email">
                        <p className="text-body text-main-3">
                          Get exclusive access to new collections, styling tips, and special offers.
                        </p>
                        <form className="form-email">
                          <fieldset>
                            <input
                              className="bg-transparent"
                              type="text"
                              placeholder="Your_email@example.com"
                              required
                            />
                          </fieldset>
                          <div className="box-btn">
                            <button type="submit" className="btn-submit link"> 
                              <i className="icon-arrow-right-2"></i>
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  </div>
                  <div className="col-s2 me-1 me-md-5">
                    <div className="footer-inner-wrap flex-sm-nowrap s2">
                      <div className="footer-col-block ">
                        <p className="footer-heading footer-heading-mobile font-2">
                          Contact us
                        </p>
                        <div className="tf-collapse-content">
                          <ul className="footer-menu-list mb-0 ps-3 text-decoration- ">


                            <li>
                              <a
                                href="tel:+919584826112"
                                className="text-main-4 link"
                              >
                                +91 9584826112
                              </a>
                            </li>
                            <li>
                              <a
                                href="mailto:support@mahirash.com"
                                className="text-main-4 link"
                              >
                                support@mahirash.com
                              </a>
                            </li>
                            <li>
                              <a
                                href="mailto:sales@mahirash.com"
                                className="text-main-4 link"
                              >
                                sales@mahirash.com
                              </a>
                            </li>
                            <li>
                              <p className="text-main-4 fw-bold">
                                Find us on
                              </p>
                            </li>

                          </ul>
                          <ul className="social-icons flex space-x-4 mt-3">
                            <li>
                              <a
                                href="https://www.facebook.com/mahirashperfumes"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="social-link bg-facebook hover:shadow-facebook hover:scale-105 transition-all w-10 h-10 flex items-center justify-center rounded-full shadow-md"
                              >
                                <i className="fab fa-facebook-f text-white text-xl"></i>
                              </a>
                            </li>
                            <li>
                              <a
                                href="https://www.instagram.com/mahirash_perfumes/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="social-link bg-instagram hover:shadow-instagram hover:scale-105 transition-all w-10 h-10 flex items-center justify-center rounded-full shadow-md"
                              >
                                <i className="fab fa-instagram text-white text-xl"></i>
                              </a>
                            </li>
                            <li>
                              <a
                                href="https://www.google.com/search?q=mahirash&rlz=1C1SQJL_enIN1087IN1087&oq=mahirash&gs_lcrp=EgZjaHJvbWUyBggAEEUYOTIGCAEQIxgnMgwIAhAuGAoYsQMYgAQyCQgDEC4YChiABDIJCAQQABgKGIAEMgYIBRBFGD0yBggGEEUYPTIGCAcQRRg90gEIMjg4OGowajSoAgCwAgE&sourceid=chrome&ie=UTF-8"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="social-link bg-google hover:shadow-google hover:scale-105 transition-all w-10 h-10 flex items-center justify-center rounded-full shadow-md"
                              >
                                <i className="fab fa-google text-white text-xl"></i>
                              </a>
                            </li>
                          </ul>


                        </div>
                      </div>
                      <div className="footer-col-block p-xl-0 ">
                        <p className="footer-heading footer-heading-mobile font-2">
                          page
                        </p>
                        <div className="tf-collapse-content">
                          <ul className="footer-menu-list ps-3 text-decoration-">
                            <li>
                              <Link to="/about"
                                className="text-main-4 link"
                              >
                                Our Story
                              </Link>
                            </li>
                            <li>
                              <Link to="/category"
                                className="text-main-4 link"
                              >
                                Shop
                              </Link>
                            </li>
                            <li>
                              <Link to="/contact"
                                className="text-main-4 link"
                              >
                                Contact Us
                              </Link>
                            </li>
                            <li>
                              <Link to="/blog"
                                className="text-main-4 link"
                              >
                                Blogs
                              </Link>
                            </li>

                          </ul>
                        </div>
                      </div>
                      <div className="footer-col-block">
                        <p className="footer-heading footer-heading-mobile font-2">
                          HELP
                        </p>
                        <div className="tf-collapse-content">
                          <ul className="footer-menu-list ps-3 text-decoration">

                            <li>
                              <Link to="/chart"
                                className="text-main-4 link"
                              >
                                Cart
                              </Link>
                            </li>
                            <li>
                              <Link to="/orders"
                                className="text-main-4 link"
                              >
                                Orders
                              </Link>
                            </li>
                            <li>
                              <Link to="/shipping"
                                className="text-main-4 link"
                              >
                                Shipping
                              </Link>
                            </li>
                            <li>
                              <Link to="/refund"
                                className="text-main-4 link"
                              >
                                Privacy Policy
                              </Link>
                            </li>
                            <li>
                              <Link to="/terms"
                                className="text-main-4 link"
                              >
                                Terms & Conditions
                              </Link>
                            </li>
                            
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="footer-bottom pt-4 pb-2 text-center">
              <div className="container">
                <div className="footer-bottom-wrap d-flex justify-content-center align-items-center">
                  <div className="footer-bar-language">
                    <p className="text-nocopy m-0">All Rights Reserved 2025 Mahirash.</p>
                  </div>
                </div>
              </div>
            </div>

          </footer>
        </div>
      </div>
    </div>
  );
}
export default Footer;
