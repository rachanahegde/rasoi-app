import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-lg font-serif-custom font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-stone-800 text-[#FDFCF8] hover:bg-stone-700 shadow-md active:translate-y-0.5",
        primary: "bg-stone-800 text-[#FDFCF8] hover:bg-stone-700 shadow-md active:translate-y-0.5",
        secondary: "bg-[#FDFCF8] text-stone-800 border border-stone-200 hover:bg-white hover:border-stone-300 shadow-sm",
        ghost: "hover:bg-stone-100 text-stone-600",
        danger: "bg-red-50 text-red-700 hover:bg-red-100 border border-red-100",
        outline: "border-2 border-stone-200 bg-transparent hover:bg-stone-50 text-stone-800 dashed-border",
        accent: "bg-orange-200 text-stone-900 hover:bg-orange-300 border border-orange-300 shadow-sm",
        link: "text-stone-900 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-6 py-2",
        sm: "h-9 rounded-md px-3 text-xs",
        lg: "h-14 px-8 text-lg",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props} />
  );
}

export { Button, buttonVariants }
