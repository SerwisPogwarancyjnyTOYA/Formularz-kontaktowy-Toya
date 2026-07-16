# v78 - Bad PDF fixes pass 1

Generated: 2026-07-14T00:32:14Z

## Fixed

### YT-55557

Problem: the site was using `Czesci_zamienne_YT-55557 V2.pdf` as the main drawing, while V3 was split between a technical diagram and a separate verification list.

Fix: created `assets/pdfs/Czesci_zamienne_YT-55557__SCALONE.pdf` with 7 pages:

1. Publication cover
2. V2 section cover
3. V2 assembly drawing
4. V2 parts list
5. V3 section cover
6. V3 technical drawing
7. V3 parts list

The old source files remain in reports/quarantine, but the app should prefer the fixed merged PDF.

