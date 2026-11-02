import { Metadata } from "next";

import ChatSidebar from "@/components/ecommerce/ChatSidebar";

export const metadata: Metadata = {
  title: "CS Chat - Agro Market",
  description: "Customer Service chat interface.",
};

export default function CsChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex w-full h-screen bg-slate-50 animate-fade-in min-h-0">
      <ChatSidebar />
      <div className="flex-1 flex flex-col min-w-0 bg-gray-100 relative border-l border-gray-200">
        {children}
      </div>
    </div>
  );
}
