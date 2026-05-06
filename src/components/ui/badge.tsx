import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-expo-blue text-white hover:bg-expo-blue/90",
        secondary:
          "border-transparent bg-expo-gray-100 dark:bg-expo-dark-surface text-expo-gray-900 dark:text-expo-white hover:bg-expo-gray-200 dark:hover:bg-expo-dark-elevated",
        destructive:
          "border-transparent bg-expo-pink text-white hover:bg-expo-pink/90",
        outline: "text-foreground border-expo-gray-200 dark:border-expo-dark-border",
        success:
          "border-transparent bg-expo-green/15 text-expo-green hover:bg-expo-green/20",
        warning:
          "border-transparent bg-expo-orange/15 text-expo-orange hover:bg-expo-orange/20",
        info:
          "border-transparent bg-expo-blue/15 text-expo-blue hover:bg-expo-blue/20",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
