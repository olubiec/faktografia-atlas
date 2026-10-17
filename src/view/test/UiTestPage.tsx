import React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SearchField } from "@/view/ui/SearchField"
import { Sheet } from "@/view/ui/Sheet"
import { Icon } from "@/view/ui/Icon"
import { Menu, Check, Search } from "iconoir-react"

export function UiTestPage() {
  const [theme, setTheme] = React.useState<"light" | "dark">("light")

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light"
    setTheme(nextTheme)
    if (nextTheme === "dark") {
      document.documentElement.setAttribute("data-theme", "dark")
    } else {
      document.documentElement.removeAttribute("data-theme")
    }
  }

  return (
    <main className="min-h-screen p-8 bg-kalka text-tusz font-sans transition-colors">
      <div className="max-w-4xl mx-auto flex flex-col gap-8">
        <header className="flex justify-between items-center border-b border-linia pb-4">
          <h1 className="text-2xl font-bold">Strona testowa komponentów UI (CC2.1)</h1>
          <Button variant="secondary" onClick={toggleTheme} id="theme-toggle">
            Tryb: {theme === "light" ? "Jasny" : "Ciemny"}
          </Button>
        </header>

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
    </main>
  )
}

export default UiTestPage
