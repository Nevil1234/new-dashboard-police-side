import "./globals.css";
import type { Metadata } from "next";
import type React from "react";

import CustomSessionProvider from "@/components/providers/session-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "Police Portal",
  description: "Dashboard for Police Stations and Officers",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <body>
        <CustomSessionProvider>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
            {children}
            <Toaster />
          </ThemeProvider>
        </CustomSessionProvider>
        </body>
        </html>
  );
}