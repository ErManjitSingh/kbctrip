import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Inter } from "next/font/google";
import { AppProviders } from "@/components/providers/app-providers";
import { TopBanner } from "@/components/layout/top-banner";
import { KbcSiteHeader } from "@/components/layout/KbcSiteHeader";
import { RightFloatingRail } from "@/components/layout/right-floating-rail";
import { JsonLd } from "@/components/seo/JsonLd";
import { MarketingTracking } from "@/components/marketing/MarketingTracking";
import { HERO_SLIDES, SITE } from "@/lib/constants";
import "./kbc-tokens.css";
import "./globals.css";

export const dynamic = "force-dynamic";

/** Clean UI font site-wide — no decorative display serif. */
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-sans",
  display: "swap",
});

const siteUrl = SITE.url;
const defaultTitle =
  "KBC Trip | Book hotels, packages, cabs and more";
const defaultDescription =
  "Book stays, holiday packages, and cabs in one place. India first — then the rest of the map.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: defaultTitle,
    template: `%s | ${SITE.name}`,
  },
  description: defaultDescription,
  keywords: [
    "tour packages India",
    "holiday packages",
    "hotel booking India",
    "honeymoon packages",
    "custom itineraries",
    "KBC Trip",
    "cab booking",
    "Himachal packages",
  ],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: siteUrl,
    siteName: SITE.name,
    title: defaultTitle,
    description: defaultDescription,
    images: [
      {
        url: HERO_SLIDES[0].src,
        width: 1920,
        height: 1080,
        alt: HERO_SLIDES[0].alt,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: defaultTitle,
    description: defaultDescription,
    images: [HERO_SLIDES[0].src],
  },
  category: "travel",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon-32.png", type: "image/png", sizes: "32x32" },
    ],
    shortcut: "/favicon.ico",
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#0f766e",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={inter.variable}
    >
      <body className="min-h-screen font-sans" suppressHydrationWarning>
        <Script id="meta-pixel" strategy="afterInteractive">
          {process.env.NEXT_PUBLIC_META_PIXEL_ID
            ? `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${process.env.NEXT_PUBLIC_META_PIXEL_ID}');
            fbq('track', 'PageView');
          `
            : ""}
        </Script>
        {process.env.NEXT_PUBLIC_META_PIXEL_ID ? (
          <noscript>
            <img
              height="1"
              width="1"
              style={{ display: "none" }}
              src={`https://www.facebook.com/tr?id=${process.env.NEXT_PUBLIC_META_PIXEL_ID}&ev=PageView&noscript=1`}
              alt=""
            />
          </noscript>
        ) : null}
        <MarketingTracking />
        <JsonLd />
        <AppProviders>
          <TopBanner />
          <KbcSiteHeader />
          {children}
          <RightFloatingRail />
        </AppProviders>
        {/* Temporarily disabled: the consent dialog was obstructing mobile CTA controls. */}
        {/* <CookieConsentBanner /> */}
      </body>
    </html>
  );
}
