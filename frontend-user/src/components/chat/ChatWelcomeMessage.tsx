import { Headphones } from "lucide-react";

export default function ChatWelcomeMessage() {
  return (
    <div className="flex items-start gap-2">
      <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
        <Headphones size={16} className="text-primary-600" />
      </div>
      <div className="max-w-[85%] bg-white border border-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
        <p className="text-[14px] text-gray-800 leading-relaxed">
          👋 Halo! Selamat datang di{" "}
          <span className="font-bold text-primary-600">
            Customer Service Agro Market
          </span>
          .
          <br />
          <br />
          Ada yang bisa kami bantu? Silakan pilih topik di bawah ini atau ketik
          pesan Anda.
        </p>
      </div>
    </div>
  );
}
