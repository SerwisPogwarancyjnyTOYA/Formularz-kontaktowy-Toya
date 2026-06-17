#!/usr/bin/env bash
set -euo pipefail
echo "=== GDZIE JESTEM ==="; pwd
echo "=== ROZMIAR REPO ==="; du -sh . 2>/dev/null || true
echo "=== ROZMIAR .GIT ==="; du -sh .git 2>/dev/null || echo "brak .git"
echo "=== LICZBA PLIKÓW BEZ .GIT ==="; find . -path "./.git" -prune -o -type f -print | wc -l
echo "=== PDF BEZ .GIT ==="; find . -path "./.git" -prune -o -iname "*.pdf" -print | wc -l
echo "=== OBRAZY BEZ .GIT ==="; find . -path "./.git" -prune -o \( -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" \) -print | wc -l
echo "=== PLIKI >20MB BEZ .GIT ==="; find . -path "./.git" -prune -o -type f -size +20M -print
echo "=== TOP 50 NAJWIĘKSZYCH PLIKÓW BEZ .GIT ==="; find . -path "./.git" -prune -o -type f -exec du -h {} + | sort -hr | head -50
