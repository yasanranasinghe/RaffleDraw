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

## Desktop application

Run the desktop application locally:

```bash
npm run desktop
```

Build an installer for the current operating system:

```bash
npm run package:desktop
```

Pushing a version tag such as `v1.0.0` starts the desktop release workflow. It publishes Windows installer/extractable packages (`.exe` and `.zip`) and macOS installer/extractable packages (`.dmg` and `.zip`) to GitHub Releases.
