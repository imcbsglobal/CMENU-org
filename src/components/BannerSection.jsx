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
        swipe: scale === 1, // Only allow sliding when not zoomed
        touchMove: scale === 1,
    };

    const modalSliderSettings = {
        ...sliderSettings,
        autoplay: false,
        initialSlide: currentSlide,
        arrows: true,
    };

    const handleDoubleTap = (e) => {
        const currentTime = new Date().getTime();
        const tapGap = currentTime - lastTap;

        if (tapGap < 300 && tapGap > 0) {
            if (scale === 1) {
                // Zoom in to where the user double-tapped
                const rect = e.target.getBoundingClientRect();
                const x = (e.clientX || e.touches[0].clientX) - rect.left;
                const y = (e.clientY || e.touches[0].clientY) - rect.top;
                setOffsetX((window.innerWidth / 2 - x) * 2);
                setOffsetY((window.innerHeight / 2 - y) * 2);
                setScale(2);
            } else {
                // Reset zoom
                setScale(1);
                setOffsetX(0);
                setOffsetY(0);
            }
        }
        setLastTap(currentTime);
    };

    const handleZoomIn = () => {
        setScale(prev => {
            const newScale = Math.min(prev + 0.5, 3);
            if (prev === 1 && newScale > 1) {
                // Center the zoom
                setOffsetX(0);
                setOffsetY(0);
            }
            return newScale;
        });
    };

    const handleZoomOut = () => {
        setScale(prev => {
            const newScale = Math.max(prev - 0.5, 1);
            if (newScale === 1) {
                // Reset position when fully zoomed out
                setOffsetX(0);
                setOffsetY(0);
            }
            return newScale;
        });
    };

    const handleDragStart = (e) => {
        if (scale > 1) {
            setIsDragging(true);
            setStartX(e.clientX || e.touches[0].clientX);
            setStartY(e.clientY || e.touches[0].clientY);
        }
    };

    const handleDragMove = (e) => {
        if (!isDragging) return;
        const x = e.clientX || e.touches[0].clientX;
        const y = e.clientY || e.touches[0].clientY;
        
        const deltaX = x - startX;
        const deltaY = y - startY;

        // Calculate boundaries based on zoom level
        const maxOffset = (scale - 1) * 150; // Adjust this value based on your needs
        
        setOffsetX(prev => {
            const newOffset = prev + deltaX;
            return Math.max(Math.min(newOffset, maxOffset), -maxOffset);
        });
        
        setOffsetY(prev => {
            const newOffset = prev + deltaY;
            return Math.max(Math.min(newOffset, maxOffset), -maxOffset);
        });
        
        setStartX(x);
        setStartY(y);
    };

    const handleDragEnd = () => {
        setIsDragging(false);
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
                                        onTouchStart={handleDragStart}
                                        onTouchMove={handleDragMove}
                                        onTouchEnd={handleDragEnd}
                                        onMouseDown={handleDragStart}
                                        onMouseMove={handleDragMove}
                                        onMouseUp={handleDragEnd}
                                        onMouseLeave={handleDragEnd}
                                        onDoubleClick={handleDoubleTap}
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

                        <div className="justify-center items-center flex gap-10 text-[#fff]">
                            <button onClick={handleZoomIn} className="p-2">
                                <ZoomIn />
                            </button>
                            <button onClick={handleZoomOut} className="p-2">
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