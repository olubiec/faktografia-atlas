import * as React from "react"
import { ToggleGroup as ToggleGroupPrimitive } from "radix-ui"
import { cn } from "@/lib/utils"

function ToggleGroup({
  className,
  children,
  ...props
}: React.ComponentProps<typeof ToggleGroupPrimitive.Root>) {
  return (
    <ToggleGroupPrimitive.Root
      data-slot="toggle-group"
      className={cn("inline-flex items-center gap-1", className)}
      {...props}
    >
      {children}
    </ToggleGroupPrimitive.Root>
  )
}

function ToggleGroupItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof ToggleGroupPrimitive.Item>) {
  return (
    <ToggleGroupPrimitive.Item
      data-slot="toggle-group-item"
      className={cn(
        "inline-flex min-h-[44px] min-w-[44px] items-center justify-center border border-[var(--tusz)] bg-[var(--arkusz)] px-3 py-2 text-sm font-medium text-[var(--tusz)] transition-colors hover:bg-[var(--linia)]/20 focus:outline-none focus-visible:ring-1 focus-visible:ring-[var(--tusz)] disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-[var(--tusz)] data-[state=on]:text-[var(--kalka)] rounded-none",
        className
      )}
      {...props}
    >
      {children}
    </ToggleGroupPrimitive.Item>
  )
}

export { ToggleGroup, ToggleGroupItem }
