import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600/40 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--kbc-ink)] text-white shadow-sm hover:bg-[var(--kbc-teal)] hover:shadow-md",
        accent:
          "bg-[var(--kbc-teal)] text-white shadow-sm hover:bg-[var(--kbc-teal-deep)]",
        outline:
          "border border-[var(--kbc-line)] bg-white text-[var(--kbc-ink)] hover:border-[var(--kbc-teal)] hover:text-[var(--kbc-teal-deep)]",
        ghost: "text-[var(--kbc-ink)] hover:bg-[var(--kbc-paper)]",
        secondary:
          "border border-white/30 bg-white/15 text-white backdrop-blur hover:bg-white/25",
        link: "text-[var(--kbc-teal)] underline-offset-4 hover:text-[var(--kbc-teal-deep)] hover:underline",
      },
      size: {
        default: "h-11 px-6",
        sm: "h-9 px-4 text-xs",
        lg: "h-12 px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
