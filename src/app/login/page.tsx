"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Ticket,
  Mail,
  Lock,
  Loader2,
  ArrowRight,
  ShieldCheck,
  Eye,
  EyeOff,
  Calendar,
  MapPin,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      if (redirect === "/") {
        const userRole = data.user.role;
        const target =
          userRole === "ADMIN"
            ? "/admin/dashboard"
            : userRole === "ORGANIZER"
              ? "/organizer/dashboard"
              : "/dashboard";
        router.push(target);
      } else {
        router.push(redirect);
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] w-full">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-16 items-center">
          {/* Brand / Editorial column */}
          <div className="lg:col-span-2 order-2 lg:order-1 space-y-10">
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground">
                <Ticket className="h-3.5 w-3.5 text-primary" />
                Aura Ticketing
              </div>
              <h1 className="serif text-4xl sm:text-5xl font-semibold leading-[1.05] text-foreground">
                Welcome back.
                <br />
                <span className="text-primary">Let&apos;s get you in.</span>
              </h1>
              <p className="text-base text-muted-foreground leading-relaxed max-w-md">
                Sign in to browse events, access your tickets, or manage your
                event listings. Everything is secured end-to-end.
              </p>
            </div>

            {/* Trust panel — editorial card, not form chrome */}
            <div className="rounded-xl border border-border bg-card p-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-md bg-verified/10 text-verified flex items-center justify-center">
                  <ShieldCheck className="h-4.5 w-4.5" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-sm font-semibold text-foreground">
                    Your tickets, and data, stay yours.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Signed session cookies · bcrypt credentials · no third-party
                    analytics.
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-border space-y-3">
                <p className="text-xs font-medium text-foreground/80 uppercase tracking-wider">
                  Coming up
                </p>
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2.5 text-foreground min-w-0">
                      <Calendar className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <span className="truncate">Lagos Jazz Weekend</span>
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0 ml-3">
                      Fri · 7:00 PM
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2.5 text-foreground min-w-0">
                      <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <span className="truncate">Amber Hall, Victoria Island</span>
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0 ml-3">
                      Sold out
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              Don&apos;t have an account yet?{" "}
              <Link
                href="/register"
                className="text-primary font-medium underline-offset-4 hover:underline"
              >
                Create one here
              </Link>
              .
            </p>
          </div>

          {/* Form column */}
          <div className="lg:col-span-3 order-1 lg:order-2">
            <div className="mx-auto w-full max-w-md">
              <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
                <div className="p-7 sm:p-9 space-y-7">
                  <div className="space-y-1.5">
                    <h2 className="serif text-2xl font-semibold text-foreground">
                      Sign in
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Use the email and password you registered with.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium">
                        Email
                      </Label>
                      <div className="relative">
                        <Mail className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          autoComplete="email"
                          placeholder="you@example.com"
                          required
                          value={formData.email}
                          onChange={handleChange}
                          className="h-11 pl-10 text-sm"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label
                          htmlFor="password"
                          className="text-sm font-medium"
                        >
                          Password
                        </Label>
                        <button
                          type="button"
                          className="text-xs text-primary font-medium hover:underline underline-offset-4"
                          tabIndex={-1}
                        >
                          Forgot password?
                        </button>
                      </div>
                      <div className="relative">
                        <Lock className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          autoComplete="current-password"
                          placeholder="Enter your password"
                          required
                          value={formData.password}
                          onChange={handleChange}
                          className="h-11 pl-10 pr-10 text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((s) => !s)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 h-7 w-7 inline-flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                          aria-label={
                            showPassword ? "Hide password" : "Show password"
                          }
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {error && (
                      <div
                        role="alert"
                        className="rounded-md border border-destructive/30 bg-destructive/5 px-3.5 py-2.5 text-sm text-destructive"
                      >
                        {error}
                      </div>
                    )}

                    <Button
                      type="submit"
                      disabled={loading}
                      size="lg"
                      className="w-full h-11 text-sm"
                    >
                      {loading ? (
                        <span className="inline-flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Signing in…
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-2">
                          Sign in
                          <ArrowRight className="h-4 w-4" />
                        </span>
                      )}
                    </Button>
                  </form>

                  <div className="pt-2 border-t border-border">
                    <Button
                      variant="outline"
                      size="lg"
                      className="w-full h-11 text-sm"
                      asChild
                    >
                      <Link href="/register">Create account</Link>
                    </Button>
                  </div>
                </div>
              </div>

              <p className="mt-5 text-center text-xs text-muted-foreground inline-flex items-center justify-center gap-2 w-full">
                <ShieldCheck className="h-3.5 w-3.5 text-verified" />
                Secured with signed sessions · verified on every request
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
