import type { Metadata } from "next";
import localFont from "next/font/local";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

/**
 * Switzer (Fontshare / Indian Type Foundry) — free neo-grotesque closest to
 * OpenAI docs’ Söhne / OpenAI Sans look. Self-hosted; Söhne & OpenAI Sans are not freely redistributable.
 */
const switzer = localFont({
  src: [
    {
      path: "../fonts/switzer-400.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../fonts/switzer-500.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../fonts/switzer-600.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../fonts/switzer-700.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-sans",
  display: "swap",
  fallback: ["ui-sans-serif", "system-ui", "Helvetica Neue", "Arial", "sans-serif"],
});

export const metadata: Metadata = {
  title: "OpenDots — Miles Seade · Summer 2027",
  description:
    "Internship prep workspace for Miles Seade: deepen AADE, research SWE/cloud roles, and ship applications with specialist Dots.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`dark ${switzer.variable} h-full antialiased`}
    >
      <body className="min-h-full font-sans">
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
}
