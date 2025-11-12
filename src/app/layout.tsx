import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/header";
import { Sidebar } from "@/components/sidebar";
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Pikl QA Assistant - AI-Powered Call Quality Analysis",
  description: "Automated transcription and AI analysis for call center operations. Save 40+ hours per month with intelligent QA insights.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider defaultTheme="light">
          <div className="relative flex min-h-screen flex-col">
            <Header />
            <div className="flex-1 flex">
              <Sidebar />
              <main className="flex-1 overflow-auto">
                <div className="container py-6 px-8">
                  {children}
                </div>
              </main>
            </div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
