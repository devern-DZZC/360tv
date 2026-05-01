import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: {
    default: "360tv — Live Cricket & Football Streaming",
    template: "%s | 360tv",
  },
  description:
    "Watch live cricket and football streams. Your go-to hub for sports action from 360tv.",
  keywords: ["cricket", "football", "soccer", "live stream", "sports", "360tv"],
  openGraph: {
    type: "website",
    siteName: "360tv",
    title: "360tv — Live Cricket & Football Streaming",
    description:
      "Watch live cricket and football streams. Your go-to hub for sports action from 360tv.",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "360tv — Live Cricket & Football Streaming",
    description:
      "Watch live cricket and football streams. Your go-to hub for sports action.",
  },
  icons: {
    icon: "/360tv-logo.png",
    apple: "/360tv-logo.png",
  },
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
  ),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
