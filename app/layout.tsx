import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "EZScreenshotEssay.com",
  description: "Create beautiful screenshots of your essays with customizable styling and watermarks. Perfect for content creators and social media managers.",
  openGraph: {
    title: "EZScreenshotEssay.com",
    description: "Create beautiful screenshots of your essays with customizable styling and watermarks. Perfect for content creators and social media managers.",
    url: "https://ezscreenshotessay.com",
    siteName: "EZScreenshotEssay.com",
    images: [
      {
        url: "https://ezscreenshotessay.com/og.png",
        width: 1152,
        height: 602,
        alt: "EZScreenshotEssay.com Preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "EZScreenshotEssay.com",
    description: "Create beautiful screenshots of your essays with customizable styling and watermarks. Perfect for content creators and social media managers.",
    images: ["https://ezscreenshotessay.com/og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
