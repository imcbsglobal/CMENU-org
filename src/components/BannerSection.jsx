import React, { useState } from 'react';
import Slider from "react-slick";
import { X } from 'lucide-react';

const BannerSection = ({banners}) => {
    const [showModal, setShowModal] = useState(false);
    const [currentSlide, setCurrentSlide] = useState(0);

    const sliderSettings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 3000,
        pauseOnHover: false,
        arrows: false,
        beforeChange: (_, next) => setCurrentSlide(next),
        accessibility: true, // Enables keyboard arrow navigation
        swipe: true, // Enables swipe gesture
        touchMove: true, // Allows touch movement
      };
    
      const modalSliderSettings = {
        ...sliderSettings,
        autoplay: false,
        initialSlide: currentSlide,
        arrows: true,
      };
  return (
    <>
      <div className="pt-24 mb-10">
        {banners.length > 0 && (
          <Slider {...sliderSettings} className="mx-auto">
            {banners.map((banner, index) => (
              <div
                key={index}
                className="w-full relative h-[150px] px-2 rounded-3xl shadow-[0_3px_10px_rgb(0,0,0,0.2)] lg:h-[400px] cursor-pointer"
                onClick={() => {
                  setCurrentSlide(index);
                  setShowModal(true);
                }}
              >
                <img
                  src={banner.url}
                  className="w-full h-full rounded-3xl object-cover"
                  alt={`offer-poster-${index + 1}`}
                />
              </div>
            ))}
          </Slider>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-75 GlassBack">
          <div className="relative w-full max-w-4xl mx-4">
            <button
              onClick={() => setShowModal(false)}
              className="absolute right-2 top-2 z-10 p-2 GlassBack rounded-full"
            >
              <X className="h-6 w-6 text-[#fff]" />
            </button>
            
            <div className=" p-4 rounded-lg">
              <Slider {...modalSliderSettings} className="mx-auto">
                {banners.map((banner, index) => (
                  <div key={index} className="w-full h-[80vh]">
                    <img
                      src={banner.url}
                      className="w-full h-full object-contain"
                      alt={`offer-poster-${index + 1}`}
                    />
                  </div>
                ))}
              </Slider>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default BannerSection
