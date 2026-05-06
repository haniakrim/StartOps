import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-expo-lg text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default: "bg-expo-blue text-white hover:bg-expo-blue/90 shadow-expo-sm hover:shadow-expo-md",
        destructive:
          "bg-expo-pink text-white hover:bg-expo-pink/90 shadow-expo-sm",
        outline:
          "border border-expo-gray-200 dark:border-expo-dark-border bg-background hover:bg-expo-gray-50 dark:hover:bg-expo-dark-surface hover:text-foreground",
        secondary:
          "bg-expo-gray-100 dark:bg-expo-dark-surface text-expo-gray-900 dark:text-expo-white hover:bg-expo-gray-200 dark:hover:bg-expo-dark-elevated",
        ghost: "hover:bg-expo-gray-50 dark:hover:bg-expo-dark-surface hover:text-foreground",
        link: "text-expo-blue underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-expo-md px-3 text-xs",
        lg: "h-12 rounded-expo-xl px-6 text-body",
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
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
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
