import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SearchField } from "@/view/ui/SearchField"
import { Sheet } from "@/view/ui/Sheet"
import { Icon } from "@/view/ui/Icon"
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
import { AnnotationProvider } from "@/view/annotation/AnnotationProvider"
import { Annotate } from "@/view/annotation/Annotate"
import { ProfileSheet } from "@/view/profile/ProfileSheet"
import sampleProfileData from "../../../tests/fixtures/synthetic/profile-sample.json"
import { buildProfile, type UnitProfile, type Indicator, type IndicatorValues } from "@/core/profile/profile"
import type { Unit } from "@/core/units/types"

const sampleUnits = sampleProfileData.units as unknown as Unit[]
const sampleIndicators = sampleProfileData.indicators as unknown as Indicator[]
const sampleValuesById = sampleProfileData.valuesById as unknown as Record<string, IndicatorValues>
const sampleProfile: UnitProfile = buildProfile("0201011", sampleIndicators, sampleValuesById, sampleUnits)
import {
  NavArrowDown,
  Menu,
  Check,
  Search,
  Settings,
  InfoCircle,
  Map,
  Filter,
  Refresh,
} from "iconoir-react"
import type { RoughAnnotationType } from "rough-notation/lib/model"

const COLOR_TOKENS = [
  { name: "--kalka", label: "kalka", usage: "tło strony" },
  { name: "--arkusz", label: "arkusz", usage: "panele nałożone na mapę, pola formularzy" },
  { name: "--linia", label: "linia", usage: "ramki i podziały, zawsze 1 px" },
  { name: "--tusz", label: "tusz", usage: "tekst, granice, przyciski główne" },
  { name: "--olowek", label: "olowek", usage: "tekst drugiego planu" },
  { name: "--korekta", label: "korekta", usage: "ręczne zakreślenia, aktywna zakładka, wybrane miejsce" },
  { name: "--korekta-tekst", label: "korektaTekst", usage: "drobny tekst w kolorze korekty" },
  { name: "--ochra", label: "ochra", usage: "ujemna strona skali dywergentnej" },
  { name: "--ochra-tekst", label: "ochraTekst", usage: "drobny tekst w ochrze" },
  { name: "--seq-1", label: "seq-1", usage: "skala sekwencjonalna 1" },
  { name: "--seq-2", label: "seq-2", usage: "skala sekwencjonalna 2" },
  { name: "--seq-3", label: "seq-3", usage: "skala sekwencjonalna 3" },
  { name: "--seq-4", label: "seq-4", usage: "skala sekwencjonalna 4" },
  { name: "--seq-5", label: "seq-5", usage: "skala sekwencjonalna 5" },
  { name: "--div-1", label: "div-1", usage: "skala dywergentna 1" },
  { name: "--div-2", label: "div-2", usage: "skala dywergentna 2" },
  { name: "--div-3", label: "div-3", usage: "skala dywergentna 3" },
  { name: "--div-4", label: "div-4", usage: "skala dywergentna 4" },
  { name: "--div-5", label: "div-5", usage: "skala dywergentna 5" },
  { name: "--no-data", label: "no-data", usage: "brak danych" },
  { name: "--highlight", label: "highlight", usage: "wyróżnienie" },
]

export function DesignPage() {
  const [theme, setTheme] = useState<"light" | "dark">("light")
  const [colorValues, setColorValues] = useState<Record<string, string>>({})
  const [sliderVal, setSliderVal] = useState<number[]>([50])
  const [activeAnnotation, setActiveAnnotation] = useState<RoughAnnotationType | null>("circle")

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light"
    setTheme(nextTheme)
    if (nextTheme === "dark") {
      document.documentElement.setAttribute("data-theme", "dark")
    } else {
      document.documentElement.removeAttribute("data-theme")
    }
  }

  useEffect(() => {
    const updateColors = () => {
      const computed = getComputedStyle(document.documentElement)
      const vals: Record<string, string> = {}
      COLOR_TOKENS.forEach((t) => {
        vals[t.name] = computed.getPropertyValue(t.name).trim()
      })
      setColorValues(vals)
    }
    updateColors()

    const observer = new MutationObserver(updateColors)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme", "class", "style"],
    })
    return () => observer.disconnect()
  }, [])

  return (
    <AnnotationProvider>
      <TooltipProvider>
        <main className="min-h-screen bg-kalka text-tusz p-4 sm:p-8 font-sans transition-colors">
          <div className="max-w-5xl mx-auto space-y-12">
            {/* Header z przełącznikiem motywu */}
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-linia pb-4 gap-4">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">System Wyglądu — /design</h1>
                <p className="text-sm text-olowek">
                  Faktografia Atlas — kompletny przegląd komponentów, tokenów i krojów
                </p>
              </div>
              <Button variant="secondary" onClick={toggleTheme} id="theme-toggle">
                Tryb: {theme === "light" ? "Jasny" : "Ciemny"}
              </Button>
            </header>

            {/* 1. Kolory */}
            <section id="kolory" aria-labelledby="heading-kolory" className="space-y-4">
              <h2 id="heading-kolory" className="text-xl font-bold border-b border-linia pb-2">
                1. Kolory
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {COLOR_TOKENS.map((token) => (
                  <div
                    key={token.name}
                    className="p-3 bg-arkusz border border-linia flex items-center gap-3"
                  >
                    <div
                      className="w-10 h-10 border border-linia shrink-0"
                      style={{ backgroundColor: `var(${token.name})` }}
                    />
                    <div className="min-w-0 text-xs">
                      <p className="font-mono font-bold truncate">{token.name}</p>
                      <p className="font-mono text-olowek truncate">
                        {colorValues[token.name] || `var(${token.name})`}
                      </p>
                      <p className="text-olowek truncate">{token.usage}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 2. Typografia */}
            <section id="typografia" aria-labelledby="heading-typografia" className="space-y-6">
              <h2 id="heading-typografia" className="text-xl font-bold border-b border-linia pb-2">
                2. Typografia
              </h2>
              <div className="space-y-6 bg-arkusz p-4 sm:p-6 border border-linia">
                <div>
                  <span className="text-xs text-olowek block font-mono">
                    76 px (text-5xl) - Tytuł strony (800)
                  </span>
                  <p className="text-5xl font-extrabold tracking-tight leading-none break-words">
                    Faktografia <span className="font-mono">2024</span>
                  </p>
                </div>
                <div>
                  <span className="text-xs text-olowek block font-mono">
                    61 px (text-4xl) - Tytuł strony (800)
                  </span>
                  <p className="text-4xl font-extrabold tracking-tight leading-tight break-words">
                    Atlas Polski <span className="font-mono">1440</span>
                  </p>
                </div>
                <div>
                  <span className="text-xs text-olowek block font-mono">
                    49 px (text-3xl) - Duża liczba w panelu (800)
                  </span>
                  <p className="text-3xl font-extrabold tabular-nums font-mono break-words">
                    37 840 000
                  </p>
                </div>
                <div>
                  <span className="text-xs text-olowek block font-mono">
                    39 px (text-2xl) - Nagłówek sekcji (700)
                  </span>
                  <p className="text-2xl font-bold break-words">
                    Województwo Mazowieckie <span className="font-mono">(14)</span>
                  </p>
                </div>
                <div>
                  <span className="text-xs text-olowek block font-mono">
                    31 px (text-xl) - Nagłówek sekcji (700)
                  </span>
                  <p className="text-xl font-bold">
                    Powiat Warszawski Zachodni <span className="font-mono">(1432)</span>
                  </p>
                </div>
                <div>
                  <span className="text-xs text-olowek block font-mono">
                    25 px (text-lg) - Podtytuł (500)
                  </span>
                  <p className="text-lg font-medium">
                    Liczba mieszkańców w roku <span className="font-mono">2023</span>
                  </p>
                </div>
                <div>
                  <span className="text-xs text-olowek block font-mono">
                    20 px (text-md) - Podtytuł (500)
                  </span>
                  <p className="text-md font-medium">
                    Gmina Stare Babice <span className="font-mono">(1432062)</span>
                  </p>
                </div>
                <div>
                  <span className="text-xs text-olowek block font-mono">
                    17 px (text-sm) - Tekst podstawowy (400)
                  </span>
                  <p className="text-sm font-normal max-w-prose">
                    Dane są czyste i spokojne. Faktografia sprawdza fakty, a jej językiem jest korekta. Kod TERYT: <span className="font-mono">1432062</span>.
                  </p>
                </div>
                <div>
                  <span className="text-xs text-olowek block font-mono">
                    13 px (text-xs) - Drobny tekst, źródła (400)
                  </span>
                  <p className="text-xs text-olowek font-normal">
                    Źródło: GUS, Bank Danych Lokalnych, <span className="font-mono">2024</span>. TERYT: <span className="font-mono">000000</span>.
                  </p>
                </div>
              </div>
            </section>

            {/* 3. Logo */}
            <section id="logo" aria-labelledby="heading-logo" className="space-y-4">
              <h2 id="heading-logo" className="text-xl font-bold border-b border-linia pb-2">
                3. Logo
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Jasne tło */}
                <div className="p-6 bg-arkusz border border-linia flex flex-col items-center justify-center gap-4">
                  <span className="text-xs text-olowek">Na jasnym tle (arkusz)</span>
                  <img src="/brand/faktografia-logo-granat.svg" alt="Logo granatowe" className="h-9" />
                  <img src="/brand/faktografia-znak-granat.svg" alt="Znak granatowy" className="h-24" />
                  <img src="/brand/faktografia-favicon.svg" alt="Favicon" className="w-8 h-8" />
                </div>
                {/* Ciemne tło */}
                <div className="p-6 bg-tusz text-arkusz border border-linia flex flex-col items-center justify-center gap-4">
                  <span className="text-xs text-arkusz">Na ciemnym tle (tusz)</span>
                  <img src="/brand/faktografia-logo-jasne.svg" alt="Logo jasne" className="h-9" />
                  <img src="/brand/faktografia-znak-jasny.svg" alt="Znak jasny" className="h-24" />
                  <img src="/brand/faktografia-favicon.svg" alt="Favicon jasny" className="w-8 h-8" />
                </div>
              </div>
            </section>

            {/* 4. Przyciski */}
            <section id="przyciski" aria-labelledby="heading-przyciski" className="space-y-4">
              <h2 id="heading-przyciski" className="text-xl font-bold border-b border-linia pb-2">
                4. Przyciski (Button)
              </h2>
              <div className="p-6 bg-arkusz border border-linia flex flex-wrap items-center gap-4">
                <Button variant="primary">Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="ghost">Ghost</Button>
                <Button disabled>Wyłączony</Button>
              </div>
            </section>

            {/* 5. Pola */}
            <section id="pola" aria-labelledby="heading-pola" className="space-y-4">
              <h2 id="heading-pola" className="text-xl font-bold border-b border-linia pb-2">
                5. Pola (Input, Label, SearchField)
              </h2>
              <div className="p-6 bg-arkusz border border-linia space-y-6 max-w-md">
                <div className="space-y-2">
                  <Label htmlFor="design-input">Etykieta pola</Label>
                  <Input id="design-input" placeholder="Wpisz tekst..." />
                </div>
                <div className="space-y-2">
                  <SearchField id="design-search" label="Szukaj jednostki" />
                </div>
              </div>
            </section>

            {/* 6. Ikony */}
            <section id="ikony" aria-labelledby="heading-ikony" className="space-y-4">
              <h2 id="heading-ikony" className="text-xl font-bold border-b border-linia pb-2">
                6. Ikony (Icon)
              </h2>
              <div className="p-6 bg-arkusz border border-linia flex flex-wrap gap-6 items-center text-tusz">
                <div className="flex flex-col items-center gap-1">
                  <Icon icon={Menu} aria-label="Menu" />
                  <span className="text-xs text-olowek">Menu</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <Icon icon={Check} aria-label="Zatwierdzono" />
                  <span className="text-xs text-olowek">Check</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <Icon icon={Search} aria-hidden={true} />
                  <span className="text-xs text-olowek">Search</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <Icon icon={Settings} aria-label="Ustawienia" />
                  <span className="text-xs text-olowek">Settings</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <Icon icon={InfoCircle} aria-label="Informacje" />
                  <span className="text-xs text-olowek">InfoCircle</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <Icon icon={Map} aria-label="Mapa" />
                  <span className="text-xs text-olowek">Map</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <Icon icon={Filter} aria-label="Filtr" />
                  <span className="text-xs text-olowek">Filter</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <Icon icon={Refresh} aria-label="Odśwież" />
                  <span className="text-xs text-olowek">Refresh</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <Icon icon={NavArrowDown} aria-label="Rozwiń" />
                  <span className="text-xs text-olowek">NavArrowDown</span>
                </div>
              </div>
            </section>

            {/* 7. Zakładki */}
            <section id="zakladki" aria-labelledby="heading-zakladki" className="space-y-4">
              <h2 id="heading-zakladki" className="text-xl font-bold border-b border-linia pb-2">
                7. Zakładki (Tabs)
              </h2>
              <div className="p-6 bg-arkusz border border-linia max-w-md">
                <Tabs defaultValue="wojewodztwa" className="w-full">
                  <TabsList aria-label="Poziomy podziału">
                    <TabsTrigger value="wojewodztwa">Województwa</TabsTrigger>
                    <TabsTrigger value="powiaty">Powiaty</TabsTrigger>
                    <TabsTrigger value="gminy">Gminy</TabsTrigger>
                  </TabsList>
                  <TabsContent value="wojewodztwa" className="p-4 border border-linia mt-2">
                    Lista 16 województw.
                  </TabsContent>
                  <TabsContent value="powiaty" className="p-4 border border-linia mt-2">
                    Lista 380 powiatów.
                  </TabsContent>
                  <TabsContent value="gminy" className="p-4 border border-linia mt-2">
                    Lista 2477 gmin.
                  </TabsContent>
                </Tabs>
              </div>
            </section>

            {/* 8. Dymek */}
            <section id="dymek" aria-labelledby="heading-dymek" className="space-y-4">
              <h2 id="heading-dymek" className="text-xl font-bold border-b border-linia pb-2">
                8. Dymek (Tooltip)
              </h2>
              <div className="p-6 bg-arkusz border border-linia flex items-center">
                <Tooltip>
                  <TooltipTrigger className="min-h-[44px] min-w-[44px] border border-linia bg-kalka px-4 py-2 text-sm">
                    Najedź, aby zobaczyć dymek
                  </TooltipTrigger>
                  <TooltipContent>
                    To jest dymek informacyjny (Tooltip)
                  </TooltipContent>
                </Tooltip>
              </div>
            </section>

            {/* 9. Okno */}
            <section id="okno" aria-labelledby="heading-okno" className="space-y-4">
              <h2 id="heading-okno" className="text-xl font-bold border-b border-linia pb-2">
                9. Okno (Dialog)
              </h2>
              <div className="p-6 bg-arkusz border border-linia flex items-center">
                <Dialog>
                  <DialogTrigger className="min-h-[44px] border border-tusz bg-tusz px-4 py-2 text-sm text-arkusz font-medium">
                    Otwórz okno dialogowe
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Tytuł okna dialogowego</DialogTitle>
                      <DialogDescription>
                        Przykładowe okno dialogowe z informacjami o projekcie.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-2 text-sm">
                      <p>Zawartość okna modalnego Faktografii.</p>
                    </div>
                    <DialogFooter>
                      <DialogClose className="min-h-[44px] border border-linia bg-arkusz px-4 py-2 text-sm font-medium">
                        Zamknij
                      </DialogClose>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </section>

            {/* 10. Popover */}
            <section id="popover" aria-labelledby="heading-popover" className="space-y-4">
              <h2 id="heading-popover" className="text-xl font-bold border-b border-linia pb-2">
                10. Popover
              </h2>
              <div className="p-6 bg-arkusz border border-linia flex items-center">
                <Popover>
                  <PopoverTrigger className="min-h-[44px] border border-linia bg-kalka px-4 py-2 text-sm">
                    Otwórz popover
                  </PopoverTrigger>
                  <PopoverContent>
                    <h3 className="font-bold text-sm">Nagłówek popovera</h3>
                    <p className="text-xs text-olowek mt-1">
                      Podręczne okienko z dodatkowymi opcjami filtrowania.
                    </p>
                  </PopoverContent>
                </Popover>
              </div>
            </section>

            {/* 11. Suwak */}
            <section id="suwak" aria-labelledby="heading-suwak" className="space-y-4">
              <h2 id="heading-suwak" className="text-xl font-bold border-b border-linia pb-2">
                11. Suwak (Slider)
              </h2>
              <div className="p-6 bg-arkusz border border-linia max-w-xs space-y-2">
                <Label htmlFor="design-slider">Wartość suwaka: {sliderVal[0]}</Label>
                <Slider
                  id="design-slider"
                  value={sliderVal}
                  onValueChange={setSliderVal}
                  max={100}
                  step={1}
                  aria-label="Wartość suwaka"
                />
              </div>
            </section>

            {/* 12. Przełącznik */}
            <section id="przelacznik" aria-labelledby="heading-przelacznik" className="space-y-4">
              <h2 id="heading-przelacznik" className="text-xl font-bold border-b border-linia pb-2">
                12. Przełącznik (ToggleGroup)
              </h2>
              <div className="p-6 bg-arkusz border border-linia space-y-2">
                <span className="text-sm text-olowek block">Wybór trybu mapy:</span>
                <ToggleGroup type="single" defaultValue="2d" aria-label="Tryb mapy">
                  <ToggleGroupItem value="2d" aria-label="Płaska 2D">
                    Płaska 2D
                  </ToggleGroupItem>
                  <ToggleGroupItem value="3d" aria-label="Arkusze 3D">
                    Arkusze 3D
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>
            </section>

            {/* 13. Arkusz */}
            <section id="arkusz" aria-labelledby="heading-arkusz" className="space-y-4">
              <h2 id="heading-arkusz" className="text-xl font-bold border-b border-linia pb-2">
                13. Arkusz (Sheet)
              </h2>
              <div className="max-w-md">
                <Sheet>
                  <h3 className="text-lg font-bold mb-2">Arkusz informacyjny</h3>
                  <p className="text-sm text-olowek mb-4">
                    Panel nakładany na mapę z podglądem profilu wybranego miejsca. Tło --arkusz, ramka 1 px --linia, bez cieni i rozmycia.
                  </p>
                  <Button variant="primary" className="w-full">
                    Zamknij panel
                  </Button>
                </Sheet>
              </div>
            </section>

            {/* 13.1 ProfileSheet */}
            <section id="profil-arkusz" aria-labelledby="heading-profil-arkusz" className="space-y-4">
              <h2 id="heading-profil-arkusz" className="text-xl font-bold border-b border-linia pb-2">
                13a. Arkusz profilu jednostki (ProfileSheet)
              </h2>
              <div className="flex flex-col lg:flex-row gap-6 items-start">
                <ProfileSheet
                  profile={sampleProfile}
                  units={sampleUnits}
                  onClose={() => {}}
                />
                <div className="text-xs text-olowek space-y-2 max-w-sm">
                  <p className="font-bold text-tusz">Arkusz profilu jednostki (komputer, 440 px)</p>
                  <p>
                    Komponent przyjmujący wygenerowany profil jednostki i tablicę metadanych jednostek.
                    Wskaźniki są pogrupowane według kategorii, prezentując wartości sformatowane przez{' '}
                    <code className="font-mono text-tusz">formatValue</code> oraz informację o randze i powiązaniach.
                  </p>
                </div>
              </div>
            </section>

            {/* 14. Zakreślenia */}
            <section id="zakreslenia" aria-labelledby="heading-zakreslenia" className="space-y-4">
              <h2 id="heading-zakreslenia" className="text-xl font-bold border-b border-linia pb-2">
                14. Zakreślenia (Annotate)
              </h2>
              <div className="p-6 bg-arkusz border border-linia space-y-6">
                <p className="text-sm leading-relaxed">
                  Podgląd zakreślenia (najwyżej jedno na raz):{" "}
                  <strong className="text-lg font-bold ml-2 inline-block">
                    {activeAnnotation ? (
                      <Annotate type={activeAnnotation} show={true}>
                        37 840 000
                      </Annotate>
                    ) : (
                      "37 840 000"
                    )}
                  </strong>
                </p>

                <div className="flex flex-wrap gap-3 pt-4 border-t border-linia">
                  {(["circle", "underline", "bracket", "box"] as const).map((type) => (
                    <Button
                      key={type}
                      variant={activeAnnotation === type ? "primary" : "secondary"}
                      onClick={() => setActiveAnnotation(type)}
                    >
                      Pokaż {type}
                    </Button>
                  ))}
                  <Button
                    variant={activeAnnotation === null ? "primary" : "ghost"}
                    onClick={() => setActiveAnnotation(null)}
                  >
                    Ukryj zakreślenie
                  </Button>
                </div>
              </div>
            </section>
          </div>
        </main>
      </TooltipProvider>
    </AnnotationProvider>
  )
}

export default DesignPage
