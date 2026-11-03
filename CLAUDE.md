# CNC Tutor: notes for working on it

An ncSender plugin (`com.tmuka.cnc-tutor`, planned as "CNC Basics") that teaches beginners on their own machine.
`docs/PLAN.md` is the plan; README.md the user guide. GPL-3.0 (starting feeds copied from QuickCut).

**Rule: it never sends anything to the controller.** `tests/readonly.test.cjs` fails on `send-command`, jog
APIs or any endpoint beyond firmware, settings, server-state, its own settings and `gcode-files/load-temp`.

## Layout

| File | What |
| --- | --- |
| `config.html` | The dialog: styles, markup, the UI script. `lib/*.cjs` are copied in between `/* BEGIN lib/x.cjs */` markers (one scope: prefix helpers `ct`). |
| `lib/tutor-machine.cjs` | Facts from `/api/firmware` + `/api/settings`, "Where am I" sentences, the tracker (moves = MPos change from Idle to Idle) and the Try it `CHECKS`. |
| `lib/tutor-lessons.cjs` | `CT_LESSONS` (HTML bodies, `live` blocks, `tryIt`, quiz, docs keys), `CT_DOCS` (docs.ncsender.xyz paths), glossary. |
| `lib/tutor-figures.cjs` | The lessons' SVGs, colored by CSS classes in config.html. |
| `lib/tutor-program.cjs` | The practice program and `explainLine`. |
| `lib/starting-feeds.cjs` | Copied from QuickCut; keep in step. |

## How Try it works

ncSender's plugin dialog is modal. The plugin's CSS (`.plugin-dialog-backdrop:has(.ct-wrapper.ct-mini)`) makes
the backdrop transparent and click-through and shrinks the dialog to a card in a corner, so ncSender's buttons work
behind it. Keyboard jogging works with the dialog open anyway. State comes from the `server-state-update`
messages ncSender posts to the dialog (full merged state). A move counts as a jog only from Idle to Idle with no
Home/Run/Alarm/Hold/disconnect in between. The Try it in progress is kept in localStorage (Escape closes the dialog even
as a card) and restored on reopen unless done.

**Saving:** `save(keys, value)` patches only what changed onto a fresh GET of the plugin settings (two screens).
The page is remembered in localStorage. **Loading the practice program** is refused unless the machine is Idle and no
job is running or paused: ncSender's `load-temp` would replace a running job.

## Testing

`npm test`. UI: the test kit (`~/Documents/projects/ncsender-plugin-testkit`):
`openLocal({ config: 'config.html', pluginId: 'com.tmuka.cnc-tutor', settings: {} })`; post
`{ type: 'server-state-update', state }` messages to simulate moves. The harness has no dialog backdrop, so
wrap `.plugin-dialog-content` in `.plugin-dialog-backdrop > .plugin-dialog-container > .plugin-dialog` to test
the card. Check the docs links still resolve with `node .scripts/check-links.cjs` (network).

**Releasing:** as Gears and Laser Toolbox: bump `version` in manifest.json and package.json, add `## <version>`
to CHANGELOG.md, commit, tag `v<version>`, push the tag; `.github/workflows/release.yml` does the rest.
