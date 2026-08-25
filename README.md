# KDU Ball - 2026

A responsive, client-side raffle draw application with multiple inclusive number ranges, secure random selection, persistent history, and duplicate-winner prevention.

## Local development

```bash
npm install
npm run dev
```

## Verification

```bash
npm run format
npm run lint
npm run test
npm run typecheck
npm run build
```

## Deployment

Pushes to `main` are automatically verified, built, and deployed to GitHub Pages by the included GitHub Actions workflow.

Draw history is stored in each browser's local storage and is not shared between visitors or devices.
