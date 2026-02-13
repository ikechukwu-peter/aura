import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";
import Navbar from "@/components/navbar";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { LoadingProvider } from "@/components/providers/loading-provider";
import { PageTransition } from "@/components/page-transition";
import { Suspense } from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AURA | Premium Ticketing Platform",
  description: "Secure, fast, and elegant event ticketing.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background text-foreground overflow-x-hidden`}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {/* Background Glow Orbs */}
          <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
            <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-indigo-500/[0.08] blur-[120px] rounded-full animate-pulse" />
            <div className="absolute top-[20%] -right-[5%] w-[35%] h-[35%] bg-cyan-500/[0.08] blur-[100px] rounded-full animate-pulse [animation-delay:2s]" />
            <div className="absolute -bottom-[10%] left-[20%] w-[50%] h-[50%] bg-violet-500/[0.08] blur-[150px] rounded-full animate-pulse [animation-delay:4s]" />
            <div className="absolute inset-0 bg-glass-gradient opacity-30 dark:opacity-40" />
          </div>

          <div className="relative flex min-h-screen flex-col w-full">
            <Navbar />
            <main className="flex-1 w-full flex flex-col items-center">
              <div className="w-full max-w-7xl px-6 lg:px-12">
                <Suspense fallback={null}>
                  <LoadingProvider>
                    <PageTransition>
                      {children}
                    </PageTransition>
                  </LoadingProvider>
                </Suspense>
              </div>
            </main>
            <footer className="border-t border-border bg-foreground/[0.02] backdrop-blur-xl py-20">
              <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-col items-start justify-between gap-12 md:flex-row">
                <div className="space-y-4">
                  <span className="text-2xl font-black tracking-tighter bg-gradient-to-r from-aura-primary to-aura-secondary bg-clip-text text-transparent uppercase">
                    AURA
                  </span>
                  <p className="text-sm text-foreground/40 font-medium max-w-xs leading-relaxed">
                    The premium ticketing platform for next-gen experiences. Built for speed, security, and elegance.
                  </p>
                </div>
                <div className="flex flex-col gap-6 md:items-end">
                  <div className="flex gap-8">
                    <Link href="/events" className="text-[10px] font-black uppercase tracking-widest text-foreground/40 hover:text-foreground transition-colors">Events</Link>
                    {session ? (
                      <Link href={(session.role === "ADMIN" || (session.role as string) === "SUPER_ADMIN") ? "/admin/dashboard" : session.role === "ORGANIZER" ? "/organizer/dashboard" : "/dashboard"} className="text-[10px] font-black uppercase tracking-widest text-foreground/40 hover:text-foreground transition-colors">Dashboard</Link>
                    ) : (
                      <>
                        <Link href="/login" className="text-[10px] font-black uppercase tracking-widest text-foreground/40 hover:text-foreground transition-colors">Login</Link>
                        <Link href="/register" className="text-[10px] font-black uppercase tracking-widest text-foreground/40 hover:text-foreground transition-colors">Register</Link>
                      </>
                    )}
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/20">
                    &copy; {new Date().getFullYear()} AURA Neural Systems // Secure
                  </p>
                </div>
              </div>
            </footer>
          </div>
          <Toaster position="top-center" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
