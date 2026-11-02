import type { ApiChatMessage } from "@/types";

interface FAQItem {
  label: string;
  text: string;
}

interface ChatFAQButtonsProps {
  onSelectFAQ: (text: string) => Promise<void>;
  disabled?: boolean;
}

const FAQ_ITEMS: FAQItem[] = [
  {
    label: "Status Pesanan Saya",
    text: "Halo, saya ingin menanyakan status pesanan saya.",
  },
  {
    label: "Masalah Pembayaran",
    text: "Halo, saya mengalami masalah dengan pembayaran.",
  },
  {
    label: "Kendala Pengiriman",
    text: "Halo, saya ingin melaporkan kendala pengiriman.",
  },
  {
    label: "Pengembalian Barang",
    text: "Halo, saya ingin mengajukan pengembalian barang.",
  },
  {
    label: "Pertanyaan Lainnya",
    text: "Halo, saya ingin bertanya mengenai layanan Agro Market.",
  },
];

export default function ChatFAQButtons({
  onSelectFAQ,
  disabled = false,
}: ChatFAQButtonsProps) {
  return (
    <div className="ml-10 flex flex-col gap-2 w-full max-w-[85%]">
      {FAQ_ITEMS.map((faq, idx) => (
        <button
          key={idx}
          onClick={() => onSelectFAQ(faq.text)}
          disabled={disabled}
          className="text-left px-4 py-2.5 bg-white border border-primary-200 hover:bg-primary-50 hover:border-primary-400 text-primary-700 text-[13px] font-semibold rounded-xl transition-all active:scale-[0.98] shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {faq.label}
        </button>
      ))}
    </div>
  );
}
