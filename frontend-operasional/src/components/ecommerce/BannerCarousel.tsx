"use client";

import React, { useRef, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  gradient: string;
  link?: string;
}

interface BannerCarouselProps {
  banners: Banner[];
  autoPlayInterval?: number;
}

const BannerCarousel: React.FC<BannerCarouselProps> = ({
  banners,
  autoPlayInterval = 3000,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Trick for infinite loop: Duplicate banners array 3 times (Prev Set, Middle Set, Next Set)
  const infiniteBanners = [...banners, ...banners, ...banners];
  const totalBannersLength = banners.length;

  const checkScroll = useCallback(() => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;

      // Seamless jump logic
      if (clientWidth === 0 || totalBannersLength === 0) return;

      const singleSetWidth = scrollWidth / 3;

      // If we scrolled deep into the 3rd set, instantly jump back exactly 1 set
      if (scrollLeft > singleSetWidth * 2) {
        scrollRef.current.style.scrollBehavior = "auto"; // Disable smooth temp
        scrollRef.current.scrollLeft = scrollLeft - singleSetWidth;
        // Re-enable smooth via class
        requestAnimationFrame(() => {
          if (scrollRef.current)
            scrollRef.current.style.scrollBehavior = "smooth";
        });
      }

      // If we scrolled way back into the 1st set, instantly jump forward exactly 1 set
      if (scrollLeft < singleSetWidth * 0.1) {
        // 0.1 buffer to trigger
        scrollRef.current.style.scrollBehavior = "auto";
        scrollRef.current.scrollLeft = scrollLeft + singleSetWidth;
        requestAnimationFrame(() => {
          if (scrollRef.current)
            scrollRef.current.style.scrollBehavior = "smooth";
        });
      }
    }
  }, [totalBannersLength]);

  useEffect(() => {
    // Initial jump to the middle set for infinite prep
    if (scrollRef.current) {
      const { scrollWidth } = scrollRef.current;
      scrollRef.current.style.scrollBehavior = "auto";
      scrollRef.current.scrollLeft = scrollWidth / 3;
      requestAnimationFrame(() => {
        if (scrollRef.current)
          scrollRef.current.style.scrollBehavior = "smooth";
      });
    }

    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, [checkScroll]);

  // Autoplay Logic
  useEffect(() => {
    if (!autoPlayInterval) return;

    const interval = setInterval(() => {
      if (!scrollRef.current) return;
      const { clientWidth } = scrollRef.current;

      // Scroll forward by one item (roughly the current container width * 0.8)
      scrollRef.current.scrollBy({
        left: clientWidth * 0.8,
        behavior: "smooth",
      });
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [autoPlayInterval]);

  const scrollByAmount = (offset: number) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: offset, behavior: "smooth" });
      setTimeout(checkScroll, 400);
    }
  };

  return (
    <div className="relative w-full group mt-2 mb-6">
      {/* Scrollable Container */}
      <div
        ref={scrollRef}
        onScroll={checkScroll}
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth [&::-webkit-scrollbar]:hidden"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {infiniteBanners.map((banner, idx) => (
          <div
            key={`${banner.id}-${idx}`}
            className="w-full md:w-[70%] lg:w-[55%] xl:w-[45%] flex-shrink-0 snap-center rounded-2xl md:rounded-3xl overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 relative border border-gray-100"
          >
            <div
              className={`w-full h-32 md:h-40 lg:h-48 ${banner.gradient} flex flex-col justify-end items-start p-6 md:p-8 relative overflow-hidden group/banner`}
            >
              <div className="relative z-10 max-w-[85%] md:max-w-[70%] text-left">
                <h2 className="text-lg md:text-xl lg:text-2xl font-display font-semibold text-white mb-1.5 md:mb-2 leading-tight drop-shadow-md">
                  {banner.title}
                </h2>
                {banner.subtitle && (
                  <p className="text-xs md:text-sm lg:text-[15px] text-white/95 font-medium drop-shadow-sm max-w-[250px] md:max-w-md">
                    {banner.subtitle}
                  </p>
                )}
              </div>

              {/* Decorative shapes */}
              <div className="absolute top-0 right-0 w-36 h-36 md:w-64 md:h-64 bg-white/10 rounded-full blur-2xl -mr-10 md:-mr-16 -mt-10 md:-mt-16 group-hover/banner:scale-110 transition-transform duration-700" />
              <div className="absolute bottom-0 right-10 w-24 h-24 md:w-48 md:h-48 bg-black/10 rounded-full blur-xl group-hover/banner:-translate-y-4 transition-transform duration-700" />
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows for Desktop */}
      <button
        onClick={() => scrollByAmount(-800)}
        className="hidden lg:flex absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 backdrop-blur shadow-xl rounded-full items-center justify-center text-gray-700 hover:text-primary-600 transition-all duration-300 z-10 opacity-0 group-hover:opacity-100"
      >
        <ChevronLeft size={28} />
      </button>

      <button
        onClick={() => scrollByAmount(800)}
        className="hidden lg:flex absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 backdrop-blur shadow-xl rounded-full items-center justify-center text-gray-700 hover:text-primary-600 transition-all duration-300 z-10 opacity-0 group-hover:opacity-100"
      >
        <ChevronRight size={28} />
      </button>
    </div>
  );
};

export default BannerCarousel;
