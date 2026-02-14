import Link from "next/link";
import { getSession } from "@/lib/auth";
import { Zap, User, LogOut, LayoutDashboard, Search, Menu, MessageSquare } from "lucide-react";
import ThemeToggle from "./theme-toggle";
import UnreadBadge from "@/components/messages/unread-badge";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription, SheetClose } from "@/components/ui/sheet";

export default async function Navbar() {
  const session = await getSession();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/60 backdrop-blur-2xl supports-[backdrop-filter]:bg-background/40">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 flex h-20 items-center justify-between">
        <div className="flex items-center gap-12">
          <Link href="/" className="flex items-center space-x-2 sm:space-x-3 group">
            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg sm:xl bg-gradient-to-br from-aura-primary to-aura-secondary flex items-center justify-center group-hover:shadow-glow-aura transition-all duration-500 group-hover:scale-110 active:scale-95 border border-aura-primary/20">
              <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-white fill-white" />
            </div>
            <span className="inline-block font-black text-xl sm:text-2xl tracking-tighter bg-gradient-to-r from-foreground via-foreground to-foreground/40 bg-clip-text text-transparent group-hover:drop-shadow-sm transition-all">
              Aura
            </span>
          </Link>
          <nav className="hidden md:flex gap-10">
            <Link
              href="/events"
              className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40 transition-all hover:text-foreground hover:drop-shadow-[0_0_8px_rgba(79,70,229,0.3)]"
            >
              Discover
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-2 sm:gap-6">
          <div className="hidden md:flex items-center gap-8">
            {session ? (
              <>
                {(session.role === "ADMIN" || (session.role as string) === "SUPER_ADMIN") && (
                  <>
                    <Link
                      href="/admin/dashboard"
                      className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40 hover:text-cyan-500 transition-colors"
                    >
                      Admin
                    </Link>
                    <Link
                      href="/admin/users"
                      className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40 hover:text-cyan-500 transition-colors"
                    >
                      Citizens
                    </Link>
                  </>
                )}
                {session.role === "ORGANIZER" && (
                  <>
                    <Link
                      href="/organizer/dashboard"
                      className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40 hover:text-indigo-500 transition-colors"
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/organizer/messages"
                      className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40 hover:text-foreground transition-all relative"
                    >
                      <MessageSquare className="h-4 w-4" />
                      Signals
                      <UnreadBadge className="absolute -top-2 -right-2 h-4 w-4 rounded-full bg-aura-primary text-[8px] font-black text-white flex items-center justify-center animate-pulse" />
                    </Link>
                  </>
                )}
                {session.role === "USER" && (
                  <Link
                    href="/dashboard/messages"
                    className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40 hover:text-foreground transition-all relative"
                  >
                    <MessageSquare className="h-4 w-4" />
                    Neural Link
                    <UnreadBadge className="absolute -top-2 -right-2 h-4 w-4 rounded-full bg-aura-secondary text-[8px] font-black text-white flex items-center justify-center animate-pulse" />
                  </Link>
                )}
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40 hover:text-foreground transition-all"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Wallet
                </Link>
                <Link
                  href="/profile"
                  className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40 hover:text-foreground transition-all"
                >
                  <User className="h-4 w-4" />
                  Identity
                </Link>
                <Link
                  href="/api/auth/logout"
                  className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/20 hover:text-red-500 transition-all"
                >
                  <LogOut className="h-4 w-4" />
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40 hover:text-foreground transition-all"
                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  className="inline-flex h-11 items-center justify-center rounded-xl bg-foreground text-background px-6 text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-foreground/5 hover:scale-[1.05] active:scale-95 transition-all"
                >
                  Get started
                </Link>
              </>
            )}
          </div>
          <div className="h-6 w-px bg-border hidden md:block" />
          <ThemeToggle />
          <Sheet>
            <SheetTrigger asChild>
              <button className="md:hidden p-2 text-foreground/40 hover:text-foreground cursor-pointer transition-colors" aria-label="Toggle menu">
                <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:max-w-sm bg-background/90 backdrop-blur-2xl border-border/60 p-6">
              <SheetHeader>
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                <SheetDescription className="sr-only">Main navigation links and account actions</SheetDescription>
              </SheetHeader>
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-aura-primary to-aura-secondary flex items-center justify-center border border-aura-primary/20">
                    <Zap className="h-5 w-5 text-white" />
                  </div>
                  <span className="font-black text-xl tracking-tighter text-foreground">Aura</span>
                </div>
                <nav className="flex flex-col gap-3">
                  <SheetClose asChild>
                    <Link href="/events" className="h-12 rounded-xl px-4 flex items-center text-sm font-bold tracking-wider border border-border/60 hover:border-aura-primary/30 hover:bg-aura-primary/5 transition-all">
                      Discover
                    </Link>
                  </SheetClose>
                  {session ? (
                    <>
                      {(session.role === "ADMIN" || (session.role as string) === "SUPER_ADMIN") && (
                        <>
                          <SheetClose asChild>
                            <Link href="/admin/dashboard" className="h-12 rounded-xl px-4 flex items-center text-sm font-bold tracking-wider border border-border/60 hover:border-cyan-500/30 hover:bg-cyan-500/5 transition-all">
                              Admin
                            </Link>
                          </SheetClose>
                          <SheetClose asChild>
                            <Link href="/admin/users" className="h-12 rounded-xl px-4 flex items-center text-sm font-bold tracking-wider border border-border/60 hover:border-cyan-500/30 hover:bg-cyan-500/5 transition-all">
                              Citizens
                            </Link>
                          </SheetClose>
                        </>
                      )}
                      {session.role === "ORGANIZER" && (
                        <>
                          <SheetClose asChild>
                            <Link href="/organizer/dashboard" className="h-12 rounded-xl px-4 flex items-center text-sm font-bold tracking-wider border border-border/60 hover:border-indigo-500/30 hover:bg-indigo-500/5 transition-all">
                              Dashboard
                            </Link>
                          </SheetClose>
                          <SheetClose asChild>
                            <Link href="/organizer/messages" className="h-12 rounded-xl px-4 flex items-center gap-2 text-sm font-bold tracking-wider border border-border/60 hover:border-foreground/30 hover:bg-foreground/5 transition-all">
                              <MessageSquare className="h-4 w-4" />
                              Signals
                            </Link>
                          </SheetClose>
                        </>
                      )}
                      {session.role === "USER" && (
                        <SheetClose asChild>
                          <Link href="/dashboard/messages" className="h-12 rounded-xl px-4 flex items-center gap-2 text-sm font-bold tracking-wider border border-border/60 hover:border-foreground/30 hover:bg-foreground/5 transition-all">
                            <MessageSquare className="h-4 w-4" />
                            Neural Link
                          </Link>
                        </SheetClose>
                      )}
                      <SheetClose asChild>
                        <Link href="/dashboard" className="h-12 rounded-xl px-4 flex items-center gap-2 text-sm font-bold tracking-wider border border-border/60 hover:border-foreground/30 hover:bg-foreground/5 transition-all">
                          <LayoutDashboard className="h-4 w-4" />
                          Wallet
                        </Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <Link href="/profile" className="h-12 rounded-xl px-4 flex items-center gap-2 text-sm font-bold tracking-wider border border-border/60 hover:border-foreground/30 hover:bg-foreground/5 transition-all">
                          <User className="h-4 w-4" />
                          Identity
                        </Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <Link href="/api/auth/logout" className="h-12 rounded-xl px-4 flex items-center gap-2 text-sm font-bold tracking-wider border border-border/60 text-red-500 hover:bg-red-500/5 transition-all">
                          <LogOut className="h-4 w-4" />
                          Log out
                        </Link>
                      </SheetClose>
                    </>
                  ) : (
                    <>
                      <SheetClose asChild>
                        <Link href="/login" className="h-12 rounded-xl px-4 flex items-center text-sm font-bold tracking-wider border border-border/60 hover:border-foreground/30 hover:bg-foreground/5 transition-all">
                          Log in
                        </Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <Link href="/register" className="h-12 rounded-xl px-4 flex items-center justify-center text-sm font-bold tracking-wider rounded-xl bg-foreground text-background hover:opacity-90 transition-all">
                          Get started
                        </Link>
                      </SheetClose>
                    </>
                  )}
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
