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
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://world-insights.vercel.app'),
  title: {
    default: "World Insights | Global Demographic & Geographic Dashboard",
    template: "%s | World Insights",
  },
  description: "Explore comprehensive global statistics, regional demographics, and detailed country profiles with our high-performance interactive dashboard.",
  keywords: ["countries", "world statistics", "demographics", "geography", "dashboard", "country flags", "capitals", "world map", "population data"],
  authors: [{ name: "World Insights Team" }],
  creator: "World Insights",
  publisher: "World Insights",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "World Insights Dashboard",
    description: "Explore comprehensive global statistics and detailed country profiles.",
    url: "/",
    siteName: "World Insights",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "World Insights Dashboard",
    description: "Explore comprehensive global statistics and detailed country profiles.",
    creator: "@worldinsights",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

import { ThemeProvider } from "@/components/ThemeProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col transition-colors duration-300">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          forcedTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
