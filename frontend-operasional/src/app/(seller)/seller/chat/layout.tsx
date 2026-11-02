import { Metadata } from "next";

import SellerChatSidebar from "@/components/ecommerce/SellerChatSidebar";

export const metadata: Metadata = {
  title: "Chat - Agro Market",
  description: "Kelola chat dengan pelanggan dan admin operasional.",
};

export default function SellerChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex w-full h-full bg-gray-100 animate-fade-in min-h-0">
      <SellerChatSidebar />
      <div className="flex-1 flex flex-col min-w-0 bg-gray-100 relative">
        {children}
      </div>
    </div>
  );
}
