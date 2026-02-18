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
    default: "보수학당",
    template: "%s | 보수학당",
  },
  description:
    "보수주의 사상과 철학을 체계적으로 배울 수 있는 무료 교육 플랫폼",
  keywords: [
    "보수주의",
    "보수학당",
    "강의",
    "교육",
    "철학",
    "사상",
    "무료 강의",
  ],
  authors: [{ name: "보수학당" }],
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: "보수학당",
    title: "보수학당",
    description:
      "보수주의 사상과 철학을 체계적으로 배울 수 있는 무료 교육 플랫폼",
  },
  twitter: {
    card: "summary_large_image",
    title: "보수학당",
    description:
      "보수주의 사상과 철학을 체계적으로 배울 수 있는 무료 교육 플랫폼",
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
