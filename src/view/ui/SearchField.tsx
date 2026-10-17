import React from "react"
import { Search } from "iconoir-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Icon } from "@/view/ui/Icon"
import { cn } from "@/lib/utils"

export interface SearchFieldProps
  extends Omit<React.ComponentProps<"input">, "type"> {
  label?: string
  containerClassName?: string
}

export function SearchField({
  id = "search-field",
  label = "Szukaj miejsca",
  placeholder = "Gmina, powiat albo miejscowość",
  className,
  containerClassName,
  ...props
}: SearchFieldProps) {
  return (
    <div className={cn("flex flex-col gap-2 w-full", containerClassName)}>
      {label && <Label htmlFor={id}>{label}</Label>}
      <div className="relative flex items-center w-full">
        <div className="absolute left-3 pointer-events-none text-tusz flex items-center justify-center">
          <Icon icon={Search} aria-hidden={true} size={20} />
        </div>
        <Input
          id={id}
          type="search"
          placeholder={placeholder}
          className={cn("pl-10", className)}
          {...props}
        />
      </div>
    </div>
  )
}
