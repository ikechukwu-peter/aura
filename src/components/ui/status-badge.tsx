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
  const variants = {
    default: "bg-foreground/5 text-foreground/40 border-border shadow-none",
    success: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20 shadow-glow-green/20",
    warning: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 shadow-glow-amber/20",
    error: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20 shadow-glow-red/20",
    info: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20 shadow-glow-indigo/20",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border backdrop-blur-md transition-all duration-300",
        variants[variant],
        className
      )}
      {...props}
    >
      <span className={cn(
        "h-1.5 w-1.5 rounded-full mr-2 animate-pulse",
        variant === "success" && "bg-green-500",
        variant === "warning" && "bg-amber-500",
        variant === "error" && "bg-red-500",
        variant === "info" && "bg-indigo-500",
        variant === "default" && "bg-foreground/20"
      )} />
      {children}
    </div>
  );
}
