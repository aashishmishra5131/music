"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import ChatWidget from "@/components/ChatWidget";

export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminPage = pathname.startsWith("/admin");

  return (
    <>
      {!isAdminPage && (
        <div className="relative w-full flex items-center justify-center">
          <Navbar />
        </div>
      )}
      {children}
      {!isAdminPage && <ChatWidget />}
    </>
  );
}
