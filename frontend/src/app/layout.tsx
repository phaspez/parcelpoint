import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "dotenv/config";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ThemeProvider } from "next-themes";
import { cn } from "@/lib/utils";
import { CookiesProvider } from "next-client-cookies/server";
import { Toaster } from "@/components/ui/toaster";
import { QueryClient } from "@tanstack/react-query";
import { GoogleOAuthProvider } from "@react-oauth/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

const queryClient = new QueryClient();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&icon_names=filter_list"
        />
      </head>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          geistSans.variable,
          geistMono.variable,
        )}
      >
        <GoogleOAuthProvider clientId="885738935087-dgvfhn67sfnqr8g87if8jb2e1tmj24b4.apps.googleusercontent.com">
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <CookiesProvider>
              <div className="relative flex min-h-screen flex-col dark:bg-black">
                <Header />
                <main className="flex-1 px-4 md:px-20 lg:px-40 py-10 pb-10">
                  {children}
                </main>
                <Footer />
              </div>
              <Toaster />
            </CookiesProvider>
          </ThemeProvider>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
