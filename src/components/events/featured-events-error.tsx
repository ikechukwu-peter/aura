"use client";

import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCcw } from "lucide-react";

export function FeaturedEventsError({ error, reset }: { error?: Error, reset?: () => void }) {
  return (
    <div className="w-full py-20 px-6 rounded-[2.5rem] bg-aura-primary/5 border border-aura-primary/10 flex flex-col items-center justify-center text-center space-y-6">
      <div className="h-20 w-20 rounded-3xl bg-aura-primary/10 flex items-center justify-center text-aura-primary border border-aura-primary/20">
        <AlertCircle className="h-10 w-10" />
      </div>
      <div className="space-y-2">
        <h3 className="text-2xl font-bold tracking-tight text-foreground">Failed to load events</h3>
        <p className="text-foreground/60 max-w-md mx-auto">
          We encountered an error while fetching the latest experiences. This might be due to a connection issue.
        </p>
      </div>
      <Button 
        onClick={() => reset ? reset() : window.location.reload()}
        variant="outline" 
        className="rounded-xl px-8 border-aura-primary/20 text-aura-primary hover:bg-aura-primary/5 gap-2"
      >
        <RefreshCcw className="h-4 w-4" />
        Try again
      </Button>
    </div>
  );
}
