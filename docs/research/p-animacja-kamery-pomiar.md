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
| wheel×3 | 99 | 366,6 | 12% | 866,7 | 0 (jedno z 3 uruchomień: 0,223) | | | | |
| pinch | 121 | 1833,3 | 24% | 2716,6 | 0,655 | | | | |
| cofnij | 10 | 3699,8 | 50% | 3699,8 | 1,051 | | | | |
| powrot_z_powiatow | 20 | 6233,1 | 45% | 9016,3 | 0 | | | | |
| zoom_do_gminy | 42 | 1716,7 | 83% | 1916,6 | 0,223 | | | | |

Wszystkie scenariusze „przed” przekraczają progi. Kolumny „po” uzupełnia zadanie W2-FIX6G.
Uwaga: „skok zoomu” to największa różnica zoomu między sąsiednimi klatkami; przy rzadkich klatkach (długie odstępy) skok rośnie także z samego braku klatek.
