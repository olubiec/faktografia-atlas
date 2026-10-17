import * as React from "react"
import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "min-h-[44px] h-[44px] w-full min-w-0 rounded-none border border-tusz bg-arkusz px-3 py-2 text-[17px] text-tusz transition-colors outline-none placeholder:text-olowek focus-visible:outline-2 focus-visible:outline-tusz focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:bg-arkusz/50 disabled:text-olowek disabled:border-olowek disabled:opacity-100",
        className
      )}
      {...props}
    />
  )
}

export { Input }
