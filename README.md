# Compare Lizard

A small JavaScript app for comparing two JSON documents.

Open `index.html` in a browser, paste JSON into the left and right editors, then use `Compare` to see added, removed, changed, and equal paths.

For logo, color, versioning, and publishing details, see [BRAND_AND_DEPLOYMENT.md](BRAND_AND_DEPLOYMENT.md).

## Features

- Parse and validate two JSON documents.
- Compare object keys, array items, primitives, and nested values.
- Toggle strict values, object key order handling, and equal-path visibility.
- Filter results by added, removed, changed, and equal paths.
- Copy or save the diff report as JSON.
- Open local `.json` or `.txt` files into either editor.

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
