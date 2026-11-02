import React, { useState } from "react";
import { User, MoreVertical, Phone, MessageCircle } from "lucide-react";

interface ConvDetail {
  id: string;
  type: string;
  otherUser: {
    id: string;
    name: string | null;
    email: string;
    role: string;
    phone: string | null;
  } | null;
}

interface ChatHeaderProps {
  conversation: ConvDetail | null;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ conversation }) => {
  const [showMenu, setShowMenu] = useState(false);

  const customerName =
    conversation?.otherUser?.name ||
    conversation?.otherUser?.email ||
    "Customer";

  return (
    <div className="bg-white px-5 py-3.5 flex items-center gap-3 shadow-sm z-20 border-b border-gray-100 flex-shrink-0">
      <div className="w-10 h-10 bg-gray-100 border border-gray-200/60 text-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
        <User size={20} className="text-gray-600" />
      </div>
      <div className="flex-1 min-w-0">
        <h1 className="font-semibold text-gray-800 text-[15px] truncate">
          {customerName}
        </h1>
        <p className="text-gray-500 text-[12px] font-medium capitalize">
          {conversation?.otherUser?.role?.toLowerCase().replace("_", " ") ||
            "Operasional"}
        </p>
      </div>

      {/* Action Menu */}
      <div className="relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className={`p-2 rounded-full transition-colors ${
            showMenu
              ? "bg-gray-100 text-gray-900"
              : "text-gray-400 hover:bg-gray-50 hover:text-gray-600"
          }`}
        >
          <MoreVertical size={20} />
        </button>

        {showMenu && (
          <>
            <div
              className="fixed inset-0 z-30"
              onClick={() => setShowMenu(false)}
            />
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-40 animate-in fade-in zoom-in duration-150 origin-top-right">
              <a
                href={`tel:${conversation?.otherUser?.phone}`}
                className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                onClick={() => setShowMenu(false)}
              >
                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                  <Phone size={16} />
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold">Telepon HP</span>
                  <span className="text-[10px] text-gray-400">
                    {conversation?.otherUser?.phone || "-"}
                  </span>
                </div>
              </a>
              <a
                href={`https://wa.me/${conversation?.otherUser?.phone?.replace(/^0/, "62")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                onClick={() => setShowMenu(false)}
              >
                <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                  <MessageCircle size={16} />
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold">WhatsApp</span>
                  <span className="text-[10px] text-gray-400">
                    Klik untuk kirim WA
                  </span>
                </div>
              </a>
              <a
                href={`mailto:${conversation?.otherUser?.email}`}
                className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                onClick={() => setShowMenu(false)}
              >
                <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
                  <User size={16} />
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold">Kirim Email</span>
                  <span className="text-[10px] text-gray-400 font-medium truncate max-w-[120px]">
                    {conversation?.otherUser?.email || "-"}
                  </span>
                </div>
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ChatHeader;
