"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

// next-themes wrapper - light/dark/system, same storage key as the other
// endothe.dev apps. family convention, third app in the set.
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange={false}>
      {children}
    </NextThemesProvider>
  );
}