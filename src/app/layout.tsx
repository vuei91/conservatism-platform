import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "@/providers";
import { Header, Footer, EmailVerifyBanner } from "@/components/layout";
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
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://example.com",
  ),
  title: {
    default: "보수주의 강의 플랫폼",
    template: "%s | 보수주의 강의 플랫폼",
  },
  description:
    "보수주의 사상과 철학을 배우고자 하는 분들을 위한 무료 교육 플랫폼",
  keywords: ["보수주의", "강의", "교육", "철학", "사상", "무료 강의"],
  authors: [{ name: "보수주의 강의 플랫폼" }],
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: "보수주의 강의 플랫폼",
    title: "보수주의 강의 플랫폼",
    description:
      "보수주의 사상과 철학을 배우고자 하는 분들을 위한 무료 교육 플랫폼",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "보수주의 강의 플랫폼",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "보수주의 강의 플랫폼",
    description:
      "보수주의 사상과 철학을 배우고자 하는 분들을 위한 무료 교육 플랫폼",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <div className="flex min-h-screen flex-col">
            <Header />
            <EmailVerifyBanner />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
