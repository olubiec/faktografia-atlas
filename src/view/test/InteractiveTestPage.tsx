import React from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Slider } from "@/components/ui/slider"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

export function InteractiveTestPage() {
  const [sliderVal, setSliderVal] = React.useState<number[]>([40])

  return (
    <main className="min-h-screen bg-[var(--kalka)] text-[var(--tusz)] p-8 space-y-12 max-w-4xl mx-auto">
      <header className="border-b border-[var(--linia)] pb-4">
        <h1 className="text-3xl font-bold">Strona testowa komponentów interaktywnych (CC2.2)</h1>
        <p className="text-sm text-[var(--olowek)] mt-1">
          Zakładki, dymek, okno, popover, suwak, przełącznik
        </p>
      </header>

      {/* 1. Tabs */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold">1. Zakładki (Tabs)</h2>
        <Tabs defaultValue="tab1" className="w-full max-w-md">
          <TabsList aria-label="Przykładowe zakładki">
            <TabsTrigger value="tab1">Zakładka 1</TabsTrigger>
            <TabsTrigger value="tab2">Zakładka 2</TabsTrigger>
            <TabsTrigger value="tab3">Zakładka 3</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1" className="p-4 border border-[var(--linia)] bg-[var(--arkusz)]">
            Treść pierwszej zakładki.
          </TabsContent>
          <TabsContent value="tab2" className="p-4 border border-[var(--linia)] bg-[var(--arkusz)]">
            Treść drugiej zakładki.
          </TabsContent>
          <TabsContent value="tab3" className="p-4 border border-[var(--linia)] bg-[var(--arkusz)]">
            Treść trzeciej zakładki.
          </TabsContent>
        </Tabs>
      </section>

      {/* 2. Tooltip */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold">2. Dymek (Tooltip)</h2>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger className="min-h-[44px] min-w-[44px] border border-[var(--tusz)] bg-[var(--arkusz)] px-4 py-2 text-sm text-[var(--tusz)]">
              Najedź na przycisk
            </TooltipTrigger>
            <TooltipContent>
              To jest dymek informacyjny
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </section>

      {/* 3. Dialog */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold">3. Okno (Dialog)</h2>
        <Dialog>
          <DialogTrigger className="min-h-[44px] border border-[var(--tusz)] bg-[var(--tusz)] px-4 py-2 text-sm text-[var(--arkusz)] font-medium">
            Otwórz okno dialogowe
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tytuł okna dialogowego</DialogTitle>
              <DialogDescription>
                Opis okna dialogowego informujący o szczegółach zadania.
              </DialogDescription>
            </DialogHeader>
            <div className="py-2 text-sm">
              <p>To jest treść okna dialogowego.</p>
            </div>
            <DialogFooter>
              <DialogClose className="min-h-[44px] border border-[var(--tusz)] bg-[var(--arkusz)] px-4 py-2 text-sm text-[var(--tusz)] font-medium">
                Zamknij
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </section>

      {/* 4. Popover */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold">4. Popover</h2>
        <Popover>
          <PopoverTrigger className="min-h-[44px] border border-[var(--tusz)] bg-[var(--arkusz)] px-4 py-2 text-sm text-[var(--tusz)]">
            Otwórz popover
          </PopoverTrigger>
          <PopoverContent>
            <h3 className="font-bold text-sm text-[var(--tusz)]">Nagłówek popovera</h3>
            <p className="text-xs text-[var(--olowek)] mt-1">
              Zawartość w podręcznym okienku typu Popover.
            </p>
          </PopoverContent>
        </Popover>
      </section>

      {/* 5. Slider */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold">5. Suwak (Slider)</h2>
        <div className="w-full max-w-xs space-y-2">
          <label htmlFor="interactive-slider" className="block text-sm font-medium text-[var(--tusz)]">
            Wartość suwaka: {sliderVal[0]}
          </label>
          <Slider
            id="interactive-slider"
            value={sliderVal}
            onValueChange={setSliderVal}
            max={100}
            step={1}
            aria-label="Wartość suwaka"
          />
        </div>
      </section>

      {/* 6. ToggleGroup */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold">6. Przełącznik (ToggleGroup)</h2>
        <div className="space-y-2">
          <p className="text-sm font-medium text-[var(--tusz)]">Wybierz wariant:</p>
          <ToggleGroup type="single" defaultValue="a" aria-label="Wybór wariantu">
            <ToggleGroupItem value="a" aria-label="Wariant A">
              Wariant A
            </ToggleGroupItem>
            <ToggleGroupItem value="b" aria-label="Wariant B">
              Wariant B
            </ToggleGroupItem>
            <ToggleGroupItem value="c" aria-label="Wariant C">
              Wariant C
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </section>
    </main>
  )
}

export default InteractiveTestPage
