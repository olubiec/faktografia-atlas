import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center font-medium whitespace-nowrap transition-colors rounded-none outline-none select-none focus-visible:outline-2 focus-visible:outline-tusz focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:text-olowek disabled:bg-transparent disabled:border-olowek disabled:opacity-100 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary: "bg-tusz text-arkusz hover:bg-tusz/90 border border-tusz",
        default: "bg-tusz text-arkusz hover:bg-tusz/90 border border-tusz",
        secondary: "border border-tusz bg-transparent text-tusz hover:bg-tusz/10",
        ghost: "bg-transparent text-tusz hover:underline border border-transparent",
      },
      size: {
        default: "min-h-[44px] h-[44px] px-4 text-[17px] gap-2",
        sm: "min-h-[44px] px-3 text-sm gap-1.5",
        lg: "min-h-[44px] h-[48px] px-6 text-[17px] gap-2",
        icon: "size-[44px] min-h-[44px]",
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
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button }
