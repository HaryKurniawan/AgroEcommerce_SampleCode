"use client";

import React from "react";
import { useParams, usePathname } from "next/navigation";

import ChatSidebar from "@/src/components/chat/ChatSidebar";

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const pathname = usePathname();
  const id = params?.id as string | undefined;

  const isIndex = pathname === "/chat";

  return (
    <div className="lg:flex lg:h-[calc(100vh-128px)] lg:mt-0 w-full lg:border-x lg:border-gray-200 overflow-hidden bg-white">
      <div
        className={`lg:w-[380px] flex-shrink-0 h-full ${!isIndex ? "hidden lg:block" : "block"}`}
      >
        <ChatSidebar activeConversationId={id} />
      </div>
      <div
        className={`flex-1 relative h-full bg-slate-50 ${isIndex ? "hidden lg:block" : "block"}`}
      >
        {children}
      </div>
    </div>
  );
}
