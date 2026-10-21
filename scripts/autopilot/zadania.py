#!/usr/bin/env python3
"""Autopilot (WORKFLOW v3 §10): Issues z paczek, start Julesa, auto-scalanie, CI na main."""
import glob
import json
import os
import re
import subprocess
import sys

WYLACZONY = os.environ.get("AUTOPILOT", "").strip().lower() == "off"
LIMIT = int(os.environ.get("LIMIT") or 3)
NAGLOWEK = re.compile(r"^## Zadanie (S(\d+)\.(\d+)) [–-] (.+)$", re.M)
ETYKIETY = {
    "zadanie": "0e8a16", "auto": "1d76db", "widoczne": "fbca04", "jules": "5319e7",
    "sprawdzone": "0e8a16", "nowa-zaleznosc": "d93f0b", "wstrzymane": "b60205",
    "tablica": "000000",
}


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


def pole(blok, nazwa):
    m = re.search(rf"^{nazwa}:\s*(.*)$", blok, re.M)
    return m.group(1).strip() if m else ""


def paczki():
    zadania = []
    for plik in sorted(glob.glob("docs/zadania/S*.md")):
        tekst = open(plik, encoding="utf-8").read()
        trafienia = list(NAGLOWEK.finditer(tekst))
        for i, m in enumerate(trafienia):
            koniec = trafienia[i + 1].start() if i + 1 < len(trafienia) else len(tekst)
            blok = tekst[m.start():koniec].strip()
            zadania.append({
                "id": m.group(1), "sesja": int(m.group(2)), "nr": int(m.group(3)),
                "tytul": m.group(4).strip(), "blok": blok,
                # brak lub niejasna klasa = widoczne (bezpieczniej)
                "klasa": "auto" if pole(blok, "Klasa").lower().startswith("auto") else "widoczne",
                "zalezy": re.findall(r"S\d+\.\d+", pole(blok, "Zależy od")),
            })
    return sorted(zadania, key=lambda z: (z["sesja"], z["nr"]))


def issues():
    wynik = {}
    for i in gh_json("issue", "list", "--label", "zadanie", "--state", "all", "--limit", "500",
                     "--json", "number,title,state,labels"):
        m = re.match(r"(S\d+\.\d+) ", i["title"])
        if m:
            wynik[m.group(1)] = {"nr": i["number"], "otwarte": i["state"] == "OPEN",
                                 "etykiety": {e["name"] for e in i["labels"]}}
    return wynik


def utworz_brakujace(zadania, istn):
    brak = [z for z in zadania if z["id"] not in istn]
    if not brak:
        return
    jest = {e["name"] for e in gh_json("label", "list", "--limit", "300", "--json", "name")}
    potrzebne = dict(ETYKIETY)
    potrzebne.update({f"sesja-S{z['sesja']}": "c5def5" for z in brak})
    for nazwa, kolor in potrzebne.items():
        if nazwa not in jest:
            gh("label", "create", nazwa, "--color", kolor, "--force")
    for z in brak:
        tresc = z["blok"] + "\n\n---\n_Utworzone przez Autopilota z paczki. Zmiana zadania = zmiana paczki albo ręczna edycja tego Issue._"
        r = gh("issue", "create", "--title", f"{z['id']} – {z['tytul']}", "--body", tresc,
               "--label", "zadanie", "--label", z["klasa"], "--label", f"sesja-S{z['sesja']}")
        if r.returncode == 0:
            nr = int(r.stdout.strip().rstrip("/").rsplit("/", 1)[-1])
            istn[z["id"]] = {"nr": nr, "otwarte": True, "etykiety": {"zadanie", z["klasa"]}}
            print("Utworzono Issue", z["id"], f"#{nr}")


def startuj_julesa(zadania, istn):
    if WYLACZONY:
        print("AUTOPILOT=off – nie startuję zadań")
        return
    otwarte = [z for z in zadania if istn.get(z["id"], {}).get("otwarte")]
    if not otwarte:
        return
    biezaca = min(z["sesja"] for z in otwarte)
    w_toku = sum(1 for v in istn.values() if v["otwarte"] and "jules" in v["etykiety"])
    for z in otwarte:
        if w_toku >= LIMIT:
            break
        i = istn[z["id"]]
        if z["sesja"] != biezaca or {"jules", "wstrzymane"} & i["etykiety"]:
            continue
        # zależność bez Issue traktujemy jak otwartą (blokuje)
        if any(istn.get(d, {"otwarte": True})["otwarte"] for d in z["zalezy"]):
            continue
        if gh("issue", "edit", str(i["nr"]), "--add-label", "jules").returncode == 0:
            i["etykiety"].add("jules")
            w_toku += 1
            print("Start Julesa:", z["id"], f"#{i['nr']}")


def auto_scalanie(istn):
    if WYLACZONY:
        return
    auto = {v["nr"] for v in istn.values() if v["otwarte"] and "auto" in v["etykiety"]}
    for p in gh_json("pr", "list", "--state", "open", "--limit", "50",
                     "--json", "number,isDraft,autoMergeRequest,closingIssuesReferences"):
        if p["isDraft"] or p["autoMergeRequest"]:
            continue
        zamyka = {i["number"] for i in (p.get("closingIssuesReferences") or [])}
        if not zamyka or not zamyka <= auto:
            continue
        nr = str(p["number"])
        if gh("pr", "merge", nr, "--auto", "--squash", "--delete-branch").returncode == 0:
            print("Auto-scalanie włączone: PR", nr)
        else:
            # PR już gotowy (np. wszystko zielone) – zwykłe scalenie; reguły gałęzi i tak
            # odrzucą je, jeśli wymagane sprawdzenia nie przeszły.
            if gh("pr", "merge", nr, "--squash", "--delete-branch").returncode == 0:
                print("Scalono PR", nr)


def ci_na_main():
    """Scalenie wykonane przez automat nie uruchamia CI – uruchamiamy je jawnie."""
    sha = gh("api", f"repos/{os.environ['GH_REPO']}/commits/main", "-q", ".sha").stdout.strip()
    if not sha:
        return
    if not gh_json("run", "list", "--workflow", "ci.yml", "--commit", sha, "--json", "databaseId"):
        gh("workflow", "run", "ci.yml", "--ref", "main")
        print("Uruchomiono CI na main dla", sha[:7])


if __name__ == "__main__":
    zad = paczki()
    istn = issues()
    utworz_brakujace(zad, istn)
    startuj_julesa(zad, istn)
    auto_scalanie(istn)
    ci_na_main()
