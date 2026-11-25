// Progi legendy przy „długim ogonie”: gdy kilka skrajnych wartości mocno odstaje, czyste kwantyle
// dają ostatnią klasę od progu aż do rekordzisty (np. „powyżej 8 600” łączy 8 700 i 14 874).
// Wtedy górne (lub dolne) klasy dzielimy naturalnymi przerwami (Jenks), a dolne zostają kwantylami.
// Czysta logika, bez importów z calibrate.ts i classes.ts (unikamy cyklu importów).

/** Ułamek zakresu wartości, powyżej którego skrajna klasa uchodzi za „rozciągniętą”. */
export const TAIL_SPAN = 0.35;

/** Najmniejsza skrajna klasa po podziale: ułamek jednostek (min. 1 jednostka). */
export const TAIL_MIN_SHARE = 0.005;

/**
 * Naturalne przerwy (Jenks) dla posortowanych wartości: k klas, każda ma co najmniej `minCount`
 * jednostek. Zwraca k − 1 progów (pierwsza wartość każdej klasy poza pierwszą). Dokładne DP, O(k·n²).
 */
export function jenksBreaks(sorted: number[], k: number, minCount: number): number[] {
  const n = sorted.length;
  if (k < 2 || n < k * minCount) return [];
  const pre = [0];
  const pre2 = [0];
  for (const v of sorted) {
    pre.push(pre[pre.length - 1] + v);
    pre2.push(pre2[pre2.length - 1] + v * v);
  }
  // Suma kwadratów odchyleń dla sorted[a..b) – miara rozrzutu jednej klasy.
  const cost = (a: number, b: number) => {
    const s = pre[b] - pre[a];
    return pre2[b] - pre2[a] - (s * s) / (b - a);
  };
  const best: number[][] = [];
  const from: number[][] = [];
  for (let c = 0; c < k; c++) {
    best.push(new Array<number>(n + 1).fill(Infinity));
    from.push(new Array<number>(n + 1).fill(0));
  }
  for (let j = minCount; j <= n; j++) best[0][j] = cost(0, j);
  for (let c = 1; c < k; c++) {
    for (let j = (c + 1) * minCount; j <= n; j++) {
      for (let m = c * minCount; m <= j - minCount; m++) {
        const total = best[c - 1][m] + cost(m, j);
        if (total < best[c][j]) {
          best[c][j] = total;
          from[c][j] = m;
        }
      }
    }
  }
  const starts: number[] = [];
  let end = n;
  for (let c = k - 1; c >= 1; c--) {
    end = from[c][end];
    starts.unshift(sorted[end]);
  }
  return starts;
}

/** Usuwa powtórzone progi i progi nie większe od minimum (jak cleanBreaks w calibrate.ts). */
function strictlyAbove(breaks: number[], min: number): number[] {
  const out: number[] = [];
  for (const b of breaks) if (b > min && (out.length === 0 || b > out[out.length - 1])) out.push(b);
  return out;
}

/** Miary dopasowania legendy do danych: jaką część zakresu i jednostek zajmują skrajne klasy. */
export function legendFit(values: number[], breaks: number[]) {
  const sorted = values.filter((v) => Number.isFinite(v)).sort((a, b) => a - b);
  if (sorted.length === 0 || breaks.length === 0) {
    return { topSpan: 0, topShare: 0, bottomSpan: 0, bottomShare: 0 };
  }
  const min = sorted[0];
  const max = sorted[sorted.length - 1];
  const range = max - min || 1;
  const first = breaks[0];
  const last = breaks[breaks.length - 1];
  return {
    topSpan: (max - last) / range,
    topShare: sorted.filter((v) => v >= last).length / sorted.length,
    bottomSpan: (first - min) / range,
    bottomShare: sorted.filter((v) => v < first).length / sorted.length,
  };
}

/** Skrajna klasa jest „uczciwa”: wąska w wartościach albo licząca tylko garstkę jednostek. */
export const TAIL_MAX_SHARE = 0.03;

/** Czy skrajna klasa (górna, a po odbiciu dolna) jest uczciwa wobec danych. */
export function isTailFair(span: number, share: number): boolean {
  return span <= TAIL_SPAN || share <= TAIL_MAX_SHARE;
}

/**
 * Gdy skrajna klasa kwantylowa jest rozciągnięta (ogon), przelicza progi tej strony:
 * zostaje jak najwięcej progów kwantylowych (równoliczne klasy), a resztę ogona dzielą naturalne
 * przerwy. Bierze najmniejszą zmianę, po której skrajna klasa jest uczciwa (isTailFair).
 * Liczba klas bez zmian.
 */
export function reshapeTail(valid: number[], breaks: number[]): number[] {
  // Dwa przebiegi: pierwszy poprawia gorszą stronę, drugi ewentualnie drugą (skrajne klasy się nie nakładają).
  return reshapeSide(valid, reshapeSide(valid, breaks));
}

function reshapeSide(valid: number[], breaks: number[]): number[] {
  if (breaks.length < 3 || valid.length === 0) return breaks;
  const fit = legendFit(valid, breaks);
  const stretched = (f: typeof fit) =>
    !isTailFair(f.topSpan, f.topShare) || !isTailFair(f.bottomSpan, f.bottomShare);
  if (!stretched(fit)) return breaks;
  // Rozciągnięty dół liczymy jak górę po odbiciu liczb (−x), żeby mieć jeden kod.
  const mirror = fit.bottomSpan > fit.topSpan;
  const neg = (v: number) => 0 - v;
  const sorted = [...valid].sort((a, b) => a - b);
  const s = mirror ? sorted.map(neg).reverse() : sorted;
  const b = mirror ? [...breaks].reverse().map(neg) : breaks;
  const minCount = Math.max(1, Math.floor(s.length * TAIL_MIN_SHARE));
  let result = breaks;
  for (let keep = b.length - 1; keep >= 1; keep--) {
    const head = b.slice(0, keep);
    const tail = s.filter((v) => v >= head[keep - 1]);
    const split = jenksBreaks(tail, b.length - keep + 1, minCount);
    const out = strictlyAbove([...head, ...split], s[0]);
    if (out.length !== b.length) continue;
    // Po odbiciu próg to największa wartość klasy; w oryginale klasa zaczyna się od „>= próg”,
    // więc próg musi być najmniejszą wartością wyższej klasy (inaczej pierwsza klasa byłaby pusta).
    const up = (x: number) => sorted.find((v) => v > x) ?? x;
    result = mirror
      ? [...out.slice(0, keep).map(neg), ...out.slice(keep).map((v) => up(neg(v)))].reverse()
      : out;
    const f = legendFit(valid, result);
    if (mirror ? isTailFair(f.bottomSpan, f.bottomShare) : isTailFair(f.topSpan, f.topShare)) break;
  }
  return result;
}
