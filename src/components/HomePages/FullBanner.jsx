import React from 'react';
import { useNavigate } from 'react-router-dom';

const FullScreenBanner = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/category');
  };

  return (
    <div
      onClick={handleClick}
      className="cursor-pointer"
      data-aos="zoom-in"
      data-aos-duration="800"
      data-aos-delay="200"
    >
      <img
        src="./images/fb.png"
        alt="Mahirash Perfume Banner"
        className="mb-5"
      />
    </div>
  );
};

export default FullScreenBanner;
