import type { Metadata, Viewport } from "next";
import { Poppins, League_Gothic } from "next/font/google";
import "./globals.css";

// Garet itself is a paid font (not on Google Fonts) — Poppins is the
// specified fallback, loaded here under the same --font-garet variable.
const garetFallback = Poppins({
  variable: "--font-garet",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const leagueGothic = League_Gothic({
  variable: "--font-league-gothic",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Phoenix Races — Relances",
  description: "Suivi des relances partenaires pour Phoenix Races.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#122620",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fr"
      className={`${garetFallback.variable} ${leagueGothic.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
