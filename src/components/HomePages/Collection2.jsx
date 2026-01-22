import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Collection2.css';

function Collection2() {
  const navigate = useNavigate();

  const handleMenClick = () => {
    navigate('/category?gender=Men');
  };

  const handleWomenClick = () => {
    navigate('/category?gender=Women');
  };

  return (
    <section className="luxury-collection-wrap"
    >
      <div className="collection-split">
        
        {/* MEN COLLECTION */}
        <div className="collection-item item-men" data-aos="fade-up" onClick={handleMenClick}>
          <div className="collection-link" style={{ cursor: 'pointer' }}>
            <div className="image-reveal">
              <img src="images/p45 (1).jpg" alt="Men's Collection" className="collection-img" />
              <div className="image-overlay"></div>
            </div>
            <div className="collection-content">
              <span className="subtitle">Pour Homme</span>
              <h2 className="collection-title">Men's Signature</h2>
              <div className="shop-discovery">
                <span>Explore Collection</span>
                <div className="line"></div>
              </div>
            </div>
          </div>
        </div>

        {/* WOMEN COLLECTION */}
        <div className="collection-item item-women" data-aos="fade-up" data-aos-delay="200" onClick={handleWomenClick}>
          <div className="collection-link" style={{ cursor: 'pointer' }}>
            <div className="image-reveal">
              <img src="images/p45 (2).jpg" alt="Women's Collection" className="collection-img" />
              <div className="image-overlay"></div>
            </div>
            <div className="collection-content">
              <span className="subtitle">Pour Femme</span>
              <h2 className="collection-title">Women's Essence</h2>
              <div className="shop-discovery">
                <span>Explore Collection</span>
                <div className="line"></div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}

export default Collection2;