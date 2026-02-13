"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Zap, QrCode, MapPin, Calendar, Clock, ShieldCheck, Download, Loader2, Printer, Share2 } from "lucide-react";
import { Button } from "./button";
import QRCode from "qrcode";
import { toPng } from "html-to-image";

interface TicketCardProps extends React.HTMLAttributes<HTMLDivElement> {
  eventTitle: string;
  eventDate: string;
  eventLocation: string;
  ticketType: string;
  ticketCode: string;
  qrPayload?: string;
  showDownload?: boolean;
}

export function TicketCard({
  eventTitle,
  eventDate,
  eventLocation,
  ticketType,
  ticketCode,
  qrPayload,
  showDownload = false,
  className,
  ...props
}: TicketCardProps) {
  const [qrDataUrl, setQrDataUrl] = React.useState<string>("");
  const [isDownloading, setIsDownloading] = React.useState(false);
  const [isPrinting, setIsPrinting] = React.useState(false);
  const ticketRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (qrPayload) {
      QRCode.toDataURL(qrPayload, {
        width: 800,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#ffffff",
        },
      })
        .then(setQrDataUrl)
        .catch(console.error);
    }
  }, [qrPayload]);

  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!ticketRef.current) return;
    
    setIsDownloading(true);
    try {
      // Small delay to ensure any animations or transitions are settled
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const dataUrl = await toPng(ticketRef.current, {
        cacheBust: true,
        backgroundColor: 'transparent',
        pixelRatio: 4, // Higher resolution for better print quality
      });
      
      const link = document.createElement('a');
      link.download = `aura-pass-${ticketCode.substring(0, 8)}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to download ticket:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div
        ref={ticketRef}
        className={cn(
          "relative w-full max-w-md overflow-hidden rounded-[2.5rem] bg-[#020617] border border-white/10 shadow-2xl group transition-all duration-700 hover:shadow-glow-aura/30",
          className
        )}
        {...props}
      >
        {/* Holographic Shimmer Effect */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-10 pointer-events-none transition-opacity duration-1000 bg-gradient-to-tr from-aura-primary/30 via-aura-secondary/30 to-aura-accent/30 animate-pulse" />
        
        {/* Circuit Pattern Overlay */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
             style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M10 10L90 10M90 10L90 90M90 90L10 90M10 90L10 10M50 10L50 90M10 50L90 50' stroke='white' stroke-width='0.5' fill='none'/%3E%3Ccircle cx='10' cy='10' r='2' fill='white'/%3E%3Ccircle cx='90' cy='10' r='2' fill='white'/%3E%3Ccircle cx='90' cy='90' r='2' fill='white'/%3E%3Ccircle cx='10' cy='90' r='2' fill='white'/%3E%3C/svg%3E")`, backgroundSize: '100px 100px' }} />

        {/* Brand Accent Bar */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-aura-primary via-aura-secondary to-aura-accent" />
        
        {/* Ambient Glows */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-72 h-72 bg-aura-primary/20 blur-[100px] rounded-full -z-10 group-hover:bg-aura-primary/30 transition-all duration-1000" />
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-64 h-64 bg-aura-secondary/20 blur-[80px] rounded-full -z-10 group-hover:bg-aura-secondary/30 transition-all duration-1000" />

        <div className="relative p-10 space-y-8">
          {/* Header Section */}
          <div className="flex justify-between items-start gap-4">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-aura-primary/10 border border-aura-primary/20 text-[10px] font-black uppercase tracking-[0.25em] text-aura-primary shadow-sm shadow-aura-primary/10">
                <Zap className="h-3.5 w-3.5 fill-aura-primary animate-pulse" />
                {ticketType}
              </div>
              <h3 className="text-4xl font-black tracking-tighter text-white leading-[0.85] group-hover:text-aura-primary transition-colors duration-500">
                {eventTitle.split(' ').map((word, i) => (
                  <span key={i} className="block">{word}</span>
                ))}
              </h3>
            </div>
            <div className="flex flex-col items-end gap-3 shrink-0">
              <div className="h-16 w-16 rounded-[1.5rem] bg-white/5 border border-white/10 flex items-center justify-center text-white/40 group-hover:scale-110 group-hover:rotate-6 transition-all duration-700 shadow-inner">
                <Zap className="h-8 w-8 text-aura-primary" />
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 shadow-sm shadow-emerald-500/5">
                <ShieldCheck className="h-3 w-3 text-emerald-500" />
                <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500">Authentic</span>
              </div>
            </div>
          </div>

          {/* Neural Divider */}
          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-dashed border-white/10" />
            </div>
            <div className="relative flex justify-center">
              <div className="bg-[#020617] px-4">
                <div className="flex gap-2">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-1.5 w-1.5 rounded-full bg-aura-primary/40 animate-pulse" style={{ animationDelay: `${i * 200}ms` }} />
                  ))}
                </div>
              </div>
            </div>
            {/* Notch cuts */}
            <div className="absolute -left-[3.5rem] top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-background border-r border-white/10" />
            <div className="absolute -right-[3.5rem] top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-background border-l border-white/10" />
          </div>

          {/* Event Metadata */}
          <div className="grid grid-cols-2 gap-10">
            <div className="space-y-3">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 flex items-center gap-2">
                <Calendar className="h-3 w-3 text-aura-primary" />
                Chronicle
              </p>
              <div className="space-y-1">
                <p className="text-sm font-black text-white">{eventDate.split(',')[0]}</p>
                <p className="text-[10px] font-bold text-white/60">{eventDate.split(',')[1]}</p>
              </div>
            </div>
            <div className="space-y-3 text-right">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 flex items-center justify-end gap-2">
                <MapPin className="h-3 w-3 text-aura-secondary" />
                Sector
              </p>
              <div className="space-y-1">
                <p className="text-sm font-black text-white line-clamp-1">{eventLocation}</p>
                <p className="text-[10px] font-bold text-white/60">Verified location</p>
              </div>
            </div>
          </div>

          {/* Secure Access Token Section */}
          <div className="flex items-end justify-between gap-8 pt-4">
            <div className="flex-1 space-y-6">
              <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Neural ID Token</p>
                  <div className="flex items-center gap-3">
                    <p className="text-xl font-mono font-black tracking-[0.2em] text-white bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
                      {ticketCode.substring(0, 4)}<span className="text-aura-primary mx-1">-</span>{ticketCode.substring(4, 8)}
                    </p>
                  </div>
              </div>
              <div className="flex gap-1.5">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-1.5 w-6 rounded-full bg-gradient-to-r from-aura-primary/40 to-aura-secondary/40" />
                  ))}
              </div>
            </div>
            
            <div className="relative p-4 rounded-[2rem] bg-white shadow-glow-aura/20 group-hover:scale-105 transition-transform duration-700">
              <div className="h-28 w-28 flex items-center justify-center bg-white">
                  {qrDataUrl ? (
                    <img src={qrDataUrl} alt="Secure QR Access" className="w-full h-full object-contain" />
                  ) : (
                    <QrCode className="h-16 w-16 text-slate-900 animate-pulse" />
                  )}
              </div>
              {/* Active Scan Indicator */}
              <div className="absolute inset-0 border-2 border-aura-primary/20 rounded-[2rem] animate-pulse pointer-events-none" />
              <div className="absolute top-0 left-0 w-full h-1 bg-aura-primary shadow-[0_0_20px_rgba(139,92,246,1)] animate-scan-line pointer-events-none opacity-60" />
            </div>
          </div>
          
          {/* Footer Branding */}
          <div className="pt-8 border-t border-white/5 flex justify-between items-center opacity-40 group-hover:opacity-100 transition-opacity duration-700">
            <div className="flex flex-col gap-1">
              <p className="text-[9px] font-black uppercase tracking-[0.4em] text-white">
                AURA <span className="text-aura-primary">NEURAL</span> PASS
              </p>
              <p className="text-[7px] font-bold text-white/40 uppercase tracking-[0.2em]">
                Decentralized Ticketing Protocol v4.0
              </p>
            </div>
            <div className="flex gap-1.5">
               {[...Array(3)].map((_, i) => (
                 <div key={i} className="h-1 w-1 rounded-full bg-aura-primary" />
               ))}
            </div>
          </div>
        </div>
      </div>

      {showDownload && (
        <div className="grid grid-cols-2 gap-4 no-print">
          <Button 
            variant="outline" 
            className="h-14 rounded-2xl group/dl bg-slate-950/50 border-white/10 hover:border-aura-primary/50 text-white font-black uppercase tracking-widest text-[10px]"
            onClick={handleDownload}
            disabled={isDownloading}
          >
            {isDownloading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Download className="h-4 w-4 mr-3 group-hover/dl:translate-y-0.5 transition-transform text-aura-primary" />
                Digital Pass
              </>
            )}
          </Button>
          <Button 
            variant="outline" 
            className="h-14 rounded-2xl group/print bg-slate-950/50 border-white/10 hover:border-aura-secondary/50 text-white font-black uppercase tracking-widest text-[10px]"
            onClick={handlePrint}
          >
            <Printer className="h-4 w-4 mr-3 group-hover/print:-translate-y-0.5 transition-transform text-aura-secondary" />
            Print Ticket
          </Button>
        </div>
      )}

      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            background: white !important;
            padding: 0 !important;
          }
          .container {
            width: 100% !important;
            max-width: none !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          /* Print-specific ticket adjustments */
          [ref="ticketRef"] {
            box-shadow: none !important;
            border: 2px solid #e2e8f0 !important;
            margin: 2rem auto !important;
            -webkit-print-color-adjust: exact;
          }
        }
      `}</style>
    </div>
  );
}

