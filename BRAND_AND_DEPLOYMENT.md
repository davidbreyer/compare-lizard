# Brand and Deployment Notes

This file documents the Compare Lizard logo, color palette, release/version stamp, and GitHub Pages publishing flow.

## Logo

The site uses the Yelling Lizard mark without text, copied from Format Lizard so the apps feel related while keeping separate codebases.

Tracked site assets:

- `assets/yelling-lizard-logo.png` - header logo, transparent PNG, 2000x2000 source.
- `assets/apple-icon.png` - favicon/apple touch icon, copied from the same transparent PNG.

Use the transparent PNG for the web UI whenever possible. The logo should appear as an image asset, not as a redrawn SVG or CSS approximation.

## Colors

The CSS palette follows the Format Lizard brand palette:

| Purpose | Hex | Notes |
| --- | --- | --- |
| Logo green | `#80A24D` | Primary Yelling Lizard green. |
| Light green | `#99CC66` | Secondary logo green. |
| Pale gray | `#EFF0EB` | Logo/background neutral. |
| Black | `#000000` | Standard logo black. |
| White | `#FFFFFF` | Standard logo white. |

Derived CSS tokens:

```css
--bg: #eff0eb;
--logo-green: #80a24d;
--logo-green-light: #99cc66;
--accent: #5f7a38;
--accent-strong: #35471e;
--accent-soft: #edf5e7;
```

Compare Lizard also adds semantic diff colors for added, removed, changed, and equal rows.

## Version Stamp

The app uses a release stamp in this format:

```text
yyyyMMdd-HHmm
```

The version appears in three places:

- `script.js`: `const appRelease = "YYYYMMDD-HHMM";`
- `index.html`: visible footer text, `Version: YYYYMMDD-HHMM`
- `index.html`: cache-busting query strings on CSS, JavaScript, favicon, and logo URLs

## Git Hook

The repo includes a tracked pre-commit hook:

```text
.githooks/pre-commit
```

Enable it once in a fresh clone:

```powershell
git config core.hooksPath .githooks
```

The hook runs:

```powershell
scripts/update-release.ps1
```

That script updates:

- `const appRelease` in `script.js`
- all `?v=...` cache-busting query strings in `index.html`
- the visible footer version in `index.html`

## GitHub Pages

Suggested repository:

```text
https://github.com/davidbreyer/compare-lizard.git
```

Suggested deployment flow:

```powershell
git add -- ...
git commit -m "Some change"
git push origin master
git push origin master:gh-pages
```
