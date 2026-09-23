"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, MapPin, ShieldCheck, Ticket, ArrowRight, Loader2, AlertCircle, Plus, Minus } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { formatDate } from "@/lib/utils";

export default function CheckoutPage() {
  const { id } = useParams();
  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load event details");
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
      } catch {
        throw new Error("Server returned an invalid response. Please try again.");
      }

      if (!res.ok) {
        throw new Error(data.error || "Checkout failed");
      }

      // Success! Redirect to dashboard/wallet
      router.push("/dashboard?success=true");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed");
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="text-sm font-medium text-muted-foreground">
          Loading checkout...
        </p>
      </div>
    );
  }

  if (error && !event) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <div className="h-20 w-20 rounded-2xl bg-red-500/10 flex items-center justify-center border border-red-500/20 text-red-500">
          <AlertCircle className="h-10 w-10" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Something went wrong</h2>
          <p className="text-muted-foreground font-medium">{error}</p>
        </div>
        <Button asChild variant="outline" className="h-10 px-6 rounded-lg cursor-pointer">
          <Link href="/events">Back to events</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="py-12 max-w-4xl mx-auto space-y-8">
      <div className="space-y-3">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight leading-tight text-foreground">
          Confirm your reservation
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Card className="bg-background border-border rounded-lg overflow-hidden">
            <div className="aspect-video relative bg-muted">
              {event?.images?.[0] ? (
                <Image 
                  src={event.images[0].thumbPath || event.images[0].originalPath} 
                  alt={event.title}
                  fill
                  unoptimized
                  className="object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/20">
                  <Calendar className="h-20 w-20" />
                </div>
              )}
              <div className="absolute bottom-4 left-4">
                 <span className="px-3 py-1 rounded-full bg-background/90 border border-border text-xs font-medium text-foreground">
                    {event?.category}
                 </span>
              </div>
            </div>
            <CardHeader className="p-5 pb-3">
              <CardTitle className="text-xl font-bold tracking-tight text-foreground leading-tight">
                {event?.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 pt-3 space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20 text-primary shrink-0">
                  <Calendar className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Date & Time</p>
                  <p className="text-sm font-semibold text-foreground">{event && formatDate(event.startTime)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center border border-border text-muted-foreground shrink-0">
                  <MapPin className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Location</p>
                  <p className="text-sm font-semibold text-foreground">{event?.location}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-background border-border rounded-lg overflow-hidden">
            <CardHeader className="p-5 pb-3">
              <CardTitle className="text-lg font-bold tracking-tight flex items-center gap-2 text-foreground">
                <Ticket className="h-4 w-4 text-primary" />
                Order summary
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 pt-3 space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-border">
                  <span className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Item</span>
                  <span className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Price</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="space-y-1">
                    <p className="font-semibold text-foreground">General Admission</p>
                    <div className="flex items-center gap-3 mt-2">
                      <button 
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        disabled={quantity <= 1}
                        className="h-8 w-8 rounded-md border border-border flex items-center justify-center hover:bg-muted disabled:opacity-30 transition-colors cursor-pointer"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="text-sm font-semibold w-4 text-center">{quantity}</span>
                      <button 
                        onClick={() => setQuantity(Math.min(event?.ticketsPerUserLimit || 10, quantity + 1))}
                        disabled={quantity >= (event?.ticketsPerUserLimit || 10)}
                        className="h-8 w-8 rounded-md border border-border flex items-center justify-center hover:bg-muted disabled:opacity-30 transition-colors cursor-pointer"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                  <span className="text-xl font-bold tracking-tight text-primary">{Number(event?.price ?? 0) === 0 ? "FREE" : `$${Number(event?.price ?? 0).toFixed(2)}`}</span>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-muted/50 border border-border space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground flex items-center gap-2 font-medium">
                    <ShieldCheck className="h-4 w-4 text-verified" />
                    Secure transaction
                  </span>
                  <span className="text-verified font-semibold">Verified</span>
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-2 text-red-500">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <p className="text-xs font-medium leading-tight">{error}</p>
                </div>
              )}

              <Button 
                onClick={handleCheckout} 
                disabled={processing}
                variant="default"
                className="w-full h-11 rounded-lg text-sm font-semibold group/btn cursor-pointer"
              >
                {processing ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    Confirm ticket
                    <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1 ml-1" />
                  </>
                )}
              </Button>

              <p className="text-center text-xs text-muted-foreground">
                By clicking confirm, you agree to our terms of service and event policy.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
