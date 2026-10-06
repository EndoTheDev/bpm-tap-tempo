import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

// umami analytics - this tool's own entry (4a67333b), separate from the other tools
export const metadata: Metadata = {
  title: "Check BPM - tap tempo counter, see the transitions",
  description:
    "Tap to find a track's BPM, then see every transition option: half, double, dotted eighth and the pitch ride range. For DJs mixing across genres.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* umami analytics - this tool's own entry (4a67333b) */}
        <script
          defer
          src="https://umami.endothe.dev/script.js"
          data-website-id="4a67333b-3399-4f49-b1af-407385ad3a86"
        />
      </head>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}