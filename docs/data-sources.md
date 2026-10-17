# Źródła danych geograficznych i statystycznych

Dokumentacja źródeł danych geometrycznych oraz statystycznych wykorzystywanych w projekcie Faktografia Atlas.

---

## 1. Geometria administracyjna Polski (`public/geo/admin.topo.json`)

Plik zawiera wspólną topologię granic 3 poziomów podziału administracyjnego Polski (województwa, powiaty, gminy) skompilowaną do formatu TopoJSON.

### Metadane źródła
- **Źródło:** [GeoJSON-Polska-Wojewodztwa-Powiaty-Gminy](https://github.com/waszkiewiczja/GeoJSON-Polska-Wojewodztwa-Powiaty-Gminy) (gałąź `main`)
- **Pliki źródłowe:** `wojewodztwa.json`, `powiaty.json`, `gminy.json`
- **Licencja:** Domena publiczna (Public Domain)
- **Data pobrania:** 2026-10-17

### Skrypt generujący
- **Skrypt:** `scripts/geo/build.mjs` (`pnpm geo`)
- **Narzędzie:** `mapshaper` (`applyCommands`)

### Parametry przetworzenia i uproszczenia
- **Mapowanie właściwości:**
  - `woj`: `teryt` (string, 2 cyfry z zerem wiodącym), `name` (nazwa)
  - `pow`: `teryt` (string, 4 cyfry z zerem wiodącym), `name` (nazwa)
  - `gmi`: `teryt` (string, 7 cyfr z zerem wiodącym), `name` (nazwa)
  - Usunięto wszystkie pozostałe właściwości (zostały wyłącznie `teryt` oraz `name`).
- **Algorytm uproszczenia:** Visvalingam weighted z zachowaniem kształtów (`keep-shapes`)
  - Województwa (`woj`): **8%** zachowanych punktów
  - Powiaty (`pow`): **6%** zachowanych punktów
  - Gminy (`gmi`): **5%** zachowanych punktów
- **Topologia:** wspólna topologia dla trzech warstw (`woj`, `pow`, `gmi`)
- **Kwantyzacja:** 1e5 (`quantization=100000`)

### Podsumowanie wyniku
- **Lokalizacja pliku:** `public/geo/admin.topo.json`
- **Rozmiar pliku:** 1 276 774 bajtów (~1,22 MB) — poniżej limitu 3 MB

| Warstwa | Liczba obiektów | Długość TERYT | Właściwości |
|---|---|---|---|
| `woj` | 16 | 2 cyfry (np. `"02"`) | `teryt`, `name` |
| `pow` | 380 | 4 cyfry (np. `"0201"`) | `teryt`, `name` |
| `gmi` | 2479 | 7 cyfr (np. `"0201011"`) | `teryt`, `name` |
