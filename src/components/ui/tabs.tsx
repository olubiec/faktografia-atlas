import * as React from "react"
import { Tabs as TabsPrimitive } from "radix-ui"
import { cn } from "@/lib/utils"

function Tabs({
  className,
  orientation = "horizontal",
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      orientation={orientation}
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  )
}

function TabsList({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
        "inline-flex h-auto items-center justify-start border-b border-[var(--linia)] bg-transparent p-0 text-[var(--olowek)] gap-2",
        className
      )}
      {...props}
    />
  )
}

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "relative inline-flex min-h-[44px] items-center justify-center px-1.5 sm:px-3 py-2 text-sm font-medium whitespace-nowrap text-[var(--tusz)] opacity-80 transition-colors hover:opacity-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--tusz)] disabled:pointer-events-none disabled:opacity-50 data-[state=active]:opacity-100 data-[state=active]:text-[var(--tusz)] data-[state=active]:border-b-[3px] data-[state=active]:border-[var(--korekta)] -mb-[1px] rounded-none",
        className
      )}
      {...props}
    />
  )
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn(
        "flex-1 text-sm outline-none focus-visible:ring-1 focus-visible:ring-[var(--tusz)]",
        className
      )}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
