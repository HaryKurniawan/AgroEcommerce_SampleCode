"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowRight, X, MapPin, Building2 } from "lucide-react";

import { useAuthStore } from "@/store/auth-store";

const slides = [
  {
    id: "b2b",
    image: "/onboarding-b2b.png",
    badge: "🏢",
    badgeColor: "bg-emerald-50 text-emerald-700",
    badgeLabel: "Pembeli Institusi",
    title: "Beli Lebih Banyak,\nHemat Lebih Besar",
    description: "Nikmati harga grosir dan kuota besar langsung dari petani.",
    ctaLabel: "Daftar Verifikasi B2B",
    ctaPath: "/profil/verifikasi-b2b",
    ctaIcon: Building2,
    skipLabel: "Nanti Saja",
  },
  {
    id: "address",
    image: "/onboarding-address.png",
    badgeColor: "bg-blue-50 text-blue-700",
    title: "Temukan Toko Tani\nTerdekat dari Lokasimu",
    description: "Isi alamat agar kami rekomendasikan produk segar terdekat.",
    ctaLabel: "Isi Alamat Sekarang",
    ctaPath: "/profil/alamat",
    ctaIcon: MapPin,
    skipLabel: "Lewati",
  },
];

export default function OnboardingModal() {
  const { showOnboarding, dismissOnboarding } = useAuthStore();
  const router = useRouter();
  const [slideIndex, setSlideIndex] = useState(0);
  const [visible, setVisible] = useState(false);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    if (showOnboarding) {
      const t = setTimeout(() => setVisible(true), 50);
      return () => clearTimeout(t);
    }
  }, [showOnboarding]);

  if (!showOnboarding) return null;

  const slide = slides[slideIndex % slides.length] || slides[0];
  const isLast = slideIndex === slides.length - 1;

  const handleNext = () => {
    if (isLast) {
      dismissOnboarding();
      return;
    }
    setAnimating(true);
    setTimeout(() => {
      setSlideIndex((i) => i + 1);
      setAnimating(false);
    }, 200);
  };

  const handleCta = () => {
    dismissOnboarding();
    router.push(slide.ctaPath);
  };

  const handleSkip = () => {
    if (isLast) {
      dismissOnboarding();
    } else {
      setAnimating(true);
      setTimeout(() => {
        setSlideIndex((i) => i + 1);
        setAnimating(false);
      }, 200);
    }
  };

  const handleDismiss = () => {
    dismissOnboarding();
  };

  return (
    <div
      className={`fixed inset-0 z-[200] flex items-center justify-center px-5 transition-all duration-300 ${
        visible ? "bg-black/40" : "bg-transparent"
      }`}
      role="dialog"
      aria-modal="true"
      aria-label="Onboarding"
    >
      <div
        className={`relative bg-white w-full max-w-[380px] rounded-2xl overflow-hidden transition-all duration-300 ${
          visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
        }`}
      >
        {/* Close */}
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 z-20 w-7 h-7 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          aria-label="Tutup"
        >
          <X size={16} strokeWidth={2.5} />
        </button>

        {/* Image */}
        <div
          className={`flex items-center justify-center px-6 pt-10 pb-2 transition-opacity duration-200 ${
            animating ? "opacity-0" : "opacity-100"
          }`}
        >
          <Image
            src={slide.image}
            alt={slide.title}
            width={200}
            height={180}
            className="object-contain w-[180px] h-[160px]"
            priority
          />
        </div>

        {/* Dots */}
        <div className="flex items-center justify-center gap-1.5 py-3">
          {slides.map((s, i) => (
            <div
              key={s.id}
              className={`rounded-full transition-all duration-300 ${
                i === slideIndex
                  ? "w-5 h-1.5 bg-emerald-600"
                  : "w-1.5 h-1.5 bg-gray-200"
              }`}
            />
          ))}
        </div>

        {/* Content */}
        <div
          className={`px-5 pb-5 pt-1 flex flex-col items-center text-center transition-opacity duration-200 ${
            animating ? "opacity-0" : "opacity-100"
          }`}
        >
          {/* Badge */}
          {/* <span
            className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full mb-3 ${slide.badgeColor}`}
          >
            {slide.badge} {slide.badgeLabel}
          </span> */}

          {/* Title */}
          <h2 className="text-xl font-bold text-gray-900 leading-snug mb-2 whitespace-pre-line">
            {slide.title}
          </h2>

          {/* Description */}
          <p className="text-[13px] text-gray-500 leading-relaxed mb-4">
            {slide.description}
          </p>

          {/* CTA Button — directly below description */}
          <button
            onClick={handleCta}
            className="flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors active:scale-[0.98]"
          >
            <slide.ctaIcon size={15} />
            {slide.ctaLabel}
          </button>
        </div>

        {/* Footer — Nanti Saja (left) | Lanjut (right) */}
        <div className="flex items-center justify-between px-5 pb-5">
          <button
            onClick={handleSkip}
            className="text-xs text-gray-400 hover:text-gray-500 font-medium transition-colors"
          >
            {slide.skipLabel}
          </button>

          <button
            onClick={handleNext}
            className="flex items-center gap-1 text-sm font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
          >
            {isLast ? "Selesai" : "Lanjut"}
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
