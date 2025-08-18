import { Toaster } from 'sonner'  
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
  title: "Blossom Coaching",
  description: "At Blossom Coaching, we are building a community where aspiring life and career coaches-in-training grow by helping you grow. Contribute only what feels right.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        {/* 🔔 Mount the toast portal ONCE here */}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
