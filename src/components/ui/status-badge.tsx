import * as React from "react";
import { cn } from "@/lib/utils";

interface StatusBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "success" | "warning" | "error" | "info" | "default";
}

export function StatusBadge({
  variant = "default",
  className,
  children,
  ...props
}: StatusBadgeProps) {
  const variants: Record<NonNullable<StatusBadgeProps["variant"]>, string> = {
    default: "bg-muted text-muted-foreground border-border",
    success: "bg-verified/10 text-verified border-verified/20",
    warning: "bg-primary/10 text-primary border-primary/20",
    error: "bg-destructive/10 text-destructive border-destructive/20",
    info: "bg-accent text-foreground border-border",
  };

  const dots: Record<NonNullable<StatusBadgeProps["variant"]>, string> = {
    default: "bg-muted-foreground/50",
    success: "bg-verified",
    warning: "bg-primary",
    error: "bg-destructive",
    info: "bg-foreground/50",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border",
        variants[variant],
        className
      )}
      {...props}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", dots[variant])} />
      <span>{children}</span>
    </div>
  );
}
