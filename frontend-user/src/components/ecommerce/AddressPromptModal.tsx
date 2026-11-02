import React from "react";
import { MapPin, Clock, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface AddressPromptModalProps {
  isOpen: boolean;
  city: string;
  onClose: () => void;
}

const AddressPromptModal: React.FC<AddressPromptModalProps> = ({
  isOpen,
  city,
  onClose,
}) => {
  const router = useRouter();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <div className="w-full max-w-sm relative animate-slide-up bg-white rounded-[2rem] p-6 shadow-2xl">
        <div className="flex justify-center mb-2 ml-1 -mr-2 -mt-6">
          <Image
            src="/images/maps.svg"
            alt="Maps Illustration"
            width={240}
            height={240}
            className="object-contain w-[240px] h-[240px]"
            priority
          />
        </div>

        <h2 className="font-display text-xl font-semibold text-gray-900 text-center mb-3">
          Lengkapi Alamatmu Yuk!
        </h2>
        <p className="text-[13px] text-gray-500 text-center mb-10 leading-relaxed px-2">
          Biar belanjamu di {city} makin lancar, isi alamat pengiriman sekarang,
          yuk!
        </p>

        <div className="flex gap-3">
          <button
            onClick={() => {
              onClose();
              router.push(
                `/profil/alamat/form?city=${encodeURIComponent(city)}`,
              );
            }}
            className="w-full bg-primary-600 text-white font-medium py-3 rounded-xl hover:bg-primary-700 transition-all shadow-md shadow-primary-500/20 text-sm"
          >
            Isi Sekarang
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddressPromptModal;
