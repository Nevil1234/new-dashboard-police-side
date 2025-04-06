import type { Metadata } from "next";
import type React from "react";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "Police Station Dashboard",
  description: "Dashboard for Police Stations",
};

export default function PoliceStationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <div className="flex-1 w-full h-full">{children}</div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}