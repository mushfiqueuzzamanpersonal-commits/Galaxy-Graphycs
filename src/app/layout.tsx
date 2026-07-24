import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Galaxy Graphycs | Premium Printing & Design Services",
  description: "Order and manage your printing requests with Galaxy Graphycs. We offer high-quality banners, posters, visiting cards, custom prints, and more.",
  keywords: "Galaxy Graphycs, printing services, banners, posters, visiting cards, custom prints, online print ordering",
  openGraph: {
    title: "Galaxy Graphycs | Premium Printing Services",
    description: "High-quality banners, posters, visiting cards, and custom prints. Order easily through our customer portal.",
    type: "website",
    siteName: "Galaxy Graphycs",
  },
  verification: {
    google: 'yG5NWZlFEavJI-Jj64fX_U7BkDfJq27_0r9b6gu7JFQ',
  },
  icons: {
    icon: '/logo.jpg',
    apple: '/logo.jpg',
  },
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-900 text-white min-h-screen`}>
        {children}
      </body>
    </html>
  );
}
