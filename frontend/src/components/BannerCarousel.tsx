import { classNames } from '../lib/uiStyles';
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
    <section className={classNames('bannerCarousel')} aria-label="Banner TBT 360">
      <div className={classNames('bannerImageFrame')}>
        {visibleBanners.map((banner, bannerIndex) =>
        {
          return (
            <a
              className={classNames(
                'bannerSlide',
                currentIndex === bannerIndex
                  ? 'bannerSlideActive'
                  : 'bannerSlideInactive',
              )}
              href={banner.targetUrl || '#products'}
              key={banner.id}
              aria-hidden={currentIndex !== bannerIndex}
              tabIndex={currentIndex === bannerIndex ? 0 : -1}
            >
              <img
                className={classNames('bannerSlideImage')}
                src={banner.imageUrl}
                alt={banner.title}
              />
            </a>
          );
        })}
        {visibleBanners.length > 1 && (
          <>
            <button
              className={classNames('bannerArrow', 'bannerArrowPrevious')}
              type="button"
              onClick={() => changeSlide(-1)}
              aria-label="Banner trước"
            >
              ‹
            </button>
            <button
              className={classNames('bannerArrow', 'bannerArrowNext')}
              type="button"
              onClick={() => changeSlide(1)}
              aria-label="Banner tiếp theo"
            >
              ›
            </button>
          </>
        )}
      </div>
      <div className={classNames('bannerDots')}>
        {visibleBanners.map((banner, bannerIndex) =>
        {
          return (
            <button
              className={classNames(
                'bannerDot',
                currentIndex === bannerIndex
                  ? 'bannerDotActive'
                  : 'bannerDotInactive',
              )}
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
