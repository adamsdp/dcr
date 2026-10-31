# Direct–Compensatory Representation: an explainer

An interactive explainer for a proposed UK electoral system, re-run independently on the corrected 2024 general election results. Plain static HTML, CSS and JavaScript, so there is no build step and no dependencies.

## Publish on GitHub Pages

1. Create a repository and push the contents of this folder to the `main` branch.
2. **Settings → Pages → Build and deployment → Source: GitHub Actions** (a workflow is included at `.github/workflows/pages.yml`).
   Or choose **Deploy from a branch → main → / (root)** and skip the workflow.
3. The site appears at `https://<user>.github.io/<repo>/`.

Preview locally (the page loads its data with `fetch`, so it needs a web server, not a `file://` URL):

```
python3 -m http.server 8000
```

## Layout

| Path | Purpose |
|---|---|
| `index.html` | The page |
| `assets/engine.js` | Allocation engine (runs in the browser and in Node) |
| `assets/app.js`, `assets/style.css` | Interface |
| `data/model-data.json` | Reconciled regional votes, 2024 winners, scenario seats |
| `downloads/` | Report, reproducibility script, workbook, CSVs |
| `verify/` | `node verify/compare.js` checks the JS engine against the Python reference |

## Checking the numbers

- `python3 downloads/rdcr_independent_reproducibility.py` reproduces every figure from the embedded data.
- `node verify/compare.js` confirms the in-browser engine gives identical seats to the Python in 19 settings (every region and both Gallagher indices).
- Vote data: House of Commons Library, *General election 2024 results* (CBP-10009), corrected edition, changes logged to 5 January 2026.

## Limits

Local-seat inputs are scenario assumptions, not real constituencies, and the model applies new rules to votes cast under the old ones. It illustrates the mechanism and is not a forecast.
