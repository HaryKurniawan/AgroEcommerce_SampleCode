import type { Metadata } from "next";

import ClientLayoutWrapper from "@/src/components/layout/ClientLayoutWrapper";

import { Providers } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://agro-ecommerce.web.id"),
  title: "Agro Ecommerce",
  description: "Mode testing pemenuhan skripsi By @hyverstudio",
  openGraph: {
    title: "Agro Ecommerce",
    description: "Mode testing pemenuhan skripsi By @hyverstudio",
    url: "https://agro-ecommerce.web.id",
    siteName: "Agro Ecommerce",
    images: [
      {
        url: "/images/hyver.png",
        width: 1200,
        height: 630,
        alt: "Agro Ecommerce",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Agro Ecommerce",
    description: "Mode testing pemenuhan skripsi By @hyverstudio",
    images: ["/images/hyver.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased" suppressHydrationWarning>
        <Providers>
          <ClientLayoutWrapper>{children}</ClientLayoutWrapper>
        </Providers>
      </body>
    </html>
  );
}
