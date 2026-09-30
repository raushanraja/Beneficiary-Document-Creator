# Print Studio

Local-first A4 print studio: beneficiary dossiers, self-attested scans, ID
cards side-by-side, passport photo grids, and free-form image boards —
composed on screen, printed on A4. No account, no cloud; everything stays in
this browser's localStorage.

## Run it

Requires [pnpm](https://pnpm.io) 11+.

```bash
pnpm install
pnpm run dev      # http://localhost:3000
pnpm run build    # production bundle in dist/
pnpm run serve    # preview the production build
pnpm run typecheck
```

## Studios

| Studio | What it prints |
|---|---|
| Beneficiaries | Dossier (personal + bank details) with ID scans |
| Self-Attest | Watermarked scans (custom text) on A4 |
| ID Print | Card fronts/backs side-by-side with cut guides |
| Photo Grid | One portrait tiled N-up at exact mm sizes |
| Image Board | Any images in an adjustable grid with captions |

Shared tools: canvas cropper (8 handles, touch, arrow nudge, double-click
confirm), canvas redaction, 18 themes, full keyboard map (`?` in the app).

## Notes

- Paper size is A4 with 10mm margins (`@page` in `src/index.css`).
- Beneficiary records persist under `printstudio.*` localStorage keys;
  studio scans are session-scoped to avoid blowing the storage quota.
- Print sheets are unthemed white/black by design so every theme prints
  identically.
