"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  UserPlus,
  Mail,
  Lock,
  User,
  Loader2,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Eye,
  EyeOff,
  Check,
} from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "USER" as "USER" | "ORGANIZER",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleRoleChange = (role: "USER" | "ORGANIZER") => {
    setFormData((prev) => ({ ...prev, role }));
  };

  const passwordLength = formData.password.length >= 8;
  const hasNumber = /[0-9]/.test(formData.password);
  const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(formData.password);
  const passwordValid = passwordLength && hasNumber && hasSymbol;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!passwordValid) {
      setError(
        "Password must be at least 8 characters and include at least one number and one symbol.",
      );
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Registration failed");
      }

      router.push("/login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] w-full">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-16 items-start">
          {/* Brand / Editorial column */}
          <div className="lg:col-span-2 order-2 lg:order-1 space-y-10 lg:sticky lg:top-24">
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                New to Aura
              </div>
              <h1 className="serif text-4xl sm:text-5xl font-semibold leading-[1.05] text-foreground">
                Create your
                <br />
                <span className="text-primary">Aura account.</span>
              </h1>
              <p className="text-base text-muted-foreground leading-relaxed max-w-md">
                Join as an attendee to find and book events, or as an organizer
                to list, sell, and scan tickets for your own.
              </p>
            </div>

            {/* What you get */}
            <div className="rounded-xl border border-border bg-card p-5 space-y-4">
              <p className="text-xs font-medium text-foreground/80 uppercase tracking-wider">
                Included on every account
              </p>
              <ul className="space-y-3">
                {[
                  "Signed ticket QR codes that resist photoshop fakes.",
                  "10-minute holds on seats you&apos;re actively buying.",
                  "Transfer tickets to friends with a single code.",
                  "Auditable, zero double-sales booking engine.",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 text-sm text-foreground/90"
                  >
                    <span className="mt-0.5 h-4.5 w-4.5 shrink-0 inline-flex items-center justify-center rounded-full bg-verified/10 text-verified">
                      <Check className="h-3 w-3" />
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <p className="text-xs text-muted-foreground">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-primary font-medium underline-offset-4 hover:underline"
              >
                Sign in here
              </Link>
              .
            </p>
          </div>

          {/* Form column */}
          <div className="lg:col-span-3 order-1 lg:order-2">
            <div className="mx-auto w-full max-w-lg">
              <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
                <div className="p-7 sm:p-9 space-y-7">
                  <div className="space-y-1.5">
                    <h2 className="serif text-2xl font-semibold text-foreground">
                      Create account
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Takes under a minute. No credit card required to browse.
                    </p>
                  </div>

                  {/* Role selector */}
                  <div className="grid grid-cols-2 gap-3 p-1.5 rounded-lg border border-border bg-background">
                    {[
                      {
                        value: "USER" as const,
                        label: "Attendee",
                        description: "Browse & buy tickets",
                      },
                      {
                        value: "ORGANIZER" as const,
                        label: "Organizer",
                        description: "Host & scan events",
                      },
                    ].map((opt) => {
                      const active = formData.role === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => handleRoleChange(opt.value)}
                          className={`text-left rounded-md p-3.5 transition-all border ${
                            active
                              ? "bg-primary/5 border-primary/40 ring-1 ring-primary/20"
                              : "bg-transparent border-transparent hover:bg-accent"
                          }`}
                        >
                          <p
                            className={`text-sm font-semibold ${
                              active ? "text-foreground" : "text-foreground"
                            }`}
                          >
                            {opt.label}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {opt.description}
                          </p>
                        </button>
                      );
                    })}
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <Label
                          htmlFor="name"
                          className="text-sm font-medium"
                        >
                          Full name
                        </Label>
                        <div className="relative">
                          <User className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="name"
                            name="name"
                            autoComplete="name"
                            placeholder="John Doe"
                            required
                            value={formData.name}
                            onChange={handleChange}
                            className="h-11 pl-10 text-sm"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="email"
                          className="text-sm font-medium"
                        >
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
                    </div>

                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label
                          htmlFor="password"
                          className="text-sm font-medium"
                        >
                          Password
                        </Label>
                        <div className="relative">
                          <Lock className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            autoComplete="new-password"
                            placeholder="At least 8 characters with a number and symbol"
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

                      {/* Password requirements */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {[
                          { ok: passwordLength, label: "8+ characters" },
                          { ok: hasNumber, label: "1 number" },
                          { ok: hasSymbol, label: "1 symbol" },
                        ].map((rule) => (
                          <div
                            key={rule.label}
                            className={`flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-xs ${
                              rule.ok
                                ? "border-verified/30 bg-verified/5 text-verified"
                                : "border-border bg-background text-muted-foreground"
                            }`}
                          >
                            <Check
                              className={`h-3 w-3 shrink-0 ${
                                rule.ok ? "" : "opacity-30"
                              }`}
                            />
                            {rule.label}
                          </div>
                        ))}
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
                          Creating account…
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-2">
                          Create account
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
                      <Link href="/login">
                        <UserPlus className="h-4 w-4" />
                        Sign in instead
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>

              <p className="mt-5 text-center text-xs text-muted-foreground inline-flex items-center justify-center gap-2 w-full">
                <ShieldCheck className="h-3.5 w-3.5 text-verified" />
                Credentials stored with bcrypt · never plaintext
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
