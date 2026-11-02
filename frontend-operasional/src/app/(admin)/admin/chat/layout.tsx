import { Metadata } from "next";

import ChatSidebar from "@/components/ecommerce/ChatSidebar";

export const metadata: Metadata = {
  title: "Pusat Bantuan - Agro Market",
  description: "Kelola bantuan dan chat pelanggan dengan mudah.",
};

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex w-full h-full bg-gray-100 animate-fade-in min-h-0">
      <ChatSidebar />
      <div className="flex-1 flex flex-col min-w-0 bg-gray-100 relative border-l border-gray-200">
        {children}
      </div>
    </div>
  );
}
