import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        solid: "bg-brand text-white hover:bg-brand-deep shadow-soft",
        /* action principale de la charte : pastille or, texte encre */
        gold: "bg-gold-bright text-ink hover:bg-gold gold-glow font-semibold",
        outline:
          "border border-brand/35 text-brand hover:border-brand hover:bg-brand hover:text-white",
        ghostline:
          "border border-white/55 text-white backdrop-blur-sm hover:bg-white hover:text-brand-deep",
        soft: "bg-secondary text-ink hover:bg-brand-tint",
        link: "text-brand underline-offset-4 hover:underline px-0",
      },
      size: {
        sm: "h-9 px-4 text-[0.8rem]",
        md: "h-11 px-6",
        lg: "h-14 px-8 text-base",
      },
    },
    defaultVariants: { variant: "solid", size: "md" },
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
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
