import React, { useState, useRef } from 'react';
import Slider from "react-slick";
import { X, ZoomIn, ZoomOut } from 'lucide-react';

const BannerSection = ({ banners }) => {
    const [showModal, setShowModal] = useState(false);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [zoomLevels, setZoomLevels] = useState(banners.map(() => 1));
    const [offsets, setOffsets] = useState(banners.map(() => ({ x: 0, y: 0 })));
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [startY, setStartY] = useState(0);
    const sliderRef = useRef();

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
        beforeChange: (_, next) => {
            setCurrentSlide(next);
        },
        swipe: zoomLevels[currentSlide] === 1,
        touchMove: zoomLevels[currentSlide] === 1,
    };

    const modalSliderSettings = {
        ...sliderSettings,
        autoplay: false,
        initialSlide: currentSlide,
        arrows: true,
        afterChange: (current) => {
            setCurrentSlide(current); // Update the current slide index
        },
    };

    const handleZoomIn = () => {
        setZoomLevels((prev) => {
            const newZoomLevels = [...prev];
            newZoomLevels[currentSlide] = Math.min(newZoomLevels[currentSlide] + 0.5, 3);
            return newZoomLevels;
        });
    };

    const handleZoomOut = () => {
        setZoomLevels((prev) => {
            const newZoomLevels = [...prev];
            const newZoom = Math.max(newZoomLevels[currentSlide] - 0.5, 1);
            newZoomLevels[currentSlide] = newZoom;
            if (newZoom === 1) {
                resetOffsets();
            }
            return newZoomLevels;
        });
    };

    const resetOffsets = () => {
        setOffsets((prev) => {
            const newOffsets = [...prev];
            newOffsets[currentSlide] = { x: 0, y: 0 };
            return newOffsets;
        });
    };

    const handleDragStart = (e) => {
        if (zoomLevels[currentSlide] > 1) {
            setIsDragging(true);
            setStartX(e.clientX || e.touches[0].clientX);
            setStartY(e.clientY || e.touches[0].clientY);
        }
    };


    const handlePinchStart = (e) => {
      if (e.touches.length === 2) {
          const touch1 = e.touches[0];
          const touch2 = e.touches[1];
          const initialDistance = Math.hypot(
              touch2.clientX - touch1.clientX,
              touch2.clientY - touch1.clientY
          );
  
          setStartX(initialDistance); // Use startX to store the initial distance
      }
  };

  const handlePinchMove = (e) => {
    if (e.touches.length === 2 && startX) {
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const currentDistance = Math.hypot(
            touch2.clientX - touch1.clientX,
            touch2.clientY - touch1.clientY
        );

        const scaleDelta = currentDistance / startX;

        setZoomLevels((prev) => {
            const newZoomLevels = [...prev];
            const newZoom = Math.min(Math.max(newZoomLevels[currentSlide] * scaleDelta, 1), 3); // Bound between 1 and 3
            newZoomLevels[currentSlide] = newZoom;
            return newZoomLevels;
        });

        setStartX(currentDistance); // Update for smooth scaling
    }
};

    const handlePinchEnd = () => {
        setStartX(0);
    };

    const handleDragMove = (e) => {
      if (!isDragging || zoomLevels[currentSlide] <= 1) return;
  
      const x = e.clientX || e.touches[0].clientX;
      const y = e.clientY || e.touches[0].clientY;
  
      const deltaX = (x - startX) / zoomLevels[currentSlide];
      const deltaY = (y - startY) / zoomLevels[currentSlide];
  
      const maxOffsetX = (zoomLevels[currentSlide] - 1) * window.innerWidth / 2;
      const maxOffsetY = (zoomLevels[currentSlide] - 1) * window.innerHeight / 2;
  
      setOffsets((prev) => {
          const newOffsets = [...prev];
          newOffsets[currentSlide] = {
              x: Math.max(Math.min(prev[currentSlide].x + deltaX, maxOffsetX), -maxOffsetX),
              y: Math.max(Math.min(prev[currentSlide].y + deltaY, maxOffsetY), -maxOffsetY),
          };
          return newOffsets;
      });
  
      setStartX(x);
      setStartY(y);
  };
  

  const handleDragEnd = () => {
    setIsDragging(false);

    // Reset the offset for the current slide
    setOffsets((prev) => {
        const newOffsets = [...prev];
        newOffsets[currentSlide] = { x: 0, y: 0 };
        return newOffsets;
    });
};

    return (
      <>
        <div className="pt-24 mb-2">
          {banners.length > 0 && (
            <Slider {...sliderSettings} className="mx-auto">
              {banners.map((banner, index) => (
                <div
                  key={index}
                  className="w-full relative h-full BannerHeight md:h-[300px] px-2 rounded-3xl shadow-lg lg:h-[400px] cursor-pointer"
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

        {showModal && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black">
                <button
                    onClick={() => {
                        setShowModal(false);
                        setZoomLevels(banners.map(() => 1));
                        setOffsets(banners.map(() => ({ x: 0, y: 0 })));
                    }}
                    className="absolute right-2 top-2 z-10 p-2 bg-gray-800 rounded-full"
                >
                    <X className="h-6 w-6 text-white" />
                </button>

                <div className="relative w-full max-w-4xl mx-4">
                    <Slider
                        {...modalSliderSettings}
                        className="mx-4 backdrop-blur-lg"
                    >
                        {banners.map((banner, index) => (
                            <div
                                key={index}
                                className="w-full h-[80vh] overflow-hidden"
                                onTouchStart={(e) => {
                                    handlePinchStart(e);
                                    handleDragStart(e);
                                }}
                                onTouchMove={(e) => {
                                    handlePinchMove(e);
                                    handleDragMove(e);
                                }}
                                onTouchEnd={(e) => {
                                    handlePinchEnd();
                                    handleDragEnd();
                                }}
                                style={{ touchAction: "none" }}
                            >
                                <img
                                    src={banner.url}
                                    className="w-full h-full object-contain transition-transform duration-200"
                                    alt={`offer-poster-${index + 1}`}
                                    style={{
                                      transform: `scale(${zoomLevels[index]}) translate(${offsets[index].x}px, ${offsets[index].y}px)`,
                                      transformOrigin: "center",
                                      transition: isDragging ? "none" : "transform 0.3s ease-out",
                                    }}
                                    draggable="false"
                                />
                            </div>
                        ))}
                    </Slider>

                    <div className="flex justify-center gap-4 mt-4">
                        <button
                            onClick={handleZoomIn}
                            className="p-2 bg-gray-800 rounded-full text-white"
                        >
                            <ZoomIn />
                        </button>
                        <button
                            onClick={handleZoomOut}
                            className="p-2 bg-gray-800 rounded-full text-white"
                        >
                            <ZoomOut />
                        </button>
                    </div>
                </div>
            </div>
        )}
      </>
    );
};

export default BannerSection;
