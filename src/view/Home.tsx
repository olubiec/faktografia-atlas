
import { Header } from './Header';

export function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow p-4 md:p-8 max-w-4xl mx-auto w-full">
        <section className="mb-12">
          <h1 className="text-[61px] font-[800] leading-[1.05] tracking-[-0.02em] mb-4">
            Faktografia Atlas
          </h1>
          <p className="text-[25px] font-[500] leading-[1.3] mb-6">
            Mapa Polski z danymi GUS. W budowie.
          </p>
          <p className="max-w-[70ch]">
            Faktografia sprawdza fakty, więc jej językiem jest korekta: dane są czyste i spokojne,
            a uwagę kieruje ręczny, lekko nierówny znak czerwonym. Ta nierówność jest celowa.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-[31px] font-[700] mb-6">Skala typograficzna</h2>

          <div className="space-y-4">
            <div>
              <div className="text-olowek text-[13px] mb-1">76 px (800)</div>
              <div className="text-[76px] font-[800] leading-[1.05] tracking-[-0.02em]">Wielki Tytuł</div>
            </div>
            <div>
              <div className="text-olowek text-[13px] mb-1">61 px (800)</div>
              <div className="text-[61px] font-[800] leading-[1.05] tracking-[-0.02em]">Nagłówek 1</div>
            </div>
            <div>
              <div className="text-olowek text-[13px] mb-1">49 px (800) tabular-nums</div>
              <div className="text-[49px] font-[800] leading-[1.0] tabular-nums">1 234 567</div>
            </div>
            <div>
              <div className="text-olowek text-[13px] mb-1">39 px (700)</div>
              <div className="text-[39px] font-[700] leading-[1.15]">Nagłówek 2</div>
            </div>
            <div>
              <div className="text-olowek text-[13px] mb-1">31 px (700)</div>
              <div className="text-[31px] font-[700] leading-[1.15]">Nagłówek 3</div>
            </div>
            <div>
              <div className="text-olowek text-[13px] mb-1">25 px (500)</div>
              <div className="text-[25px] font-[500] leading-[1.3]">Podtytuł</div>
            </div>
            <div>
              <div className="text-olowek text-[13px] mb-1">20 px (500)</div>
              <div className="text-[20px] font-[500] leading-[1.3]">Mniejszy podtytuł</div>
            </div>
            <div>
              <div className="text-olowek text-[13px] mb-1">17 px (400)</div>
              <div className="text-[17px] font-[400] leading-[1.6]">Tekst zwykły. Zdania pisane normalnie, wielka litera tylko na początku.</div>
            </div>
            <div>
              <div className="text-olowek text-[13px] mb-1">13 px (400)</div>
              <div className="text-[13px] font-[400] text-olowek leading-[1.5]">Drobny tekst, źródła. Źródło: GUS, Bank Danych Lokalnych.</div>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-[31px] font-[700] mb-6">Liczby w kolumnach (Mono)</h2>
          <div className="font-mono text-[17px] flex flex-col gap-2 bg-arkusz p-4 border border-linia inline-flex">
            <div>TERYT: 1217011</div>
            <div>TERYT: 1465011</div>
            <div>TERYT: 0264011</div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-[31px] font-[700] mb-6">Kolory (Kalka i korekta)</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <ColorSwatch name="kalka" bg="bg-kalka" text="text-tusz" />
            <ColorSwatch name="arkusz" bg="bg-arkusz" text="text-tusz" />
            <ColorSwatch name="tusz" bg="bg-tusz" text="text-kalka" />
            <ColorSwatch name="olowek" bg="bg-olowek" text="text-kalka" />

            <ColorSwatch name="korekta" bg="bg-korekta" text="text-white" />
            <ColorSwatch name="korekta-tekst" bg="bg-korekta-tekst" text="text-white" />
            <ColorSwatch name="ochra" bg="bg-ochra" text="text-white" />
            <ColorSwatch name="ochra-tekst" bg="bg-ochra-tekst" text="text-white" />
          </div>
        </section>
      </main>
    </div>
  );
}

function ColorSwatch({ name, bg }: { name: string, bg: string, text: string }) {
  return (
    <div className="flex flex-col border border-linia">
      <div className={`h-24 ${bg}`}></div>
      <div className={`p-2 bg-arkusz text-tusz text-[13px] border-t border-linia`}>
        --{name}
      </div>
    </div>
  );
}
