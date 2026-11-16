const STATIC_SELECTOR = 'head link[rel="canonical"], head meta[property="og:url"]';
let mounted = 0;
let removedStatic: Element[] = [];

/** Usuwa statyczne duplikaty z index.html: zostaje ostatni tag (ten od Reacta). */
export function dropStaticDuplicates(doc: Document = document) {
  mounted += 1;
  for (const sel of ['head link[rel="canonical"]', 'head meta[property="og:url"]']) {
    const all = Array.from(doc.querySelectorAll(sel));
    for (const el of all.slice(0, -1)) {
      removedStatic.push(el);
      el.remove();
    }
  }
}

/** Przywraca statyczne tagi, gdy żadna podstrona nie jest zamontowana. */
function restoreStatic() {
  if (mounted > 0 || removedStatic.length === 0) return;
  if (document.querySelector(STATIC_SELECTOR)) {
    // React zdążył już usunąć własne tagi lub jeszcze je ma: nie dubluj
    const own = document.querySelectorAll(STATIC_SELECTOR).length;
    if (own > 0) {
      removedStatic = [];
      return;
    }
  }
  for (const el of removedStatic) document.head.appendChild(el);
  removedStatic = [];
}

/** Wywoływane przy odmontowaniu: po chwili (React usuwa własne tagi) przywraca statyczne. */
export function leavePage() {
  mounted -= 1;
  queueMicrotask(restoreStatic);
}
