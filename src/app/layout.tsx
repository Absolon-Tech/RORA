import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Jost } from "next/font/google";
import "./globals.css";

/**
 * Cormorant Garamond — a roman garalde. Chosen over a Didone deliberately: Bodoni's hairlines are
 * dramatic but fragile, and at the sizes this page uses them they read thin rather than rich, and
 * strain on a phone. A Garamond keeps the classical, expensive letterforms while holding real
 * weight in the stroke, so it stays warm and genuinely legible.
 *
 * Set at 500/600 rather than 300 — the light cuts are beautiful but disappear on a dark ground.
 */
const display = Cormorant_Garamond({
  variable: "--font-display-src",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

const body = Jost({
  variable: "--font-body-src",
  subsets: ["latin"],
  weight: ["300", "400"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "RORA",
  description:
    "An elevated take on power dressing. Structured. Bold. Yours. Seven pieces, one first run.",
  openGraph: {
    title: "RORA",
    description: "An elevated take on power dressing. Structured. Bold. Yours.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#F5F1E6",
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} h-full`}>
      <body className="min-h-full antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-6 focus:top-6 focus:z-[200] focus:bg-sceptre focus:px-5 focus:py-3 focus:text-ivory"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
