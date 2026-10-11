import React from "react";
import Providers from "@/providers";
import "./global.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#f8fafc] text-slate-900 antialiased selection:bg-[#e37937] selection:text-white">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}