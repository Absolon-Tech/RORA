import type { Metadata, Viewport } from "next";
import { Bodoni_Moda, Jost } from "next/font/google";
import "./globals.css";

const display = Bodoni_Moda({
  variable: "--font-display-src",
  subsets: ["latin"],
  weight: ["400", "500"],
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
