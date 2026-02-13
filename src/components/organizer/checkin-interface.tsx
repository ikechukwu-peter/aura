"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle, XCircle, Scan, ArrowLeft, Loader2, ShieldCheck, Info } from "lucide-react";
import Link from "next/link";
import { StatusBadge } from "@/components/ui/status-badge";

export function CheckinInterface({ event }: { event: any }) {
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleValidate = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!token) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/organizer/validate-ticket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Validation failed");
      }

      setResult(data);
      setToken(""); // Clear for next scan
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-12">
      <Link
        href="/organizer/dashboard"
        className="inline-flex items-center text-sm font-black uppercase tracking-widest text-white/40 hover:text-white transition-all group"
      >
        <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
        Back to Dashboard
      </Link>

      <div className="space-y-4">
        <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm font-medium text-cyan-300 backdrop-blur-md">
          <Scan className="h-4 w-4 mr-2" />
          Secure Validator
        </div>
        <h1 className="text-5xl font-black tracking-tighter uppercase leading-none">
          Ticket <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">CHECK-IN</span>
        </h1>
        <p className="text-xl text-white/40 font-bold uppercase tracking-tight">{event.title}</p>
      </div>

      <Card className="relative overflow-hidden bg-white/5 border-white/10 shadow-2xl group">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-cyan-500 to-indigo-500 opacity-50" />
        
        <CardHeader className="p-8 pb-4">
          <CardTitle className="flex items-center gap-3 text-xl font-black uppercase tracking-tight">
            <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
              <Scan className="h-5 w-5 text-indigo-400" />
            </div>
            Validate Token
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-8 pt-4 space-y-8">
          <form onSubmit={handleValidate} className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="token" className="text-[10px] font-black uppercase tracking-widest text-white/40">Ticket Token (QR Payload)</Label>
              <div className="flex flex-col sm:flex-row gap-3">
                <Input
                  id="token"
                  placeholder="Paste token here..."
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  disabled={loading}
                  className="h-14 bg-white/5 border-white/10 rounded-2xl focus:ring-indigo-500/20"
                />
                <Button 
                  type="submit" 
                  disabled={loading || !token}
                  className="h-14 px-8 rounded-2xl shadow-glow-indigo font-black uppercase tracking-widest text-xs shrink-0"
                >
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Validate"}
                </Button>
              </div>
            </div>
          </form>

          {error && (
            <div className="p-8 rounded-[2rem] bg-red-500/5 border border-red-500/20 text-red-400 animate-in fade-in zoom-in duration-500">
              <div className="flex items-center gap-4 mb-3">
                <div className="h-12 w-12 rounded-2xl bg-red-500/10 flex items-center justify-center border border-red-500/20">
                  <XCircle className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-black text-xl uppercase tracking-tight">Access Denied</h3>
                  <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Invalid or Expired</p>
                </div>
              </div>
              <p className="text-sm font-medium bg-red-500/10 p-4 rounded-xl border border-red-500/10">{error}</p>
            </div>
          )}

          {result && (
            <div className="p-8 rounded-[2rem] bg-green-500/5 border border-green-500/20 text-green-400 animate-in fade-in zoom-in duration-500">
              <div className="flex items-center gap-4 mb-6">
                <div className="h-12 w-12 rounded-2xl bg-green-500/10 flex items-center justify-center border border-green-500/20">
                  <CheckCircle className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-black text-xl uppercase tracking-tight">Valid Ticket</h3>
                  <StatusBadge variant="success">Access Granted</StatusBadge>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                  <p className="text-[9px] font-black uppercase tracking-widest text-white/20 mb-1">Attendee</p>
                  <p className="font-bold text-white">{result.userName}</p>
                </div>
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                  <p className="text-[9px] font-black uppercase tracking-widest text-white/20 mb-1">Ticket Code</p>
                  <p className="font-mono font-bold text-indigo-400">{result.ticketCode}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="bg-white/5 border-t border-white/5 flex items-center justify-center gap-3 py-4">
          <ShieldCheck className="h-3 w-3 text-white/20" />
          <span className="text-[9px] font-black uppercase tracking-widest text-white/20">Secure Validator Engine v2.0 // encrypted</span>
        </CardFooter>
      </Card>

      <div className="p-6 rounded-[2rem] bg-indigo-500/5 border border-indigo-500/10 text-xs text-indigo-300/60 flex gap-4">
        <div className="h-10 w-10 rounded-xl bg-indigo-500/10 flex items-center justify-center shrink-0 border border-indigo-500/20">
          <Info className="h-5 w-5 text-indigo-400" />
        </div>
        <div className="space-y-1">
          <p className="font-black uppercase tracking-widest text-indigo-400">Staff Protocol:</p>
          <p className="font-medium leading-relaxed">
            In production, this interface uses the neural scanner to automatically process QR signatures. 
            For simulation, please provide the cryptographic payload from the user's digital wallet.
          </p>
        </div>
      </div>
    </div>
  );
}
