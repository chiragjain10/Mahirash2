import React, { Suspense, lazy, useEffect, useState } from "react";
import Preloader from "../Preloader";
import BannerSlider from "./Bannerslider.jsx";
import Collections from "./Collections";
import FeaturesSlider from "./FeatureBoxes";
import BestSellers from "./BestSellers";
import NewArrivals from "./NewArrivals";
import BannerImg from "./BannerImg";
import BannerFresh from "./BannerFresh";
import Collection2 from "./Collection2";
import QuickView from "../QuickView";
import VideoBnr from "./VIdeoBnr.jsx";
import SizeGallery from "./Size.jsx";

// Lazy load heavy components
const Testimonials = lazy(() => import("./Testimonials"));
const VideoBanner = lazy(() => import("./Video"));
const FullScreenBanner = lazy(() => import("./FullBanner.jsx"));

function Home() {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isPageLoading, setIsPageLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setIsPageLoading(false), 700);
    return () => clearTimeout(t);
  }, []);

  const handleQuickView = (product) => {
    setSelectedProduct(product);
  };

  const handleCloseQuickView = () => {
    setSelectedProduct(null);
  };

  return (
    <div>
      {isPageLoading && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(255,255,255,0.96)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Preloader />
        </div>
      )}
      <div className="">
        <div id="wrapper">
          <div className="container-full-2 ">
              <Suspense fallback={<div className="loading-placeholder" style={{height: '200px', background: '#f5f5f5'}}></div>}>
              <VideoBanner />
            </Suspense>
            {/* <BannerSlider /> */}
            <FeaturesSlider />
            <NewArrivals onQuickView={handleQuickView} />
            {/* <Suspense fallback={<div className="loading-placeholder" style={{height: '200px', background: '#f5f5f5'}}></div>}>
              <VideoBanner />
            </Suspense> */}
            <VideoBnr/>
            <BestSellers onQuickView={handleQuickView} />
            <Suspense fallback={<div className="loading-placeholder" style={{height: '100px', background: '#f5f5f5'}}></div>}>
              <FullScreenBanner />
            </Suspense>
            <Collections />
            <BannerImg />
            <SizeGallery/>
            <BannerFresh onQuickView={handleQuickView} />
            <Collection2 />
            <Suspense fallback={<div className="loading-placeholder" style={{height: '300px', background: '#f5f5f5'}}></div>}>
              <Testimonials />
            </Suspense>
          </div>
        </div>
      </div>

      {/* QuickView Modal - Rendered at root level */}
      {selectedProduct && (
        <QuickView
          product={selectedProduct}
          onClose={handleCloseQuickView}
        />
      )}
    </div>
  );
}

export default Home;
