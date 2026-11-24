import { useEffect, useState } from 'react';
import type { Banner } from '../types/models';

interface BannerCarouselProps {
  banners: Banner[];
}

export function BannerCarousel({ banners }: BannerCarouselProps)
{
  const [currentIndex, setCurrentIndex] = useState(0);
  const visibleBanners = banners.filter((banner) => banner.isPublished);

  useEffect(() =>
  {
    setCurrentIndex(0);
  }, [visibleBanners.length]);

  useEffect(() =>
  {
    if (visibleBanners.length < 2)
    {
      return undefined;
    }

    const intervalId = window.setInterval(() =>
    {
      setCurrentIndex((previousIndex) =>
      {
        return (previousIndex + 1) % visibleBanners.length;
      });
    }, 7000);

    return () =>
    {
      window.clearInterval(intervalId);
    };
  }, [visibleBanners.length]);

  if (visibleBanners.length === 0)
  {
    return null;
  }

  const changeSlide = (direction: number): void =>
  {
    setCurrentIndex((previousIndex) =>
    {
      return (
        (previousIndex + direction + visibleBanners.length) %
        visibleBanners.length
      );
    });
  };

  return (
    <section className="banner-carousel" aria-label="Banner TBT 360">
      <div className="banner-image-frame">
        {visibleBanners.map((banner, bannerIndex) =>
        {
          return (
            <a
              className={`banner-slide ${
                currentIndex === bannerIndex ? 'active' : ''
              }`}
              href={banner.targetUrl || '#products'}
              key={banner.id}
              aria-hidden={currentIndex !== bannerIndex}
              tabIndex={currentIndex === bannerIndex ? 0 : -1}
            >
              <img src={banner.imageUrl} alt={banner.title} />
            </a>
          );
        })}
        {visibleBanners.length > 1 && (
          <>
            <button
              className="banner-arrow previous"
              type="button"
              onClick={() => changeSlide(-1)}
              aria-label="Banner trước"
            >
              ‹
            </button>
            <button
              className="banner-arrow next"
              type="button"
              onClick={() => changeSlide(1)}
              aria-label="Banner tiếp theo"
            >
              ›
            </button>
          </>
        )}
      </div>
      <div className="banner-dots">
        {visibleBanners.map((banner, bannerIndex) =>
        {
          return (
            <button
              className={currentIndex === bannerIndex ? 'active' : ''}
              type="button"
              key={banner.id}
              aria-label={`Chuyển đến ${banner.title}`}
              onClick={() => setCurrentIndex(bannerIndex)}
            />
          );
        })}
      </div>
    </section>
  );
}
