import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SearchField } from "@/view/ui/SearchField"
import { Sheet } from "@/view/ui/Sheet"
import { Icon } from "@/view/ui/Icon"
import { Menu, Check, Search } from "iconoir-react"
import { BottomSheet } from "@/view/ui/BottomSheet"
import { LazyShareDialog } from "@/view/share/LazyShareDialog"

export function UiTestPage() {
  const [theme, setTheme] = useState<"light" | "dark">("light")
  const [sheetOpen, setSheetOpen] = useState(false)
  const [noBgSheetOpen, setNoBgSheetOpen] = useState(false)
  const [shareDialogOpen, setShareDialogOpen] = useState(false)
  const [counter, setCounter] = useState(0)

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light"
    setTheme(nextTheme)
    if (nextTheme === "dark") {
      document.documentElement.setAttribute("data-theme", "dark")
    } else {
      document.documentElement.removeAttribute("data-theme")
    }
  }

  const shareData = {
    map: {
      indicator: { name: "Gęstość zaludnienia", unit: "os./km²", year: 2025 },
      year: 2025,
      unitName: "Województwo małopolskie",
    },
    ranking: {
      indicator: { name: "Gęstość zaludnienia", unit: "os./km²" },
      year: 2025,
      items: [
        { teryt: "14", name: "mazowieckie", value: 153.2, rank: 1 },
        { teryt: "12", name: "małopolskie", value: 225.8, rank: 2, selected: true },
        { teryt: "24", name: "śląskie", value: 360.1, rank: 3 },
      ],
    },
    profile: {
      unitName: "Województwo małopolskie",
      teryt: "12",
      indicatorName: "Gęstość zaludnienia",
      unit: "os./km²",
      year: 2025,
      bigNumber: "225,8",
      rankText: "2. miejsce w Polsce",
      indicators: [
        { name: "Gęstość zaludnienia", value: "225,8", unit: "os./km²", rankText: "2. miejsce" },
        { name: "Stopa bezrobocia", value: "4,5", unit: "%", rankText: "5. miejsce" },
      ],
    },
    compare: {
      indicatorName: "Gęstość zaludnienia",
      year: 2025,
      unitA: { name: "małopolskie", teryt: "12" },
      unitB: { name: "mazowieckie", teryt: "14" },
      rows: [
        {
          indicatorName: "Gęstość zaludnienia",
          valA: "225,8 os./km²",
          valB: "153,2 os./km²",
          diffText: "wyżej o 72,6 os./km²",
        },
      ],
    },
    csvContent: "\uFEFFTERYT;Nazwa;Wartość;Rok;Źródło\r\n12;małopolskie;225,8;2025;GUS, Bank Danych Lokalnych (CC BY 4.0)\r\n",
    csvFileName: "faktografia-gestosc-zaludnienia-2025.csv",
  }

  return (
    <main className="min-h-screen p-4 sm:p-8 bg-kalka text-tusz font-sans transition-colors overflow-x-hidden max-w-full">
      <div className="max-w-4xl mx-auto flex flex-col gap-8 max-w-full">
        <header className="flex justify-between items-center border-b border-linia pb-4 flex-wrap gap-2">
          <h1 className="text-xl sm:text-2xl font-bold">Strona testowa komponentów UI (CC2.1)</h1>
          <Button variant="secondary" onClick={toggleTheme} id="theme-toggle">
            Tryb: {theme === "light" ? "Jasny" : "Ciemny"}
          </Button>
        </header>

        {/* Sekcja ShareDialog */}
        <section className="flex flex-col gap-4 relative z-10" aria-labelledby="share-section-title">
          <h2 id="share-section-title" className="text-xl font-semibold">Pobierz i udostępnij (W2.18 / S19)</h2>
          <div className="flex gap-4">
            <Button variant="primary" id="open-share-dialog" onClick={() => setShareDialogOpen(true)}>
              Otwórz okno Pobierz i udostępnij
            </Button>
          </div>
        </section>

        {/* Sekcja BottomSheet */}
        <section className="flex flex-col gap-4 relative z-10" aria-labelledby="bottom-sheet-section-title">
          <h2 id="bottom-sheet-section-title" className="text-xl font-semibold">BottomSheet (Dolny arkusz)</h2>
          <div className="flex gap-4">
            <Button variant="primary" onClick={() => setSheetOpen(true)}>
              Otwórz dolny arkusz
            </Button>
            <Button variant="secondary" onClick={() => setNoBgSheetOpen(true)}>
              Otwórz arkusz bez tła
            </Button>
          </div>

          <div className="mt-4 p-4 border border-linia bg-arkusz relative z-10">
            <p>Kliknij ten przycisk, by sprawdzić działanie trybu bez tła:</p>
            <button
              id="bg-click-button"
              className="mt-2 px-4 py-2 bg-tusz text-kalka cursor-pointer pointer-events-auto"
              onClick={() => setCounter(c => c + 1)}
            >
              Kliknięto w tło: <span id="bg-click-counter">{counter}</span>
            </button>
          </div>
        </section>

        {/* Sekcja Button */}
        <section className="flex flex-col gap-4" aria-labelledby="btn-section-title">
          <h2 id="btn-section-title" className="text-xl font-semibold">Przyciski (Button)</h2>
          <div className="flex flex-wrap gap-4 items-center">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button disabled>Wyłączony</Button>
          </div>
        </section>

        {/* Sekcja Input + Label */}
        <section className="flex flex-col gap-4" aria-labelledby="input-section-title">
          <h2 id="input-section-title" className="text-xl font-semibold">Input + Label</h2>
          <div className="max-w-md flex flex-col gap-2">
            <Label htmlFor="demo-input">Etykieta pola</Label>
            <Input id="demo-input" placeholder="Wpisz cokolwiek..." />
          </div>
        </section>

        {/* Sekcja SearchField */}
        <section className="flex flex-col gap-4" aria-labelledby="search-section-title">
          <h2 id="search-section-title" className="text-xl font-semibold">SearchField</h2>
          <div className="max-w-md">
            <SearchField />
          </div>
        </section>

        {/* Sekcja Sheet */}
        <section className="flex flex-col gap-4" aria-labelledby="sheet-section-title">
          <h2 id="sheet-section-title" className="text-xl font-semibold">Sheet (Arkusz)</h2>
          <Sheet className="max-w-md">
            <h3 className="text-lg font-bold mb-2">Tytuł w arkuszu</h3>
            <p className="text-sm text-olowek mb-4">
              Zawartość arkusza. Tło --arkusz, ramka 1 px --linia, padding 24 px, bez cieni i rozmycia.
            </p>
            <Button variant="primary" className="w-full">
              Zamknij
            </Button>
          </Sheet>
        </section>

        {/* Sekcja Icon */}
        <section className="flex flex-col gap-4" aria-labelledby="icon-section-title">
          <h2 id="icon-section-title" className="text-xl font-semibold">Ikona (Icon)</h2>
          <div className="flex gap-4 items-center">
            <Icon icon={Menu} aria-label="Nawigacja" />
            <Icon icon={Check} aria-label="Zatwierdzono" />
            <Icon icon={Search} aria-hidden={true} />
          </div>
        </section>
      </div>

      <BottomSheet
        isOpen={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title="Testowy arkusz dolny"
        snapPoints={[1, 0.4, 0]}
        initialSnap={1}
      >
        <h3 className="text-lg font-bold">Witaj w arkuszu</h3>
        <p className="mt-4 text-olowek">Złap uchwyt by przesunąć.</p>
        <p className="mt-2">Ten arkusz ma tło, kliknięcie poza zamknie go.</p>
      </BottomSheet>

      <BottomSheet
        isOpen={noBgSheetOpen}
        onClose={() => setNoBgSheetOpen(false)}
        title="Arkusz bez tła"
        snapPoints={[1, 0.4, 0]}
        initialSnap={1}
        noBackdrop={true}
      >
        <h3 className="text-lg font-bold">Arkusz bez tła</h3>
        <p className="mt-4 text-olowek">Możesz klikać w mapę/elementy z tyłu.</p>
      </BottomSheet>

      <LazyShareDialog
        isOpen={shareDialogOpen}
        onClose={() => setShareDialogOpen(false)}
        defaultKind="map"
        data={shareData}
      />
    </main>
  )
}

export default UiTestPage
