"""Liste les montants balisés par le shortcode {{< tarif >}} dans content/.

Usage :
    python -X utf8 tools/lister_tarifs.py [--csv sortie.csv]

Les occurrences avec ref="slug" sont résolues depuis data/tarifs.yaml.
Les occurrences sans ref restent signalées comme « historiques » : elles
doivent être migrées une fois l'onglet Tarifs du classeur complété.
"""

from __future__ import annotations

import argparse
import csv
import re
from pathlib import Path

import yaml

RACINE = Path(__file__).resolve().parent.parent
CONTENU = RACINE / "content"
DONNEES = RACINE / "data" / "tarifs.yaml"

MOTIF = re.compile(
    r"\{\{<\s*tarif(?P<args>[^>]*?)\s*(?P<self>/?)>\}\}"
    r"(?:(?P<valeur>.*?)\{\{<\s*/tarif\s*>\}\})?",
    re.DOTALL,
)
REF = re.compile(r'ref="(?P<ref>[^"]+)"')
ANNEE = re.compile(r'annee="(?P<annee>\d{4})"')


def charger_tarifs() -> dict:
    if not DONNEES.exists():
        return {}
    return yaml.safe_load(DONNEES.read_text(encoding="utf-8")) or {}


def lignes() -> list[dict[str, str]]:
    tarifs = charger_tarifs()
    resultats: list[dict[str, str]] = []
    for fichier in sorted(CONTENU.rglob("*.md")):
        texte = fichier.read_text(encoding="utf-8")
        for correspondance in MOTIF.finditer(texte):
            args = correspondance.group("args")
            ref = REF.search(args)
            annee = ANNEE.search(args)
            valeur = " ".join((correspondance.group("valeur") or "").split())
            ligne = texte.count("\n", 0, correspondance.start()) + 1
            cle = ref.group("ref") if ref else ""
            if cle:
                rentree = tarifs.get(cle)
                affichage = rentree["affichage"] if rentree else "REF INCONNUE"
                source = "data"
            else:
                affichage = valeur
                source = "historique"
            resultats.append(
                {
                    "fichier": str(fichier.relative_to(RACINE)).replace("\\", "/"),
                    "ligne": str(ligne),
                    "ref": cle,
                    "annee": annee.group("annee") if annee else "",
                    "affichage": affichage,
                    "source": source,
                }
            )
    return resultats


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--csv", help="écrit le résultat dans un fichier CSV")
    args = parser.parse_args()

    resultats = lignes()
    champs = ["fichier", "ligne", "ref", "annee", "affichage", "source"]
    if args.csv:
        with open(args.csv, "w", newline="", encoding="utf-8-sig") as flux:
            ecrivain = csv.DictWriter(flux, fieldnames=champs)
            ecrivain.writeheader()
            ecrivain.writerows(resultats)
        print(f"{len(resultats)} tarif(s) écrit(s) dans {args.csv}")
        return

    for r in resultats:
        ref = f" [{r['ref']}]" if r["ref"] else ""
        print(f"{r['fichier']}:{r['ligne']}  {r['affichage']}{ref} ({r['source']})")

    refs = sum(1 for r in resultats if r["source"] == "data")
    inconnus = sum(1 for r in resultats if r["affichage"] == "REF INCONNUE")
    print(
        f"\n{len(resultats)} tarif(s) recensé(s) : {refs} via data, "
        f"{len(resultats) - refs} historique(s), {inconnus} ref(s) inconnue(s)."
    )


if __name__ == "__main__":
    main()
