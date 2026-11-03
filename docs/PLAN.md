# CNC Tutor: plan (2026-11-02; first called CNC Basics)

An ncSender plugin that walks a new operator through the basics on their own machine, from what X, Y and Z
are to feeds and speeds, one short lesson at a time.

## Who it's for
Someone with a new router and ncSender who has never zeroed a machine. They may not know G-code, and they're
standing at a 1920 × 1200 touchscreen or a laptop beside the machine.

## Principles
- **The plugin never moves the machine or sends a command.** Each lesson says what to do in ncSender (jog X+,
  press Home, zero X), then **watches** the live machine state and says when it saw it happen ("X went up by
  10 mm: that's X+"). Nothing can go wrong because of the plugin.
- **The idea first, then where it is in ncSender.** Each lesson teaches the concept in plain words with a
  picture, and links to the docs page that shows ncSender's buttons for it.
- **Your machine, not a generic one.** It reads your travel ($130–$132), homing ($22, $23), limits ($20,
  $21), units, and work offsets, and explains them as they are set on your machine.
- Short pages, big touch targets, mm or inch as ncSender is set, light and dark themes, like the other
  plugins.
- Safety comes first and keeps coming back.

## The lessons
Each lesson has the idea (a few sentences and an SVG), a **Try it** step checked live where possible, a
**Check yourself** question or two, and **In ncSender** links. Progress is saved, and every lesson can be
skipped.

**Level 1: The machine**
1. **Safety first:** the E-stop and when to hit it, eye, ear and dust protection, loose sleeves and hair,
   never leaving a running job. Try it: find your E-stop (a checkbox, not a test).
2. **X, Y and Z:** which way each axis moves, + and −, and the right-hand rule. Try it: jog X+, Y+ and Z+ a
   little; it sees which way the numbers went and says whether that matches what you saw (a quick check of
   direction settings).
3. **Machine coordinates and homing:** why the machine has its own fixed origin, what homing does, and why
   positions only mean something after it. Try it: home; it sees the homed state.
4. **Limits and alarms:** soft and hard limits, what an alarm is, unlocking, and why you shouldn't unlock
   blindly. It explains your own $20/$21/$22 settings.

**Level 2: Moving**
5. **Jogging:** step and continuous, step sizes, jog feed, and keyboard, gamepad and pendant. Try it: jog
   exactly 1 mm, 10 mm and 0.1 mm; it checks the moves.
6. **Getting out of the way:** Safe Z, lifting before moving across, Go to zero and Park.

**Level 3: Zero**
7. **Work coordinates:** machine and work positions, the work offset between them, and G54–G59 as six saved
   zeros. Your offsets are shown as they stand now.
8. **Zero X and Y:** on a stock corner or its center, and why the program's origin must match the zero. Try
   it: zero X and Y somewhere; it sees the offset change and shows where it went on a little map.
9. **Zero Z:** the paper method, a touch plate (plate thickness), and the top of the stock or the
   spoilboard. Try it: zero Z.
10. **A new bit needs a new Z:** tool length, why Z0 is lost after a bit change, and how a tool setter and
   tool length offsets (TLO) fix it.

**Level 4: Running a program**
11. **G-code in five lines:** G0, G1, G2/G3, F, S, M3/M5, G20/G21, G90. Read a short program together.
12. **Check before you cut:** the visualizer (outline, origin, depth, out-of-bounds warning) and run time.
   Try it: load a sample program (made by the plugin, nothing cut) and find its origin.
13. **The air cut:** run it with Z0 raised above the stock to watch the whole path. Try it: it walks you
   through setting Z0 25 mm up (with you doing it in ncSender) and putting it back.
14. **Pause, stop and resume:** feed hold, stop, overrides, Start From Line, and when to use the E-stop
   instead.

**Level 5: Cutting well**
15. **Bits:** flutes, end types (flat, ball, V, compression, up/downcut), and flute and overall length.
16. **Feeds and speeds:** RPM, feed, and chip load (feed = RPM × flutes × chip load), with a small
   calculator using the same starting feeds as QuickCut, Gears and Spoilboard Toolbox. Sounds and chips: too
   slow rubs and burns, too fast chatters or breaks bits.
17. **Depth of cut and stepover:** how much per pass, and roughing vs finishing.
18. **Climb vs conventional milling:** what each does to the edge, and which way a profile goes round.
19. **Holding the work:** clamps, screws, tape and glue, dog holes and pins, tabs, and keeping clamps out of
   the toolpath.

**Capstone: your first part.** A checklist from stock to finished part, using QuickCut (for example a
rectangle pocket in scrap), with each step linked to its lesson.

## Extras
- **Your machine at a glance:** travel, homing corner, limits, units, spindle range, tool changer, probe
  and laser, each with one line on what it means.
- **Glossary:** each term links to its lesson.
- **Where am I:** a page that reads the live state and says it in words ("homed, G54 active, X0 Y0 is 120
  mm right of home, Z0 is not set since the bit changed").

## Links to ncSender's docs
The docs are at https://docs.ncsender.xyz (source siganberg/ncSender.manual). Some of the "In ncSender"
links:

| Lesson | Link |
| --- | --- |
| Homing, limits | `/getting-started/setup-wizard/#homing`, `#switches-probe`, `/features/jog-controls/#homing` |
| Alarms | `/settings/alarms/#unlocking`, `#alarm-list` |
| Jogging | `/features/jog-controls/#step-sizes`, `#continuous-jog`, `#keyboard-and-gamepad`; `/settings/controls/#set-up-a-gamepad`; `/accessories/pendant/#jog` |
| Zeroing | `/features/dro/#setting-work-zeros-long-press`, `/getting-started/interface-overview/#zero-an-axis` |
| G54–G59 | `/features/multi-workspace/` (Pro) |
| Probing | `/features/probing/#standard-block`, `#using-the-probe-dialog` |
| Tool length | `/features/tool-changer/#tool-length-setter-tls`, `/faq/#what-order-should-i-home-probe-and-change-tools-in` |
| Running a job | `/features/visualizer/#loading-a-file`, `#running-a-job`, `#overrides`; `/features/gcode-preview/#start-from-line` |

The links are kept in one table in the plugin, and a test checks that each one still resolves.

## Contributing back to the manual (later)
The docs explain ncSender's buttons well but not the ideas behind them. Gaps that fit the lessons:
- a first-job walkthrough (home, zero, check, air cut, run)
- feeds and speeds and chip load; depth of cut and stepover; climb vs conventional
- workholding, and general shop safety including the E-stop
- a G54–G59 primer outside the Pro page; TLO and G43.1; units and G20/G21
- the default keyboard shortcuts on the Controls page

Before copying text either way: the manual repo has no license file, so ask siganberg what license it's under.
Also small: `mkdocs.yml`'s `site_url` still says docs.ncsender.com, but the live site is docs.ncsender.xyz.

## How it's built
- A client-only plugin (`com.tmuka.cnc-tutor`), one `config.html`, like Spoilboard Toolbox and Gears: a
  sidebar of levels, a lesson page, progress in plugin settings.
- It reads only, with GET `/api/server-state`, the firmware settings and the live `server-state-update`
  messages. A test fails if the code contains `send-command` or any other write to the machine.
- Shared code copied in: `parseUnitValue`, `startingFeeds`, the dialog styles workaround and the theme
  tokens.
- Diagrams as inline SVG drawn from your machine's numbers (travel, home corner), as Spoilboard Toolbox's
  are.
- Tests: the "watch for it" checks (a jog of +10 in X seen as X+, homed, offset changed) are pure functions
  fed recorded states; the harness renders each lesson; Pi test zips with `testzip.py`.

## Phases
1. **Skeleton and Levels 1–3** with the live checks, your machine at a glance, and the docs links. Pi test.
2. **Levels 4–5** with the sample program, air cut walkthrough and feeds calculator, plus the glossary and the
   capstone.
3. **Polish and release:** independent review, a public GitHub repo, CI like the others, the registry.
4. **Manual contributions**, once the license question is answered, starting with the first-job
   walkthrough.

## Open questions
- **Name:** "CNC Basics"? It could also be the plugin new users are pointed to first (a welcome note in
  Spoilboard Toolbox, QuickCut's README).
- **Should it ever move the machine** (a guided "jog 10 mm for me")? The plan says no; you do every move.
- **Pro-only features** (Multi-Workspace, Trace): mention them as Pro, or leave them out?
- **Sample program for the air cut:** one the plugin writes (a 50 mm square at Z −1), or QuickCut's?
