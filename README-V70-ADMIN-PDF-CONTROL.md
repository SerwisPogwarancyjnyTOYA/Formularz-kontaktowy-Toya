# PGW v70 — Admin PDF Control

Większy pakiet zamiast kolejnego małego patcha. v70 zawiera wszystko z v68/v69 oraz dodatkową warstwę admin/debug do kontroli PDF-ów po konwersji.

## Co dochodzi w v70

- Panel admina uruchamiany parametrem `?admin=1`.
- Przycisk `PDF QA` widoczny tylko w trybie admina.
- Eksport diagnostyki do JSON i CSV bez grzebania w konsoli.
- Eksport samych „sierot” PDF do CSV.
- Generator szablonu do `data/pdf-device-overrides.json`.
- Nowy skrypt `pgw-refresh-pdf-manifest-after-conversion-v70.gs`.
- Funkcja instalująca dzienny automat odświeżania manifestu.
- Zachowana kompatybilność z v68/v69: stare manifesty dalej są czytane.

## Pliki do podmiany / dodania

```text
app.js
config.js
data/drive-drawings-map.converted.json
data/pdf-device-overrides.json
data/pdf-orphans.json
data/pdf-quality-report.json
data/pdf-admin-notes.json
scripts/pgw-refresh-pdf-manifest-after-conversion-v70.gs
```

Starych skryptów v68/v69 nie trzeba usuwać od razu. Można je zostawić jako backup, ale docelowo używać v70.

## Jak używać po konwersji PDF

W Apps Script uruchom:

```javascript
pgwRefreshPdfManifestAfterConversionV70()
```

To odświeży:

```text
data/drive-drawings-map.converted.json
data/pdf-orphans.json
data/pdf-quality-report.json
```

Opcjonalnie można raz uruchomić:

```javascript
pgwInstallDailyPdfManifestRefreshV70()
```

Wtedy Google ustawi codzienny trigger około godziny 04:00.

## Panel admina na stronie

Po wdrożeniu wejdź na stronę z parametrem:

```text
?admin=1&v=20260709-v70-admin-pdf-control
```

Pojawi się przycisk `PDF QA` w prawym dolnym rogu. Panel pokaże:

- liczbę PDF-ów w manifestach,
- liczbę widocznych rysunków,
- PDF-y bez indeksu urządzenia,
- PDF-y niedopasowane do urządzeń,
- PDF-y ze słabą/niepewną marką,
- duplikaty,
- sieroty z raportu po konwersji.

## Narzędzia w konsoli

Dalej działają:

```javascript
window.PGW_DEBUG.getPdfDiagnostics()
window.PGW_DEBUG.refreshPdfDiagnostics()
window.PGW_DEBUG.downloadPdfDiagnostics()
window.PGW_DEBUG.downloadPdfDiagnosticsCsv()
window.PGW_DEBUG.downloadPdfOrphansCsv()
window.PGW_DEBUG.copyPdfOverridesTemplate()
window.PGW_DEBUG.openAdminPanel()
window.PGW_DEBUG.closeAdminPanel()
```

## Jak poprawiać błędne przypisania PDF

Edytuj `data/pdf-device-overrides.json`.

Przykład:

```json
{
  "files": {
    "dziwna_nazwa_pliku.pdf": ["YT-82806"]
  },
  "fileIds": {
    "1abcDriveFileId": ["YT-82806"]
  }
}
```

Po zmianie override'ów odśwież stronę z cache-busterem, np. `?admin=1&v=20260709-v70-admin-pdf-control-2`.

## Kierunek dalej

Po v70 najrozsądniejszy następny większy krok to nie kolejny PDF patch, tylko pełne spięcie pipeline’u:

1. konwersja PDF,
2. refresh manifestu,
3. raport jakości,
4. automatyczny commit/synchronizacja repo,
5. kontrolny test na GitHub Pages.

