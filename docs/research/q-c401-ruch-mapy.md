# QC401 – Pomiar ruchu mapy (raport)

Stan: 17.11.2026, gałąź `claude/QC401`, `origin/main` = f202604. Bez zmian w `src/` i `tests/`.

## 1. Metoda
- `pnpm build` + `vite preview --port 4173`, wejście z `?e2e` (szew `window.__atlas`). Wersje: maplibre-gl 6.15.0, react-map-gl 8.1.3, deck.gl 9.4.0 (z `node_modules`; INSPIRACJE.md wymienia 6.16.0 – różnica patchowa, bez znaczenia dla wniosków).
- Chromium z Playwright, viewport 1440×900, `hasTouch`, WebGL = **SwiftShader** (programowy). Skrypt (dodatek) próbkuje w stronie `__atlas.viewState`, `reveal.progress`, `camera.trace.length` w `requestAnimationFrame`. Każdy ruch ×3, mediana; drugi komplet z `reducedMotion: 'reduce'`.
- **Ograniczenie kluczowe:** w headless rAF idle ma 61 kl./s, ale podczas ruchu mapy główny wątek jest zajęty (SwiftShader + deck.gl): w oknie 2,5 s zebrano tylko 4–13 klatek rAF dla ruchów z animacją (kolumna „rAF”). Liczby klatek i czasy są więc **względne** (dolna granica), nie bezwzględne; „1 klatka” przy ruchu o 1–2 poziomy zoomu oznacza skok, ale 2–4 klatki może znaczyć i płynną animację zagłodzoną przez procesor. Werdykt opieram na liczbach **i** na kodzie.
- Nie zmierzono wprost: koloru wypełnienia deck.gl (przejście `transitions.getFillColor` jest wewnątrz deck.gl, szew go nie pokazuje) – ocena z kodu. Pinch emulowany przez CDP `Input.dispatchTouchEvent` (2 punkty, 16 ms odstępu); MapLibre go przyjął (15 kroków zoomu), więc emulacja jest wiarygodna.
- Klik w województwo (a): w serii normalnej trafiłem w tło (0 zmian); w serii reduced trafił w jednostkę. Wynik (a) bierzemy z serii reduced + z (g), które używa tej samej ścieżki `onBboxChange → updateViewStateForBbox`.

## 2. Tabela wyników (mediana z 3; „kl.” = unikalne pośrednie widoki zoom/pozycja; rAF = ile klatek strony zebrano)
| Ruch | kl. | czas ms | rAF | reduced-motion (kl./Δzoom) | Werdykt | Przyczyna (plik:linia) |
|---|---|---|---|---|---|---|
| (a) klik w województwo | 1 (reduced); 0 (miss) | – | 3–4 | 1 / 1,18 skok | **animacja nieobserwowalna w headless; w reduced skok (poprawnie)** | `useMapViewState.ts:176-248` animuje zoom tylko przez własny rAF ze `setCurrentViewState`; `essential`/MapLibre `easeTo` nieużywane |
| (b) kółko ×3 | 5 (4 w reduced) | ~3200 | 82 | 4 / 0,36 | **działa** (MapLibre `scrollZoom` generuje kroki sam) – ale reduced-motion go nie wyłącza | `AtlasMap.tsx:347-362` kontrolowany `{...currentViewState}` + `onMove`; patrz ryzyko R1 |
| (c) pinch | 15 | ~11 000* | 193 | 15 / 2,0 | **działa** | `onMove` przepuszcza `touchmove` (`AtlasMap.tsx:355-358`) |
| (d1) `+` | 1 | skok | 154 | 1 / 0,5 | **nie działa (skok)** | `useMapViewState.ts:374-379` – `setCurrentViewState(zoom+0,5)` bez animacji |
| (d2) `-` | 1 | skok | 153 | 1 / -0,41 | **nie działa (skok)** | `useMapViewState.ts:380-385` j.w. |
| (e) okruszki → Polska | 1 (2 w reduced) | ~0 | 13 | 2 / -1,51 | **niewiarygodny pomiar; kod animuje** | `onBboxChange` → `updateViewStateForBbox` (`:250-281`) → `animateToView` |
| (f) „Wróć” | 1 (2 w reduced) | ~0 | 13 | 2 / -1,51 | j.w. | j.w. (ta sama ścieżka co e) |
| (g) wyszukiwarka → województwo | 1 (2 w reduced) | ~0 | 28 | 2 / 1,51 | j.w. (istniejący `camera.spec.ts` wymaga ≥3 pośrednich – przechodzi na CI przy wolnym CPU, tu głodzone) | j.w. |
| (g2) wyszukiwarka → miejscowość | 1 (2 w reduced) | ~0 | 28 | 2 / 5,12 | **nie działa (skok, celowo)** | `AtlasMap.tsx:111-114` `onLocalitySelectView` → `setCurrentViewState` bez animacji; `useMapViewState.ts:294-305` też ustawia widok natychmiast |
| (h) zmiana wskaźnika | 0 ruchu kamery; reveal 1 | – | 10–131 | – | **kolory: brak pomiaru wprost; patrz R5** | `layers/choropleth.ts:105-111` (300 ms przejścia) ma `updateTriggers` na `reveal.progress` (`:164-167`) |
| (i) poziom „Powiaty” | 0 kamery; reveal 2 wartości | – | 10–156 | reveal 1 (brak) | reveal startuje, ale w headless 2 próbki | `useChoropleth.ts:118-136` (rAF z `revealTotal`); `scopeKey` w `:90` |
*) czas pinch to czas mojej emulacji (15 kroków × odstęp), nie czas animacji aplikacji.

Gdzie kod odpowiada hipotezie właściciela:
1. **Animacja kamery działa tylko dla zmiany ramki/bbox** (`updateViewStateForBbox`, `measure()`), nie dla `+`/`-` ani dla wejścia w miejscowość.
2. **Animacja jest własnym rAF** (`useMapViewState.ts:206-243`), a nie `easeTo` MapLibre. Każda klatka to `setCurrentViewState` → re-render Reacta + przebudowa warstw (`AtlasMap.tsx:227-242`) → przy słabym CPU mało klatek. Dodatkowo `frameProgress = min(1, frameCount/6)` (`:221`) wymusza minimum 6 klatek niezależnie od czasu (poprawnie dla testów, ale spowalnia ruch na wolnych klatkach).
3. **`onMove` odrzuca ruchy bez przeciągania podczas animacji** (`AtlasMap.tsx:358`: `if (isAnimatingRef.current && !isDragging) return;`). Kółko i klawisze w trakcie animacji kamery są ignorowane (MapLibre emituje `move` z `originalEvent` typu `wheel`). To skok-lub-nic: zoom kółkiem „klei się” do animacji lub jest zgubiony, potem stan Reacta nadpisuje kamerę MapLibre (kontrolowany `viewState`, `:349`).
4. **Kontrolowany `viewState`** (`{...currentViewState}`, `AtlasMap.tsx:349`): react-map-gl 8 przy każdym renderze wywołuje `jumpTo`/ustawia kamerę z propsów; to kasuje ewentualną trwającą animację MapLibre (`easeTo`), więc samo dołożenie `easeTo` bez zmiany architektury sterowania nie zadziała.
5. **Reduced-motion**: kamera ma `duration 0` (`camera.ts:31-33`), ale kółko/pinch MapLibre nadal się wygładzają (to wbudowane `scrollZoom`, nie nasz kod); `essential:false` w MapLibre dotyczy tylko `easeTo/flyTo` (INSPIRACJE.md, wpis MapLibre – kamera).
6. **Powiaty / kolory**: `reveal` liczy się w osobnym rAF (`useChoropleth.ts:118-136`) i każda klatka zmienia `reveal.progress`, które jest w `updateTriggers.getFillColor` (`choropleth.ts:164-167`) razem z `transitions.getFillColor: 300 ms` (`:110`). Efekt: deck.gl co klatkę **restartuje** 300 ms przejście koloru → kolory dojeżdżają do wartości docelowej dopiero ~300 ms po końcu reveal (900 ms), a ze względu na restart wyglądają na skokowe/migające. To hipoteza z kodu; wymaga potwierdzenia w QC405 (np. screenshoty co 50 ms).
7. Drobne: `useChoropleth.ts:71` odpytuje URL co 100 ms (`setInterval`) i przy każdej zmianie `setSelectedTeryt` – dodatkowe rendery podczas ruchu.

## 3. Rekomendacje
**Kolejność: QC402 → QC403 → QC404 → QC405** (QC402 i QC403 zależą od tej samej decyzji R0).

**R0 (wspólne, decyzja architektoniczna dla QC402).** Nie przepisywać na `easeTo` w ciemno (punkt 4). Dwie drogi: (A) zostać przy kontrolowanym `viewState` i animować własnym rAF, ale **przepuszczać `onMove` z `originalEvent`** (przerwać animację i przejąć ruch użytkownika – `markUserMoved()` już to robi); (B) przejść na niekontrolowaną mapę (`initialViewState`) i sterować `mapRef.easeTo`, z `essential:false`. Zalecam A (mniejsza zmiana, istniejące testy `camera.spec.ts`/`map-zoom-out.spec.ts` dalej pasują).

**QC402 – kółko/pinch.** (1) W `onMove` usunąć warunek `isAnimatingRef && !isDragging` (`AtlasMap.tsx:358`) – zamiast tego dowolny `originalEvent` przerywa animację. (2) Dodać test e2e: kółko ×3 w trakcie animacji kamery daje zoom rosnący, nie stały. (3) Reduced-motion: ustawić `scrollZoom`/`touchZoomRotate` bez wygładzania (opcja `smooth`?) – sprawdzić w dokumentacji MapLibre `ScrollZoomHandler`; jeśli niemożliwe, zostawić. Ryzyko: nie ignorować `onMove` bez przeciągania (kółko!) – to dokładnie ten błąd.

**QC403 – `+`/`-`.** Zamiast `setCurrentViewState` (`useMapViewState.ts:374-385`) wywołać `animateToView({...prev, zoom: ±0,5}, 'in'|'out')` z czasem z tokenów (`cameraIn/Out`); przy reduced-motion `cameraTransition` już zwraca 0. Ryzyko: szybkie wielokrotne naciśnięcia – celem animacji liczyć od **bieżącego celu**, nie od `currentViewStateRef`, inaczej zoom „gubi” kroki. Strzałki zostawić bez animacji (pan).

**QC404 – wejście w głąb / powrót.** Ścieżka (`updateViewStateForBbox`) już animuje; problemy: (a) miejscowość natychmiast (`AtlasMap.tsx:111-114`, `useMapViewState.ts:294-305`) – użyć `animateToView(target,'in')` zamiast skoku, (b) próg `0,05` zoom do `instant` (`:263-268`) pomija małe ruchy, (c) `frameProgress` (`:221`) – zastąpić wyłącznie czasem, a minimalną liczbę klatek zostawić testom. Ryzyko: nie zmieniać `localityTargetRef`/`measure()` równolegle – to wyścig z `fittedKeyRef`.

**QC405 – kafelki i kolory.** Usunąć `reveal.progress`/`running` z `updateTriggers.getFillColor` albo wyłączyć `transitions` na czas reveal (`choropleth.ts:110,164-167`); przejście koloru niech robi tylko deck.gl (zmiana wskaźnika), a reveal — własny `opacity`/próg (`delay`). Dodać test jednostkowy planu reveal (`reveal.ts` już ma) + e2e `@S` na `reveal.progress` > 3 unikalnych wartości. Ryzyko: deck.gl nie pokaże przejścia, jeśli `updateTriggers` się zmienia co klatkę.

**Zalecenie ogólne:** po QC402–404 zmierzyć ponownie na CI-podglądzie w tej samej metodzie; jeśli klatek jest nadal mało, zredukować koszt klatki (nie przebudowywać warstw przy każdym `setCurrentViewState` – `AtlasMap.tsx:227-242`).

## 4. Dodatek – skrypt pomiarowy (poza repozytorium)
Uruchomienie: `pnpm build && pnpm exec vite preview --port 4173 &`, potem `NODE_PATH=<repo>/node_modules node measure.cjs [reduced]` (Chromium: `/opt/pw-browsers/chromium`).
```js
// Jednorazowy pomiar ruchu mapy (QC401). Uruchom: NODE_PATH=<repo>/node_modules node measure.cjs [reduced]
const { chromium } = require('playwright');
const REDUCED = process.argv[2] === 'reduced';
const URL = 'http://localhost:4173/';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function open(browser, qs = '?e2e') {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, hasTouch: true, reducedMotion: REDUCED ? 'reduce' : 'no-preference' });
  const page = await ctx.newPage();
  await page.goto(URL + qs);
  await page.waitForFunction(() => window.__atlas?.ready === true);
  await page.waitForFunction(() => window.__atlas?.choropleth != null);
  await sleep(1500);
  await page.evaluate(() => {
    window.__samples = [];
    const t0 = performance.now();
    window.__t0 = t0;
    const tick = () => {
      const a = window.__atlas, v = a.viewState;
      window.__samples.push([Math.round(performance.now() - t0), v.zoom, v.longitude, v.latitude, a.reveal?.progress ?? 1, a.camera?.animating ? 1 : 0, a.camera?.trace?.length ?? 0]);
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
  return { ctx, page };
}

function analyse(samples, since) {
  const s = samples.filter((r) => r[0] >= since);
  const key = (r) => `${r[1].toFixed(4)}|${r[2].toFixed(4)}|${r[3].toFixed(4)}`;
  const cam = []; let last = null;
  for (const r of s) { const k = key(r); if (k !== last) { cam.push(r); last = k; } }
  const zooms = new Set(s.map((r) => r[1].toFixed(4)));
  const prog = new Set(s.map((r) => r[4].toFixed(3)));
  const camMs = cam.length > 2 ? cam[cam.length - 1][0] - cam[1][0] : 0;
  const rev = s.filter((r) => r[4] < 1 && r[4] > 0);
  const revMs = rev.length ? rev[rev.length - 1][0] - rev[0][0] : 0;
  return { camFrames: Math.max(0, cam.length - 1), traceLen: s.length ? s[s.length - 1][6] : 0, rafFrames: s.length, uniqueZoom: zooms.size - 1, camMs, uniqueProgress: prog.size, revealMs: revMs,
    dz: s.length ? +(s[s.length - 1][1] - s[0][1]).toFixed(2) : 0 };
}

async function run(browser, name, qs, setup, action, settle = 2500) {
  const out = [];
  for (let i = 0; i < 3; i++) {
    const { ctx, page } = await open(browser, qs);
    if (setup) { await setup(page); await sleep(2500); }
    const since = await page.evaluate(() => performance.now() - window.__t0);
    try { await action(page); } catch (e) { out.push({ error: String(e).slice(0, 80) }); await ctx.close(); continue; }
    await sleep(settle);
    const samples = await page.evaluate(() => window.__samples);
    out.push(analyse(samples, since));
    await ctx.close();
  }
  const med = (k) => { const v = out.map((o) => o[k]).filter((x) => x !== undefined).sort((a, b) => a - b); return v[Math.floor(v.length / 2)]; };
  console.log(JSON.stringify({ name, reduced: REDUCED, runs: out.length, camFrames: med('camFrames'), uniqueZoom: med('uniqueZoom'), camMs: med('camMs'), traceLen: med('traceLen'), rafFrames: med('rafFrames'), uniqueProgress: med('uniqueProgress'), revealMs: med('revealMs'), dz: med('dz'), raw: out.map((o) => o.error ?? `${o.camFrames}/${o.camMs}ms/dz${o.dz}`) }));
}

const centre = { x: 800, y: 450 };
const searchPick = (q) => async (page) => {
  await page.keyboard.press('Control+k');
  const inp = page.locator('div[role="dialog"] input[placeholder="Gmina, powiat albo miejscowość"]');
  await inp.fill(q);
  await page.locator('div[role="dialog"] [cmdk-item]').first().waitFor();
  await page.keyboard.press('Enter');
};

(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--no-sandbox'] });
  const gl = await (async () => { const { ctx, page } = await open(browser); const r = await page.evaluate(() => { const c = document.createElement('canvas'); const g = c.getContext('webgl2'); const e = g?.getExtension('WEBGL_debug_renderer_info'); return g ? g.getParameter(e ? e.UNMASKED_RENDERER_WEBGL : g.RENDERER) : 'brak WebGL'; });
    const fps = await page.evaluate(() => new Promise((res) => { let n = 0; const t = performance.now(); const f = () => { n++; if (performance.now() - t < 1000) requestAnimationFrame(f); else res(n); }; requestAnimationFrame(f); }));
    await ctx.close(); return { renderer: r, rafPerSec: fps }; })();
  console.log(JSON.stringify({ webgl: gl, reduced: REDUCED }));

  await run(browser, 'a_klik_wojewodztwo', '?e2e', null, async (p) => { await p.mouse.move(centre.x, centre.y); await p.mouse.click(centre.x, centre.y); });
  await run(browser, 'b_kolko_x3', '?e2e', null, async (p) => { await p.mouse.move(centre.x, centre.y); for (let i = 0; i < 3; i++) { await p.mouse.wheel(0, -100); await sleep(120); } });
  await run(browser, 'c_pinch', '?e2e', null, async (p) => {
    const c = await p.context().newCDPSession(p);
    const pts = (d) => [{ x: centre.x - d, y: centre.y, id: 1 }, { x: centre.x + d, y: centre.y, id: 2 }];
    await c.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: pts(40) });
    for (let d = 40; d <= 160; d += 8) { await c.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: pts(d) }); await sleep(16); }
    await c.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  });
  await run(browser, 'd_klawisz_plus', '?e2e', null, async (p) => { await p.locator('[aria-label="Mapa Polski"]').focus().catch(() => {}); await p.keyboard.press('+'); });
  await run(browser, 'd_klawisz_minus', '?e2e', async (p) => { await p.evaluate(() => 0); }, async (p) => { await p.locator('[aria-label="Mapa Polski"]').focus().catch(() => {}); await p.keyboard.press('-'); });
  await run(browser, 'e_okruszki_Polska', '?u=12&e2e', null, async (p) => { await p.locator('nav[aria-label="Ścieżka"] ol li button').first().click(); });
  await run(browser, 'f_wroc', '?u=12&e2e', null, async (p) => { await p.locator('button', { hasText: 'Wróć' }).first().click(); });
  await run(browser, 'g_wyszukiwarka_woj', '?e2e', null, searchPick('małopolskie'));
  await run(browser, 'g2_wyszukiwarka_miejscowosc', '?e2e', null, searchPick('Wieliczka'), 4000);
  await run(browser, 'h_zmiana_wskaznika', '?e2e', null, async (p) => { await p.getByRole('button', { name: /^Wskaźnik/ }).click(); await p.getByRole('option', { name: /Stopa bezrobocia rejestrowanego/ }).click(); });
  await run(browser, 'i_wejscie_w_powiaty', '?e2e', null, async (p) => { await p.getByRole('button', { name: 'Powiaty' }).click(); });
  await browser.close();
})();
```
