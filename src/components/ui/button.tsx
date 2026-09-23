import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "xl" | "icon";
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";

    const variants: Record<NonNullable<ButtonProps["variant"]>, string> = {
      default:
        "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 active:bg-primary/95",
      secondary:
        "bg-secondary text-secondary-foreground hover:bg-secondary/70 border border-border/60",
      outline:
        "border border-border bg-transparent hover:bg-accent text-foreground",
      ghost: "hover:bg-accent text-foreground",
      link: "text-primary underline-offset-4 hover:underline p-0 h-auto",
      destructive:
        "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm",
    };

    const sizes: Record<NonNullable<ButtonProps["size"]>, string> = {
      default: "h-10 px-4 rounded-md text-sm",
      sm: "h-8 px-3 rounded-md text-xs",
      lg: "h-12 px-6 rounded-md text-sm",
      xl: "h-14 px-8 rounded-lg text-base",
      icon: "h-10 w-10 rounded-md",
    };

    return (
      <Comp
        className={cn(
          "inline-flex items-center justify-center gap-2 font-medium whitespace-nowrap",
          "transition-colors duration-150",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          "active:scale-[0.98] transition-transform",
          "disabled:pointer-events-none disabled:opacity-50",
          variants[variant],
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
