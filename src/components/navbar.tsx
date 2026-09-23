import Link from "next/link";
import { getSession } from "@/lib/auth";
import {
  Ticket,
  User,
  LogOut,
  LayoutDashboard,
  Menu,
  MessageSquare,
  CalendarHeart,
} from "lucide-react";
import ThemeToggle from "./theme-toggle";
import UnreadBadge from "@/components/messages/unread-badge";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetClose,
} from "@/components/ui/sheet";

export default async function Navbar() {
  const session = await getSession();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="max-w-6xl mx-auto px-5 sm:px-6 lg:px-8 flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 group shrink-0">
            <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center text-primary-foreground group-hover:opacity-90 transition-opacity">
              <Ticket className="h-4 w-4" />
            </div>
            <span className="serif text-xl font-semibold tracking-tight text-foreground">
              Aura
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/events"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Browse events
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-5">
            {session ? (
              <>
                {(session.role === "ADMIN" ||
                  (session.role as string) === "SUPER_ADMIN") && (
                  <>
                    <Link
                      href="/admin/dashboard"
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Admin
                    </Link>
                    <Link
                      href="/admin/users"
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Users
                    </Link>
                  </>
                )}
                {session.role === "ORGANIZER" && (
                  <>
                    <Link
                      href="/organizer/dashboard"
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/organizer/events/new"
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1.5"
                    >
                      <CalendarHeart className="h-3.5 w-3.5" />
                      New event
                    </Link>
                    <Link
                      href="/organizer/messages"
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1.5 relative"
                    >
                      <MessageSquare className="h-3.5 w-3.5" />
                      Messages
                      <UnreadBadge className="absolute -top-1.5 -right-3 h-4 min-w-4 px-1 rounded-full bg-primary text-[10px] font-medium text-primary-foreground flex items-center justify-center" />
                    </Link>
                  </>
                )}
                {session.role === "USER" && (
                  <Link
                    href="/dashboard/messages"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1.5 relative"
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                    Messages
                    <UnreadBadge className="absolute -top-1.5 -right-3 h-4 min-w-4 px-1 rounded-full bg-primary text-[10px] font-medium text-primary-foreground flex items-center justify-center" />
                  </Link>
                )}
                <Link
                  href="/dashboard"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1.5"
                >
                  <LayoutDashboard className="h-3.5 w-3.5" />
                  My tickets
                </Link>
                <Link
                  href="/profile"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1.5"
                >
                  <User className="h-3.5 w-3.5" />
                  Profile
                </Link>
                <Link
                  href="/api/auth/logout"
                  className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                  aria-label="Sign out"
                >
                  <LogOut className="h-4 w-4" />
                </Link>
              </>
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
                  className="inline-flex h-9 items-center justify-center rounded-md bg-primary text-primary-foreground px-4 text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  Create account
                </Link>
              </>
            )}
          </div>
          <ThemeToggle />
          <Sheet>
            <SheetTrigger asChild>
              <button
                className="md:hidden p-2 text-muted-foreground hover:text-foreground rounded-md transition-colors"
                aria-label="Toggle menu"
              >
                <Menu className="h-5 w-5" />
              </button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-full sm:max-w-sm border-border p-6 bg-background"
            >
              <SheetHeader>
                <SheetTitle className="sr-only">Navigation menu</SheetTitle>
                <SheetDescription className="sr-only">
                  Main navigation links and account actions
                </SheetDescription>
              </SheetHeader>
              <div className="space-y-6">
                <div className="flex items-center gap-3 pb-3 border-b border-border">
                  <div className="h-9 w-9 rounded-md bg-primary flex items-center justify-center text-primary-foreground">
                    <Ticket className="h-4 w-4" />
                  </div>
                  <span className="serif text-lg font-semibold text-foreground">Aura</span>
                </div>
                <nav className="flex flex-col gap-1">
                  <SheetClose asChild>
                    <Link
                      href="/events"
                      className="h-10 px-3 rounded-md text-sm font-medium text-foreground hover:bg-accent transition-colors flex items-center"
                    >
                      Browse events
                    </Link>
                  </SheetClose>
                  {session ? (
                    <>
                      <div className="h-px bg-border my-2" />
                      {(session.role === "ADMIN" ||
                        (session.role as string) === "SUPER_ADMIN") && (
                        <>
                          <SheetClose asChild>
                            <Link
                              href="/admin/dashboard"
                              className="h-10 px-3 rounded-md text-sm font-medium text-foreground hover:bg-accent transition-colors flex items-center"
                            >
                              Admin dashboard
                            </Link>
                          </SheetClose>
                          <SheetClose asChild>
                            <Link
                              href="/admin/users"
                              className="h-10 px-3 rounded-md text-sm font-medium text-foreground hover:bg-accent transition-colors flex items-center"
                            >
                              Manage users
                            </Link>
                          </SheetClose>
                        </>
                      )}
                      {session.role === "ORGANIZER" && (
                        <>
                          <SheetClose asChild>
                            <Link
                              href="/organizer/dashboard"
                              className="h-10 px-3 rounded-md text-sm font-medium text-foreground hover:bg-accent transition-colors flex items-center"
                            >
                              Organizer dashboard
                            </Link>
                          </SheetClose>
                          <SheetClose asChild>
                            <Link
                              href="/organizer/events/new"
                              className="h-10 px-3 rounded-md text-sm font-medium text-foreground hover:bg-accent transition-colors flex items-center"
                            >
                              Create event
                            </Link>
                          </SheetClose>
                          <SheetClose asChild>
                            <Link
                              href="/organizer/messages"
                              className="h-10 px-3 rounded-md text-sm font-medium text-foreground hover:bg-accent transition-colors flex items-center gap-2"
                            >
                              Messages
                            </Link>
                          </SheetClose>
                        </>
                      )}
                      {session.role === "USER" && (
                        <SheetClose asChild>
                          <Link
                            href="/dashboard/messages"
                            className="h-10 px-3 rounded-md text-sm font-medium text-foreground hover:bg-accent transition-colors flex items-center gap-2"
                          >
                            Messages
                          </Link>
                        </SheetClose>
                      )}
                      <SheetClose asChild>
                        <Link
                          href="/dashboard"
                          className="h-10 px-3 rounded-md text-sm font-medium text-foreground hover:bg-accent transition-colors flex items-center gap-2"
                        >
                          My tickets
                        </Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <Link
                          href="/profile"
                          className="h-10 px-3 rounded-md text-sm font-medium text-foreground hover:bg-accent transition-colors flex items-center gap-2"
                        >
                          Profile
                        </Link>
                      </SheetClose>
                      <div className="h-px bg-border my-2" />
                      <SheetClose asChild>
                        <Link
                          href="/api/auth/logout"
                          className="h-10 px-3 rounded-md text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors flex items-center gap-2"
                        >
                          <LogOut className="h-4 w-4" />
                          Sign out
                        </Link>
                      </SheetClose>
                    </>
                  ) : (
                    <>
                      <div className="h-px bg-border my-2" />
                      <SheetClose asChild>
                        <Link
                          href="/login"
                          className="h-10 px-3 rounded-md text-sm font-medium text-foreground hover:bg-accent transition-colors flex items-center"
                        >
                          Sign in
                        </Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <Link
                          href="/register"
                          className="h-10 px-3 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center justify-center"
                        >
                          Create account
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
