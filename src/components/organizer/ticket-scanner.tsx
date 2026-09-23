"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { 
  ShieldCheck, 
  ShieldAlert, 
  Loader2, 
  CheckCircle2, 
  XCircle, 
  Camera, 
  RefreshCw,
  User,
  Calendar,
  Sparkles,
  Zap,
  Info
} from "lucide-react";
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats } from "html5-qrcode";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface TicketScannerProps {
  role: "ORGANIZER" | "ADMIN";
}

export function TicketScanner({ role }: TicketScannerProps) {
  const searchParams = useSearchParams();
  const eventIdFromUrl = searchParams.get("eventId");
  
  const [isScanning, setIsScanning] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [lastResult, setLastResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    if (isScanning && !scannerRef.current) {
      const scanner = new Html5QrcodeScanner(
        "qr-reader",
        { 
          fps: 10, 
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
          formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE]
        },
        /* verbose= */ false
      );

      scanner.render(onScanSuccess, onScanFailure);
      scannerRef.current = scanner;
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
        scannerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isScanning]);

  async function onScanSuccess(decodedText: string) {
    if (isValidating) return;
    
    if (window.navigator.vibrate) window.navigator.vibrate(100);

    setIsValidating(true);
    setError(null);
    
    try {
      const response = await fetch("/api/organizer/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          qrToken: decodedText,
          expectedEventId: eventIdFromUrl 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setLastResult(data.ticket);
        toast.success("Check-in Successful!");
        setIsScanning(false);
      } else {
        setError(data.error);
        setLastResult(data.details || null);
        toast.error(data.error);
        setIsScanning(false);
      }
    } catch {
      setError("Failed to connect to server");
      toast.error("Network error");
    } finally {
      setIsValidating(false);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function onScanFailure(_: string) {}

  const resetScanner = () => {
    setLastResult(null);
    setError(null);
    setIsScanning(true);
  };

  return (
    <div className="w-full max-w-lg space-y-10">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-5 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-primary backdrop-blur-sm">
          <Zap className="h-3 w-3 mr-2" />
          Real-time Verification
        </div>
        <h1 className="text-5xl font-black tracking-tighter text-foreground leading-none">
          Ticket <span className="text-primary">Scanner</span>
        </h1>
        <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-[0.3em] flex items-center justify-center gap-2">
          <span className="h-px w-8 bg-border/60" />
          Check-in Station
          <span className="h-px w-8 bg-border/60" />
        </p>
      </div>

      {/* Scanner / Result Area */}
      <div className="relative group">
        <div className="relative aspect-square w-full bg-card rounded-6xl border border-border shadow-2xl flex flex-col overflow-hidden">
          
          {!isScanning && !lastResult && !error && (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-8">
              <div className="relative">
                <div className="relative h-28 w-28 rounded-4xl bg-primary/10 flex items-center justify-center border border-primary/20 transform hover:scale-110 transition-transform duration-500">
                  <Camera className="h-12 w-12 text-primary" />
                </div>
              </div>
              <div className="space-y-3">
                <h3 className="text-2xl font-bold tracking-tight">Scanner idle</h3>
                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em] leading-relaxed max-w-50 mx-auto">
                  Ready to process digital tickets
                </p>
              </div>
              <Button 
                onClick={() => setIsScanning(true)}
                size="lg"
                variant="default"
                className="h-16 w-full max-w-60 rounded-2xl"
              >
                <span className="flex items-center gap-2 uppercase text-xs tracking-[0.2em] font-bold">
                  <Sparkles className="h-4 w-4" />
                  Start scan
                </span>
              </Button>
            </div>
          )}

          {isScanning && (
            <div className="relative w-full h-full">
              <div id="qr-reader" className="w-full h-full border-none! overflow-hidden" />
              {/* Scanning Overlay UI */}
              <div className="absolute inset-0 pointer-events-none border-40 border-black/40">
                <div className="absolute inset-0 border-2 border-primary/30 rounded-lg">
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary" />
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary" />
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary" />
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary" />
                </div>
                <div className="absolute top-1/2 left-0 w-full h-px bg-primary/50 animate-scan-line" />
              </div>
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/60 backdrop-blur-md rounded-full border border-white/10 flex items-center gap-2">
                <span className="text-[8px] font-bold uppercase tracking-widest text-white">Scanning…</span>
              </div>
            </div>
          )}

          {isValidating && (
            <div className="absolute inset-0 bg-background/80 backdrop-blur-xl flex flex-col items-center justify-center gap-6 z-50 animate-in fade-in duration-300">
              <div className="relative">
                <Loader2 className="h-16 w-16 text-primary animate-spin relative" />
              </div>
              <div className="space-y-1 text-center">
                <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-primary block">Verifying Ticket</span>
                <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Checking in…</span>
              </div>
            </div>
          )}

          {/* Success Result */}
          {lastResult && !error && (
            <div className="flex-1 flex flex-col items-center justify-center p-10 text-center space-y-8 animate-in slide-in-from-bottom-4 duration-500">
              <div className="relative">
                <div className="h-24 w-24 rounded-full bg-green-500/10 flex items-center justify-center border border-green-500/20 relative group-hover:scale-110 transition-transform">
                  <CheckCircle2 className="h-12 w-12 text-green-500" />
                </div>
              </div>
              
              <div className="space-y-6 w-full">
                <div className="space-y-1">
                  <h3 className="text-3xl font-bold tracking-tighter text-green-500">Checked in</h3>
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/5 border border-green-500/10 rounded-lg">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-green-500/70 font-mono">
                      {lastResult.code}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 text-left">
                  <div className="group/item p-5 rounded-4xl bg-card border border-border flex items-center gap-4 hover:bg-muted/30 transition-colors">
                    <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 group-hover/item:scale-110 transition-transform">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/70">Attendee</span>
                      <span className="text-sm font-bold tracking-tight">{lastResult.userName}</span>
                    </div>
                  </div>
                  <div className="group/item p-5 rounded-4xl bg-card border border-border flex items-center gap-4 hover:bg-muted/30 transition-colors">
                    <div className="h-12 w-12 rounded-2xl bg-[#0F766E]/10 flex items-center justify-center border border-[#0F766E]/20 group-hover/item:scale-110 transition-transform">
                      <Calendar className="h-5 w-5 text-[#0F766E]" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/70">Event</span>
                      <span className="text-sm font-bold tracking-tight line-clamp-1">{lastResult.eventTitle}</span>
                    </div>
                  </div>
                </div>
              </div>

              <Button 
                onClick={resetScanner}
                size="lg"
                variant="default"
                className="h-14 w-full rounded-2xl mt-4"
              >
                <span className="uppercase text-[10px] tracking-[0.2em] font-bold">Scan next attendee</span>
              </Button>
            </div>
          )}

          {/* Error Result */}
          {error && (
            <div className="flex-1 flex flex-col items-center justify-center p-10 text-center space-y-8 animate-in slide-in-from-bottom-4 duration-500">
              <div className="relative">
                <div className="h-24 w-24 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20 relative">
                  <XCircle className="h-12 w-12 text-red-500" />
                </div>
              </div>
              
              <div className="space-y-6 w-full">
                <div className="space-y-2">
                  <h3 className="text-3xl font-bold tracking-tighter text-red-500">Access denied</h3>
                  <p className="px-4 py-2 bg-red-500/5 border border-red-500/10 rounded-xl text-[10px] font-bold uppercase tracking-[0.15em] text-red-500/80 mx-auto max-w-60">
                    {error}
                  </p>
                </div>

                {lastResult && (
                  <div className="p-6 rounded-4xl bg-red-500/5 border border-red-500/10 text-left space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-red-500/50">Previous check-in</span>
                      <ShieldAlert className="h-4 w-4 text-red-500" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-red-500" />
                        <p className="text-[10px] font-bold uppercase text-muted-foreground">
                          Checked: {new Date(lastResult.usedAt).toLocaleTimeString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-red-500" />
                        <p className="text-[10px] font-bold uppercase text-muted-foreground">
                          Attendee: {lastResult.userName}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <Button 
                onClick={resetScanner}
                size="lg"
                variant="destructive"
                className="h-14 w-full rounded-2xl"
              >
                <span className="uppercase text-[10px] tracking-[0.2em] font-bold">Try again</span>
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Stats/Info Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="group p-6 rounded-[2.5rem] bg-card border border-border space-y-3 hover:bg-muted/20 transition-all">
          <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:scale-110 transition-transform">
            <RefreshCw className="h-5 w-5 text-primary" />
          </div>
          <div className="space-y-1">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em]">Signed tickets</h4>
            <p className="text-[9px] text-muted-foreground font-semibold uppercase leading-relaxed tracking-wider">
              Server-signed JWT tickets.
            </p>
          </div>
        </div>
        <div className="group p-6 rounded-[2.5rem] bg-card border border-border space-y-3 hover:bg-muted/20 transition-all">
          <div className="h-10 w-10 rounded-2xl bg-green-500/10 flex items-center justify-center border border-green-500/20 group-hover:scale-110 transition-transform">
            <ShieldCheck className="h-5 w-5 text-green-500" />
          </div>
          <div className="space-y-1">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em]">One entry only</h4>
            <p className="text-[9px] text-muted-foreground font-semibold uppercase leading-relaxed tracking-wider">
              Single-use entry validation.
            </p>
          </div>
        </div>
      </div>

      {/* Footer System Info */}
      <div className="flex items-center justify-between px-6 py-4 rounded-2xl bg-card border border-border">
        <div className="flex items-center gap-3">
          <Info className="h-4 w-4 text-muted-foreground" />
          <span className="text-[8px] font-bold uppercase tracking-[0.3em] text-muted-foreground">
            Scanner role: {role}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-1 w-1 rounded-full bg-green-500" />
          <span className="text-[8px] font-bold uppercase tracking-[0.3em] text-muted-foreground">
            Connected
          </span>
        </div>
      </div>
    </div>
  );
}
