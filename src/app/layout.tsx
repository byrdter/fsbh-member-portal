import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { Navigation } from "@/components/Navigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Fair Street-Butler High Schools Alumni Association",
  description: "Preserving the heritage of Fair Street and E.E. Butler High Schools - Member Portal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50`}>
        <Providers>
          <Navigation />
          <main className="min-h-screen">
            {children}
          </main>
          <footer className="bg-maroon-900 text-white py-8 mt-12">
            <div className="max-w-7xl mx-auto px-4 text-center">
              <p className="text-lg font-semibold">Fair Street-Butler High Schools Alumni Association</p>
              <p className="text-gray-300 mt-2">Preserving Our Heritage Since 1991</p>
              <p className="text-gray-400 mt-4 text-sm">
                © {new Date().getFullYear()} FSBHSAA. All rights reserved.
              </p>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
