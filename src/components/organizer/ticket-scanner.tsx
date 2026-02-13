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
  Info,
  Maximize2
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
    } catch (err) {
      setError("Failed to connect to server");
      toast.error("Network error");
    } finally {
      setIsValidating(false);
    }
  }

  function onScanFailure(error: string) {}

  const resetScanner = () => {
    setLastResult(null);
    setError(null);
    setIsScanning(true);
  };

  return (
    <div className="w-full max-w-lg space-y-10">
      {/* Header */}
      <div className="text-center space-y-4 relative">
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-40 h-40 bg-indigo-500/10 blur-[80px] rounded-full pointer-events-none" />
        <div className="inline-flex items-center rounded-full border border-indigo-500/20 bg-indigo-500/5 px-5 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400 backdrop-blur-sm">
          <Zap className="h-3 w-3 mr-2 fill-indigo-500/20" />
          Real-time Verification
        </div>
        <h1 className="text-5xl font-black tracking-tighter text-foreground leading-none">
          Gate <span className="text-indigo-600 relative">
            Access
            <div className="absolute -bottom-2 left-0 w-full h-1 bg-indigo-600/20 rounded-full" />
          </span>
        </h1>
        <p className="text-foreground/40 text-[10px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-2">
          <span className="h-px w-8 bg-border/60" />
          Secure Entry Point
          <span className="h-px w-8 bg-border/60" />
        </p>
      </div>

      {/* Scanner / Result Area */}
      <div className="relative group">
        {/* Animated Glow Border */}
        <div className="absolute -inset-[2px] bg-gradient-to-tr from-indigo-500/20 via-cyan-500/20 to-indigo-500/20 rounded-[3rem] blur-sm group-hover:blur-md transition-all duration-500" />
        
        <div className="relative aspect-square w-full bg-background/40 backdrop-blur-xl rounded-[3rem] border border-white/10 shadow-2xl flex flex-col overflow-hidden">
          
          {!isScanning && !lastResult && !error && (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-8">
              <div className="relative">
                <div className="absolute inset-0 bg-indigo-600/20 blur-2xl rounded-full animate-pulse" />
                <div className="relative h-28 w-28 rounded-[2rem] bg-indigo-600/10 flex items-center justify-center border border-indigo-500/20 transform hover:scale-110 transition-transform duration-500">
                  <Camera className="h-12 w-12 text-indigo-600" />
                </div>
              </div>
              <div className="space-y-3">
                <h3 className="text-2xl font-black tracking-tight italic">Scanner offline</h3>
                <p className="text-[10px] text-foreground/40 font-black uppercase tracking-[0.2em] leading-relaxed max-w-[200px] mx-auto">
                  Ready to process digital tickets
                </p>
              </div>
              <Button 
                onClick={() => setIsScanning(true)}
                className="h-16 w-full max-w-[240px] rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black tracking-[0.2em] text-xs shadow-[0_0_40px_-10px_rgba(79,70,229,0.5)] cursor-pointer group/btn overflow-hidden relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000" />
                <span className="relative flex items-center gap-2 uppercase">
                  <Sparkles className="h-4 w-4" />
                  Initialize scan
                </span>
              </Button>
            </div>
          )}

          {isScanning && (
            <div className="relative w-full h-full">
              <div id="qr-reader" className="w-full h-full !border-none overflow-hidden" />
              {/* Scanning Overlay UI */}
              <div className="absolute inset-0 pointer-events-none border-[40px] border-black/40">
                <div className="absolute inset-0 border-2 border-indigo-500/30 rounded-lg">
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-indigo-500" />
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-indigo-500" />
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-indigo-500" />
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-indigo-500" />
                </div>
                <div className="absolute top-1/2 left-0 w-full h-px bg-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.5)] animate-scan-line" />
              </div>
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/60 backdrop-blur-md rounded-full border border-white/10 flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-[8px] font-black uppercase tracking-widest text-white">System Active</span>
              </div>
            </div>
          )}

          {isValidating && (
            <div className="absolute inset-0 bg-indigo-950/40 backdrop-blur-xl flex flex-col items-center justify-center gap-6 z-50 animate-in fade-in duration-300">
              <div className="relative">
                <div className="absolute inset-0 bg-indigo-600/30 blur-3xl animate-pulse" />
                <Loader2 className="h-16 w-16 text-indigo-400 animate-spin relative" />
              </div>
              <div className="space-y-1 text-center">
                <span className="text-[11px] font-black uppercase tracking-[0.3em] text-indigo-400 block">Decrypting Ledger</span>
                <span className="text-[8px] font-black uppercase tracking-[0.2em] text-indigo-400/40">Securing Transaction...</span>
              </div>
            </div>
          )}

          {/* Success Result */}
          {lastResult && !error && (
            <div className="flex-1 flex flex-col items-center justify-center p-10 text-center space-y-8 animate-in slide-in-from-bottom-4 duration-500">
              <div className="relative">
                <div className="absolute inset-0 bg-green-500/20 blur-[60px] rounded-full" />
                <div className="h-24 w-24 rounded-full bg-green-500/10 flex items-center justify-center border border-green-500/20 relative group-hover:scale-110 transition-transform">
                  <CheckCircle2 className="h-12 w-12 text-green-500" />
                </div>
              </div>
              
              <div className="space-y-6 w-full">
                <div className="space-y-1">
                  <h3 className="text-3xl font-black tracking-tighter text-green-500 italic">Clear for entry</h3>
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/5 border border-green-500/10 rounded-lg">
                    <span className="text-[9px] font-black uppercase tracking-widest text-green-500/60 font-mono">
                      {lastResult.code}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 text-left">
                  <div className="group/item p-5 rounded-[2rem] bg-white/[0.03] border border-white/10 flex items-center gap-4 hover:bg-white/[0.05] transition-colors">
                    <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 group-hover/item:scale-110 transition-transform">
                      <User className="h-5 w-5 text-indigo-500" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] font-black uppercase tracking-widest text-foreground/30">Holder identity</span>
                      <span className="text-sm font-black tracking-tight">{lastResult.userName}</span>
                    </div>
                  </div>
                  <div className="group/item p-5 rounded-[2rem] bg-white/[0.03] border border-white/10 flex items-center gap-4 hover:bg-white/[0.05] transition-colors">
                    <div className="h-12 w-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20 group-hover/item:scale-110 transition-transform">
                      <Calendar className="h-5 w-5 text-cyan-500" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] font-black uppercase tracking-widest text-foreground/30">Target destination</span>
                      <span className="text-sm font-black tracking-tight line-clamp-1">{lastResult.eventTitle}</span>
                    </div>
                  </div>
                </div>
              </div>

              <Button 
                onClick={resetScanner}
                className="h-14 w-full rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black tracking-[0.2em] text-[10px] shadow-glow-indigo mt-4"
              >
                <span className="uppercase">Scan next passenger</span>
              </Button>
            </div>
          )}

          {/* Error Result */}
          {error && (
            <div className="flex-1 flex flex-col items-center justify-center p-10 text-center space-y-8 animate-in slide-in-from-bottom-4 duration-500">
              <div className="relative">
                <div className="absolute inset-0 bg-red-500/20 blur-[60px] rounded-full" />
                <div className="h-24 w-24 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20 relative">
                  <XCircle className="h-12 w-12 text-red-500" />
                </div>
              </div>
              
              <div className="space-y-6 w-full">
                <div className="space-y-2">
                  <h3 className="text-3xl font-black tracking-tighter text-red-500 italic">Access denied</h3>
                  <p className="px-4 py-2 bg-red-500/5 border border-red-500/10 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] text-red-500/80 mx-auto max-w-[240px]">
                    {error}
                  </p>
                </div>

                {lastResult && (
                  <div className="p-6 rounded-[2rem] bg-red-500/5 border border-red-500/10 text-left space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black uppercase tracking-widest text-red-500/40 italic">Audit record</span>
                      <ShieldAlert className="h-4 w-4 text-red-500" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-red-500" />
                        <p className="text-[10px] font-black uppercase text-foreground/60">
                          Checked: {new Date(lastResult.usedAt).toLocaleTimeString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-red-500" />
                        <p className="text-[10px] font-black uppercase text-foreground/60">
                          Holder: {lastResult.userName}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <Button 
                onClick={resetScanner}
                className="h-14 w-full rounded-2xl bg-red-600 hover:bg-red-500 text-white font-black uppercase tracking-[0.2em] text-[10px]"
              >
                Reset system
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Stats/Info Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="group p-6 rounded-[2.5rem] bg-foreground/[0.02] border border-border/40 space-y-3 hover:bg-foreground/[0.04] transition-all">
          <div className="h-10 w-10 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 group-hover:scale-110 transition-transform">
            <RefreshCw className="h-5 w-5 text-indigo-500" />
          </div>
          <div className="space-y-1">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em]">End-to-End</h4>
            <p className="text-[9px] text-foreground/40 font-bold uppercase leading-relaxed tracking-wider">
              Cryptographically verified tickets.
            </p>
          </div>
        </div>
        <div className="group p-6 rounded-[2.5rem] bg-foreground/[0.02] border border-border/40 space-y-3 hover:bg-foreground/[0.04] transition-all">
          <div className="h-10 w-10 rounded-2xl bg-green-500/10 flex items-center justify-center border border-green-500/20 group-hover:scale-110 transition-transform">
            <ShieldCheck className="h-5 w-5 text-green-500" />
          </div>
          <div className="space-y-1">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em]">Immutability</h4>
            <p className="text-[9px] text-foreground/40 font-bold uppercase leading-relaxed tracking-wider">
              Single-use entry validation.
            </p>
          </div>
        </div>
      </div>

      {/* Footer System Info */}
      <div className="flex items-center justify-between px-6 py-4 rounded-2xl bg-foreground/[0.01] border border-border/20">
        <div className="flex items-center gap-3">
          <Info className="h-4 w-4 text-foreground/20" />
          <span className="text-[8px] font-black uppercase tracking-[0.3em] text-foreground/20">
            Node: {role}_GATE_01
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-1 w-1 rounded-full bg-green-500" />
          <span className="text-[8px] font-black uppercase tracking-[0.3em] text-foreground/20 italic">
            Secure Connection
          </span>
        </div>
      </div>
    </div>
  );
}
