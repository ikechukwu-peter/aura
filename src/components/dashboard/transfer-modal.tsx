"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Send, CheckCircle, Loader2, Copy } from "lucide-react";

interface TransferModalProps {
  ticketId: string;
  ticketCode: string;
  eventTitle: string;
}

export function TransferModal({ ticketId, ticketCode, eventTitle }: TransferModalProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [transferCode, setTransferCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleTransfer = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/tickets/${ticketId}/transfer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiverEmail: email }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Transfer failed");

      setTransferCode(data.transferCode);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Transfer failed");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (transferCode) {
      navigator.clipboard.writeText(transferCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full h-11 rounded-xl text-[10px] font-black uppercase tracking-widest cursor-pointer">
          <Send className="mr-2 h-3.5 w-3.5" /> Transfer
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-background border-border/60 rounded-lg overflow-hidden">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="text-2xl font-black uppercase tracking-tight">
            Transfer ticket
          </DialogTitle>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mt-2">
            {eventTitle} {ticketCode}
          </p>
        </DialogHeader>

        {!transferCode ? (
          <div className="p-6 space-y-6">
            <div className="space-y-3">
              <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Receiver Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="friend@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-14 bg-foreground/3 border-border/60 rounded-2xl focus:ring-primary/20 font-bold"
              />
              <p className="text-[9px] text-muted-foreground/70 font-medium uppercase tracking-widest">
                The receiver will need this code to claim the ticket.
              </p>
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold uppercase tracking-tight">
                {error}
              </div>
            )}

            <DialogFooter className="pt-4">
              <Button 
                onClick={handleTransfer} 
                disabled={loading || !email} 
                variant="default"
                className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-xs"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Generate Transfer Code"}
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="p-6 space-y-8 text-center animate-in fade-in zoom-in duration-500">
            <div className="h-20 w-20 rounded-2xl bg-verified/10 border border-verified/30 flex items-center justify-center mx-auto">
              <CheckCircle className="h-10 w-10 text-verified" />
            </div>
            
            <div className="space-y-4">
              <h3 className="text-xl font-black uppercase tracking-tight">Transfer initiated</h3>
              <p className="text-sm font-medium text-muted-foreground leading-relaxed">
                Share this unique code with the receiver. It expires in 24 hours.
              </p>
            </div>

            <div className="relative group">
              <div className="h-20 bg-foreground/3 border border-border/60 rounded-2xl flex items-center justify-center font-mono text-3xl font-black tracking-widest text-primary group-hover:border-primary/30 transition-all">
                {transferCode}
              </div>
              <Button 
                size="icon" 
                variant="ghost" 
                className="absolute right-2 top-1/2 -translate-y-1/2 h-12 w-12 rounded-xl"
                onClick={copyToClipboard}
              >
                {copied ? <CheckCircle className="h-5 w-5 text-verified" /> : <Copy className="h-5 w-5" />}
              </Button>
            </div>

            <Button 
              variant="outline" 
              className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-xs border-border/60"
              onClick={() => {
                setTransferCode(null);
                setEmail("");
              }}
            >
              Transfer Another
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
