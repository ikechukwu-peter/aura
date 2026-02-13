import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | "glass" | "aura";
  size?: "default" | "sm" | "lg" | "xl" | "icon";
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    const variants = {
      default: "bg-foreground text-background shadow-lg shadow-foreground/5 hover:scale-[1.02] active:scale-[0.98] cursor-pointer",
      glass: "glass glass-hover text-foreground active:scale-[0.98] border-border/40 hover:bg-foreground/5 cursor-pointer",
      aura: "bg-aura-primary text-white shadow-glow-aura hover:bg-aura-primary/90 hover:scale-[1.02] active:scale-[0.98] cursor-pointer border-none",
      destructive: "bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 hover:bg-red-500/20 hover:shadow-glow-red active:scale-[0.98] cursor-pointer",
      outline: "border border-border bg-transparent hover:bg-foreground/[0.03] text-foreground active:scale-[0.98] cursor-pointer",
      secondary: "bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500/20 hover:shadow-glow-cyan active:scale-[0.98] cursor-pointer",
      ghost: "hover:bg-foreground/[0.03] text-foreground active:scale-[0.98] cursor-pointer",
      link: "text-indigo-600 dark:text-indigo-400 underline-offset-4 hover:underline font-bold text-sm cursor-pointer",
    };

    const sizes = {
      default: "h-11 px-6 rounded-xl",
      sm: "h-9 px-4 text-xs rounded-lg",
      lg: "h-14 px-10 text-sm rounded-2xl",
      xl: "h-20 px-12 text-lg rounded-[1.5rem]",
      icon: "h-11 w-11 rounded-xl",
    };

    return (
      <Comp
        className={cn(
          "inline-flex items-center justify-center font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aura-primary disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
          variants[variant as keyof typeof variants],
          sizes[size],
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
