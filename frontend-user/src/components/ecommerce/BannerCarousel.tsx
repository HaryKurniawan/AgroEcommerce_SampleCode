"use client";

import React, { useRef, useEffect, useCallback, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  gradient?: string;
  imageUrl?: string;
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
  const [activeIndex, setActiveIndex] = useState(0);

  // Trick for infinite loop: Duplicate banners array 3 times (Prev Set, Middle Set, Next Set)
  const infiniteBanners = [...banners, ...banners, ...banners];
  const totalBannersLength = banners.length;

  const checkScroll = useCallback(() => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;

      // Seamless jump logic
      if (clientWidth === 0 || totalBannersLength === 0) return;

      const singleSetWidth = scrollWidth / 3;
      const itemWidth = singleSetWidth / totalBannersLength;

      // Calculate active index based on center of the screen
      const centerPos = scrollLeft + clientWidth / 2;
      const rawIndex = Math.floor(centerPos / itemWidth);
      const currentActive = rawIndex % totalBannersLength;

      setActiveIndex((prev) => (prev !== currentActive ? currentActive : prev));

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
      {/* Mobile Frame Wrapper */}
      <div className="rounded-2xl border-2 border-slate-200 md:border-none md:rounded-none overflow-hidden md:overflow-visible">
        {/* Scrollable Container */}
        <div
          ref={scrollRef}
          onScroll={checkScroll}
          className="flex gap-0 md:gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth [&::-webkit-scrollbar]:hidden"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {infiniteBanners.map((banner, idx) => {
            const rawUrl = banner.imageUrl || "";
            let imgUrl = "";
            if (rawUrl) {
              if (
                rawUrl.startsWith("http://") ||
                rawUrl.startsWith("https://")
              ) {
                imgUrl = rawUrl;
              } else {
                const backendUrl =
                  process.env.NEXT_PUBLIC_BACKEND_URL ||
                  process.env.NEXT_PUBLIC_API_URL ||
                  "https://api.agro-ecommerce.web.id";

                let domainRoot = "https://api.agro-ecommerce.web.id";
                try {
                  const parsed = new URL(backendUrl);
                  domainRoot = `${parsed.protocol}//${parsed.host}`;
                } catch {
                  domainRoot = "https://api.agro-ecommerce.web.id";
                }

                const cleanPath = rawUrl
                  .replace(/^\/api\/proxy/, "")
                  .replace(/^\/api/, "");
                const formattedPath = cleanPath.startsWith("/")
                  ? cleanPath
                  : `/${cleanPath}`;
                imgUrl = `${domainRoot}${formattedPath}`;
              }
            }

            let posX = 50;
            let posY = 50;
            let zoom = 1;
            let fitMode: "cover" | "contain" = "cover";
            let bgGradientClass = banner.gradient || "bg-slate-100";

            if (banner.gradient && banner.gradient.includes("pos:")) {
              const posMatch = banner.gradient.match(/pos:(\d+)%\s+(\d+)%/);
              const fitMatch = banner.gradient.match(/fit:(cover|contain)/);
              const zoomMatch = banner.gradient.match(/zoom:([\d.]+)/);
              if (posMatch) {
                posX = parseInt(posMatch[1], 10);
                posY = parseInt(posMatch[2], 10);
              }
              if (fitMatch) {
                fitMode = fitMatch[1] as "cover" | "contain";
              }
              if (zoomMatch) {
                zoom = parseFloat(zoomMatch[1]);
              }
              bgGradientClass = "bg-slate-900";
            }

            const cleanTitle = (banner.title || "").trim();
            const cleanSub = (banner.subtitle || "").trim();
            const hasTitle =
              cleanTitle !== "" && cleanTitle !== "-" && cleanTitle !== ".";
            const hasSubtitle =
              cleanSub !== "" && cleanSub !== "-" && cleanSub !== ".";
            const showTextOverlay = hasTitle || hasSubtitle;

            const content = (
              <div
                className={`w-full h-32 md:h-36 lg:h-40 rounded-none md:rounded-3xl ${imgUrl ? "bg-slate-900" : bgGradientClass} flex flex-col justify-end items-start relative overflow-hidden group/banner after:hidden md:after:block after:absolute after:inset-0 md:after:rounded-3xl after:border-2 after:border-slate-200/90 after:pointer-events-none ${banner.link ? "cursor-pointer" : ""}`}
              >
                {imgUrl ? (
                  <img
                    src={imgUrl}
                    alt={hasTitle ? cleanTitle : "Banner Promo"}
                    style={{
                      objectFit: fitMode,
                      objectPosition: `${posX}% ${posY}%`,
                      transform: `scale(${zoom})`,
                      transformOrigin: `${posX}% ${posY}%`,
                    }}
                    className="absolute inset-0 w-full h-full"
                  />
                ) : (
                  <>
                    <div className="absolute top-0 right-0 w-36 h-36 md:w-64 md:h-64 bg-white/10 rounded-full blur-2xl -mr-10 md:-mr-16 -mt-10 md:-mt-16 group-hover/banner:scale-110 transition-transform duration-700" />
                    <div className="absolute bottom-0 right-10 w-24 h-24 md:w-48 md:h-48 bg-black/10 rounded-full blur-xl group-hover/banner:-translate-y-4 transition-transform duration-700" />
                  </>
                )}

                {showTextOverlay && (
                  <div className="relative z-10 w-full p-4 md:p-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                    <div className="max-w-[90%] md:max-w-[80%] text-left">
                      {hasTitle && (
                        <h2 className="text-sm md:text-base lg:text-lg font-display font-semibold text-white mb-1 md:mb-1.5 leading-tight drop-shadow-md">
                          {cleanTitle}
                        </h2>
                      )}
                      {hasSubtitle && (
                        <p className="text-[9px] md:text-[10px] lg:text-xs text-white/95 font-medium drop-shadow-sm max-w-[250px] md:max-w-md line-clamp-2">
                          {cleanSub}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );

            return (
              <div
                key={`${banner.id}-${idx}`}
                className="w-full md:w-[65%] lg:w-[45%] xl:w-[38%] flex-shrink-0 snap-center"
              >
                {banner.link ? (
                  <a
                    href={banner.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full h-full"
                  >
                    {content}
                  </a>
                ) : (
                  content
                )}
              </div>
            );
          })}
        </div>
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

      {/* Progress Indicators */}
      {totalBannersLength > 1 && (
        <div className="flex justify-center items-center gap-1.5 mt-2">
          {banners.map((_, idx) => (
            <div
              key={idx}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === activeIndex
                  ? "w-6 bg-emerald-600 shadow-sm"
                  : "w-1.5 bg-slate-300/80 hover:bg-slate-400"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default BannerCarousel;
