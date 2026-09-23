"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, Loader2, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";

export function ClaimTicketModal() {
  const router = useRouter();
  const [transferCode, setTransferCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClaim = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/tickets/transfer/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transferCode: transferCode.trim() }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Claim failed");

      setSuccess(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Claim failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="default" className="h-16 px-10 rounded-2xl font-black tracking-widest text-xs uppercase">
          <Download className="mr-3 h-5 w-5" /> Claim ticket
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-background border-border/60 rounded-lg overflow-hidden shadow-2xl">
        <DialogHeader className="p-8 pb-2">
          <DialogTitle className="text-3xl font-black tracking-tighter text-foreground">
            Claim transferred ticket
          </DialogTitle>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mt-2">
            Enter your unique transfer code
          </p>
        </DialogHeader>

        {!success ? (
          <div className="p-6 space-y-6">
            <div className="space-y-3">
              <Label htmlFor="code" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Transfer code</Label>
              <Input
                id="code"
                placeholder="TRF-XXXXXXXX"
                value={transferCode}
                onChange={(e) => setTransferCode(e.target.value)}
                className="h-14 bg-foreground/3 border-border/60 rounded-2xl focus:ring-primary/20 font-bold text-center tracking-widest text-xl uppercase"
              />
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold uppercase tracking-tight">
                {error}
              </div>
            )}

            <DialogFooter className="pt-4">
              <Button 
                onClick={handleClaim} 
                disabled={loading || !transferCode} 
                variant="default"
                className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-xs"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <span className="uppercase">Claim ticket</span>}
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="p-8 space-y-8 text-center animate-in fade-in zoom-in duration-500">
            <div className="h-24 w-24 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center mx-auto">
              <Sparkles className="h-12 w-12 text-primary" />
            </div>
            
            <div className="space-y-4">
              <h3 className="text-2xl font-black tracking-tighter">Ticket claimed!</h3>
              <p className="text-sm font-bold text-muted-foreground leading-relaxed tracking-tight">
                The ticket has been successfully added to your wallet.
              </p>
            </div>

            <Button 
              variant="default"
              className="w-full h-14 rounded-2xl font-black tracking-widest text-xs uppercase"
              onClick={() => {
                setSuccess(false);
                setTransferCode("");
              }}
            >
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
