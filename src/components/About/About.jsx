import React from 'react';

const About = () => {
  return (
    <div>
      {/* Brand Intro Section */}
      <section className="s-brand-intro py-5 ">
        <div className="container ">
          <div className="row align-items-center">
            <div className="col-lg-6 mb-4 mb-lg-0">
              <div className="">

                <img src="images/p (11).png" alt="Our Story" className="img-fluid rounded w-100 brand-intro_image" />

              </div>
            </div>
            <div className="col-lg-6 ">
              <h2 className="text-3xl font-bold text-main uppercase mb-4">Our Story</h2>
              <div className="w-16 h-1 bg-main mb-6"></div>
              <p className="text-gray-700 mb-4">
                Welcome to our world of exquisite fragrances. Our journey began with a passion for the art of perfumery and a desire to create scents that evoke memories and emotions.
              </p>
              <p className="text-gray-700">
                Founded in 2023, we source the finest ingredients from around the globe to craft unique and captivating perfumes. Each bottle tells a story — one we want to share with you.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="s-core-values py-1">
        <div className="container text-start">
          <div className="row align-items-center flex-row-reverse">
            <div className="col-lg-6 mb-4 mb-lg-0">
              <div className="core-values-image">
                <img src="images/bg4.jpg" alt="Our Mission" className="img-fluid rounded shadow" />
                <div>

                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="value-box p-4 bg-white rounded ">
                <h2 className="text-3xl font-bold text-main uppercase mb-4 ">Our Mission</h2>
                <div className="w-16 h-1 bg-main mb-6"></div>
                <p className="value-description">
                  Our mission is to bring the luxury of fine perfumery to everyone. We are committed to creating high-quality, long-lasting fragrances that are both accessible and sustainable. We strive for excellence in every aspect of our business, from scent creation to customer service.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="s-core-values my-3 py-md-5">
        <div className="container">
          <div className="values-grid tf-grid-layout md-col-2 xl-col-3">
            {/* Image Section */}
            <div className="core-values-image">
              <img
                src="/images/perfume3.jpg"
                alt="Core Value"
                className="ls-is-cached lazyloaded"
              />
            </div>

            <div className="value-box hightlight ">
              <h4 className="value-title">TIMELESS CRAFTSMANSHIP</h4>
              <span className="br-line"></span>
              <p className="value-description">
                Each Marisha fragrance blends tradition with modern artistry for a timeless scent.</p>
            </div>


            <div className="value-box">

              <h4 className="value-title">EXCEPTIONAL QUALITY</h4>

              <span className="br-line"></span>

              <p className="value-description">

                Crafted to perfection with the finest global ingredients — from Indian sandalwood to French jasmine.



              </p>          </div>



            <div className="value-box">

              <h4 className="value-title">SIGNATURE SCENTS</h4>

              <span className="br-line"></span>

              <p className="value-description">

                More than fragrance — our signature scents express identity and emotion with lasting impact.





              </p>

            </div>



            <div className="value-box hightlight">

              <h4 className="value-title">CUSTOMER DEVOTION</h4>

              <span className="br-line"></span>

              <p className="value-description">

                Dedicated to your satisfaction with personalized scents and ongoing support.





              </p>

            </div>

          </div>

        </div>

      </section>

      {/* Team Section */}
      {/* <section className="py-16 ">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-main uppercase">Meet the Team</h2>
            <div className="w-16 h-1 bg-main mx-auto mt-4"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              { name: 'Jane Doe', role: 'Founder & Perfumer', img: 'images/avatar/avt-1.jpg' },
              { name: 'John Smith', role: 'Head of Operations', img: 'images/avatar/avt-2.jpg' },
              { name: 'Emily Johnson', role: 'Marketing Director', img: 'images/avatar/avt-3.jpg' }
            ].map((member, i) => (
              <div key={i} className="text-center">
                <img
                  src={member.img}
                  alt={member.name}
                  className="w-36 h-36 mx-auto mb-4 rounded-full shadow-lg object-cover"
                />
                <h5 className="text-xl font-semibold">{member.name}</h5>
                <p className="text-gray-500">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section> */}
    </div>
  );
};

export default About; 