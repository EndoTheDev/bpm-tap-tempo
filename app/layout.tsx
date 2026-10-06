import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

// umami analytics - the shared endothe.dev tools website id, from commit one
export const metadata: Metadata = {
  title: "Check BPM - tap tempo counter, see the transitions",
  description:
    "Tap to find a track's BPM, then see every transition option: half, double, dotted eighth and the pitch ride range. For DJs mixing across genres.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* umami analytics - shared tools website id, from commit one */}
        <script
          defer
          src="https://umami.endothe.dev/script.js"
          data-website-id="1edac4e0-e48a-46d3-8274-1a756e5a337c"
        />
      </head>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}