import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { AppProviders } from "@/providers/AppProviders";
import ErrorBoundary from "@/components/ErrorBoundary";
import Navbar from "@/components/layout/Navbar";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap"
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap"
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#4a5d3a" }, // Forest green
    { media: "(prefers-color-scheme: dark)", color: "#2d3d2d" },  // Dark forest green
  ],
};

export const metadata: Metadata = {
  title: "FarmTrack - Professional Farm Management",
  description: "Comprehensive farm records management system for modern agricultural operations. Track activities, manage inventory, monitor finances, and optimize productivity.",
  keywords: ["farm management", "agriculture", "record keeping", "inventory", "financial tracking", "productivity"],
  authors: [{ name: "FarmTrack Team" }],
  creator: "FarmTrack",
  publisher: "FarmTrack",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      { rel: 'mask-icon', url: '/safari-pinned-tab.svg', color: '#4a5d3a' },
    ],
  },
  manifest: "/site.webmanifest",
  openGraph: {
    title: "FarmTrack - Professional Farm Management",
    description: "Comprehensive farm records management system for modern agricultural operations",
    url: "https://farm-track-gamma.vercel.app",
    siteName: "FarmTrack",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "FarmTrack - Professional Farm Management",
    description: "Comprehensive farm records management system for modern agricultural operations",
    creator: "@farmtrack",
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body className={`${inter.variable} ${playfair.variable} font-sans min-h-screen flex flex-col bg-background`}>
        <AppProviders>
          <ErrorBoundary>
            <div className="min-h-screen flex flex-col">
              <Navbar />
              <main className="flex-1">
                {children}
              </main>
              <footer className="bg-background border-t">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                  <p className="text-center text-sm text-muted-foreground">
                    &copy; {new Date().getFullYear()} FarmTrack. All rights reserved.
                  </p>
                </div>
              </footer>
              <Toaster />
            </div>
          </ErrorBoundary>
        </AppProviders>
      </body>
    </html>
  );
}
