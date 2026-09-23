"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  QrCode,
  MapPin,
  Calendar,
  CheckCircle2,
  Download,
  Loader2,
  Printer,
  Ticket,
} from "lucide-react";
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
  const ticketRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (qrPayload) {
      QRCode.toDataURL(qrPayload, {
        width: 800,
        margin: 2,
        color: { dark: "#1C1917", light: "#FFFFFF" },
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
      await new Promise((resolve) => setTimeout(resolve, 150));
      const dataUrl = await toPng(ticketRef.current, {
        cacheBust: true,
        backgroundColor: "#FFFFFF",
        pixelRatio: 4,
      });
      const link = document.createElement("a");
      link.download = `ticket-${ticketCode.substring(0, 8)}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Failed to download ticket:", err);
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrint = () => window.print();

  const [datePart, timePart] = eventDate.includes(",")
    ? [
        eventDate.split(",")[0].trim(),
        eventDate.split(",").slice(1).join(",").trim(),
      ]
    : [eventDate, ""];

  return (
    <div className="space-y-4">
      <div
        ref={ticketRef}
        className={cn(
          "ticket-card relative w-full max-w-md bg-card border border-border rounded-lg shadow-sm overflow-hidden card-hover",
          className
        )}
        {...props}
      >
        {/* Amber stub stripe */}
        <div className="absolute top-0 left-0 w-1.5 h-full bg-primary" />

        <div className="relative pl-5 pr-4 py-5 space-y-5">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2 min-w-0">
              <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-primary/10 text-primary text-[11px] font-medium">
                <Ticket className="h-3 w-3" />
                {ticketType}
              </span>
              <h3 className="serif text-2xl font-semibold leading-tight text-card-foreground wrap-break-word">
                {eventTitle}
              </h3>
            </div>
            <span className="shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded bg-verified/10 text-verified text-[11px] font-medium">
              <CheckCircle2 className="h-3 w-3" />
              Verified
            </span>
          </div>

          {/* Perforation with notches */}
          <div className="ticket-perforation py-3 -mx-4" />

          {/* Event details */}
          <div className="grid grid-cols-2 gap-5">
            <div className="space-y-1 min-w-0">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium flex items-center gap-1.5">
                <Calendar className="h-3 w-3" />
                Date
              </p>
              <p className="text-sm font-medium text-card-foreground truncate">
                {datePart}
              </p>
              {timePart && (
                <p className="text-xs text-muted-foreground truncate">{timePart}</p>
              )}
            </div>
            <div className="space-y-1 min-w-0 text-right">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium flex items-center gap-1.5 justify-end">
                <MapPin className="h-3 w-3" />
                Venue
              </p>
              <p className="text-sm font-medium text-card-foreground truncate">
                {eventLocation}
              </p>
            </div>
          </div>

          {/* QR + ticket code */}
          <div className="flex items-end justify-between gap-5 pt-1">
            <div className="space-y-2 min-w-0">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                Ticket No.
              </p>
              <p className="mono text-sm font-medium tracking-wider text-card-foreground bg-accent px-2.5 py-1.5 rounded border border-border inline-block">
                {ticketCode.substring(0, 4)}-{ticketCode.substring(4, 8)}
              </p>
            </div>
            <div className="shrink-0 bg-white p-2.5 rounded border border-border">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt="Ticket QR code"
                  className="h-24 w-24 object-contain"
                />
              ) : (
                <QrCode className="h-24 w-24 text-muted-foreground/40" />
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-border/60 flex items-center justify-between">
            <span className="serif text-sm font-medium text-card-foreground">
              Aura
            </span>
            <span className="text-[10px] text-muted-foreground mono">
              {ticketCode.substring(0, 6).toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      {showDownload && (
        <div className="grid grid-cols-2 gap-3 no-print">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            disabled={isDownloading}
            className="w-full text-xs"
          >
            {isDownloading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <>
                <Download className="h-3.5 w-3.5" />
                Download
              </>
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="w-full text-xs"
          >
            <Printer className="h-3.5 w-3.5" />
            Print
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
            padding: 2rem !important;
          }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>
    </div>
  );
}
