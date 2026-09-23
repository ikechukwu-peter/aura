"use client";

import { useState, useEffect } from "react";
import { 
  User, 
  Mail, 
  ShieldCheck, 
  Sparkles, 
  Save, 
  Loader2, 
  FileText,
  BadgeCheck,
  Building2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function OrganizerProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [profile, setProfile] = useState<any>(null);
  const [formData, setFormData] = useState({
    displayName: "",
    bio: "",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    try {
      const res = await fetch("/api/organizer/profile");
      const data = await res.json();
      if (res.ok) {
        setProfile(data);
        setFormData({
          displayName: data.displayName || "",
          bio: data.bio || "",
        });
      }
    } catch {
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/organizer/profile", {
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
    } catch {
      toast.error("Network error");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="container py-16 max-w-4xl space-y-12">
      {/* Header */}
      <div className="space-y-4">
        <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-primary backdrop-blur-md">
          <Sparkles className="h-4 w-4 mr-2" />
          Profile Settings
        </div>
        <h1 className="text-6xl font-black tracking-tighter uppercase leading-none text-foreground">
          Organizer <span className="text-primary">PROFILE</span>
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="p-8 rounded-[2.5rem] bg-foreground/3 border border-border/60 space-y-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-5">
              <Building2 className="h-24 w-24" />
            </div>
            
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="h-24 w-24 rounded-4xl bg-primary/10 flex items-center justify-center border border-primary/20">
                <User className="h-12 w-12 text-primary" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-black uppercase tracking-tight">{profile?.displayName}</h3>
                <div className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  <Mail className="h-3 w-3" />
                  {profile?.user?.email}
                </div>
              </div>
              {profile?.verified && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-[8px] font-black uppercase tracking-widest text-green-600">
                  <BadgeCheck className="h-3 w-3" />
                  Verified Organizer
                </div>
              )}
            </div>

            <div className="pt-8 border-t border-border/40 space-y-4">
              <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                <span>Account Status</span>
                <span className="text-primary">Active</span>
              </div>
              <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                <span>Joined</span>
                <span>{new Date(profile?.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          <div className="p-8 rounded-4xl bg-primary text-primary-foreground space-y-4">
            <ShieldCheck className="h-8 w-8" />
            <h4 className="font-black uppercase tracking-tight">Account Security</h4>
            <p className="text-[10px] font-medium leading-relaxed opacity-80 uppercase tracking-widest">
              Your profile data is securely stored. Public information is only shared with verified event attendees.
            </p>
          </div>
        </div>

        {/* Edit Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="p-10 rounded-6xl bg-background border border-border/60 shadow-card space-y-10">
            <div className="space-y-8">
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <User className="h-3 w-3" />
                  Display Name
                </label>
                <input 
                  type="text"
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  className="w-full h-14 bg-foreground/3 border border-border/60 rounded-2xl px-6 text-sm font-black uppercase tracking-widest focus:outline-none focus:border-primary/50 transition-all"
                  placeholder="Enter organization name"
                  required
                />
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <FileText className="h-3 w-3" />
                  Professional Bio
                </label>
                <textarea 
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full min-h-40 bg-foreground/3 border border-border/60 rounded-3xl p-6 text-sm font-medium focus:outline-none focus:border-primary/50 transition-all resize-none"
                  placeholder="Tell the world about your events..."
                />
              </div>
            </div>

            <Button 
              type="submit"
              variant="default"
              disabled={saving}
              className="w-full h-16 rounded-2xl font-black uppercase tracking-widest text-xs transition-all cursor-pointer group"
            >
              {saving ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <Save className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                  Update Profile
                </>
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
