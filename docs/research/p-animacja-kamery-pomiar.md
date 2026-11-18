# Pomiar ruchu kamery – FIX6 (przed / po)

Narzędzie: `tests/e2e/fix6-camera-metrics.spec.ts` (metoda PF01: dławienie CPU ×4, SwiftShader, 390×844, świeży kontekst na każde uruchomienie, 3 uruchomienia, mediana).
Uruchomienie: `PERF=1 pnpm exec playwright test tests/e2e/fix6-camera-metrics.spec.ts`; progi jako asercje: dodatkowo `FIX6_GATE=1`.

## Maszyna i wersje
- Linux 6.18 x86_64, 4 rdzenie (sesja chmurowa, bez GPU – programowy WebGL).
- Node 22.23.4, Playwright 1.64.1 (chromium), data pomiaru 2026-11-18.
- Stan „przed”: `origin/main` bez zmian w `src/`.

## Progi (§5 `p-animacja-kamery.md`)
p95 ≤ 33 ms · droppedShare < 10% · max ≤ 100 ms · skok zoomu ≤ 0,25 / klatkę.
Pomiar na SwiftShader jest pesymistyczny; rozstrzyga telefon właściciela.

## Wyniki (mediana z 3 uruchomień)
| Scenariusz | klatki | p95 przed [ms] | zgubione przed | max przed [ms] | skok zoomu przed | p95 po | zgubione po | max po | skok zoomu po |
|---|---|---|---|---|---|---|---|---|---|
| wheel×3 | 99 | 366,6 | 12% | 866,7 | 0 (jedno z 3 uruchomień: 0,223) | 716,7 | 19% | 800,0 | 0,959 |
| pinch | 121 | 1833,3 | 24% | 2716,6 | 0,655 | 566,6 | 13% | 733,4 | 1,401 |
| cofnij | 10 | 3699,8 | 50% | 3699,8 | 1,051 | 983,4 | 57% | 983,4 | 0,736 |
| powrot_z_powiatow | 20 | 6233,1 | 45% | 9016,3 | 0 | 1500,0 | 53% | 1500,0 | 0 |
| zoom_do_gminy | 42 | 1716,7 | 83% | 1916,6 | 0,223 | 733,2 | 43% | 833,4 | 0,960 |

Wszystkie scenariusze „przed” przekraczają progi. Kolumny „po” (W2-FIX6G, wszystkie zadania A–F scalone, ta sama metoda): liczby ORIENTACYJNE z SwiftShader z dławieniem CPU ×4, nie z telefonu. Rozstrzygają pomiary z telefonu właściciela.

**Wynik względem progów: niespełnione we wszystkich 5 scenariuszach** (p95 ≤ 33 ms, zgubione < 10%, max ≤ 100 ms, skok ≤ 0,25). Na SwiftShader z ×4 nawet p50 to 16,7 ms, a p95 jest dominowane przez pojedyncze klatki 500–1500 ms (programowe renderowanie WebGL). Poprawa widoczna tylko w części: pinch (p95 1833→567 ms), cofnij (3700→983 ms), zoom_do_gminy (1717→733 ms), powrot_z_powiatow max (9016→1500 ms). wheel×3 wyszło gorzej (p95 367→717 ms) – natywny scrollZoom bez sterownika, rozrzut między uruchomieniami duży. „Skok zoomu” wzrósł, bo przy rzadkich klatkach różnica między sąsiednimi klatkami rośnie sama z siebie.
Reduced motion (ten PR): plan o czasie 0 to jedno `jumpTo`, bez klatek (testy @FIX6G).
Uwaga: „skok zoomu” to największa różnica zoomu między sąsiednimi klatkami; przy rzadkich klatkach (długie odstępy) skok rośnie także z samego braku klatek.
