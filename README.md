# Compare Lizard

A small JavaScript app for comparing two JSON or XML documents.

Open `index.html` in a browser, paste JSON or XML into the left and right editors, choose the matching format, then use `Compare` to see added, removed, changed, and equal paths.

For logo, color, versioning, and publishing details, see [BRAND_AND_DEPLOYMENT.md](BRAND_AND_DEPLOYMENT.md).

## Features

- Parse and validate two JSON or XML documents.
- Compare JSON object keys, array items, primitives, and nested values.
- Compare XML elements, attributes, direct text, and child elements.
- Find XML duplicates under the same parent by element name and normalized text value.
- Toggle strict values, key or attribute order handling, and equal-path visibility.
- Filter results by added, removed, changed, equal, and duplicate paths.
- Copy or save the diff report as JSON.
- Open local `.json`, `.xml`, or `.txt` files into either editor.

## GitHub Pages

The site publishes from the remote `gh-pages` branch:

```text
https://davidbreyer.github.io/compare-lizard/
```

Normal deployment flow:

```powershell
git add -- ...
git commit -m "Some change"
git push origin master
git push origin master:gh-pages
```

`master` stores the source/history. `gh-pages` is the branch GitHub Pages serves publicly.

## Release Stamp

The footer displays the current version:

```text
Version: YYYYMMDD-HHMM
```

The value lives in `script.js`:

```js
const appRelease = "YYYYMMDD-HHMM";
```

The same value is used for cache-busting query strings in `index.html`.
