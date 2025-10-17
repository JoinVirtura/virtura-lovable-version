import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-display font-bold ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-violet-500 via-purple-500 to-blue-500 text-white shadow-[0_0_30px_rgba(212,110,255,0.5)] hover:shadow-[0_0_50px_rgba(212,110,255,0.7)] hover:scale-105 transition-all duration-300 rounded-xl border border-violet-400/30",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl",
        outline:
          "border-2 border-violet-500/50 bg-transparent text-violet-300 hover:bg-violet-500/10 hover:border-violet-400 hover:shadow-[0_0_20px_rgba(212,110,255,0.4)] transition-all duration-300 rounded-xl",
        secondary:
          "bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white hover:shadow-[0_0_30px_rgba(236,72,153,0.5)] rounded-xl transition-all duration-300",
        ghost: "hover:bg-violet-500/10 hover:text-violet-300 rounded-xl transition-all duration-200",
        link: "text-primary underline-offset-4 hover:underline",
        premium: "bg-gradient-to-r from-violet-500 to-blue-500 text-white shadow-[0_0_40px_rgba(212,110,255,0.6)] hover:shadow-[0_0_60px_rgba(212,110,255,0.8)] hover:scale-110 transition-all duration-300 rounded-xl font-bold border-2 border-violet-400/50",
      },
      size: {
        default: "h-12 px-6 py-3 text-sm",
        sm: "h-10 px-4 py-2 text-xs rounded-lg",
        lg: "h-14 px-8 py-4 text-base rounded-lg",
        xl: "h-16 px-10 py-5 text-lg rounded-xl",
        icon: "h-12 w-12 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
