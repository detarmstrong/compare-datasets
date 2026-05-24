# SPEC: Discoverable Paste UI for CSV Comparison

Status: Draft
Owner: detarmstrong@gmail.com
Date: 2026-05-24

## 1. Objective

Make the existing clipboard-paste flow in Compare Datasets discoverable and usable by giving users a visible UI with two side-by-side paste targets — one per dataset — alongside the existing drag-and-drop area.

### Problem

Today (`src/DragNDropForm.tsx:61-121`) the app already accepts pasted CSV/TSV text, but the affordance is invisible:

- There is no visual hint that pasting is supported.
- A user must paste twice into the drop area to advance; the first paste produces no feedback.
- The captured paste cannot be inspected, renamed, or cleared.
- The existing source even flags this gap (`DragNDropForm.tsx:80`): `// got 2 pastes, ready for business // but how does the user know that?`.

### Target user

Same as today — general CSV users (analysts, ops, engineers) who routinely live in spreadsheets and copy ranges out of Excel/Google Sheets/Numbers. They reach for paste before they reach for "save as CSV → drag file."

### Success criteria

- A first-time user can complete a paste-based comparison without reading docs.
- On page load, pressing `Cmd/Ctrl+V` immediately fills the left paste zone — no click required to "arm" the target. The left zone holds focus on mount.
- After the first paste lands in the left zone, the user sees an unambiguous "now paste the second dataset" state on the right zone, and focus shifts there.
- Both pasted datasets can be reviewed (row/column count, preview) and cleared before advancing.
- Existing drag-and-drop file flow continues to work exactly as it does today.

## 2. Commands

No build-tooling changes. Use the existing scripts in `package.json`:

| Task         | Command         |
| ------------ | --------------- |
| Dev server   | `npm start`     |
| Production build | `npm run build` |
| Run tests    | `npm test`      |

Manual verification step (required before marking work complete):

1. Run `npm start`.
2. Open the app and **without clicking anything**, press `Cmd/Ctrl+V` with TSV content on the clipboard → left zone fills, focus moves to the right zone.
3. Press `Cmd/Ctrl+V` again with CSV text → right zone fills, comparison flow advances.
4. Drag two `.csv` files onto the existing drop area → confirm legacy flow still works.

## 3. Project structure

The feature lives within the current React app (`src/`). Minimal surface area:

```
src/
  DragNDropForm.tsx        # extend: render PasteZones alongside FileUploader
  PasteZones.tsx           # NEW: two side-by-side paste targets + state
  PasteZone.tsx            # NEW: single zone (empty | filled | error)
  util.ts                  # extend: shared paste-normalization helper
                           #   (extract from DragNDropForm.handleOnPaste)
  tests/
    PasteZones.test.tsx    # NEW
    PasteZone.test.tsx     # NEW
```

Rules:

- Do not move or rename existing files unrelated to paste.
- Keep `handleFileChange` (drag-drop) and the new paste handlers in separate code paths; both should ultimately call the same `props.loadCsv` + state-setting code, but via a small shared helper rather than copy-paste.

## 4. Code style

Follow the existing project conventions — do not introduce new ones.

- **Language**: TypeScript, React function components with hooks (matches existing files).
- **Formatting**: Prettier config in `package.json` (`singleQuote: true`, `semi: false`, `tabWidth: 2`, `trailingComma: 'es5'`). Do not change these.
- **Styling**: MUI components (`@mui/material`) and `styles.scss` for layout, matching `DragNDropForm.tsx`. No new CSS-in-JS library.
- **State**: local `useState` in the form component; lift only when a second consumer appears. Do not introduce Redux/Zustand/etc.
- **Utilities**: `lodash` and `d3-dsv` are already in use — prefer them over hand-rolled equivalents.
- **Naming**: zones are `dataset1` / `dataset2` in code; table names stay `clipboard1` / `clipboard2` to preserve the current SQL behavior unless the user provides a name.
- **Comments**: only when the why is non-obvious (e.g., the `setTimeout` hack on `DragNDropForm.tsx:88` is the kind of thing that earns a comment — explain why, not what).

## 5. Testing strategy

- **Unit tests** (`src/tests/`): Jest + React Testing Library, matching existing test setup.
  - Each `PasteZone` state renders the right affordance (empty prompt, filled summary, error message).
  - `PasteZones` advances to the comparison step only after both zones are filled.
  - TSV input (tab-delimited) is converted to CSV before being handed to `loadCsv`.
  - Clearing a filled zone returns it to empty and prevents advancement.
- **Manual / browser verification** (required because this is UI work): the four steps in §2. Type checks and unit tests verify code correctness; only a real browser verifies the feature works.
- **Regression**: existing drag-and-drop flow still loads two CSVs and advances to key selection — must be checked manually before merge.

## 6. Boundaries

### Always do

- Preserve the **browser-only privacy guarantee**. Pasted data must never leave the browser — no network calls, no logging to external services, no telemetry that includes paste contents. This is the core promise of the app and is non-negotiable.
- Keep the **existing drag-and-drop flow unchanged**. The paste UI is additive. If the drag-drop behavior changes as a side effect, that's a regression.
- Route both paste and drag-drop through the same downstream loader (`props.loadCsv` + the `setTableNames` / `setColumns` / `setOpen` calls) so the comparison step behaves identically regardless of input method.

### Ask first

- Adding a new npm dependency (the user did not rule it out, but did not green-light it either; default is to use the existing stack — React, MUI, lodash, d3-dsv, wa-sqlite).
- Changing copy on the existing landing page beyond what's needed to introduce the paste zones.
- Renaming `clipboard1` / `clipboard2` table names or other user-visible identifiers.
- Adding analytics or any kind of usage tracking.

### Never do

- Send pasted data to any server or third-party endpoint.
- Persist pasted data to `localStorage`, `IndexedDB`, cookies, or any storage that survives the tab.
- Remove or hide the drag-and-drop area in favor of paste.
- Add a build step, framework migration, or CSS framework change as part of this feature.

## Resolved decisions

- **Per-zone naming**: deferred to a later iteration. Stick with `clipboard1` / `clipboard2` for now.
- **Paste on the drop area**: removed. Paste now lives exclusively in the two new zones, with the left zone focused on page load so `Cmd/Ctrl+V` works immediately. The drop area reverts to handling file drops only (its original purpose). This is a deliberate behavior change from today's "paste anywhere on the drop area" flow — the trade-off is one focused entry point over an invisible one.
