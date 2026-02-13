"use client";

import { useState, useEffect, useRef } from "react";
import { Ticket, Maximize2, Sparkles, ShieldCheck, Download, Loader2, Zap } from "lucide-react";
import QRCode from "qrcode";
import { toPng } from "html-to-image";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface QRManagerProps {
  ticketCode: string;
  qrPayload: string;
  eventTitle: string;
}

export function QRManager({ ticketCode, qrPayload, eventTitle }: QRManagerProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [isDownloading, setIsDownloading] = useState(false);
  const ticketRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (!ticketRef.current) return;
    
    setIsDownloading(true);
    try {
      // Small delay to ensure styles are applied
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const dataUrl = await toPng(ticketRef.current, {
        cacheBust: true,
        backgroundColor: '#ffffff',
        pixelRatio: 3, // Increase resolution for better scanning
        style: {
          borderRadius: '0',
        }
      });
      
      const link = document.createElement('a');
      link.download = `ticket-${ticketCode}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to download ticket:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  useEffect(() => {
    if (qrPayload) {
      QRCode.toDataURL(qrPayload, {
        width: 600,
        margin: 4, // Standard quiet zone for better scanning
        color: {
          dark: "#000000",
          light: "#ffffff",
        },
      })
        .then(setQrDataUrl)
        .catch(console.error);
    }
  }, [qrPayload]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="p-4 rounded-2xl bg-foreground/[0.03] border border-border/60 flex flex-col items-center justify-center gap-2 group-hover:bg-aura-primary/5 group-hover:border-aura-primary/20 transition-all cursor-pointer">
          <div className="relative p-3 rounded-xl bg-white flex items-center justify-center shadow-lg group-hover:shadow-aura-primary/10 transition-all">
            {qrDataUrl ? (
              <img src={qrDataUrl} alt="QR Code" className="w-10 h-10" />
            ) : (
              <div className="grid grid-cols-4 gap-1 w-10 h-10">
                {[...Array(16)].map((_, i) => (
                  <div key={i} className={`rounded-sm ${(i * 13) % 2 === 0 ? 'bg-black/20' : 'bg-transparent'}`} />
                ))}
              </div>
            )}
            <div className="absolute inset-0 bg-aura-primary/0 group-hover:bg-aura-primary/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
              <Maximize2 className="h-4 w-4 text-aura-primary" />
            </div>
          </div>
          <span className="text-[9px] font-black uppercase tracking-widest text-foreground/40 group-hover:text-aura-primary transition-colors flex items-center gap-2">
            Expand QR
          </span>
        </div>
      </DialogTrigger>
      <DialogContent className="max-w-[320px] sm:max-w-[340px] bg-background/80 backdrop-blur-3xl border-border/60 rounded-[2rem] p-0 overflow-hidden shadow-2xl">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-aura-primary via-aura-secondary to-aura-primary" />
        
          <div className="p-4 space-y-4">
            {/* Downloadable Area (Hidden from view, used for high-quality export) */}
            <div className="absolute -left-[9999px] top-0">
              <div 
                ref={ticketRef} 
                className="bg-white p-10 space-y-8 w-[500px] flex flex-col items-center relative overflow-hidden"
              >
                {/* Brand Sidebar */}
                <div className="absolute top-0 left-0 h-full w-4 bg-gradient-to-b from-aura-primary via-aura-secondary to-aura-primary" />
                
                <div className="w-full flex justify-between items-start pl-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-aura-primary fill-aura-primary" />
                      <p className="text-[12px] font-black uppercase tracking-[0.3em] text-aura-primary">AURA PASS</p>
                    </div>
                    <h3 className="text-4xl font-black uppercase tracking-tighter text-slate-950 leading-none">{eventTitle}</h3>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <ShieldCheck className="h-8 w-8 text-aura-primary" />
                    <p className="text-[10px] font-black text-slate-400">VERIFIED</p>
                  </div>
                </div>

                {/* Ticket Stub Divider */}
                <div className="w-full h-px border-t-2 border-dashed border-slate-200 relative my-4">
                  <div className="absolute -left-14 -top-3.5 h-7 w-7 rounded-full bg-white border border-slate-200" />
                  <div className="absolute -right-14 -top-3.5 h-7 w-7 rounded-full bg-white border border-slate-200" />
                </div>

                <div className="bg-slate-50 p-6 rounded-[2.5rem] border-2 border-slate-100 shadow-inner flex flex-col items-center gap-6">
                  {qrDataUrl && (
                    <img 
                      src={qrDataUrl} 
                      alt="Ticket QR Code" 
                      className="w-[320px] h-[320px] object-contain mix-blend-multiply"
                    />
                  )}
                  <div className="space-y-1 text-center">
                    <p className="text-[14px] font-mono font-black tracking-[0.2em] text-slate-950">
                      {ticketCode}
                    </p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      Entry Authorization Token
                    </p>
                  </div>
                </div>

                <div className="w-full flex justify-between items-center pl-6 pt-4 border-t border-slate-100">
                  <div className="flex gap-4">
                    <div className="h-10 w-1 bg-aura-primary/20 rounded-full" />
                    <div className="space-y-1">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Security</p>
                      <p className="text-[10px] font-black uppercase text-slate-900">Encrypted QR</p>
                    </div>
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">
                    &copy; {new Date().getFullYear()} AURA NEURAL SYSTEMS
                  </p>
                </div>
              </div>
            </div>

            {/* Display Area */}
            <div className="bg-white p-5 rounded-[1.5rem] space-y-4">
              <DialogHeader className="space-y-2">
              <div className="inline-flex items-center rounded-full border border-aura-primary/20 bg-aura-primary/5 px-2 py-0.5 text-[8px] font-black uppercase tracking-widest text-aura-primary">
                <Sparkles className="h-2 w-2 mr-1" />
                Event Pass
              </div>
              <DialogTitle className="text-xl font-black tracking-tighter uppercase text-slate-950 leading-tight">
                {eventTitle}
              </DialogTitle>
              <div className="flex justify-between items-center">
                <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 font-mono">
                  ID: {ticketCode}
                </p>
                <Ticket className="h-3 w-3 text-slate-300" />
              </div>
            </DialogHeader>

            <div className="relative flex flex-col items-center justify-center p-4 rounded-xl bg-slate-50 border border-slate-100 shadow-inner">
              {qrDataUrl && (
                  <img 
                    src={qrDataUrl} 
                    alt="Ticket QR Code" 
                    className="w-full aspect-square max-w-[160px] object-contain"
                  />
                )}
            </div>

            <div className="p-3 rounded-lg bg-slate-900 space-y-2">
              <div className="flex items-center justify-between text-[8px] font-black uppercase tracking-widest">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <ShieldCheck className="h-3 w-3 text-green-500" />
                  Verified
                </span>
                <span className="text-green-500">Active</span>
              </div>
              <p className="text-[7px] text-slate-500 font-black uppercase tracking-[0.05em] text-center leading-tight opacity-80">
                Non-transferable • Secured • Present for entry
              </p>
            </div>
          </div>

          <div className="space-y-2.5">
            <Button 
              onClick={handleDownload}
              disabled={isDownloading}
              className="w-full h-10 rounded-xl bg-aura-primary hover:bg-aura-primary/90 text-white font-black uppercase tracking-widest text-[8px] shadow-glow-aura transition-all cursor-pointer group"
            >
              {isDownloading ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <>
                  <Download className="h-3.5 w-3.5 mr-1.5 group-hover:translate-y-0.5 transition-transform" />
                  Save Pass
                </>
              )}
            </Button>
            
            <p className="text-center text-[7px] text-foreground/30 font-black uppercase tracking-widest">
              Compact high-res pass
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
