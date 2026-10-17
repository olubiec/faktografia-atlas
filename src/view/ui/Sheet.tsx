import React from "react"
import { cn } from "@/lib/utils"

export interface SheetProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
}

export function Sheet({ className, children, ...props }: SheetProps) {
  return (
    <div
      className={cn(
        "bg-arkusz border border-linia p-6 text-tusz",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
