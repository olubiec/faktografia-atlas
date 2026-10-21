#!/usr/bin/env python3
"""Tablica (przypięte Issue) i out/KONTEKST.md (WORKFLOW v3 §7, §11)."""
import datetime
import glob
import hashlib
import json
import os
import re
import subprocess
import sys
from fnmatch import fnmatch

REPO = os.environ["GH_REPO"]
RAW = f"https://raw.githubusercontent.com/{REPO}/main"
WYLACZONY = os.environ.get("AUTOPILOT", "").strip().lower() == "off"
BLOKADY = re.compile(r"(^|/)(pnpm-lock\.yaml|package-lock\.json|yarn\.lock|requirements[^/]*\.txt|poetry\.lock|uv\.lock)$")
ZLE = {"FAILURE", "ERROR", "TIMED_OUT", "ACTION_REQUIRED", "STARTUP_FAILURE"}
OK = {"SUCCESS", "NEUTRAL", "SKIPPED"}


def gh(*args):
    r = subprocess.run(["gh", *args], capture_output=True, text=True)
    if r.returncode != 0:
        print(f"[gh {' '.join(args[:3])}] {r.stderr.strip()}", file=sys.stderr)
    return r


def gh_json(*args):
    r = gh(*args)
    try:
        return json.loads(r.stdout) if r.returncode == 0 and r.stdout.strip() else []
    except json.JSONDecodeError:
        return []


def czytaj(sciezka):
    try:
        return open(sciezka, encoding="utf-8").read()
    except FileNotFoundError:
        return ""


def sekcja(tekst, tytul):
    m = re.search(rf"^## {tytul}\s*\n(.*?)(?=^## |\Z)", tekst, re.M | re.S)
    return m.group(1).strip() if m else ""


def kontrole(pr):
    """Zwraca (nieudane, w_toku) – nazwy kontroli."""
    zle, czeka = [], []
    for c in pr.get("statusCheckRollup") or []:
        nazwa = c.get("name") or c.get("context") or "?"
        wynik = (c.get("conclusion") or c.get("state") or "").upper()
        if wynik in ZLE:
            zle.append(nazwa)
        elif wynik not in OK:
            czeka.append(nazwa)
    return zle, czeka


def main():
    wzory = [w.strip() for w in czytaj(".github/krytyczne.txt").splitlines()
             if w.strip() and not w.strip().startswith("#")]
    zad = gh_json("issue", "list", "--label", "zadanie", "--state", "all", "--limit", "500",
                  "--json", "number,title,state,labels")
    auto_issues = {i["number"] for i in zad if any(e["name"] == "auto" for e in i["labels"])}
    prs = gh_json("pr", "list", "--state", "open", "--limit", "50", "--json",
                  "number,title,url,headRefName,labels,isDraft,statusCheckRollup,closingIssuesReferences,author")

    co_dalej, lista_pr = [], []
    main_ci = gh_json("run", "list", "--workflow", "ci.yml", "--branch", "main", "--limit", "1",
                      "--json", "conclusion,url")
    if main_ci and main_ci[0].get("conclusion") == "failure":
        co_dalej.append(f"🔴 `main` jest czerwony ({main_ci[0]['url']}) → AUTOPILOT=off, „Revert” ostatniego PR, Claude: TRYB: AWARIA")

    sprawdz, audyt, zgoda, awaria = [], [], [], []
    for p in prs:
        nr = p["number"]
        ety = {e["name"] for e in p["labels"]}
        pliki = gh("pr", "diff", str(nr), "--name-only").stdout.split()
        kryt = any(fnmatch(f, w) for f in pliki for w in wzory)
        zalez = any(BLOKADY.search(f) for f in pliki) and "dependabot" not in p["author"]["login"]
        zamyka = {i["number"] for i in (p.get("closingIssuesReferences") or [])}
        auto = bool(zamyka) and zamyka <= auto_issues
        zle, czeka = kontrole(p)
        inne_zle = [z for z in zle if z != "zgody"]
        if inne_zle:
            ci = "❌"
        elif czeka:
            ci = "⏳"
        else:
            ci = "✅" if not zle else "✅ (brak zgody)"
        lista_pr.append(f"- #{nr} {p['title']} — CI {ci} · {'auto' if auto else 'widoczne'}"
                        f"{' · krytyczne' if kryt else ''}{' · szkic' if p['isDraft'] else ''}")
        if p["isDraft"]:
            continue
        if inne_zle:
            proby = gh_json("run", "list", "--branch", p["headRefName"], "--workflow", "ci.yml",
                            "--status", "failure", "--limit", "20", "--json", "databaseId")
            if len(proby) >= 3:
                awaria.append(f"#{nr}")
            continue
        if czeka:
            continue
        if kryt and "sprawdzone" not in ety:
            audyt.append(str(nr))
        if zalez and "nowa-zaleznosc" not in ety:
            zgoda.append(f"#{nr}")
        if not auto and not (kryt and "sprawdzone" not in ety) and not (zalez and "nowa-zaleznosc" not in ety):
            sprawdz.append(f"#{nr}")

    if awaria:
        co_dalej.append(f"🆘 Jules nie naprawił CI po 2 próbach: {', '.join(awaria)} → Claude (Sonnet): TRYB: AWARIA + link do PR")
    if sprawdz:
        co_dalej.append(f"👀 Obejrzyj podgląd i scal (lista §16.12): {', '.join(sprawdz)}")
    if audyt:
        co_dalej.append(f"🔍 Audytor – Claude Code: `/audyt-pr {' '.join(audyt)}`")
    if zgoda:
        co_dalej.append(f"📦 Nowy pakiet – zdecyduj (etykieta nowa-zaleznosc albo komentarz do Julesa): {', '.join(zgoda)}")

    # postęp sesji
    otwarte = [i for i in zad if i["state"] == "OPEN"]
    sesje = sorted({int(m.group(1)) for i in zad if (m := re.match(r"S(\d+)\.", i["title"]))})
    if otwarte:
        biezaca = min(int(re.match(r"S(\d+)\.", i["title"]).group(1)) for i in otwarte
                      if re.match(r"S(\d+)\.", i["title"]))
    else:
        biezaca = sesje[-1] if sesje else None
    postep = ""
    if biezaca is not None:
        wszystkie = [i for i in zad if i["title"].startswith(f"S{biezaca}.")]
        zamkn = sum(1 for i in wszystkie if i["state"] == "CLOSED")
        u_julesa = sum(1 for i in wszystkie if i["state"] == "OPEN" and any(e["name"] == "jules" for e in i["labels"]))
        postep = f"Sesja S{biezaca}: {zamkn}/{len(wszystkie)} zamkniętych · u Julesa: {u_julesa}"
        pr_sesji = [p for p in prs if p["title"].startswith(f"S{biezaca}.")]
        pr_raportu = [p for p in prs if p["title"].startswith(f"Raport S{biezaca}")]
        if wszystkie and zamkn == len(wszystkie) and not pr_sesji:
            if pr_raportu:
                co_dalej.append(f"📄 Scal PR z raportem: #{pr_raportu[0]['number']}")
            elif os.path.exists(f"docs/raporty/S{biezaca}.md"):
                co_dalej.append(f"🏁 Raport S{biezaca} jest → Claude (Opus, nowy czat): TRYB: ZAMKNIJ SESJĘ + link KONTEKST")
            else:
                co_dalej.append(f"🏁 Sesja S{biezaca} gotowa → Claude Code: `/audyt-sesji S{biezaca}`")
    elif not prs:
        co_dalej.append("📝 Brak zadań → Claude (Opus): TRYB: PLAN – pierwsza sesja")
    if not co_dalej:
        co_dalej.append("☕ Nic dla Ciebie – Jules i automaty pracują")
    if WYLACZONY:
        co_dalej.insert(0, "⛔ AUTOPILOT=off – zadania nie startują same")

    nastepny = sekcja(czytaj("docs/STAN.md"), "Następny krok") or "—"
    rdzen = "\n".join([
        "## ➡️ Co dalej", *[f"{n}. {t}" for n, t in enumerate(co_dalej, 1)], "",
        "## 🔧 Otwarte PR", *(lista_pr or ["- brak"]), "",
        f"## 📦 {postep or 'Brak sesji'}", "",
        "## 📝 Następny krok wg STAN.md", nastepny,
    ])
    odcisk = hashlib.sha1("\n".join(co_dalej).encode()).hexdigest()[:12]
    teraz = datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
    tresc = f"{rdzen}\n\n<sub>Aktualizacja automatyczna · {teraz}</sub>\n<!-- co-dalej:{odcisk} -->"

    tab = gh_json("issue", "list", "--label", "tablica", "--state", "open", "--limit", "1",
                  "--json", "number,body,url")
    if not tab:
        gh("label", "create", "tablica", "--color", "000000", "--force")
        r = gh("issue", "create", "--title", "📋 Tablica", "--label", "tablica", "--body", tresc)
        url = r.stdout.strip()
        if url:
            gh("issue", "pin", url)
    else:
        url = tab[0]["url"]
        stara = tab[0]["body"] or ""
        if stara.split("\n\n<sub>")[0] != rdzen:
            gh("issue", "edit", str(tab[0]["number"]), "--body", tresc)
        if f"co-dalej:{odcisk}" not in stara:
            gh("issue", "comment", str(tab[0]["number"]), "--body",
               "**Nowe na Tablicy:**\n" + "\n".join(f"- {t}" for t in co_dalej))

    # KONTEKST.md – bez znacznika czasu, żeby publikować tylko przy realnej zmianie
    sha = os.environ.get("GITHUB_SHA", "")[:7]
    cz = [f"# KONTEKST – {REPO}", f"Stan: commit `{sha}` na main · Tablica: {url}",
          "Kolejność czytania: TABLICA → STAN → PLAN → AGENTS → linki (tylko potrzebne).", "",
          "---", "## TABLICA", rdzen]
    for f in ("docs/STAN.md", "docs/PLAN.md", "AGENTS.md"):
        t = czytaj(f)
        if t:
            cz += ["", "---", f"## PLIK: {f}", t.strip()]
    cz += ["", "---", "## OTWARTE ZADANIA"]
    cz += [f"- #{i['number']} {i['title']}" for i in otwarte] or ["- brak"]
    cz += ["", "## OTWARTE PR"]
    cz += [f"- #{p['number']} {p['title']} {p['url']}" for p in prs] or ["- brak"]
    cz += ["", "---", "## DOKUMENTY (linki do pobrania)"]
    for f in sorted(set(glob.glob("docs/**/*.md", recursive=True)) | {".github/krytyczne.txt"}):
        if os.path.exists(f) and not f.startswith("docs/archiwum/"):
            cz.append(f"- {f}: {RAW}/{f}")
    pomin = re.compile(r"(^|/)(node_modules|dist|docs)/|\.(png|jpe?g|webp|gif|svg|ico|woff2?|ttf)$|(^|/)pnpm-lock\.yaml$")
    pliki = [f for f in subprocess.run(["git", "ls-files"], capture_output=True, text=True).stdout.splitlines()
             if not pomin.search(f)]
    cz += ["", "## PLIKI KODU (link = pobierz tylko, gdy potrzebny)"]
    cz += [f"- {RAW}/{f}" for f in pliki[:250]]
    if len(pliki) > 250:
        cz.append(f"- … i {len(pliki) - 250} innych (pytania o cały kod → Gemini z importem repo)")
    os.makedirs("out", exist_ok=True)
    with open("out/KONTEKST.md", "w", encoding="utf-8") as plik:
        plik.write("\n".join(cz) + "\n")


if __name__ == "__main__":
    main()
