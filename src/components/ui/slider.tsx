import * as React from "react"
import { Slider as SliderPrimitive } from "radix-ui"
import { cn } from "@/lib/utils"

function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  "aria-valuetext": ariaValueText,
  ...props
}: React.ComponentProps<typeof SliderPrimitive.Root>) {
  const values = React.useMemo(() => {
    if (Array.isArray(value)) return value
    if (Array.isArray(defaultValue)) return defaultValue
    return [min]
  }, [value, defaultValue, min])

  return (
    <SliderPrimitive.Root
      data-slot="slider"
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      className={cn(
        "relative flex w-full touch-none items-center select-none py-3 data-[disabled]:opacity-50",
        className
      )}
      {...props}
    >
      <SliderPrimitive.Track
        data-slot="slider-track"
        className="relative h-[2px] w-full grow overflow-hidden bg-[var(--linia)]"
      >
        <SliderPrimitive.Range
          data-slot="slider-range"
          className="absolute h-full bg-[var(--tusz)]"
        />
      </SliderPrimitive.Track>
      {values.map((_, index) => (
        <SliderPrimitive.Thumb
          data-slot="slider-thumb"
          key={index}
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledBy}
          aria-valuetext={ariaValueText}
          className="relative block h-[44px] w-[44px] shrink-0 rounded-none bg-transparent focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 after:absolute after:left-1/2 after:top-1/2 after:h-[20px] after:w-[20px] after:-translate-x-1/2 after:-translate-y-1/2 after:bg-[var(--tusz)] after:transition-colors after:content-[''] focus-visible:after:ring-1 focus-visible:after:ring-[var(--tusz)] focus-visible:after:ring-offset-1"
        />
      ))}
    </SliderPrimitive.Root>
  )
}

export { Slider }
