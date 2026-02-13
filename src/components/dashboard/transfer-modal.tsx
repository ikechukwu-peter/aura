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
    } catch (err: any) {
      setError(err.message);
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
        <Button variant="glass" size="sm" className="w-full h-11 rounded-xl text-[10px] font-black uppercase tracking-widest cursor-pointer">
          <Send className="mr-2 h-3.5 w-3.5" /> Transfer
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-background border-border/60 rounded-[2rem] overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-cyan-500 to-indigo-500" />
        
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="text-2xl font-black uppercase tracking-tight">
            Transfer <span className="text-indigo-600 dark:text-indigo-400">TICKET</span>
          </DialogTitle>
          <p className="text-xs font-medium text-foreground/40 uppercase tracking-widest mt-2">
            {eventTitle} // {ticketCode}
          </p>
        </DialogHeader>

        {!transferCode ? (
          <div className="p-6 space-y-6">
            <div className="space-y-3">
              <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-foreground/40">Receiver Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="friend@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-14 bg-foreground/[0.03] border-border/60 rounded-2xl focus:ring-indigo-500/20 font-bold"
              />
              <p className="text-[9px] text-foreground/30 font-medium uppercase tracking-widest">
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
                className="w-full h-14 rounded-2xl shadow-glow-indigo font-black uppercase tracking-widest text-xs"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Generate Transfer Code"}
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="p-6 space-y-8 text-center animate-in fade-in zoom-in duration-500">
            <div className="h-20 w-20 rounded-[2rem] bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto">
              <CheckCircle className="h-10 w-10 text-green-500" />
            </div>
            
            <div className="space-y-4">
              <h3 className="text-xl font-black uppercase tracking-tight">Transfer Initiated</h3>
              <p className="text-sm font-medium text-foreground/40 leading-relaxed">
                Share this unique code with the receiver. It expires in 24 hours.
              </p>
            </div>

            <div className="relative group">
              <div className="h-20 bg-foreground/[0.03] border border-border/60 rounded-2xl flex items-center justify-center font-mono text-3xl font-black tracking-widest text-indigo-600 dark:text-indigo-400 group-hover:border-indigo-500/30 transition-all">
                {transferCode}
              </div>
              <Button 
                size="icon" 
                variant="ghost" 
                className="absolute right-2 top-1/2 -translate-y-1/2 h-12 w-12 rounded-xl"
                onClick={copyToClipboard}
              >
                {copied ? <CheckCircle className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5" />}
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
