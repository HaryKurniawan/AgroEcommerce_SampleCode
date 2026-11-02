interface ChatDateSeparatorProps {
  date: string;
}

export default function ChatDateSeparator({ date }: ChatDateSeparatorProps) {
  const formatDateSeparator = (dateStr: string) => {
    const msgDate = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (msgDate.toDateString() === today.toDateString()) return "Hari Ini";
    if (msgDate.toDateString() === yesterday.toDateString()) return "Kemarin";
    return msgDate.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="flex justify-center mb-4 mt-2">
      <span className="bg-gray-200/60 text-gray-600 px-3 py-1 rounded-full text-[11px] font-medium">
        {formatDateSeparator(date)}
      </span>
    </div>
  );
}
