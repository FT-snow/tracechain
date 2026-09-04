import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const geistMono = Geist_Mono({
  variable: "--font-technical",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TraceChain — Trace Every Wallet. Track Every Fraud.",
  description:
    "Real-time identification of fraud-linked cryptocurrency exchanges from victim-reported suspect wallet addresses through automated blockchain analytics. Built for SIH26183, Ministry of Home Affairs.",
  keywords: [
    "cryptocurrency tracing",
    "fraud wallet tracing",
    "blockchain analytics",
    "cybercrime",
    "exchange identification",
    "India",
    "MHA",
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistMono.variable} h-full antialiased`}    >
      <body className="min-h-screen bg-bg text-text-primary">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
