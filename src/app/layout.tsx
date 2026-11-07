import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://ai-chat-widget-nu.vercel.app"),
  title: "AI Chat Widget — Demo",
  description: "AI chat widget for business websites: answers 24/7 and takes bookings",
  openGraph: {
    title: "AI-ассистент для сайта клиники — демо",
    description: "Отвечает пациентам 24/7 и записывает на приём. Нажмите 💬 и попробуйте сами.",
    url: "/",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ru"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
