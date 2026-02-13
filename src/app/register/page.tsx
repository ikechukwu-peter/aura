"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, Mail, Lock, User, Loader2, ArrowRight, ShieldCheck, Sparkles, Eye, EyeOff } from "lucide-react";

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

  const validatePassword = (password: string) => {
    if (password.length < 8) return false;
    const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/ .test(password);
    const hasNumber = /[0-9]/.test(password);
    return hasSymbol && hasNumber;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePassword(formData.password)) {
      setError("Password must be at least 8 characters and include a mix of numbers and symbols.");
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
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container min-h-[calc(100vh-120px)] flex items-center justify-center py-12">
      <div className="w-full max-w-xl space-y-8 relative">
        {/* Decorative background glow */}
        <div className="absolute -top-24 -right-24 h-64 w-64 bg-aura-primary/10 rounded-full blur-3xl -z-10 animate-pulse" />
        <div className="absolute -bottom-24 -left-24 h-64 w-64 bg-aura-secondary/10 rounded-full blur-3xl -z-10 animate-pulse delay-1000" />

        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center h-20 w-20 rounded-3xl bg-aura-primary shadow-glow-aura mb-4 group hover:scale-110 transition-transform duration-500">
            <UserPlus className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-black tracking-tighter">
            Join the <span className="bg-gradient-to-r from-aura-primary to-aura-secondary bg-clip-text text-transparent uppercase">Future</span>
          </h1>
          <p className="text-foreground/40 font-bold tracking-widest text-xs uppercase">
            Create your digital identity and start experiencing
          </p>
        </div>

        <Card className="bg-foreground/[0.03] border-border shadow-2xl backdrop-blur-2xl rounded-[2.5rem] overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-aura-primary via-aura-secondary to-aura-primary opacity-50" />
          
          <CardHeader className="p-10 pb-4">
            <CardTitle className="text-xl font-black tracking-tight flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-aura-primary" />
              Registration
            </CardTitle>
          </CardHeader>
          
          <CardContent className="p-10 pt-4 space-y-8">
            <div className="grid grid-cols-2 gap-4 p-1.5 bg-foreground/[0.03] rounded-2xl border border-border">
              <button
                type="button"
                onClick={() => handleRoleChange("USER")}
                className={`h-12 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
                  formData.role === "USER" 
                    ? "bg-aura-primary text-white shadow-glow-aura" 
                    : "text-foreground/40 hover:text-foreground hover:bg-foreground/5"
                }`}
              >
                Attendee
              </button>
              <button
                type="button"
                onClick={() => handleRoleChange("ORGANIZER")}
                className={`h-12 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
                  formData.role === "ORGANIZER" 
                    ? "bg-aura-secondary text-white shadow-glow-aura-secondary" 
                    : "text-foreground/40 hover:text-foreground hover:bg-foreground/5"
                }`}
              >
                Organizer
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-widest text-foreground/40 ml-1">Full name</Label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/20 group-focus-within:text-aura-primary transition-colors" />
                    <Input
                      id="name"
                      name="name"
                      placeholder="John Doe"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="h-14 pl-12 bg-foreground/[0.03] border-border rounded-2xl focus:ring-aura-primary/20 text-foreground font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-foreground/40 ml-1">Email address</Label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/20 group-focus-within:text-aura-primary transition-colors" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="name@example.com"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="h-14 pl-12 bg-foreground/[0.03] border-border rounded-2xl focus:ring-aura-primary/20 text-foreground font-medium"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="password" className="text-[10px] font-black uppercase tracking-widest text-foreground/40 ml-1">Password</Label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/20 group-focus-within:text-aura-primary transition-colors" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="h-14 pl-12 pr-12 bg-foreground/[0.03] border-border rounded-2xl focus:ring-aura-primary/20 text-foreground font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-foreground/20 hover:text-aura-primary transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="text-[9px] text-foreground/20 font-medium px-1 uppercase tracking-widest">Minimum 8 characters with mix of symbols</p>
              </div>

              {error && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-bold flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                  <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                  {error}
                </div>
              )}

              <Button 
                type="submit" 
                disabled={loading}
                className={`w-full h-14 rounded-2xl font-black uppercase tracking-widest text-xs group transition-all duration-500 ${
                  formData.role === "USER" ? "bg-aura-primary hover:bg-aura-primary/90 shadow-glow-aura" : "bg-aura-secondary hover:bg-aura-secondary/90 shadow-glow-aura-secondary"
                }`}
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <span className="flex items-center gap-2">
                    Create account <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="p-10 pt-0 flex flex-col space-y-6">
            <div className="flex items-center gap-4 w-full">
              <div className="h-px flex-1 bg-foreground/5" />
              <span className="text-[10px] font-black text-foreground/20 uppercase tracking-widest">or</span>
              <div className="h-px flex-1 bg-foreground/5" />
            </div>

            <Button variant="glass" className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-[10px] cursor-pointer" asChild>
              <Link href="/login">
                Sign in to existing account
              </Link>
            </Button>

            <div className="flex items-center justify-center gap-2 pt-2">
              <ShieldCheck className="h-3 w-3 text-aura-primary" />
              <p className="text-[9px] text-foreground/20 font-black uppercase tracking-widest">
                Distributed ledger protected // secure
              </p>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
