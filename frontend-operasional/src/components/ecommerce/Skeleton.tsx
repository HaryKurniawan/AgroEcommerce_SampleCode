// =============================================================
// SKELETON COMPONENTS — Ecommerce App
// =============================================================

import React from "react";

// ── Base atom ────────────────────────────────────────────────
const Bone: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div
    className={`bg-gray-200 animate-pulse rounded-xl ${className}`}
    aria-hidden="true"
  />
);

// ── Product Card Skeleton (2-column grid)  ───────────────────
export const ProductCardSkeleton: React.FC = () => (
  <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
    <Bone className="w-full aspect-square rounded-none" />
    <div className="p-3 space-y-2">
      <Bone className="h-4 w-3/4" />
      <Bone className="h-3 w-1/2" />
      <div className="flex items-center justify-between mt-1">
        <Bone className="h-5 w-1/3" />
        <Bone className="h-8 w-8 rounded-full" />
      </div>
    </div>
  </div>
);

// ── Product Grid Skeleton ────────────────────────────────────
export const ProductGridSkeleton: React.FC<{ count?: number }> = ({
  count = 6,
}) => (
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6 mt-4">
    {Array.from({ length: count }).map((_, i) => (
      <ProductCardSkeleton key={i} />
    ))}
  </div>
);

// ── Cart Item Skeleton ───────────────────────────────────────
export const CartItemSkeleton: React.FC = () => (
  <div className="px-6 py-5">
    <div className="flex items-start gap-5">
      <Bone className="w-20 h-20 flex-shrink-0" />
      <div className="flex-1 space-y-3">
        <Bone className="h-4 w-3/4" />
        <Bone className="h-3 w-1/3" />
        <div className="flex items-end justify-between mt-4">
          <Bone className="h-5 w-1/4" />
          <Bone className="h-9 w-28 rounded-xl" />
        </div>
      </div>
    </div>
  </div>
);

export const CartGroupSkeleton: React.FC = () => (
  <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm mb-6">
    <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 bg-gray-50/20">
      <Bone className="w-10 h-10 rounded-xl" />
      <Bone className="h-4 w-32" />
    </div>
    <CartItemSkeleton />
    <CartItemSkeleton />
  </div>
);

// ── Order Card Skeleton ──────────────────────────────────────
export const OrderCardSkeleton: React.FC = () => (
  <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
    <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-50">
      <Bone className="h-4 w-28" />
      <Bone className="h-6 w-20 rounded-md" />
    </div>
    <div className="flex gap-4">
      <Bone className="w-20 h-20 rounded-xl flex-shrink-0" />
      <div className="flex-1 space-y-2 flex flex-col justify-center">
        <Bone className="h-4 w-2/3" />
        <Bone className="h-3 w-1/3" />
        <Bone className="h-6 w-1/2 mt-2" />
      </div>
    </div>
  </div>
);

export const OrderListSkeleton: React.FC<{ count?: number }> = ({
  count = 4,
}) => (
  <div className="space-y-4">
    {Array.from({ length: count }).map((_, i) => (
      <OrderCardSkeleton key={i} />
    ))}
  </div>
);

// ── Store Card Skeleton ──────────────────────────────────────
export const StoreCardSkeleton: React.FC = () => (
  <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
    <div className="flex items-center gap-4 mb-4">
      <Bone className="w-14 h-14 rounded-2xl flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Bone className="h-4 w-3/4" />
        <Bone className="h-3 w-1/2" />
      </div>
    </div>
    <div className="grid grid-cols-3 gap-2">
      <Bone className="h-12 rounded-xl" />
      <Bone className="h-12 rounded-xl" />
      <Bone className="h-12 rounded-xl" />
    </div>
  </div>
);

export const StoreGridSkeleton: React.FC<{ count?: number }> = ({
  count = 6,
}) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {Array.from({ length: count }).map((_, i) => (
      <StoreCardSkeleton key={i} />
    ))}
  </div>
);

// ── Notification Skeleton ────────────────────────────────────
export const NotifSkeleton: React.FC = () => (
  <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex gap-4">
    <Bone className="w-12 h-12 rounded-xl flex-shrink-0" />
    <div className="flex-1 space-y-2">
      <Bone className="h-4 w-2/3" />
      <Bone className="h-3 w-full" />
      <Bone className="h-3 w-4/5" />
    </div>
  </div>
);

export const NotifListSkeleton: React.FC<{ count?: number }> = ({
  count = 4,
}) => (
  <div className="space-y-3">
    {Array.from({ length: count }).map((_, i) => (
      <NotifSkeleton key={i} />
    ))}
  </div>
);

// ── Profile Skeleton ─────────────────────────────────────────
export const ProfileSkeleton: React.FC = () => (
  <div className="animate-pulse">
    <div className="bg-gradient-to-br from-gray-200 to-gray-100 pt-16 pb-20 flex flex-col items-center gap-3">
      <Bone className="w-28 h-28 rounded-full" />
      <Bone className="h-5 w-40" />
      <Bone className="h-4 w-32" />
    </div>
    <div className="px-4 space-y-3 mt-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <Bone key={i} className="h-14 w-full rounded-2xl" />
      ))}
    </div>
  </div>
);

// ── Product Detail Skeleton ───────────────────────────────────
export const ProductDetailSkeleton: React.FC = () => (
  <div className="min-h-screen bg-white animate-pulse">
    <Bone className="w-full h-80 rounded-none" />
    <div className="px-4 py-5 space-y-4">
      <Bone className="h-6 w-3/4" />
      <Bone className="h-8 w-1/3" />
      <div className="flex gap-2">
        <Bone className="h-7 w-20 rounded-full" />
        <Bone className="h-7 w-20 rounded-full" />
        <Bone className="h-7 w-20 rounded-full" />
      </div>
      <Bone className="h-3 w-full" />
      <Bone className="h-3 w-5/6" />
      <Bone className="h-3 w-4/5" />
    </div>
  </div>
);

// ── Booking Card Skeleton ────────────────────────────────────
export const BookingCardSkeleton: React.FC = () => (
  <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm space-y-3">
    <div className="flex justify-between items-center">
      <Bone className="h-4 w-1/3" />
      <Bone className="h-6 w-20 rounded-md" />
    </div>
    <Bone className="h-3 w-2/3" />
    <Bone className="h-3 w-1/2" />
    <div className="flex gap-2 pt-2">
      <Bone className="h-8 flex-1 rounded-xl" />
      <Bone className="h-8 flex-1 rounded-xl" />
    </div>
  </div>
);

export const BookingListSkeleton: React.FC<{ count?: number }> = ({
  count = 3,
}) => (
  <div className="space-y-4">
    {Array.from({ length: count }).map((_, i) => (
      <BookingCardSkeleton key={i} />
    ))}
  </div>
);

// ── Address Skeleton ─────────────────────────────────────────
export const AddressSkeleton: React.FC = () => (
  <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex gap-4">
    <Bone className="w-10 h-10 rounded-full flex-shrink-0" />
    <div className="flex-1 space-y-2">
      <div className="flex justify-between items-center">
        <Bone className="h-5 w-1/3" />
        <Bone className="h-6 w-16" />
      </div>
      <Bone className="h-4 w-1/4" />
      <Bone className="h-3 w-3/4" />
      <Bone className="h-3 w-1/2" />
    </div>
  </div>
);

export const AddressListSkeleton: React.FC<{ count?: number }> = ({
  count = 3,
}) => (
  <div className="space-y-4">
    {Array.from({ length: count }).map((_, i) => (
      <AddressSkeleton key={i} />
    ))}
  </div>
);

// ── Store Detail Skeleton ────────────────────────────────────
export const StoreDetailSkeleton: React.FC = () => (
  <div className="min-h-screen bg-gray-50 pb-20 animate-pulse">
    <div className="bg-primary-700 p-5 pb-8 rounded-b-3xl auto-h flex flex-col justify-end">
      <div className="flex items-center gap-4 mt-6">
        <Bone className="w-16 h-16 rounded-2xl flex-shrink-0 bg-white/20" />
        <div className="flex-1 space-y-2">
          <Bone className="h-6 w-1/2 bg-white/20" />
          <Bone className="h-4 w-1/3 bg-white/20" />
        </div>
      </div>
    </div>
    <div className="px-4 -mt-4 space-y-5 pb-4 relative z-10">
      <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
        <Bone className="h-5 w-1/3" />
        <Bone className="h-4 w-full" />
        <Bone className="h-4 w-2/3" />
      </div>
      <ProductGridSkeleton count={4} />
    </div>
  </div>
);

// ── Order Detail Skeleton ────────────────────────────────────
export const OrderDetailSkeleton: React.FC = () => (
  <div className="min-h-screen bg-gray-50 pb-20 animate-pulse">
    <div className="bg-white p-4 border-b border-gray-100 mb-4 h-16 flex items-center">
      <Bone className="h-6 w-1/3 ml-12" />
    </div>
    <div className="max-w-2xl mx-auto px-4 space-y-4">
      <div className="rounded-3xl p-6 bg-white border border-gray-100 flex gap-4">
        <Bone className="w-14 h-14 rounded-2xl flex-shrink-0" />
        <div className="flex-1 flex flex-col justify-center space-y-2">
          <Bone className="h-4 w-1/4" />
          <Bone className="h-6 w-1/2" />
        </div>
      </div>
      <div className="bg-white rounded-3xl p-6 border border-gray-100 space-y-4">
        <div className="flex justify-between items-center">
          <Bone className="h-4 w-1/4" />
          <Bone className="h-4 w-1/4" />
        </div>
        <div className="flex justify-between items-center">
          <Bone className="h-4 w-1/3" />
          <Bone className="h-4 w-1/3" />
        </div>
      </div>
      <div className="bg-white rounded-3xl p-6 border border-gray-100 space-y-4">
        <Bone className="h-5 w-1/3 mb-4" />
        <div className="flex gap-4">
          <Bone className="w-16 h-16 flex-shrink-0 rounded-xl" />
          <div className="flex-1 space-y-2">
            <Bone className="h-5 w-3/4" />
            <Bone className="h-4 w-1/2" />
          </div>
        </div>
      </div>
    </div>
  </div>
);

// ── Chat Room Skeleton ───────────────────────────────────────
export const ChatRoomSkeleton: React.FC = () => (
  <div className="fixed inset-0 z-50 flex flex-col bg-slate-50 animate-pulse">
    <div className="bg-white px-4 py-3 flex items-center gap-3 border-b border-gray-100 flex-shrink-0 h-16">
      <Bone className="w-8 h-8 rounded-full flex-shrink-0" />
      <Bone className="w-10 h-10 rounded-full flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Bone className="h-4 w-1/3" />
        <Bone className="h-3 w-1/4" />
      </div>
    </div>
    <div className="flex-1 px-4 py-6 space-y-6">
      <div className="flex justify-end">
        <Bone className="h-12 w-2/3 rounded-2xl rounded-tr-sm" />
      </div>
      <div className="flex justify-start">
        <Bone className="h-10 w-1/2 rounded-2xl rounded-tl-sm" />
      </div>
      <div className="flex justify-start">
        <Bone className="h-16 w-3/4 rounded-2xl rounded-tl-sm" />
      </div>
      <div className="flex justify-end">
        <Bone className="h-10 w-1/2 rounded-2xl rounded-tr-sm" />
      </div>
    </div>
    <div className="bg-white px-4 py-3 sm:py-4 border-t border-gray-100 flex gap-3 flex-shrink-0 mt-auto">
      <Bone className="h-12 flex-1 rounded-full" />
      <Bone className="w-12 h-12 rounded-full flex-shrink-0" />
    </div>
  </div>
);

// ── Checkout Skeleton ────────────────────────────────────────
export const CheckoutSkeleton: React.FC = () => (
  <div className="min-h-screen bg-gray-50 pb-32 animate-pulse">
    <div className="bg-white px-4 py-3 border-b border-gray-100 mb-6 h-14 flex items-center">
      <Bone className="h-6 w-1/4 ml-10" />
    </div>
    <div className="max-w-5xl mx-auto px-4 lg:px-6 lg:flex lg:gap-8">
      <div className="flex-1 space-y-6">
        <div className="bg-white rounded-3xl p-6 border border-gray-100">
          <Bone className="h-6 w-1/3 mb-4" />
          <div className="flex gap-4 items-center border border-gray-200 p-4 rounded-xl">
            <Bone className="w-5 h-5 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <Bone className="h-5 w-1/3" />
              <Bone className="h-4 w-3/4" />
              <Bone className="h-4 w-1/2" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 bg-gray-50">
            <Bone className="h-5 w-1/3" />
          </div>
          <CartItemSkeleton />
          <div className="p-5 bg-gray-50/50 border-t border-gray-100">
            <Bone className="h-8 w-full rounded-xl" />
          </div>
        </div>
      </div>
      <div className="lg:w-96 mt-6 lg:mt-0">
        <div className="bg-white rounded-3xl p-6 border border-gray-100">
          <Bone className="h-6 w-1/2 mb-6" />
          <div className="space-y-4 text-sm">
            <div className="flex justify-between">
              <Bone className="h-4 w-1/3" />
              <Bone className="h-4 w-1/4" />
            </div>
            <div className="flex justify-between">
              <Bone className="h-4 w-1/3" />
              <Bone className="h-4 w-1/4" />
            </div>
            <div className="pt-4 mt-4 border-t border-gray-100 flex justify-between">
              <Bone className="h-5 w-1/4" />
              <Bone className="h-6 w-1/3" />
            </div>
          </div>
          <Bone className="w-full h-14 rounded-xl mt-6" />
        </div>
      </div>
    </div>
  </div>
);

// ── Payment Skeleton ─────────────────────────────────────────
export const PaymentSkeleton: React.FC = () => (
  <div className="min-h-screen bg-gray-50 pb-20 animate-pulse">
    <div className="bg-white px-4 py-4 border-b border-gray-100 mb-6 h-16 flex items-center">
      <Bone className="h-6 w-1/3 ml-12" />
    </div>
    <div className="max-w-md mx-auto px-4 space-y-4">
      <div className="bg-amber-100 rounded-2xl p-4 h-24">
        <Bone className="h-4 w-1/2 mb-3 bg-amber-200" />
        <Bone className="h-8 w-3/4 bg-amber-200" />
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col gap-4 p-4">
        <div className="space-y-2">
          <Bone className="h-3 w-1/3" />
          <Bone className="h-6 w-1/2" />
        </div>
        <div className="bg-primary-50 p-4 rounded-xl space-y-2">
          <Bone className="h-3 w-1/4 bg-primary-200" />
          <Bone className="h-10 w-full rounded-xl bg-primary-200" />
        </div>
        <div className="pt-4 border-t border-gray-100 space-y-2">
          <Bone className="h-3 w-1/3" />
          <Bone className="h-8 w-1/2" />
        </div>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm space-y-4">
        <Bone className="h-5 w-1/3" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex gap-3">
            <Bone className="w-6 h-6 rounded-full flex-shrink-0" />
            <Bone className="h-4 w-full mt-1" />
          </div>
        ))}
      </div>
    </div>
  </div>
);
