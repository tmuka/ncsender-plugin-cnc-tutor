# CNC Tutor: plan for students on a shared machine (2026-11-03)

A shop, class or makerspace machine is used by several people, **one at a time**. Each student keeps their own
progress; whoever is at the machine picks their name when they start, and hands over when they're done.

## How it works for the student

- **Opening the tutor:** if more than one student exists, it opens on **Who's learning?**: a card per
  student (name, a color, lessons done, last lesson, last active). Tap yours to carry on where you stopped.
  With one student it opens straight on their lessons, as now.
- **The current student** shows at the top of the sidebar (name and color) with **Switch student**.
- **Add a student:** a name (a first name or nickname is enough) and a color. **Rename** and **Remove** (asks
  twice; removes their progress) on the student's card.
- **Hand over:** **Sign out** (in the sidebar) ends the session and returns to Who's learning?, so the next
  person doesn't carry on in someone else's progress. The tutor also asks "Still you, Sam?" when it opens
  after a long gap (default 2 hours), with Yes and Switch.
- **One at a time:** the current student is the machine's, not the screen's: the Pi's screen and a laptop
  show the same student. Switching on one switches both on their next open.

## For the teacher

- **Class progress** (under Reference): a table of students by level: lessons done, Try it steps seen, quiz
  first-try score, last active. Tap a student to see their lessons.
- Quiz answers start recording the **first** answer as well as the latest, so the first-try score means
  something (today a second tap overwrites the first).
- No sign-in or passwords: anyone at the machine can pick any name. This is about keeping progress apart,
  not privacy or grading security. An optional 4-digit PIN per student could come later, labeled as not
  secure.

## What's stored, and where

All in the plugin's settings on the machine (ncSender saves them; they're included in ncSender's Backup &
Restore under plugin configuration). Nothing leaves the machine.

```
{
  "current": "s2",                    // the student at the machine, or null
  "currentSince": "2026-11-03T14:05Z",
  "students": {
    "s1": { "name": "Sam", "color": "teal", "created": "...", "lastActive": "...", "lastLesson": "zero-z",
            "done": { "axes": true, "axes:try": true }, "ticks": {}, "answers": {}, "firstAnswers": {}, "feeds": {} },
    "s2": { ... }
  },
  "corner": "bl"                      // machine-wide preferences stay at the top
}
```

- Only a display name and a color per student: no email, age or other personal details, and the add form
  says so.
- **Upgrading:** the current top-level `done`, `ticks`, `answers` and `feeds` move into a first student
  ("Student 1", renamable) the first time 0.2 opens, and the old keys are removed. A test covers it.
- Saving keeps today's patch-and-merge (`save(['students', id, 'done', lesson], true)`), so two screens
  can't overwrite each other's progress, and a change for one student never touches another's.
- The Try it in progress and the remembered page stay in the screen's localStorage, keyed by student, so a
  hand-over doesn't continue the last student's Try it.

## Build

- `lib/tutor-students.cjs` (pure, tested): migrate old settings, add/rename/remove, pick the current student,
  "still you?" timing, class progress numbers (done counts per level, first-try score).
- config.html: the Who's learning? page, the sidebar chip with Switch student and Sign out, Class progress, and every
  progress read and write going through the current student.
- The read-only rule is unchanged: still only its own settings are written.
- Tests: migration from 0.1 settings, two students' progress kept apart, removing one leaves the others,
  saves patch only the current student's keys, the "still you?" gap.

## Phases

1. Students, Who's learning?, switching and hand-over, the upgrade from 0.1. Pi test.
2. Class progress and first-try quiz scores.
3. Later, if wanted: the optional PIN; exporting class progress as CSV (a download works on a laptop, not
   on the kiosk screen).

## Questions

- The "still you?" gap: 2 hours, or ask every time the tutor opens?
- Should Class progress be open to everyone, or behind a teacher PIN?
- Keep a no-student **Guest** mode (try lessons without saving), or always need a name?
