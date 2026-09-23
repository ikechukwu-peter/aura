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
        className="inline-flex items-center text-sm font-semibold text-muted-foreground hover:text-foreground transition-all group"
      >
        <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
        Back to Dashboard
      </Link>

      <div className="space-y-4">
        <div className="inline-flex items-center rounded-full border border-border bg-card px-4 py-1.5 text-sm font-medium text-primary">
          <Scan className="h-4 w-4 mr-2" />
          Ticket Check-In
        </div>
        <h1 className="text-5xl font-black tracking-tighter leading-none">
          Ticket <span className="text-primary">CHECK-IN</span>
        </h1>
        <p className="text-xl text-muted-foreground font-semibold">{event.title}</p>
      </div>

      <Card className="overflow-hidden bg-card border-border shadow-xl group">
        <CardHeader className="p-8 pb-4">
          <CardTitle className="flex items-center gap-3 text-xl font-bold">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
              <Scan className="h-5 w-5 text-primary" />
            </div>
            Validate Ticket
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-8 pt-4 space-y-8">
          <form onSubmit={handleValidate} className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="token" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Ticket Token (QR Payload)</Label>
              <div className="flex flex-col sm:flex-row gap-3">
                <Input
                  id="token"
                  placeholder="Paste token here..."
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  disabled={loading}
                  className="h-14 bg-background border-border rounded-2xl"
                />
                <Button 
                  type="submit" 
                  disabled={loading || !token}
                  size="lg"
                  variant="default"
                  className="h-14 px-8 rounded-2xl shrink-0"
                >
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Validate"}
                </Button>
              </div>
            </div>
          </form>

          {error && (
            <div className="p-8 rounded-4xl bg-red-500/5 border border-red-500/20 text-red-500 animate-in fade-in zoom-in duration-500">
              <div className="flex items-center gap-4 mb-3">
                <div className="h-12 w-12 rounded-2xl bg-red-500/10 flex items-center justify-center border border-red-500/20">
                  <XCircle className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-xl">Access Denied</h3>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Invalid or Expired</p>
                </div>
              </div>
              <p className="text-sm font-medium bg-red-500/10 p-4 rounded-xl border border-red-500/10">{error}</p>
            </div>
          )}

          {result && (
            <div className="p-8 rounded-4xl bg-green-500/5 border border-green-500/20 text-green-600 animate-in fade-in zoom-in duration-500">
              <div className="flex items-center gap-4 mb-6">
                <div className="h-12 w-12 rounded-2xl bg-green-500/10 flex items-center justify-center border border-green-500/20">
                  <CheckCircle className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-xl">Valid Ticket</h3>
                  <StatusBadge variant="success">Access Granted</StatusBadge>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-card border border-border">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Attendee</p>
                  <p className="font-bold text-foreground">{result.userName}</p>
                </div>
                <div className="p-4 rounded-2xl bg-card border border-border">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Ticket Code</p>
                  <p className="font-mono font-bold text-primary">{result.ticketCode}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="bg-muted/20 border-t border-border flex items-center justify-center gap-3 py-4">
          <ShieldCheck className="h-3 w-3 text-muted-foreground" />
          <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Signature verified by server</span>
        </CardFooter>
      </Card>

      <div className="p-6 rounded-4xl bg-primary/5 border border-primary/10 text-sm text-muted-foreground flex gap-4">
        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
          <Info className="h-5 w-5 text-primary" />
        </div>
        <div className="space-y-1">
          <p className="font-bold uppercase tracking-widest text-primary">Staff Note:</p>
          <p className="font-medium leading-relaxed">
            In production, this interface uses the QR camera scanner to automatically process ticket signatures.
            For testing, paste the signed token from a ticket confirmation email.
          </p>
        </div>
      </div>
    </div>
  );
}
