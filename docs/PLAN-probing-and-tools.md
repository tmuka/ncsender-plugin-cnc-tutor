# CNC Tutor: plan for probing and tools (2026-11-03)

A new level, **Level 6: Probing and tool changes**, between Cutting well and Your first part, and the Bits
lesson grown into **Your tools**, built from the operator's own ncSender tool library. Same rules as the rest:
the tutor never moves the machine or sends anything; the operator probes and changes tools in ncSender while
the tutor watches.

## What ncSender has (checked 2026-11-03)

- **Probe types** in the Probe dialog: 3D Probe (Z, X, Y, XY, XYZ, Center Inner/Outer; ball diameter,
  Z-Plunge), Standard Block (Z, X, Y, XY, XYZ; Z Thickness, XY Thickness, bit diameter), AutoZero Touch (bit
  diameter Auto or Tip), Tool Length Setter (its height). A **Connection Test** before probing.
- **Tool changes**: Settings › Tool Changer: numbering **Slot (classic)** or **Tool ID**; magazine size; TLS
  and Probe buttons; a tool changer plugin (Manual Tool Changer, Rapid Change ATC, Pneumatic ATC) can take
  them over. The TLS button blinks red until the tool is measured after power-up; **TLS after homing** moves
  the machine by itself. "Set Z0 before or after TLS: both work."
- **Tool library** (`GET /api/tools`): each tool has a Tool ID, an optional slot (`toolNumber`), name, type,
  diameter, flutes (`metadata.flutes`), flute and overall length, TLO. Types: flat, ball, v-bit, drill,
  chamfer, surfacing, thread-mill, probe.
- **Your Pi now**: 39 tools: 21 flat, 7 V-bits, 6 ball, 3 drills, 1 thread mill, 1 surfacing; no chamfer and
  no probe tool. Rapid Change ATC with 8 slots, TLS and Manual on, Probe off, Tool ID numbering. Standard
  block saved (Z 15.17 mm, XY 9.07 mm). No 3D probe on this machine.
- **Live state** the tutor can watch: `isProbing`, `probeCount`, `activeProbe`, `Pn` (input pins; the probe
  shows as P), `isToolChanging`, `tool`, `toolLengthSet`, the work offsets, alarms.

## The lessons

Each one as now: the idea, an animated picture, what your machine has, Try it where it can be watched, a
quiz, and docs links.

**Level 5 change: Bits becomes Your tools**
- The eight ncSender tool types, each with a small picture and what it's for (flat: pockets and profiles;
  ball: 3D; V-bit: engraving and chamfers; drill: holes, plunge only; chamfer; surfacing: flattening the
  spoilboard; thread mill; probe: not a cutter, never spin it).
- **From your library**: for each type, how many you have and one or two examples by name ("21 flat end
  mills, for example SpeTool W04005 Upcut 1/4""). A type you have none of says so and what it's for.
- What the fields mean and why they matter: diameter (the path), flutes (the feed; tools with no flute count
  are listed, since the feeds lesson needs it), flute length (deepest cut), stickout. Upcut, downcut,
  compression and O-flute from the current Bits lesson stay.
- Slot vs Tool ID numbering, with your setting.

**Level 6: Probing and tool changes**
1. **How a probe works.** A circuit: the bit (through a clip or the spindle) and a plate; touching closes it
   and the controller stops and records where. Why it beats paper. What goes wrong: a broken circuit drives
   the bit into the plate; a probe that never touches ends in an alarm. ncSender's Connection Test.
   *Try it:* touch the plate to the bit by hand; the tutor sees the probe input change (Pn shows P).
2. **The standard block (touch plate).** Z thickness, XY wall thickness, bit diameter, picking the corner;
   probing Z only or XYZ on a corner; AutoZero Touch as the no-setup kind. Your saved block values.
   *Try it:* probe Z (or XYZ) with your block in ncSender's Probe dialog; the tutor sees the probe cycle
   finish without an alarm and the work offset change.
3. **The tool length setter (TLS).** A fixed switch measures each tool's length; the controller offsets Z by
   the difference (TLO), so Z0 stays right across tool changes. Measuring after power-up (the blinking TLS
   button), TLS after homing, Z0 before or after TLS. Your setup.
   *Try it:* measure the tool with TLS; the tutor sees the cycle and the length marked measured.
4. **Tool changes and the ATC.** M6 T5 in a program; a manual change (stop, swap, measure); an ATC (a
   magazine of tools, the spindle drops one and picks another: Rapid Change spins the nut, a pneumatic one
   opens the collet with air). Slot vs Tool ID. Safety: the machine moves on its own; keep clear. Your
   changer, magazine and which tools sit in its slots.
   *Try it (optional):* change tools with a slot button; the tutor sees the change start and end and the new
   tool number.
5. **The 3D probe.** A ball-tipped probe in the spindle: edges, corners, the center of a hole or a part;
   ball diameter and calibration; the probe tool number (the Probe button); never turn the spindle on with
   it in. Marked "if you have one"; no Try it on a machine without one (yours), the lesson still reads.

## Pictures (animated, as the others)

- A probe circuit: a clip on the bit, a plate, a light that comes on at the touch.
- A standard block on a corner: the bit touches the top, then the X side, then the Y side, and X0 Y0 Z0
  appear.
- The tool length setter: the bit comes down onto the switch, it clicks, a length bar fills; a second,
  longer bit gives a longer bar.
- An ATC: the spindle goes to the rack, leaves one tool, picks another, and goes to the TLS.
- A 3D probe finding a hole's center: four touches, then the center.
- Small pictures for each tool type, in the Your tools lesson.

## Build notes

- Read only stays: one new GET, `/api/tools`, added to the read-only test's allowed list. Nothing posted.
- New checks in `tutor-machine.cjs`, tested with recorded states like the others: `probeSignal` (P appears
  in Pn), `probeCycle` (isProbing on, then off, no alarm, the offset changed), `tlsMeasure` (a probe cycle
  that ends with `toolLengthSet`), `toolChange` (isToolChanging on then off, `tool` changed).
- First, watch the Pi's state read-only while you touch the plate, run a TLS and change a tool, to confirm
  what Pn, isProbing, toolLengthSet and isToolChanging do. No 3D probe here, so that lesson is text and
  picture only.
- Tool names are long: show them shortened, with the full name on hover.
- New docs links: probing (standard block, AutoZero Touch, 3D probe, tool length setter, connection test),
  tool changer (tool numbering, TLS, measuring after power-up), tool library, the three tool changer plugins.

## For the manual later

What a probe circuit is, what TLO means, choosing tool types, and a "first tool change" walkthrough: the docs
describe ncSender's buttons for these but not the ideas.

## Decided (2026-11-03)

- A new **Level 6**, before Your first part.
- Keep **Bits** about bits in general, not the operator's library; the library can show a few examples at most.
- Lessons for things a machine doesn't have (3D probe, ATC, TLS, a touch plate) stay, marked optional, and say
  so: "Your machine doesn't have a tool length setter set up in ncSender" (from ncSender's tool changer
  settings), with what it would do and how to add one.

## Questions (answered above)

- Where: a new Level 6 before Your first part (my pick), or fold probing into Level 3 (Zero)?
- Bits into Your tools with your library's tools, or keep Bits and add a separate library lesson?
- The 3D probe lesson on a machine without one: show it (marked optional), or hide it?
