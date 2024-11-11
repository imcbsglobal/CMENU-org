import React, { useState } from 'react';
import Slider from "react-slick";
import { X, ZoomIn, ZoomOut } from 'lucide-react';

const BannerSection = ({banners}) => {
    const [showModal, setShowModal] = useState(false);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [scale, setScale] = useState(1);
    const [lastTap, setLastTap] = useState(0);
    const [offsetX, setOffsetX] = useState(0);
    const [offsetY, setOffsetY] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [startY, setStartY] = useState(0);
    const [initialPinchDistance, setInitialPinchDistance] = useState(null);

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
        accessibility: true,
        swipe: scale === 1,
        touchMove: scale === 1,
    };

    const modalSliderSettings = {
        ...sliderSettings,
        autoplay: false,
        initialSlide: currentSlide,
        arrows: true,
    };

    const handleTouchStart = (e) => {
        if (e.touches.length === 2) {
            const distance = getDistance(e.touches);
            setInitialPinchDistance(distance);
        } else if (scale > 1 && e.touches.length === 1) {
            setIsDragging(true);
            setStartX(e.touches[0].clientX);
            setStartY(e.touches[0].clientY);
        }
    };

    const handleTouchMove = (e) => {
        if (e.touches.length === 2) {
            const distance = getDistance(e.touches);
            if (initialPinchDistance) {
                const newScale = Math.max(1, Math.min((distance / initialPinchDistance) * scale, 3));
                setScale(newScale);
            }
        } else if (isDragging && e.touches.length === 1) {
            const deltaX = e.touches[0].clientX - startX;
            const deltaY = e.touches[0].clientY - startY;
            setOffsetX(prev => prev + deltaX);
            setOffsetY(prev => prev + deltaY);
            setStartX(e.touches[0].clientX);
            setStartY(e.touches[0].clientY);
        }
    };

    const handleTouchEnd = () => {
        setIsDragging(false);
        setInitialPinchDistance(null);
    };

    const getDistance = (touches) => {
        const [touch1, touch2] = touches;
        return Math.sqrt(
            Math.pow(touch2.clientX - touch1.clientX, 2) +
            Math.pow(touch2.clientY - touch1.clientY, 2)
        );
    };

    const resetZoom = () => {
        setScale(1);
        setOffsetX(0);
        setOffsetY(0);
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
                                    resetZoom();
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
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-75 GlassBack">
                    <div className="relative w-full max-w-4xl mx-4">
                        <button
                            onClick={() => {
                                setShowModal(false);
                                resetZoom();
                            }}
                            className="absolute right-2 top-2 z-10 p-2 GlassBack rounded-full"
                        >
                            <X className="h-6 w-6 text-[#fff]" />
                        </button>

                        <div className="p-4 rounded-lg">
                            <Slider {...modalSliderSettings} className="mx-auto">
                                {banners.map((banner, index) => (
                                    <div 
                                        key={index} 
                                        className="w-full h-[80vh] overflow-hidden touch-none"
                                        onTouchStart={handleTouchStart}
                                        onTouchMove={handleTouchMove}
                                        onTouchEnd={handleTouchEnd}
                                        style={{ touchAction: 'none' }}
                                    >
                                        <img
                                            src={banner.url}
                                            className="w-full h-full object-contain transition-transform duration-200 ease-out"
                                            alt={`offer-poster-${index + 1}`}
                                            style={{
                                                transform: `scale(${scale}) translate(${offsetX / scale}px, ${offsetY / scale}px)`,
                                                transformOrigin: 'center',
                                                willChange: 'transform'
                                            }}
                                            draggable="false"
                                        />
                                    </div>
                                ))}
                            </Slider>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default BannerSection;