import type { Metadata } from "next";
import { Fraunces, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";
import Navbar from "@/components/navbar";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { LoadingProvider } from "@/components/providers/loading-provider";
import { PageTransition } from "@/components/page-transition";
import { Suspense } from "react";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["opsz", "SOFT", "WONK"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Aura | Ticketing for events that matter",
  description:
    "Find events, buy tickets, manage attendees. Built for speed and integrity. No double-sales, ever.",
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
        className={`${fraunces.variable} ${inter.variable} ${jetbrainsMono.variable} antialiased min-h-screen bg-background text-foreground overflow-x-hidden`}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex min-h-screen flex-col w-full">
            <Navbar />
            <main className="flex-1 w-full">
              <div className="w-full max-w-6xl mx-auto px-5 sm:px-6 lg:px-8 py-8">
                <Suspense fallback={null}>
                  <LoadingProvider>
                    <PageTransition>{children}</PageTransition>
                  </LoadingProvider>
                </Suspense>
              </div>
            </main>
            <footer className="border-t border-border mt-16">
              <div className="max-w-6xl mx-auto px-5 sm:px-6 lg:px-8 py-12 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
                <div className="space-y-3 max-w-sm">
                  <Link href="/" className="inline-flex items-baseline gap-2 group">
                    <span className="serif text-2xl font-semibold tracking-tight text-foreground group-hover:text-primary transition-colors">
                      Aura
                    </span>
                  </Link>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Event ticketing with integrity. Capacity-protected bookings, verified tickets,
                    zero double-sales.
                  </p>
                </div>
                <div className="flex flex-wrap gap-x-8 gap-y-3 md:justify-end">
                  <Link
                    href="/events"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Events
                  </Link>
                  {session ? (
                    <Link
                      href={
                        session.role === "ADMIN" || (session.role as string) === "SUPER_ADMIN"
                          ? "/admin/dashboard"
                          : session.role === "ORGANIZER"
                            ? "/organizer/dashboard"
                            : "/dashboard"
                      }
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Dashboard
                    </Link>
                  ) : (
                    <>
                      <Link
                        href="/login"
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        Sign in
                      </Link>
                      <Link
                        href="/register"
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        Create account
                      </Link>
                    </>
                  )}
                </div>
                <p className="text-xs text-muted-foreground/70 md:col-span-2">
                  &copy; {new Date().getFullYear()} Aura. All rights reserved.
                </p>
              </div>
            </footer>
          </div>
          <Toaster position="top-center" richColors closeButton />
        </ThemeProvider>
      </body>
    </html>
  );
}
