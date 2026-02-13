"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, MapPin, ShieldCheck, Ticket, ArrowRight, Loader2, Sparkles, AlertCircle, Plus, Minus } from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

export default function CheckoutPage() {
  const { id } = useParams();
  const router = useRouter();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    async function fetchEvent() {
      try {
        const res = await fetch(`/api/events/${id}`);
        if (!res.ok) {
          throw new Error("Event not found");
        }
        const data = await res.json();
        setEvent(data);
      } catch (err: any) {
        setError(err.message || "Failed to load event details");
      } finally {
        setLoading(false);
      }
    }

    if (id) fetchEvent();
  }, [id]);

  const handleCheckout = async () => {
    setProcessing(true);
    setError(null);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, quantity }),
      });

      let data;
      try {
        data = await res.json();
      } catch (e) {
        throw new Error("Server returned an invalid response. Please try again.");
      }

      if (!res.ok) {
        throw new Error(data.error || "Checkout failed");
      }

      // Success! Redirect to dashboard/wallet
      router.push("/dashboard?success=true");
    } catch (err: any) {
      setError(err.message);
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="h-12 w-12 text-aura-primary animate-spin" />
        <p className="text-sm font-black uppercase tracking-widest text-foreground/40 animate-pulse">
          Initializing secure checkout...
        </p>
      </div>
    );
  }

  if (error && !event) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8">
        <div className="h-24 w-24 rounded-[2rem] bg-red-500/10 flex items-center justify-center border border-red-500/20 text-red-500">
          <AlertCircle className="h-12 w-12" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-black tracking-tighter uppercase text-foreground">Something went wrong</h2>
          <p className="text-foreground/40 font-medium">{error}</p>
        </div>
        <Button asChild variant="glass" className="h-14 px-8 rounded-2xl cursor-pointer">
          <Link href="/events">Back to Events</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="py-16 max-w-4xl mx-auto space-y-12">
      <div className="space-y-4">
        <div className="inline-flex items-center rounded-full border border-aura-primary/20 bg-aura-primary/5 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-aura-primary backdrop-blur-md">
          <span className="flex h-2 w-2 rounded-full bg-aura-primary mr-3 animate-pulse shadow-glow-aura" />
          Secure Checkout
        </div>
        <h1 className="text-5xl md:text-6xl font-black tracking-tighter uppercase leading-none text-foreground">
          Confirm Your <br />
          <span className="bg-gradient-to-r from-aura-primary to-aura-secondary bg-clip-text text-transparent">RESERVATION</span>
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="space-y-8">
          <Card className="bg-background border-border/60 shadow-card rounded-[2.5rem] overflow-hidden group">
            <div className="aspect-video relative bg-foreground/[0.03]">
              {event?.images?.[0] ? (
                <img 
                  src={event.images[0].thumbPath || event.images[0].originalPath} 
                  alt={event.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-foreground/5">
                  <Calendar className="h-24 w-24" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6">
                 <span className="px-3 py-1 rounded-full bg-background/60 backdrop-blur-xl border border-border/60 text-[8px] font-black uppercase tracking-widest text-foreground">
                    {event?.category}
                 </span>
              </div>
            </div>
            <CardHeader className="p-8 pb-4">
              <CardTitle className="text-3xl font-black tracking-tighter uppercase text-foreground leading-none">
                {event?.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 pt-4 space-y-6">
              <div className="flex items-center gap-4 text-foreground/60">
                <div className="h-10 w-10 rounded-xl bg-aura-primary/10 flex items-center justify-center border border-aura-primary/20 text-aura-primary shrink-0">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-foreground/40">Date & Time</p>
                  <p className="text-sm font-bold text-foreground">{event && formatDate(event.startTime)}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-foreground/60">
                <div className="h-10 w-10 rounded-xl bg-aura-secondary/10 flex items-center justify-center border border-aura-secondary/20 text-aura-secondary shrink-0">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-foreground/40">Location</p>
                  <p className="text-sm font-bold text-foreground">{event?.location}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          <Card className="bg-background/60 backdrop-blur-2xl border-border/60 shadow-card rounded-[2.5rem] overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-aura-primary to-aura-secondary" />
            <CardHeader className="p-10 pb-4">
              <CardTitle className="text-xl font-black uppercase tracking-tight flex items-center gap-3 text-foreground">
                <Ticket className="h-5 w-5 text-aura-primary" />
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="p-10 pt-4 space-y-8">
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-4 border-b border-border/40">
                  <span className="text-foreground/40 text-xs font-black uppercase tracking-widest">Item</span>
                  <span className="text-foreground/40 text-xs font-black uppercase tracking-widest">Price</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="space-y-1">
                    <p className="font-black text-foreground uppercase tracking-tight">General Admission</p>
                    <div className="flex items-center gap-4 mt-2">
                      <button 
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        disabled={quantity <= 1}
                        className="h-8 w-8 rounded-lg border border-border/60 flex items-center justify-center hover:bg-foreground/[0.03] disabled:opacity-30 transition-all cursor-pointer"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="text-sm font-black w-4 text-center">{quantity}</span>
                      <button 
                        onClick={() => setQuantity(Math.min(event?.ticketsPerUserLimit || 10, quantity + 1))}
                        disabled={quantity >= (event?.ticketsPerUserLimit || 10)}
                        className="h-8 w-8 rounded-lg border border-border/60 flex items-center justify-center hover:bg-foreground/[0.03] disabled:opacity-30 transition-all cursor-pointer"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                  <span className="text-2xl font-black tracking-tighter text-aura-primary">{(event as any)?.price === 0 ? "FREE" : `$${(event as any)?.price.toFixed(2)}`}</span>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-foreground/[0.03] border border-border/60 space-y-3">
                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                  <span className="text-foreground/40 flex items-center gap-2">
                    <ShieldCheck className="h-3 w-3 text-green-500" />
                    Secure Transaction
                  </span>
                  <span className="text-green-500">Verified</span>
                </div>
              </div>

              {error && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3 text-red-500">
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  <p className="text-xs font-bold leading-tight">{error}</p>
                </div>
              )}

              <Button 
                onClick={handleCheckout} 
                disabled={processing}
                className="w-full h-20 rounded-[1.5rem] text-sm font-black uppercase tracking-[0.2em] bg-aura-primary hover:bg-aura-primary/90 text-white shadow-glow-aura transition-all hover:scale-[1.02] active:scale-95 group/btn cursor-pointer"
              >
                {processing ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  <>
                    Confirm Ticket
                    <ArrowRight className="h-6 w-6 transition-transform group-hover/btn:translate-x-2" />
                  </>
                )}
              </Button>

              <p className="text-center text-[9px] text-foreground/30 font-black uppercase tracking-widest">
                By clicking confirm, you agree to our terms of service and event policy.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
