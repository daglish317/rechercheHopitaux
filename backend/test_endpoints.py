"""
Script de test pour vérifier que tous les endpoints des modules sont configurés correctement.
Ce script vérifie la configuration des URLs sans faire de requêtes HTTP.
"""

import os
import sys
import django

# Configuration de Django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "recherchehopitaux.settings")
django.setup()

from django.urls import resolve, reverse, NoReverseMatch
from django.core.exceptions import ViewDoesNotExist


def test_url_resolution(url_pattern, expected_view_name=None):
    """Teste si une URL peut être résolue."""
    try:
        resolved = resolve(url_pattern)
        status = "✅"
        view_name = resolved.view_name or resolved.func.__name__
        return f"{status} {url_pattern:50} -> {view_name}"
    except Exception as e:
        return f"❌ {url_pattern:50} -> ERREUR: {str(e)}"


def main():
    print("=" * 80)
    print("TEST DE CONFIGURATION DES ENDPOINTS")
    print("=" * 80)
    print()

    # Test des endpoints du module MALADIES
    print("📋 MODULE MALADIES")
    print("-" * 80)
    urls_maladies = [
        "/api/maladies/",
        "/api/maladies/1/",
        "/api/maladies/hopitaux/",
        "/api/maladies/associations/1/",
        "/api/maladies/associations/1/bulk/",
        "/api/maladies/associations/1/2/",
        "/api/maladies/export/1/",
    ]
    for url in urls_maladies:
        print(test_url_resolution(url))
    print()

    # Test des endpoints du module EXAMENS
    print("🔬 MODULE EXAMENS")
    print("-" * 80)
    urls_examens = [
        "/api/examens/",
        "/api/examens/1/",
        "/api/examens/hopitaux/",
        "/api/examens/associations/1/",
        "/api/examens/associations/1/bulk/",
        "/api/examens/associations/1/2/",
        "/api/examens/export/1/",
    ]
    for url in urls_examens:
        print(test_url_resolution(url))
    print()

    # Test des endpoints du module PLATEAU TECHNIQUE
    print("🏥 MODULE PLATEAU TECHNIQUE")
    print("-" * 80)
    urls_plateau = [
        "/api/plateau-technique/",
        "/api/plateau-technique/1/",
        "/api/plateau-technique/hopitaux/",
        "/api/plateau-technique/associations/1/",
        "/api/plateau-technique/associations/1/bulk/",
        "/api/plateau-technique/associations/1/2/",
        "/api/plateau-technique/export/1/",
    ]
    for url in urls_plateau:
        print(test_url_resolution(url))
    print()

    # Test des autres endpoints
    print("🔐 AUTRES ENDPOINTS")
    print("-" * 80)
    autres_urls = [
        "/api/auth/register/",
        "/api/auth/login/",
        "/api/hopitaux/",
        "/api/types-hopitaux/",
    ]
    for url in autres_urls:
        print(test_url_resolution(url))
    print()

    print("=" * 80)
    print("✅ TESTS DE CONFIGURATION TERMINÉS")
    print("=" * 80)
    print()
    print("Note : Ces tests vérifient uniquement la configuration des URLs.")
    print("Pour tester les fonctionnalités complètes, utilisez les tests d'intégration")
    print("ou testez manuellement avec Postman/curl.")
    print()


if __name__ == "__main__":
    main()
