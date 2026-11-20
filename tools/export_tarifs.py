# -*- coding: utf-8 -*-
"""Exporte l'onglet Tarifs du classeur vers data/tarifs.yaml.

Usage :
    python -X utf8 tools/export_tarifs.py [classeur.xlsx] [--out data/tarifs.yaml] [--write]

La feuille doit contenir « Montant » et au moins « Slug » ou « Objet ».
Quand « Slug » est present, il est utilise tel quel ; sinon il est genere depuis « Objet ».
Les autres colonnes (ex. « À traiter ») sont ignorees.
Sans --write, le YAML est affiche sans ecrire le fichier.
"""
from __future__ import annotations

import argparse
import ast
import operator
import re
import sys
from pathlib import Path

import yaml
from openpyxl import load_workbook
from openpyxl.utils import get_column_letter

SITE = Path(__file__).resolve().parents[1]
DEFAULT_XLSX = SITE.parent / "planning-evenements.xlsx"
DEFAULT_OUT = SITE / "data" / "tarifs.yaml"
sys.path.insert(0, str(Path(__file__).resolve().parent))

from import_xlsx import slugify

COLONNES = ("Montant",)


def montant_nombre(valeur: object) -> float:
    if isinstance(valeur, (int, float)):
        return float(valeur)
    texte = str(valeur).strip().replace("\u00a0", " ").replace("€", "").strip()
    texte = texte.replace(" ", "")
    if "," in texte and "." in texte:
        texte = (
            texte.replace(",", "")
            if texte.rfind(".") > texte.rfind(",")
            else texte.replace(".", "").replace(",", ".")
        )
    elif "," in texte:
        texte = texte.replace(",", ".")
    return float(texte)


def montant_affichage(valeur: float) -> str:
    if abs(valeur - round(valeur)) < 1e-9:
        nombre = str(int(round(valeur)))
    else:
        entier, decimal = f"{valeur:.2f}".split(".")
        nombre = f"{entier},{decimal}"
    nombre = re.sub(r"\B(?=(\d{3})+(?!\d))", " ", nombre.split(",")[0]) + (
        "," + nombre.split(",")[1] if "," in nombre else ""
    )
    return f"{nombre} €"


def humaniser_slug(slug: str) -> str:
    return slug.replace("-", " ").capitalize()


OPS = {
    ast.Add: operator.add,
    ast.Sub: operator.sub,
    ast.Mult: operator.mul,
    ast.Div: operator.truediv,
}


def valeur_cellule(feuille_valeurs, feuille_formules, coordonnee: str, pile: frozenset[str] = frozenset()) -> float:
    if coordonnee in pile:
        raise ValueError(f"formule circulaire sur {coordonnee}")
    brut = feuille_valeurs[coordonnee].value
    if brut not in (None, ""):
        return montant_nombre(brut)
    formule = feuille_formules[coordonnee].value
    if not (isinstance(formule, str) and formule.startswith("=")):
        raise ValueError(f"cellule {coordonnee} vide")
    expression = formule[1:].replace(",", ".")
    expression = re.sub(
        r"\b[A-Z]{1,3}\d+\b",
        lambda m: repr(valeur_cellule(feuille_valeurs, feuille_formules, m.group(0), pile | {coordonnee})),
        expression,
    )
    noeud = ast.parse(expression, mode="eval").body

    def calculer(n):
        if isinstance(n, ast.Constant) and isinstance(n.value, (int, float)):
            return n.value
        if isinstance(n, ast.BinOp) and type(n.op) in OPS:
            return OPS[type(n.op)](calculer(n.left), calculer(n.right))
        if isinstance(n, ast.UnaryOp) and isinstance(n.op, (ast.UAdd, ast.USub)):
            resultat = calculer(n.operand)
            return resultat if isinstance(n.op, ast.UAdd) else -resultat
        raise ValueError(f"formule non prise en charge : {formule}")

    return calculer(noeud)


def lire_tarifs(xlsx: Path) -> dict[str, dict[str, object]]:
    wb = load_workbook(xlsx, read_only=True, data_only=True)
    wb_formules = load_workbook(xlsx, read_only=True, data_only=False)
    if "Tarifs" not in wb.sheetnames:
        raise SystemExit("Feuille 'Tarifs' absente du classeur")

    feuille = wb["Tarifs"]
    feuille_formules = wb_formules["Tarifs"]
    entetes = [str(c.value or "").strip() for c in feuille[1]]
    for colonne in COLONNES:
        if colonne not in entetes:
            raise SystemExit(f"Colonne '{colonne}' absente de la feuille Tarifs")
    position_slug = entetes.index("Slug") if "Slug" in entetes else None
    position_objet = entetes.index("Objet") if "Objet" in entetes else None
    if position_slug is None and position_objet is None:
        raise SystemExit("La feuille Tarifs doit contenir 'Slug' ou 'Objet'")

    positions = {nom: entetes.index(nom) for nom in COLONNES}
    resultats: dict[str, dict[str, object]] = {}
    objets: set[str] = set()

    for numero, ligne in enumerate(feuille.iter_rows(min_row=2, values_only=True), start=2):
        brut_objet = ""
        if position_objet is not None and position_objet < len(ligne):
            brut_objet = str(ligne[position_objet] or "").strip()
        brut_slug = ""
        if position_slug is not None and position_slug < len(ligne):
            brut_slug = str(ligne[position_slug] or "").strip()
        if not brut_objet and not brut_slug:
            continue
        objet = re.sub(r"\s+", " ", brut_objet) if brut_objet else humaniser_slug(brut_slug)
        brut = ligne[positions["Montant"]] if positions["Montant"] < len(ligne) else None
        try:
            if brut in (None, ""):
                coordonnee = f"{get_column_letter(positions['Montant'] + 1)}{numero}"
                nombre = valeur_cellule(feuille, feuille_formules, coordonnee)
            else:
                nombre = montant_nombre(brut)
        except (ValueError, SyntaxError) as exc:
            raise SystemExit(f"Ligne {numero} : montant illisible {brut!r} ({exc})")

        slug = slugify(brut_slug or objet, maxlen=80)
        if not slug:
            raise SystemExit(f"Ligne {numero} : slug vide pour '{objet}'")
        if slug in resultats:
            raise SystemExit(f"Slug duplicate '{slug}' : '{objet}' et '{resultats[slug]['objet']}'")
        if objet in objets:
            raise SystemExit(f"Objet duplicate '{objet}'")
        objets.add(objet)
        resultats[slug] = {
            "objet": objet,
            "montant": int(nombre) if abs(nombre - round(nombre)) < 1e-9 else nombre,
            "affichage": montant_affichage(nombre),
        }

    if not resultats:
        raise SystemExit("Aucun tarif trouve dans la feuille Tarifs")
    return resultats


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("xlsx", nargs="?", default=str(DEFAULT_XLSX))
    parser.add_argument("--out", default=str(DEFAULT_OUT))
    parser.add_argument("--write", action="store_true")
    args = parser.parse_args()

    tarifs = lire_tarifs(Path(args.xlsx))
    contenu = yaml.safe_dump(tarifs, allow_unicode=True, sort_keys=False)

    if args.write:
        sortie = Path(args.out)
        sortie.parent.mkdir(parents=True, exist_ok=True)
        sortie.write_text(contenu, encoding="utf-8")
        print(f"{len(tarifs)} tarif(s) ecrit(s) dans {sortie}")
    else:
        print(contenu, end="")


if __name__ == "__main__":
    main()
