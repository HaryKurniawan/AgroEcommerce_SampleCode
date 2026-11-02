import { MessageCircle } from "lucide-react";

export default function ChatEmptyState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-gray-100 h-full">
      <div className="w-24 h-24 bg-primary-50 rounded-full flex items-center justify-center mb-6 shadow-sm">
        <MessageCircle size={48} className="text-primary-300" />
      </div>
      <h2 className="font-display font-bold text-xl text-gray-800 mb-2">
        Customer Service Chat
      </h2>
      <p className="text-sm text-gray-500 max-w-sm text-center">
        Pilih percakapan dari daftar di sebelah kiri untuk mulai membaca dan
        membalas pesan.
      </p>
    </div>
  );
}
