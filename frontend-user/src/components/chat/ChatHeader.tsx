import { ArrowLeft, Store, Headphones } from "lucide-react";
import Image from "next/image";

interface ChatHeaderProps {
  name: string;
  icon: "seller" | "cs";
  fotoUrl: string | null;
  onBack: () => void;
}

export default function ChatHeader({
  name,
  icon,
  fotoUrl,
  onBack,
}: ChatHeaderProps) {
  const isSeller = icon === "seller";
  const headerIcon = isSeller ? (
    <Store size={22} className="text-emerald-600" />
  ) : (
    <Headphones size={22} className="text-primary-600" />
  );
  const headerIconBg = isSeller ? "bg-emerald-100" : "bg-primary-100";

  return (
    <div className="bg-white px-4 py-3 flex items-center gap-3 shadow-sm z-20 border-b border-gray-100 flex-shrink-0">
      <button
        onClick={onBack}
        className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600 lg:hidden"
      >
        <ArrowLeft size={20} />
      </button>

      {fotoUrl ? (
        <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
          <Image
            src={fotoUrl}
            alt={name}
            width={40}
            height={40}
            className="w-full h-full object-cover"
            unoptimized
          />
        </div>
      ) : (
        <div
          className={`w-10 h-10 ${headerIconBg} rounded-full flex items-center justify-center flex-shrink-0`}
        >
          {headerIcon}
        </div>
      )}

      <div className="flex-1 min-w-0">
        <h1 className="font-semibold text-gray-800 text-[15px] truncate">
          {name}
        </h1>
      </div>
    </div>
  );
}
