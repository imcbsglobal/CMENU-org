import React, { useState, useRef } from 'react';
import Slider from "react-slick";
import { X, ZoomIn, ZoomOut } from 'lucide-react';

const BannerSection = ({ banners }) => {
    const [showModal, setShowModal] = useState(false);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [zoomLevels, setZoomLevels] = useState(banners.map(() => 1));
    const [offsetX, setOffsetX] = useState(0);
    const [offsetY, setOffsetY] = useState(0);
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
            resetZoom(next);
        },
        swipe: zoomLevels[currentSlide] === 1,
        touchMove: zoomLevels[currentSlide] === 1,
    };

    const modalSliderSettings = {
        ...sliderSettings,
        autoplay: false,
        initialSlide: currentSlide,
        arrows: true,
    };

    const handleZoomIn = () => {
        updateZoomLevel(currentSlide, Math.min(zoomLevels[currentSlide] + 0.5, 3));
    };

    const handleZoomOut = () => {
        const newZoom = Math.max(zoomLevels[currentSlide] - 0.5, 1);
        updateZoomLevel(currentSlide, newZoom);
        if (newZoom === 1) {
            setOffsetX(0);
            setOffsetY(0);
        }
    };

    const resetZoom = (index) => {
        updateZoomLevel(index, 1);
        setOffsetX(0);
        setOffsetY(0);
    };

    const updateZoomLevel = (index, newZoom) => {
        setZoomLevels((prevZoomLevels) => {
            const updatedZoomLevels = [...prevZoomLevels];
            updatedZoomLevels[index] = newZoom;
            return updatedZoomLevels;
        });
    };

    const handleDragStart = (e) => {
        if (zoomLevels[currentSlide] > 1) {
            setIsDragging(true);
            setStartX(e.clientX || e.touches[0].clientX);
            setStartY(e.clientY || e.touches[0].clientY);
        }
    };

    const handleDragMove = (e) => {
        if (!isDragging) return;

        const x = e.clientX || e.touches[0].clientX;
        const y = e.clientY || e.touches[0].clientY;

        const deltaX = (x - startX) / zoomLevels[currentSlide];
        const deltaY = (y - startY) / zoomLevels[currentSlide];

        // Calculate maximum offset based on zoom level
        const maxOffsetX = (zoomLevels[currentSlide] - 1) * 200;
        const maxOffsetY = (zoomLevels[currentSlide] - 1) * 200;

        // Update offsets, clamping them to the max offset limits
        setOffsetX((prev) => Math.max(Math.min(prev + deltaX, maxOffsetX), -maxOffsetX));
        setOffsetY((prev) => Math.max(Math.min(prev + deltaY, maxOffsetY), -maxOffsetY));

        setStartX(x);
        setStartY(y);
    };

    const handleDragEnd = () => {
        setIsDragging(false);
    };

    return (
        <>
            <div className="pt-24 mb-10">
                {banners.length > 0 && (
                    <Slider {...sliderSettings} className="mx-auto">
                        {banners.map((banner, index) => (
                            <div
                                key={index}
                                className="w-full relative h-[150px] px-2 rounded-3xl shadow-lg lg:h-[400px] cursor-pointer"
                                onClick={() => {
                                    setCurrentSlide(index);
                                    setShowModal(true);
                                    resetZoom(index);
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
                            resetZoom(currentSlide);
                        }}
                        className="absolute right-2 top-2 z-10 p-2 bg-gray-800 rounded-full"
                    >
                        <X className="h-6 w-6 text-white" />
                    </button>

                    <div className="relative w-full max-w-4xl mx-4">
                        <Slider {...modalSliderSettings} className="mx-4 backdrop-blur-lg">
                            {banners.map((banner, index) => (
                                <div
                                    key={index}
                                    className="w-full h-[80vh] overflow-hidden"
                                    onMouseDown={handleDragStart}
                                    onMouseMove={handleDragMove}
                                    onMouseUp={handleDragEnd}
                                    onMouseLeave={handleDragEnd}
                                    onTouchStart={handleDragStart}
                                    onTouchMove={handleDragMove}
                                    onTouchEnd={handleDragEnd}
                                    style={{ touchAction: 'none' }}
                                >
                                    <img
                                        src={banner.url}
                                        className="w-full h-full object-contain transition-transform duration-200"
                                        alt={`offer-poster-${index + 1}`}
                                        style={{
                                            transform: `scale(${zoomLevels[index]}) translate(${offsetX}px, ${offsetY}px)`,
                                            transformOrigin: 'center',
                                        }}
                                        draggable="false"
                                    />
                                </div>
                            ))}
                        </Slider>

                        <div className="flex justify-center gap-4 mt-4">
                            <button onClick={handleZoomIn} className="p-2 bg-gray-800 rounded-full text-white">
                                <ZoomIn />
                            </button>
                            <button onClick={handleZoomOut} className="p-2 bg-gray-800 rounded-full text-white">
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
