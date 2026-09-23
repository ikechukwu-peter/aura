"use client";

import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCcw } from "lucide-react";

export function FeaturedEventsError({ error, reset }: { error?: Error, reset?: () => void }) {
  return (
    <div className="w-full py-16 px-6 rounded-lg bg-primary/5 border border-primary/10 flex flex-col items-center justify-center text-center space-y-6">
      <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
        <AlertCircle className="h-8 w-8" />
      </div>
      <div className="space-y-2">
        <h3 className="text-2xl font-bold tracking-tight text-foreground">Failed to load events</h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          We encountered an error while fetching the latest events. This might be due to a connection issue.
        </p>
      </div>
      <Button 
        onClick={() => reset ? reset() : window.location.reload()}
        variant="outline" 
        className="px-8 border-primary/30 text-primary hover:bg-primary/5 gap-2"
      >
        <RefreshCcw className="h-4 w-4" />
        Try again
      </Button>
    </div>
  );
}
