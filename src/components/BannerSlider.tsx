import { useState, useEffect } from 'react';
import '../styles/BannerSlider.css';
import { getCourseImageSrc } from '../utils/imageHelper';

const BannerSlider = () => {
    const [currentSlide, setCurrentSlide] = useState(0);
    // Use the requested homepage banners (explicit public paths)
    const banners = [getCourseImageSrc('/images/bannertrangchu1.jpg'), getCourseImageSrc('/images/bannertrangchu2.jpg')];

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide(prev => (prev + 1) % banners.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const goToSlide = (index: number) => {
        setCurrentSlide(index);
    };

    const goToPrevious = () => {
        setCurrentSlide(prev => (prev - 1 + banners.length) % banners.length);
    };

    const goToNext = () => {
        setCurrentSlide(prev => (prev + 1) % banners.length);
    };

    return (
        <div className="banner-slider">
            <div className="slider-container">
                {banners.map((banner, index) => (
                    <div
                        key={index}
                        className={`slide ${index === currentSlide ? 'active' : ''}`}
                    >
                        <img
                            src={banner}
                            alt={`Banner ${index + 1}`}
                            className="slide-image"
                        />
                    </div>
                ))}
            </div>

            {/* Navigation buttons */}
            <button
                className="slider-nav slider-nav-prev"
                onClick={goToPrevious}
                aria-label="Previous slide"
            >
                ‹
            </button>
            <button
                className="slider-nav slider-nav-next"
                onClick={goToNext}
                aria-label="Next slide"
            >
                ›
            </button>

            {/* Dots indicator */}
            <div className="slider-dots">
                {banners.map((_, index) => (
                    <button
                        key={index}
                        className={`dot ${index === currentSlide ? 'active' : ''}`}
                        onClick={() => goToSlide(index)}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>
        </div>
    );
};

export default BannerSlider;
