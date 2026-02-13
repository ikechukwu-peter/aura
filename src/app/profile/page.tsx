"use client";

import { useState, useEffect } from "react";
import { 
  User, 
  Mail, 
  ShieldCheck, 
  Sparkles, 
  Save, 
  Loader2, 
  Clock,
  Shield,
  Zap,
  ArrowLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function UserProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    try {
      const res = await fetch("/api/user/profile");
      const data = await res.json();
      if (res.ok) {
        setUser(data);
        setFormData({
          name: data.name || "",
        });
      }
    } catch (err) {
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        toast.success("Profile updated successfully");
        fetchProfile();
      } else {
        const data = await res.json();
        toast.error(data.error || "Update failed");
      }
    } catch (err) {
      toast.error("Network error");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-aura-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="container py-16 max-w-4xl space-y-12">
      {/* Header */}
      <div className="space-y-4">
        <Link
          href="/dashboard"
          className="inline-flex items-center text-xs font-black uppercase tracking-widest text-foreground/40 hover:text-foreground transition-all group"
        >
          <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back to Vault
        </Link>
        <div className="flex items-center gap-4">
          <div className="inline-flex items-center rounded-full border border-aura-primary/20 bg-aura-primary/5 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-aura-primary backdrop-blur-md">
            <User className="h-4 w-4 mr-2" />
            Personal Identification
          </div>
        </div>
        <h1 className="text-6xl font-black tracking-tighter uppercase leading-none text-foreground">
          My <span className="bg-gradient-to-r from-aura-primary via-aura-secondary to-aura-accent bg-clip-text text-transparent animate-gradient-x">IDENTITY</span>
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Identity Card */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="p-8 rounded-[2.5rem] bg-foreground/[0.03] border border-border/60 space-y-8 relative overflow-hidden shadow-card">
            <div className="absolute top-0 right-0 p-6 opacity-5">
              <Shield className="h-24 w-24 text-aura-primary" />
            </div>
            
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="h-24 w-24 rounded-[2rem] bg-gradient-to-br from-aura-primary to-aura-secondary flex items-center justify-center text-white text-3xl font-black shadow-glow-aura border-2 border-white/20">
                {user.name?.[0] || user.email[0].toUpperCase()}
              </div>
              <div className="space-y-1">
                <h3 className="text-2xl font-black tracking-tight uppercase text-foreground">
                  {user.name || "Anonymous User"}
                </h3>
                <div className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-foreground/40">
                  <ShieldCheck className="h-3 w-3 text-aura-secondary" />
                  Verified Resident
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-border/40 space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-foreground/[0.03] border border-border/60 flex items-center justify-center">
                  <Mail className="h-4 w-4 text-foreground/40" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-[10px] font-black uppercase tracking-widest text-foreground/20">Email Address</p>
                  <p className="text-xs font-bold text-foreground/60">{user.email}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-foreground/[0.03] border border-border/60 flex items-center justify-center">
                  <Clock className="h-4 w-4 text-foreground/40" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-[10px] font-black uppercase tracking-widest text-foreground/20">Citizen Since</p>
                  <p className="text-xs font-bold text-foreground/60">
                    {new Date(user.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-foreground/[0.03] border border-border/60 flex items-center justify-center">
                  <Zap className="h-4 w-4 text-foreground/40" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-[10px] font-black uppercase tracking-widest text-foreground/20">Security Clearance</p>
                  <p className="text-xs font-black uppercase text-aura-primary">{user.role}</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Edit Form */}
        <div className="lg:col-span-2">
          <Card className="rounded-[2.5rem] bg-background border border-border/60 shadow-card overflow-hidden h-full">
            <CardHeader className="p-10 pb-6 border-b border-border/40 bg-foreground/[0.01]">
              <CardTitle className="text-xl font-black uppercase tracking-tight flex items-center gap-3">
                <Sparkles className="h-5 w-5 text-aura-primary" />
                Modify Identity
              </CardTitle>
            </CardHeader>
            <CardContent className="p-10 space-y-8">
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-3">
                  <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40 ml-1">Display Name</Label>
                  <div className="relative group">
                    <User className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/20 group-focus-within:text-aura-primary transition-colors" />
                    <Input
                      id="name"
                      placeholder="Enter your name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="h-16 pl-14 bg-foreground/[0.02] border-border/60 rounded-2xl focus:ring-aura-primary/20 font-bold text-lg"
                    />
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-aura-primary/5 border border-aura-primary/10 space-y-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-aura-primary" />
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-aura-primary">Privacy Note</h4>
                  </div>
                  <p className="text-xs font-medium text-foreground/40 leading-relaxed">
                    Your name will be displayed on your digital assets and manifest records. 
                    Your email address remains encrypted and private.
                  </p>
                </div>

                <div className="pt-4">
                  <Button 
                    type="submit" 
                    disabled={saving}
                    className="w-full h-16 rounded-2xl shadow-glow-aura font-black uppercase tracking-widest text-xs"
                  >
                    {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                      <div className="flex items-center gap-2">
                        <Save className="h-5 w-5" />
                        Save Changes
                      </div>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
