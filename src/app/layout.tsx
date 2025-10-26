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
  display: "swap",
  preload: true
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
  preload: true
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#4a5d3a" }, // Forest green
    { media: "(prefers-color-scheme: dark)", color: "#2d3d2d" },  // Dark forest green
  ],
  viewportFit: 'cover',
  colorScheme: 'light dark'
};

export const metadata: Metadata = {
  title: "FarmTrack – An EmmanuelOS Agricultural Module",
  description: "Agricultural management system for activity tracking, inventory control, financial monitoring, and operational data analysis.",
  keywords: ["farm management", "agriculture", "record keeping", "inventory", "financial tracking", "productivity"],
  authors: [{ name: "CEO – Chukwuka Emmanuel Ogugua" }],
  creator: "FarmTrack – An EmmanuelOS Agricultural Module",
  publisher: "EmmanuelOS",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
    ],
    apple: [
      { url: '/logo.svg', sizes: 'any', type: 'image/svg+xml' },
    ],
    other: [
      { rel: 'mask-icon', url: '/favicon.svg', color: '#4a5d3a' },
    ],
  },
  manifest: "/site.webmanifest",
  openGraph: {
    title: "FarmTrack – An EmmanuelOS Agricultural Module",
    description: "Agricultural management system for activity tracking, inventory control, financial monitoring, and operational data analysis",
    url: "https://farm-track-gamma.vercel.app",
    siteName: "FarmTrack",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "FarmTrack – An EmmanuelOS Agricultural Module",
    description: "Agricultural management system for activity tracking, inventory control, financial monitoring, and operational data analysis",
    creator: "@emmanuelos",
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
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable} h-full`}
      suppressHydrationWarning
    >
      <body className="font-sans min-h-screen flex flex-col bg-background text-foreground antialiased">
        <AppProviders>
          <ErrorBoundary>
            {/* Skip link for accessibility */}
            <a
              href="#main-content"
              className="skip-link"
              aria-label="Skip to main content"
            >
              Skip to main content
            </a>

            <div className="min-h-screen flex flex-col">
              <Navbar />
              <main
                id="main-content"
                className="flex-1 focus:outline-none"
                role="main"
                aria-label="Main content"
              >
                {children}
              </main>
              <footer
                className="bg-background border-t border-border mt-auto"
                role="contentinfo"
                aria-label="Site footer"
              >
                <div className="container-wide py-6">
                  <p className="text-center text-responsive-sm text-muted-foreground">
                    &copy; {new Date().getFullYear()} FarmTrack – An EmmanuelOS Agricultural Module. All rights reserved.
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
