// The lessons: the idea in plain words, a figure, what this machine has
// (data-live blocks the dialog fills from the live state), a "Try it" the
// dialog watches for (CHECKS in tutor-machine.cjs), things to tick, a quiz
// and links to ncSender's docs. Text is HTML; [[id]] links another lesson.

var CT_DOCS_BASE = 'https://docs.ncsender.xyz';
var CT_DOCS = {
  'setup-wizard': { label: 'Machine Setup Wizard', path: '/getting-started/setup-wizard/' },
  'wizard-travel': { label: 'Setup Wizard: travel', path: '/getting-started/setup-wizard/#travel' },
  'wizard-switches': { label: 'Setup Wizard: switches and probe', path: '/getting-started/setup-wizard/#switches-probe' },
  'wizard-homing': { label: 'Setup Wizard: homing', path: '/getting-started/setup-wizard/#homing' },
  'wizard-safety': { label: 'Setup Wizard: safety', path: '/getting-started/setup-wizard/#safety' },
  'status': { label: 'Check the machine status', path: '/getting-started/interface-overview/#check-the-machine-status' },
  'jog-homing': { label: 'Jog controls: homing', path: '/features/jog-controls/#homing' },
  'homing-required': { label: 'Jog controls: homing requirement', path: '/features/jog-controls/#homing-requirement' },
  'alarms-unlock': { label: 'Alarms: unlocking', path: '/settings/alarms/#unlocking' },
  'alarm-list': { label: 'Alarms: the alarm list', path: '/settings/alarms/#alarm-list' },
  'alarm-power-on': { label: 'Alarms: power-on E-stop check', path: '/settings/alarms/#power-on-e-stop-check' },
  'clear-alarm': { label: 'Clear an alarm', path: '/getting-started/interface-overview/#clear-an-alarm' },
  'jog-steps': { label: 'Jog controls: step sizes', path: '/features/jog-controls/#step-sizes' },
  'jog-feeds': { label: 'Jog controls: feed rates', path: '/features/jog-controls/#feed-rates' },
  'jog-continuous': { label: 'Jog controls: continuous jog', path: '/features/jog-controls/#continuous-jog' },
  'jog-keys': { label: 'Jog controls: keyboard and gamepad', path: '/features/jog-controls/#keyboard-and-gamepad' },
  'gamepad': { label: 'Controls: set up a gamepad', path: '/settings/controls/#set-up-a-gamepad' },
  'pendant': { label: 'Pendant: jog', path: '/accessories/pendant/#jog' },
  'go-to-zero': { label: 'Jog controls: Go to zero and Park', path: '/features/jog-controls/#go-to-zero-park' },
  'dro-zero': { label: 'DRO: setting work zeros', path: '/features/dro/#setting-work-zeros-long-press' },
  'dro-enter': { label: 'DRO: entering a coordinate', path: '/features/dro/#entering-a-specific-coordinate-double-click-double-tap' },
  'zero-axis': { label: 'Zero an axis', path: '/getting-started/interface-overview/#zero-an-axis' },
  'multi-workspace': { label: 'Multi-Workspace (Pro)', path: '/features/multi-workspace/' },
  'probe-block': { label: 'Probing: standard block', path: '/features/probing/#standard-block' },
  'probe-dialog': { label: 'Probing: the probe dialog', path: '/features/probing/#using-the-probe-dialog' },
  'probe-types': { label: 'Probing: probe types', path: '/features/probing/#probe-types' },
  'tls': { label: 'Tool changer: tool length setter', path: '/features/tool-changer/#tool-length-setter-tls' },
  'tool-measure': { label: 'Tool changer: measuring tool length', path: '/features/tool-changer/#tool-length-measuring' },
  'faq-order': { label: 'FAQ: home, probe and change tools in what order?', path: '/faq/#what-order-should-i-home-probe-and-change-tools-in' },
  'faq-plunged': { label: 'FAQ: the bit plunged after a tool change', path: '/faq/#the-bit-plunged-into-the-work-after-the-first-tool-change' },
  'load': { label: 'Visualizer: loading a file', path: '/features/visualizer/#loading-a-file' },
  'view': { label: 'Visualizer: changing the view', path: '/features/visualizer/#changing-the-view' },
  'out-of-bounds': { label: 'Visualizer: out-of-bounds warning', path: '/features/visualizer/#out-of-bounds-warning' },
  'run': { label: 'Visualizer: running a job', path: '/features/visualizer/#running-a-job' },
  'overrides': { label: 'Visualizer: overrides', path: '/features/visualizer/#overrides' },
  'spindle': { label: 'Visualizer: spindle control', path: '/features/visualizer/#spindle-control' },
  'gcode-preview': { label: 'G-code preview', path: '/features/gcode-preview/' },
  'start-from-line': { label: 'G-code preview: Start From Line', path: '/features/gcode-preview/#start-from-line' },
  'tool-library': { label: 'Tool library', path: '/features/tool-library/' },
  'quickcut': { label: 'QuickCut plugin', path: '/plugins/quickcut/' },
  'safety-door': { label: 'Safety door', path: '/features/safety-door/' },
  'keepout': { label: 'Keepout zone', path: '/features/keepout-zone/' },
  'faq-new': { label: 'FAQ: I have a new controller, where do I start?', path: '/faq/#i-have-a-new-controller-where-do-i-start' },
  'probe-autozero': { label: 'Probing: AutoZero Touch', path: '/features/probing/#autozero-touch' },
  'probe-3d': { label: 'Probing: 3D probe', path: '/features/probing/#3d-probe' },
  'probe-tls': { label: 'Probing: tool length setter', path: '/features/probing/#tool-length-setter' },
  'probe-connection': { label: 'Probing: connection test', path: '/features/probing/#connection-test' },
  'tool-numbering': { label: 'Tool changer: tool numbering', path: '/features/tool-changer/#tool-numbering' },
  'tool-buttons': { label: 'Tool changer: tool buttons', path: '/features/tool-changer/#tool-buttons' },
  'tls-power': { label: 'Tool changer: measuring after power-up', path: '/features/tool-changer/#measuring-after-power-up' },
  'tls-z0': { label: 'Tool changer: Z0 before or after TLS', path: '/features/tool-changer/#set-z0-before-or-after-tls-both-work' },
  'tool-library-slot': { label: 'Tool library: assigning a magazine slot', path: '/features/tool-library/#assigning-a-tool-to-a-magazine-slot' },
  'tool-library-probe': { label: 'Tool library: probe slot', path: '/features/tool-library/#probe-slot' },
  'manual-tc': { label: 'Manual Tool Changer plugin', path: '/plugins/manual-tool-changer/' },
  'rapid-change': { label: 'Rapid Change ATC plugin', path: '/plugins/rapid-change-atc/' },
  'pneumatic-atc': { label: 'Pneumatic ATC plugin', path: '/plugins/pneumatic-atc/' },
  'faq-probe-signal': { label: 'FAQ: the probe or tool setter shows no signal', path: '/faq/#the-probe-or-tool-setter-shows-no-signal' }
};

var CT_LEVELS = [
  { id: 1, title: 'The machine' },
  { id: 2, title: 'Moving' },
  { id: 3, title: 'Zero' },
  { id: 4, title: 'Running a program' },
  { id: 5, title: 'Cutting well' },
  { id: 6, title: 'Probing and tools' },
  { id: 99, title: 'Your first part', capstone: true }
];

var CT_LESSONS = [
  // ---------- Level 1: the machine ----------
  { id: 'safety', level: 1, title: 'Safety first', mins: 4, fig: 'estop',
    body:
      '<p>A CNC router is a fast spinning blade on a robot that does exactly what it’s told, even when that’s wrong. It doesn’t feel the bit hitting a clamp or your hand. Most accidents come from a few habits, so they come first.</p>' +
      '<ul>' +
      '<li><strong>Know your E-stop.</strong> The red mushroom button stops the motors and, on most machines, the spindle. Check that yours stops the spindle too: on some, a router on its own power keeps running. Either way the bit coasts for a few seconds, so keep your hands out. Hit it the moment anything looks or sounds wrong: a clamp in the path, smoke, a bit breaking, the machine heading somewhere you didn’t expect. Don’t reach for the mouse first.</li>' +
      '<li><strong>Stop is not the E-stop.</strong> ncSender’s Stop and Pause are software: fine for a program you want to end, but they rely on the computer and the controller working. The E-stop doesn’t.</li>' +
      '<li><strong>Never leave a running job.</strong> Stay where you can reach the E-stop. Fires start from a dull bit rubbing in wood dust.</li>' +
      '<li><strong>Protect yourself.</strong> Safety glasses, hearing protection for the spindle and the cut, and a dust mask or a dust collector: fine wood and MDF dust harm your lungs.</li>' +
      '<li><strong>Nothing loose near the bit.</strong> Long hair tied back, no gloves, loose sleeves or jewelry near a spinning bit. Keep hands out of the machine while the spindle turns, even to clear chips.</li>' +
      '<li><strong>Changing a bit:</strong> turn the spindle off (or unplug the router) first, and never leave the collet wrench on the nut.</li>' +
      '<li><strong>Hold the work down.</strong> A part that comes loose is thrown. [[workholding]] covers it.</li>' +
      '</ul>' +
      '<p>ncSender can check that the E-stop is released when it powers on and can pause on an open safety door; see the links below.</p>',
    ticks: ['I found my E-stop and can reach it from where I stand', 'I know Stop in ncSender is not the same as the E-stop', 'I have safety glasses and hearing protection by the machine'],
    quiz: [
      { q: 'The bit is heading for a clamp. What do you do?', a: ['Press Pause in ncSender', 'Hit the E-stop', 'Lift the bit with the jog buttons'], right: 1,
        why: 'The E-stop stops everything at once without relying on the computer. Pause takes a moment and depends on the software.' },
      { q: 'Is it OK to brush chips away from the bit while it’s cutting?', a: ['Yes, if you’re careful', 'No: wait until the spindle has stopped'], right: 1,
        why: 'A spinning bit catches a brush, a glove or a sleeve faster than you can pull back.' }
    ],
    docs: ['alarm-power-on', 'safety-door', 'wizard-safety'] },

  { id: 'axes', level: 1, title: 'X, Y and Z', mins: 4, fig: 'axes', live: 'axes',
    body:
      '<p>Your machine moves in three straight lines called <strong>axes</strong>. Standing in front of it:</p>' +
      '<ul><li><strong>X</strong> is left and right. <strong>X+</strong> moves the spindle to the right.</li>' +
      '<li><strong>Y</strong> is toward you and away. <strong>Y+</strong> moves the spindle away from you, to the back.</li>' +
      '<li><strong>Z</strong> is up and down. <strong>Z+</strong> lifts the bit up, away from the work. <strong>Z−</strong> goes down, into it.</li></ul>' +
      '<p>A position is three numbers, one per axis, like X100 Y50 Z10. The numbers grow in the + direction. Z− is the one to respect: it’s the direction that cuts, and the one that crashes.</p>' +
      '<p>On most routers the gantry moves; on some the table moves instead, the opposite way, so the bit still goes X+ or Y+ relative to the work. If a jog goes the wrong way, the machine’s direction settings are wrong; ncSender’s Setup Wizard fixes them.</p>',
    tryIt: { check: 'axes', text: 'Jog <strong>X+</strong>, <strong>Y+</strong> and <strong>Z+</strong> once each, a small step. Watch which way the spindle goes. Make sure it has room to move first.' },
    askAfter: { q: 'Did X+ go right, Y+ go to the back, and Z+ go up?', no: 'If an axis went the other way, its direction is set backwards. Run ncSender’s Setup Wizard (Settings) and fix it before you cut anything: a program would come out mirrored or plunge the wrong way.' },
    quiz: [
      { q: 'Which direction cuts into the stock?', a: ['Z+', 'Z−', 'Y+'], right: 1, why: 'Z− goes down, toward the work.' },
      { q: 'You want the spindle closer to you. Which jog?', a: ['Y+', 'Y−', 'X−'], right: 1, why: 'Y+ goes away from you, so Y− comes toward you.' }
    ],
    docs: ['wizard-travel', 'status'] },

  { id: 'homing', level: 1, title: 'Machine coordinates and homing', mins: 5, fig: 'home', live: 'homing',
    body:
      '<p>When the controller powers on, it doesn’t know where the spindle is. It just calls wherever it is “zero”. <strong>Homing</strong> fixes that: each axis moves slowly until it touches its limit switch, then backs off a little. That spot is the machine’s own fixed origin, called <strong>home</strong>.</p>' +
      '<p>Positions measured from home are <strong>machine coordinates</strong> (ncSender shows them as MPos). They never change: a machine position is the same place on the table every day. (On many machines they read negative after homing; that’s normal.) That’s what lets ncSender remember zeros, a park spot and a tool setter’s location between sessions.</p>' +
      '<ul><li>Home every time you power on, and after an E-stop or an alarm that lost position.</li>' +
      '<li>Z usually homes first, going up, so the bit is lifted before X and Y move.</li>' +
      '<li>If a motor skipped (a crash, a stall), the machine’s idea of where it is is wrong. Homing again puts it right.</li></ul>',
    tryIt: { check: 'home', text: 'Make sure nothing is in the way of the spindle, then press <strong>Home</strong> in ncSender and watch each axis find its switch.' },
    quiz: [
      { q: 'Why home after powering on?', a: ['It warms up the motors', 'So the machine knows where it is: machine coordinates are true again', 'It clears the program'], right: 1,
        why: 'Until it homes, the controller only knows where it was when it powered on, not where that is on the table.' },
      { q: 'Which axis homes first, and why?', a: ['X, because it’s first', 'Z, so the bit is lifted before it moves across'], right: 1, why: 'Lifting first keeps the bit from dragging across clamps or the work.' }
    ],
    docs: ['jog-homing', 'homing-required', 'wizard-homing'] },

  { id: 'limits', level: 1, title: 'Limits and alarms', mins: 5, fig: null, live: 'limits',
    body:
      '<p>Every axis can only go so far. Two kinds of limit keep it inside:</p>' +
      '<ul><li><strong>Soft limits</strong> are in the controller’s settings: the travel of each axis, measured from home. A jog that would go past them is refused before it starts. A program isn’t checked ahead: it runs until the line that would go past, then stops with an alarm (ncSender’s out-of-bounds warning helps you catch that before you start). They only work after homing.</li>' +
      '<li><strong>Hard limits</strong> are the limit switches: if one is pressed while the machine moves, everything stops at once.</li></ul>' +
      '<p>When something goes wrong, the controller stops and goes into <strong>Alarm</strong>: a limit was hit, a probe didn’t touch, homing failed, the E-stop was pressed. An alarm means “I stopped because I might not be where you think.” ncSender shows the alarm’s number and what it means.</p>' +
      '<p><strong>Unlocking</strong> clears the alarm without homing. Do that only when you know why it happened and that the position is still right. After a hard limit, an E-stop or a crash, <strong>home instead</strong>: the position may be off.</p>',
    quiz: [
      { q: 'A program stops with a hard limit alarm in the middle of a cut. What next?', a: ['Unlock and press Start again', 'Find out why, then home before running anything', 'Turn soft limits off'], right: 1,
        why: 'A hard limit stops the motors suddenly, which can lose steps. Homing makes the position true again. Then find out why the program went there (wrong zero, a program too big for the stock).' },
      { q: 'Soft limits work…', a: ['Always', 'Only after homing'], right: 1, why: 'They’re measured from home, so the controller has to know where home is.' }
    ],
    docs: ['alarms-unlock', 'alarm-list', 'clear-alarm', 'wizard-switches'] },

  // ---------- Level 2: moving ----------
  { id: 'jogging', level: 2, title: 'Jogging', mins: 5, fig: 'jog',
    body:
      '<p><strong>Jogging</strong> is moving the machine by hand from ncSender, to put the bit where you want it: over a corner of the stock, down to touch its top, out of the way.</p>' +
      '<ul><li><strong>Step jog:</strong> each press moves exactly one step, {like 10, 1 or 0.1 mm|like 1, 0.1 or 0.01 in}. Use big steps to travel and small ones as you get close.</li>' +
      '<li><strong>Continuous jog:</strong> hold the button (or key) and the axis moves until you let go. Fast for long moves, risky near the work.</li>' +
      '<li><strong>Jog feed</strong> is how fast it moves. Slow down near the stock.</li>' +
      '<li>You can also jog from the keyboard, a gamepad or the ncSender pendant.</li></ul>' +
      '<p>Near the stock, always use small steps going down in Z. A {10 mm|0.5 in} step at the wrong moment drives the bit into the work or the table.</p>',
    tryIt: { check: 'jogSizes', text: 'Pick a step size and jog any axis once. Then do the same with two other step sizes. Watch how far each one goes.' },
    quiz: [
      { q: 'The bit is {3 mm|1/8 in} above the stock and you want to touch it. Which step?', a: ['{10 mm|0.5 in}', '{1 mm, then 0.1 mm|0.1 in, then 0.01 in}', 'Continuous jog down'], right: 1, why: 'Close to the work, small steps can’t overshoot.' }
    ],
    docs: ['jog-steps', 'jog-continuous', 'jog-feeds', 'jog-keys', 'gamepad', 'pendant'] },

  { id: 'out-of-the-way', level: 2, title: 'Getting out of the way', mins: 3, fig: 'safez', live: 'safe',
    body:
      '<p>The most common crash is a move across the table with the bit too low: it hits a clamp, a screw or the edge of the stock. The rule: <strong>lift Z first, then move X and Y.</strong></p>' +
      '<ul><li><strong>Safe Z Height</strong> is how high ncSender lifts before moving across, set in ncSender’s Settings › General.</li>' +
      '<li><strong>Go to zero</strong> takes the bit back over X0 Y0 (lifting first).</li>' +
      '<li><strong>Park</strong> moves the spindle to a spot you choose, out of the way, so you can load stock or change the bit.</li></ul>' +
      '<p>Programs follow the same rule: before each move across, they rapid up to a safe height above the stock and the clamps.</p>',
    quiz: [
      { q: 'The bit is touching the stock top and you want to go back to X0 Y0. First:', a: ['Move X and Y', 'Lift Z'], right: 1, why: 'Lifting first clears the stock and any clamps between here and there.' }
    ],
    docs: ['go-to-zero'] },

  // ---------- Level 3: zero ----------
  { id: 'work-coordinates', level: 3, title: 'Work coordinates', mins: 6, fig: 'wcs', live: 'offsets',
    body:
      '<p>Machine coordinates are measured from home, but your stock could be anywhere on the table. So a program isn’t written in machine coordinates. It’s written from a point on the stock you choose, like its front-left corner on top: the <strong>work zero</strong>, X0 Y0 Z0.</p>' +
      '<p>Before you run a program, you tell the machine where that point is: you jog the bit there and press <strong>Zero</strong>. The controller stores how far work zero is from home, the <strong>work offset</strong>. From then on, the machine goes to the work offset plus each of the program’s numbers. ncSender shows where the bit is measured from work zero as the <strong>work position</strong> (WPos).</p>' +
      '<p>The controller keeps <strong>six</strong> work offsets, named G54 to G59. G54 is active after power-on or a reset; a program uses whichever is active unless it names one.</p>' +
      '<p>Many people happily use G54 for every project: put the new stock down, zero on it and cut. That’s fine. Power users keep the others for setups they come back to, because each offset keeps its zero until you change it: a vise or jig bolted to the table, several parts or fixtures on the table at once, the second side of a part they flip, or the spoilboard for surfacing. Switching to that offset gets its zero back without zeroing again.</p>' +
      '<p>The table below is your machine’s six offsets right now, in machine coordinates.</p>',
    tryIt: { check: 'workspace', optional: true, text: 'Switch to another work offset in ncSender (for example G55), see the DRO’s numbers change while the machine doesn’t move, then switch back.' },
    quiz: [
      { q: 'You moved the stock {50 mm|2 in} to the right. What changes?', a: ['The program', 'The work offset: zero it again on the stock', 'The machine coordinates of home'], right: 1,
        why: 'The program is written from the stock’s corner. Zero again on the corner and the same program cuts in the new place.' },
      { q: 'A program doesn’t name a work offset. Which one does it use?', a: ['Always G54', 'Whichever is active in the controller now', 'Machine coordinates'], right: 1,
        why: 'The controller starts in G54, but it keeps whichever was selected last. Check the work offset ncSender shows before you run.' }
    ],
    docs: ['dro-zero', 'multi-workspace'] },

  { id: 'zero-xy', level: 3, title: 'Zero X and Y', mins: 5, fig: 'xyzero', live: 'zeromap',
    body:
      '<p>Where X0 Y0 goes on the stock is decided when the program is made (in your CAM or plugin): usually the <strong>front-left corner</strong> or the <strong>center</strong>. Zero must go on the same spot, or the whole cut moves.</p>' +
      '<ul><li><strong>On a corner:</strong> put the <strong>center</strong> of the bit over the corner, so half the bit hangs off the stock (lining up the bit’s edge is off by its radius). Get low enough to see it, with small steps, then zero X and Y.</li>' +
      '<li><strong>On the center:</strong> find the center (draw the diagonals, or zero on a corner and move half the size), then zero there.</li>' +
      '<li><strong>With a probe:</strong> a touch probe or block finds the corner by touching the edges, more exactly than by eye.</li></ul>' +
      '<p>The visualizer shows the program’s origin as a marker: check it’s where you zeroed before you run.</p>',
    tryIt: { check: 'zeroXY', text: 'Jog over a spot you can see, like the corner of a piece of scrap, and zero X and Y there in ncSender. Lift Z first if the bit is low.' },
    quiz: [
      { q: 'The program’s origin is the center of the stock, but you zeroed on the front-left corner. What happens?', a: ['It cuts in the right place', 'The cut is shifted: most of it hangs off the stock'], right: 1, why: 'The program draws around its origin. With the origin on the corner, most of it hangs off the stock.' }
    ],
    docs: ['zero-axis', 'dro-zero', 'probe-dialog'] },

  { id: 'zero-z', level: 3, title: 'Zero Z', mins: 5, fig: 'zzero',
    body:
      '<p>Z0 is usually the <strong>top of the stock</strong>: a {3 mm|1/8 in} deep pocket then goes to {Z−3|Z−0.125}. Some programs use the <strong>spoilboard</strong> (the bottom of the stock) instead, so a cut through always stops at the same place. The program and the zero must agree.</p>' +
      '<ul><li><strong>Paper method:</strong> with the spindle off, slide a sheet of paper under the bit and lower it in {0.1 mm|0.001 in} steps until the paper just drags. The paper is about {0.1 mm thick, so set Z to 0.1|0.004 in thick, so set Z to 0.004} there (or zero it and accept {0.1 mm|0.004 in}).</li>' +
      '<li><strong>Touch plate:</strong> lay the plate on the stock, clip the magnet to the bit, and <strong>test the circuit first</strong>: touch the plate to the bit and see ncSender’s probe signal change. If it doesn’t, the bit would drive into the plate. Then probe: ncSender lowers until the bit touches and subtracts the plate’s thickness. Put the clip and plate away before the spindle starts.</li></ul>' +
      '<p>Never zero Z with the spindle running, and keep the bit clean: a chip under the tip makes every cut shallower.</p>',
    tryIt: { check: 'zeroZ', text: 'Lower the bit onto a piece of scrap (paper method or touch plate) and zero Z in ncSender. Then lift {a few millimeters|about 1/8 in}.' },
    quiz: [
      { q: 'Z0 is the top of {6 mm|1/4 in} stock. To cut a part out cleanly, the last pass should go to…', a: ['{Z−6|Z−0.25} exactly', 'A little past it, like {Z−6.2|Z−0.26}', '{Z−12|Z−0.5}, to be sure'], right: 1,
        why: 'At exactly {Z−6|Z−0.25} a thin skin of fibers often stays at the bottom. A little past it cuts cleanly into the spoilboard, which is what the spoilboard is for.' }
    ],
    docs: ['zero-axis', 'probe-block', 'probe-types'] },

  { id: 'tool-length', level: 3, title: 'A new bit needs a new Z', mins: 5, fig: 'tlo', live: 'tool',
    body:
      '<p>Z0 is where <strong>the tip of the bit</strong> touched. Put in another bit and its tip is somewhere else: a longer bit sticks out further. Without doing anything, the next cut goes deeper or shallower by the difference. That’s the most common way to cut too deep after a tool change.</p>' +
      '<ul><li><strong>Simplest:</strong> after every bit change, zero Z again (paper or touch plate). Leave X and Y alone.</li>' +
      '<li><strong>With a tool length setter:</strong> a fixed switch on the table. The machine measures each bit on it, and the controller shifts Z by the difference, a <strong>tool length offset</strong>. Z0 then stays right for every bit.</li></ul>' +
      '<p>Two habits: measure (or rezero) every time a bit goes into the collet, even the same bit; and after homing, measure the bit before you trust Z.</p>',
    quiz: [
      { q: 'You changed to a longer bit and didn’t rezero Z. The program cuts…', a: ['To the right depth', 'Deeper than it should', 'Shallower'], right: 1, why: 'The longer bit’s tip is lower, so every Z goes deeper by the difference in length.' }
    ],
    docs: ['tls', 'tool-measure', 'faq-order', 'faq-plunged'] },

  // ---------- Level 4: running a program ----------
  { id: 'gcode', level: 4, title: 'G-code in five minutes', mins: 6, fig: null, live: 'gcode',
    body:
      '<p>A program is a text file of <strong>G-code</strong>: one command per line, each a letter and a number. You don’t need to write it (your CAM or a plugin does), but reading a few lines helps you spot trouble.</p>' +
      '<ul><li><strong>G0</strong> rapid, fast, never cutting. <strong>G1</strong> cut in a straight line. <strong>G2 / G3</strong> cut an arc, clockwise or counterclockwise.</li>' +
      '<li><strong>X Y Z</strong> where to go. <strong>F</strong> the feed rate, <strong>S</strong> the spindle speed.</li>' +
      '<li><strong>M3</strong> spindle on, <strong>M5</strong> spindle off, <strong>M30</strong> end.</li>' +
      '<li><strong>G21 / G20</strong> millimeters or inches. <strong>G90</strong> absolute positions (from zero), <strong>G91</strong> relative (from here).</li>' +
      '<li>Anything in (parentheses) is a comment.</li></ul>' +
      '<p>Here’s the practice program the next lessons use. Tap a line to read it in words.</p>',
    quiz: [
      { q: 'Which line cuts?', a: ['G0 X40 Y0', 'G1 X40 Y0 F1000'], right: 1, why: 'G1 moves at the feed rate F: a cut. G0 is a rapid, as fast as the machine goes.' },
      { q: 'A program in inches (G20) runs with your machine set to millimeters. Is that a problem?', a: ['Yes, it comes out 25.4 times too big', 'No: the program says G20, and the controller follows it'], right: 1,
        why: 'The G20 or G21 at the top tells the controller the program’s units. Check it’s there, and that the numbers look the right size.' }
    ],
    docs: ['gcode-preview'] },

  { id: 'check', level: 4, title: 'Check before you cut', mins: 5, fig: null,
    body:
      '<p>Most ruined parts could have been caught before pressing Start. When a program loads, the <strong>visualizer</strong> draws its path. Check:</p>' +
      '<ul><li><strong>The origin marker</strong> is where you mean to zero (the stock’s corner or center).</li>' +
      '<li><strong>The size</strong> is what you expect: the rulers show it. A part 25 times too big means a units mix-up.</li>' +
      '<li><strong>It fits on the stock</strong> and doesn’t pass over clamps or screws.</li>' +
      '<li><strong>The depth</strong> in the side view: no deeper than the stock, unless you mean to cut through.</li>' +
      '<li><strong>The out-of-bounds warning:</strong> ncSender warns when the program would go past the machine’s travel from the current zero.</li>' +
      '<li>The bit and the run time in the header make sense.</li></ul>',
    tryIt: { check: 'loadSample', button: 'load', text: 'Load the practice program. It only loads: nothing moves until you press Start. Close the tutor and find its origin, its {40 × 30 mm|1.5 × 1.25 in} rectangle and its depth in the visualizer.' },
    quiz: [
      { q: 'In the side view, the path goes {10 mm|1/2 in} below the stock’s bottom. What now?', a: ['Run it, the spoilboard will take it', 'Stop: the depth or the Z zero is wrong'], right: 1, why: 'A through cut goes {a fraction of a millimeter|a few thousandths} into the spoilboard, not {10 mm|1/2 in}. Something is set wrong.' }
    ],
    docs: ['load', 'view', 'out-of-bounds'] },

  { id: 'air-cut', level: 4, title: 'The air cut', mins: 6, fig: 'aircut',
    body:
      '<p>An <strong>air cut</strong> runs the program with the bit above the stock, so you can watch the whole path without cutting anything. It’s the best way to catch a clamp in the way, a wrong zero or a surprise move.</p>' +
      '<ol><li>Zero X, Y and Z as you will for the real cut.</li>' +
      '<li>Jog Z <strong>up {25 mm|1 in}</strong> and zero Z there. Now the program’s Z0 is {25 mm|1 in} above the stock, so every cut happens in the air. Its safe heights go up {25 mm|1 in} too: check Z has that much room above, or you’ll get a soft limit alarm.</li>' +
      '<li>Run the program and watch (the spindle turns on as usual; on a router with its own switch you can leave it off): does it stay over the stock and away from the clamps?</li>' +
      '<li>When it ends, lower Z back onto the stock and <strong>zero Z again</strong> before the real cut. Forgetting this is the classic mistake: the real cut then happens {25 mm|1 in} in the air.</li></ol>' +
      '<p>For the practice program, use a piece of scrap or no stock at all.</p>',
    tryIt: { check: 'airCut', text: 'Load the practice program (Check before you cut), raise Z0 {25 mm|1 in} as above, then run it and watch it to the end. Lower Z and rezero after.' },
    ticks: ['After the air cut, I put Z0 back on the stock'],
    quiz: [
      { q: 'The air cut is done. Before the real cut you must…', a: ['Press Start', 'Lower the bit and zero Z on the stock again'], right: 1, why: 'Z0 is still {25 mm|1 in} in the air from the air cut.' }
    ],
    docs: ['run', 'zero-axis'] },

  { id: 'pause-stop', level: 4, title: 'Pause, stop and resume', mins: 5, fig: null,
    body:
      '<ul><li><strong>Pause</strong> (feed hold) slows the machine to a stop on the path, keeping its place. <strong>Resume</strong> carries on. Good for looking closer or checking a clamp. <strong>The spindle keeps turning</strong>: to clear chips, stop the spindle and wait for it to stop before reaching in.</li>' +
      '<li><strong>Stop</strong> ends the program. Starting again starts from the top.</li>' +
      '<li><strong>Overrides</strong> change the feed and spindle speed while the program runs, as a percentage. Slow down if it chatters or the cut sounds strained; speed up if it’s timid.</li>' +
      '<li><strong>Start From Line</strong> restarts partway through, for example after a broken bit. Be careful: it starts at the line you choose, so the spindle, Z and the position must be right for it.</li>' +
      '<li>The <strong>E-stop</strong> is for danger, not for ending a job.</li></ul>',
    tryIt: { check: 'hold', optional: true, text: 'During an air cut, press Pause, wait, then Resume.' },
    quiz: [
      { q: 'The cut is screeching and the bit is smoking. First:', a: ['Turn the feed override up', 'Pause and look', 'Stop the job (E-stop if there’s flame), then find out why'], right: 2, why: 'Smoke means heat: the bit is rubbing. Pausing leaves it spinning in one spot, which burns worse. Stop, then fix the feeds or the bit (a dull bit, feed too slow, RPM too high).' }
    ],
    docs: ['run', 'overrides', 'start-from-line'] },

  // ---------- Level 5: cutting well ----------
  { id: 'bits', level: 5, title: 'Bits', mins: 5, fig: 'bits',
    body:
      '<p>A router bit (end mill) is chosen by what it cuts and how it leaves the edge:</p>' +
      '<ul><li><strong>Flat end</strong> for pockets and profiles: square bottom and walls.</li>' +
      '<li><strong>Ball end</strong> for 3D carving: a round tip that leaves smooth curves.</li>' +
      '<li><strong>V-bit</strong> for engraving, sign lettering and chamfers: the deeper it goes, the wider the line.</li>' +
      '<li><strong>Upcut</strong> spirals lift chips out (clean bottom, fuzzy top edge). <strong>Downcut</strong> pushes them down (clean top edge, chips packed in the slot). <strong>Compression</strong> bits do both, for plywood.</li>' +
      '<li><strong>Flutes</strong> are the cutting edges. On a hobby router, 2 flutes is usual for wood, and 1 flute for plastics and aluminum: fewer flutes leave room for bigger chips.</li></ul>' +
      '<p>Cutting length matters too: a bit can only cut as deep as its flutes, and a longer bit bends more. Use the shortest bit that reaches.</p>',
    quiz: [
      { q: 'You want a clean top edge cutting plywood. Which bit?', a: ['Upcut', 'Downcut or compression'], right: 1, why: 'A downcut pushes the top fibers down instead of tearing them up.' }
    ],
    docs: ['tool-library'] },

  { id: 'feeds-speeds', level: 5, title: 'Feeds and speeds', mins: 8, fig: 'chip', live: 'feeds',
    body:
      '<p>Two numbers set how a bit cuts: <strong>spindle speed</strong> (RPM) and <strong>feed rate</strong> (how fast it moves through the work). What matters is the <strong>chip load</strong>: how thick a chip each cutting edge takes.</p>' +
      '<p class="ct-formula">feed = RPM × flutes × chip load</p>' +
      '<ul><li><strong>Too small a chip</strong> (slow feed, high RPM): the edge rubs instead of cutting. Heat, burn marks, a dull bit, dust instead of chips, even fire.</li>' +
      '<li><strong>Too big a chip</strong> (fast feed): the bit is overloaded. Chatter, a rough edge, the machine straining, broken bits.</li>' +
      '<li><strong>Just right:</strong> chips, not dust; a steady, even sound; the bit warm, not hot.</li></ul>' +
      '<p>Start from the table below (the same starting points QuickCut, Gears and Spoilboard Toolbox use), make a test cut, then adjust by listening and looking at the chips. To go faster, raise the feed and keep the RPM: bigger chips carry the heat away.</p>' +
      '<p><strong>Feeds and speeds belong to one bit in one material.</strong> When you change the bit (another diameter, number of flutes or kind) or the material, work them out again: what cuts pine nicely can burn hardwood or break a small bit in aluminum.</p>',
    quiz: [
      { q: 'The cut makes fine dust and leaves burn marks. Most likely:', a: ['The chip load is too small: feed up or RPM down', 'The chip load is too big'], right: 0, why: 'Dust and heat mean the edge is rubbing. A thicker chip carries the heat away.' },
      { q: 'At 18000 RPM, 2 flutes and {0.05 mm|0.002 in} chip load, the feed is…', a: ['{900 mm/min|36 in/min}', '{1800 mm/min|72 in/min}', '{3600 mm/min|144 in/min}'], right: 1, why: '18000 × 2 × {0.05 = 1800 mm/min|0.002 = 72 in/min}.' }
    ],
    docs: ['overrides', 'spindle'] },

  { id: 'depth-stepover', level: 5, title: 'Depth of cut and stepover', mins: 4, fig: 'stepover',
    body:
      '<p>The bit can’t go full depth in one pass. A program steps down:</p>' +
      '<ul><li><strong>Depth per pass</strong> (stepdown): how much deeper each pass goes. A common start in wood is half the bit’s diameter; less in hard materials and with small bits.</li>' +
      '<li><strong>Stepover</strong>: how far the bit moves over between rows when clearing a pocket, as a share of its diameter. With a flat bit, 40–50 % is normal and leaves a flat floor. With a ball bit carving 3D, 10–20 % gives a smooth surface.</li>' +
      '<li><strong>Roughing then finishing:</strong> take most of the material fast, then a light last pass for a clean wall and an exact size.</li></ul>' +
      '<p>A slot (the bit cutting with both sides, like the first pass of a profile) is the hardest work for a bit: go a little shallower there.</p>',
    quiz: [
      { q: 'A {6 mm|1/4 in} bit in hardwood. A sensible first depth per pass?', a: ['{12 mm|1/2 in}', 'About {2–3 mm|0.08–0.12 in}', '{0.1 mm|0.004 in}'], right: 1, why: 'Around half the diameter or a bit less in hardwood. {0.1 mm|0.004 in} rubs; {12 mm|1/2 in} overloads it.' }
    ],
    docs: [] },

  { id: 'climb-conventional', level: 5, title: 'Climb vs conventional', mins: 4, fig: 'climb',
    body:
      '<p>When a bit cuts along a wall, each cutting edge takes its chip one of two ways:</p>' +
      '<ul><li><strong>Conventional</strong>: the chip starts thin and ends thick; the bit pushes back against the feed. More forgiving on a less stiff machine; it can leave a rougher edge in some woods.</li>' +
      '<li><strong>Climb</strong>: the chip starts thick and ends thin; the bit pulls itself into the work. Usually a cleaner edge, but it pulls the bit into the work, so a flexible machine can be dragged off line.</li></ul>' +
      '<p>With the spindle turning clockwise (M3), seen from above: going around the <strong>outside</strong> of a part <strong>clockwise</strong> is climb, counterclockwise is conventional. Inside a pocket it’s the reverse: counterclockwise is climb. Your CAM or plugin has a setting for it. A common habit: rough conventional, finish with a light climb pass.</p>' +
      '<p>Some programs call them <strong>left</strong> and <strong>right</strong> cut instead, after the side of the wall the bit runs on, looking the way it moves. With the spindle clockwise, a <strong>left</strong> cut (the bit left of the wall, the material on its right) is climb, and a <strong>right</strong> cut is conventional. G-code’s cutter compensation uses the same sides: G41 left, G42 right.</p>',
    quiz: [
      { q: 'Spindle clockwise, cutting around the outside of a part counterclockwise. That’s…', a: ['Climb', 'Conventional'], right: 1, why: 'Outside a part with a clockwise spindle: clockwise is climb, counterclockwise is conventional.' }
    ],
    docs: [] },

  { id: 'workholding', level: 5, title: 'Holding the work', mins: 4, fig: ['clamps', 'clampcrash'],
    body:
      '<p>The bit pushes the work sideways with real force. If it moves even a little, the part is ruined; if it comes loose, it’s thrown.</p>' +
      '<ul><li><strong>Clamps</strong> on the edges: low ones, placed where the program won’t go. Check in the visualizer.</li>' +
      '<li><strong>Screws</strong> into the spoilboard, outside the cut (use brass or plastic if the bit could reach them).</li>' +
      '<li><strong>Painter’s tape and super glue</strong>: tape on the stock and the spoilboard, glue between. Great for thin sheets.</li>' +
      '<li><strong>Dog holes and pins</strong> in the spoilboard to push the stock square against.</li>' +
      '<li><strong>Vacuum clamps</strong> (pods or a vacuum table): suction holds the stock flat with nothing on top, so the bit can reach every edge. A production timesaver: set the next sheet down, turn the vacuum on, and run. They need a flat, smooth bottom face, and a small part can let go once it’s cut free, so use tabs or onion skin (a thin skin left on the bottom).</li>' +
      '<li><strong>Tabs</strong>: small bridges the program leaves so a cut-out part stays attached until the end. Without tabs, the last pass can catch a free part and throw it.</li></ul>' +
      '<p>Watch the height too. A clamp that sticks up above the stock can be hit even when the bit misses it: the collet and spindle are wider than the bit, so cutting close to a tall clamp can run them into it. A rapid at a low safe height can hit it too. Keep clamps low and away from the cut, and set the program’s safe height above the tallest clamp.</p>' +
      '<p>Before every job: is everything tight, and is every clamp and screw clear of the path, including the rapids?</p>',
    quiz: [
      { q: 'You’re cutting a small part all the way out of the sheet. What keeps it from flying at the end?', a: ['A faster feed', 'Tabs, or tape and glue', 'Nothing is needed'], right: 1, why: 'Once the last pass cuts through, the part is free. Tabs or tape and glue hold it.' }
    ],
    docs: ['keepout'] },

  // ---------- Level 6: probing and tool changes ----------
  { id: 'collet', level: 6, title: 'Changing a bit: the collet', mins: 5, fig: 'collet',
    body:
      '<p>The bit is held by a <strong>collet</strong>: a slotted sleeve that squeezes the bit’s shank when the <strong>nut</strong> is tightened. Each collet fits one shank size (1/4", 1/8", 6 mm…). Spindles use ER collets; trim routers have their own.</p>' +
      '<ol><li><strong>Spindle off.</strong> Unplug a router, or switch off the spindle, before your hands go near the bit.</li>' +
      '<li><strong>Clean</strong> the collet, the nut and the cone inside the spindle the collet sits in: a chip in there makes the bit wobble.</li>' +
      '<li><strong>Snap the collet into the nut first</strong> (an ER collet clicks into place when pushed in at a slight angle). If it isn’t clicked in, it won’t grip evenly or let go later.</li>' +
      '<li><strong>Put the bit in</strong> so most of the shank is gripped, with the flutes clear of the collet and the bit not touching the bottom. Less sticking out means less bending and chatter.</li>' +
      '<li><strong>Tighten firmly</strong> with the two wrenches (or the spindle lock and one wrench). Firm, but don’t add a pipe or a longer lever for force.</li></ol>' +
      '<p><strong>Loosening:</strong> the nut turns easily, then gets tight again: that’s the nut pulling the collet out of the spindle’s cone. Keep turning, and hold the bit so it doesn’t drop onto the work.</p>' +
      '<p>Never tighten the nut with no bit in (it bends the collet), and replace a collet that’s worn or has let a bit slide out. After a bit change, Z0 needs measuring again: [[tool-length]].</p>',
    ticks: ['The spindle is off (the router unplugged) when I change a bit', 'I snap the collet into the nut before the bit goes in'],
    quiz: [
      { q: 'Loosening the nut, it turns easily, then gets tight again. What’s happening?', a: ['It’s cross-threaded: stop', 'The nut is pulling the collet out of the spindle: keep turning'], right: 1,
        why: 'The second tight spot is the collet coming free of the spindle’s cone. That’s normal; keep turning.' },
      { q: 'How far does the bit go into the collet?', a: ['Just the end of the shank', 'Most of the shank, flutes clear of the collet, not touching the bottom', 'All the way, flutes inside the collet'], right: 1,
        why: 'Gripping most of the shank holds it straight. Flutes in the collet can’t be gripped evenly; a bit on the bottom can’t seat.' }
    ],
    docs: ['tool-library'] },

  { id: 'probe-circuit', level: 6, title: 'How a probe works', mins: 4, fig: 'probecircuit', live: 'probe',
    body:
      '<p>A touch plate, a 3D probe and a tool length setter all work the same way: a <strong>switch</strong>. For a touch plate, the clip on the bit and the metal plate are the two sides of the switch. When the bit touches the plate, the circuit closes, the controller stops at once and records exactly where it was.</p>' +
      '<p>That’s more exact than paper, and the same every time. ncSender then works out the zero from that spot (taking off the plate’s thickness, for example).</p>' +
      '<ul><li><strong>The danger:</strong> if the circuit can’t close (the clip fell off, a broken wire), nothing tells the controller to stop: the bit keeps pushing into the plate until it has gone as far as the probe is allowed to travel, then gives up with an alarm.</li>' +
      '<li>So <strong>test it every time</strong>: touch the plate to the bit and watch the probe light in ncSender come on. ncSender can ask for this before each probe (the connection test).</li>' +
      '<li>Spindle off while probing. Probing moves slowly; keep your hands clear anyway.</li></ul>',
    tryIt: { check: 'probeSignal', text: 'With the spindle off and the clip on the bit, touch the plate to the bit by hand. The probe input should light up.' },
    quiz: [
      { q: 'You start a Z probe but the clip fell off the bit. What happens?', a: ['It stops when it touches anyway', 'Nothing closes the circuit: the bit pushes into the plate until the probe gives up with an alarm'], right: 1,
        why: 'The controller only stops when the circuit closes. That’s why you test it first.' }
    ],
    docs: ['probe-connection', 'faq-probe-signal'] },

  { id: 'touch-plate', level: 6, title: 'The touch plate', mins: 6, fig: 'touchplate', live: 'touchplate',
    body:
      '<p>A <strong>touch plate</strong> (ncSender calls it a Standard block) sits on the stock. Probing Z, the bit comes down onto its top; probing X and Y, the bit comes down beside the plate and touches the outside of its lips, which hang over the stock’s edges. ncSender takes off the plate’s thickness and the bit’s radius and sets the zero on the stock.</p>' +
      '<ul><li><strong>Z thickness:</strong> the plate’s height. Measure it once with calipers and enter it exactly: any error goes straight into your depth.</li>' +
      '<li><strong>XY thickness:</strong> how thick those lips are, from the face the bit touches to the stock’s edge.</li>' +
      '<li><strong>Bit diameter:</strong> for X and Y, the bit touches with its side, so its center is half a diameter away. Give the real diameter.</li>' +
      '<li><strong>Corner:</strong> tell ncSender which corner of the stock the plate is on.</li>' +
      '<li><strong>AutoZero Touch</strong> plates measure the bit for you and need almost no setup.</li></ul>' +
      '<p>Start the bit over the plate, {a few millimeters|about 1/8 in} above it, and do the connection test. Afterwards, put the clip and the plate away before the spindle starts.</p>',
    tryIt: { check: 'probeCycle', text: 'In ncSender, press Probe, pick your plate, and probe Z (or XYZ on a corner). Test the connection first.' },
    quiz: [
      { q: 'Your plate is {15 mm|0.6 in} thick. After probing Z, where is Z0?', a: ['On top of the plate', 'On top of the stock under it: ncSender takes off the {15 mm|0.6 in}'], right: 1,
        why: 'ncSender subtracts the plate’s thickness, so Z0 lands on the stock.' },
      { q: 'Why does X and Y probing need the bit’s diameter?', a: ['To pick the feed', 'The bit touches with its side, so its center is half a diameter from the wall'], right: 1,
        why: 'The zero is the stock’s edge; the bit’s center stops a radius away from it.' }
    ],
    docs: ['probe-block', 'probe-autozero', 'probe-dialog'] },

  { id: 'tls', level: 6, title: 'The tool length setter', mins: 6, fig: 'tls', live: 'tls', needs: 'tls',
    body:
      '<p>A <strong>tool length setter</strong> (TLS) is a switch fixed to the table. The machine brings each bit down onto it and records where the tip touched. The difference between two bits is their difference in length: the controller shifts Z by it, the <strong>tool length offset</strong>, so Z0 stays right after a bit change without zeroing on the stock again.</p>' +
      '<ul><li>After power-on, the tool in the spindle must be measured once before it cuts: ncSender’s TLS button blinks red until it is (if you don’t, ncSender measures it when you press Start).</li>' +
      '<li>ncSender can measure right after homing (TLS after homing): the machine then moves to the setter by itself.</li>' +
      '<li>Set Z0 before or after measuring: both work in ncSender.</li>' +
      '<li>Every time a bit goes into the collet, even the same bit, measure it again.</li></ul>',
    tryIt: { check: 'tlsMeasure', optional: true, text: 'Press and hold TLS in ncSender to measure the bit in the spindle. Keep clear: the machine moves on its own.' },
    quiz: [
      { q: 'After power-on, the TLS button blinks red. Why?', a: ['The setter is broken', 'The bit in the spindle hasn’t been measured since power-on'], right: 1,
        why: 'The offset is lost at power-off; measure once before cutting.' },
      { q: 'With a TLS, you change from a 1/4" bit to a 1/8" one. Do you zero Z on the stock again?', a: ['Yes, every time', 'No: measure the new bit on the TLS and Z0 stays right'], right: 1,
        why: 'That’s the point of the setter: the offset makes up the difference in length.' }
    ],
    docs: ['tls', 'tls-power', 'tls-z0', 'probe-tls'] },

  { id: 'tool-changes', level: 6, title: 'Tool changes and the ATC', mins: 7, fig: 'atc', live: 'atc', needs: 'atc',
    body:
      '<p>A program that uses several bits has <strong>tool changes</strong>: a line like <code>M6 T3</code> says “now tool 3”.</p>' +
      '<ul><li><strong>By hand:</strong> the program pauses and ncSender asks for the tool. Change the bit ([[collet]]), measure it on the TLS or zero Z again, then carry on.</li>' +
      '<li><strong>Automatic tool changer (ATC):</strong> the tools wait in a <strong>magazine</strong> on the table. The spindle goes to its tool’s slot, leaves the one it has, picks up the next, and measures it. A Rapid Change ATC spins the collet nut on and off with the spindle; a pneumatic one opens the spindle with air to drop a tool holder.</li>' +
      '<li><strong>Which tool is T3?</strong> With Slot numbering, the tool in slot 3. With Tool ID numbering, the tool whose ID is 3, wherever it sits; a tool not in the magazine is changed by hand.</li>' +
      '<li><strong>Safety:</strong> an ATC moves fast, on its own. Stay clear, and keep the magazine’s positions set right: a wrong slot position crashes the spindle into the rack.</li></ul>',
    tryIt: { check: 'toolChange', optional: true, text: 'Hold a slot’s button in ncSender to change to that tool. Stay clear while it moves.' },
    quiz: [
      { q: 'During an automatic tool change, you…', a: ['Reach in to guide the tool', 'Stay clear: the machine moves fast on its own'], right: 1, why: 'An ATC doesn’t know your hand is there.' },
      { q: 'With Tool ID numbering, M6 T3 loads…', a: ['The tool in slot 3', 'The tool with Tool ID 3, wherever it sits'], right: 1, why: 'Tool ID numbering keeps your CAM’s numbers even when tools move between slots.' }
    ],
    docs: ['tool-numbering', 'tool-buttons', 'tool-library-slot', 'manual-tc', 'rapid-change', 'pneumatic-atc'] },

  { id: 'probe-3d', level: 6, title: 'The 3D probe', mins: 5, fig: 'probe3d', live: 'probe3d', needs: 'probe3d',
    body:
      '<p>A <strong>3D probe</strong> goes in the spindle like a bit. Its stylus, with a small ball on the end, is on a spring: when the ball touches something from any side, the stylus tips a little and the probe signals.</p>' +
      '<ul><li>It finds an <strong>edge</strong>, a <strong>corner</strong>, the <strong>top</strong>, or the <strong>center</strong> of a hole or a round part, without a plate.</li>' +
      '<li><strong>Ball diameter:</strong> ncSender allows for it on edges and corners (a center comes out right whatever the ball). The stylus bends a little before it signals, so the probe acts slightly smaller than the ball: if edges come out a little off, enter that smaller effective diameter.</li>' +
      '<li>It’s a tool in the tool library: the Probe slot (T99 by default). Hold its button to load it.</li>' +
      '<li><strong>Never turn the spindle on with the probe in.</strong> Check the program and the tool before pressing Start.</li></ul>',
    quiz: [
      { q: 'Can you run the spindle slowly with the 3D probe in?', a: ['Yes, at low RPM', 'Never: it wrecks the probe'], right: 1, why: 'The probe isn’t made to spin.' },
      { q: 'Edges probed with a 3D probe come out a little off. Why might that be?', a: ['The ball changes size with temperature', 'The stylus bends a little before it signals, so it acts slightly smaller than the ball'], right: 1,
        why: 'Entering the smaller, effective diameter puts the edges right.' }
    ],
    docs: ['probe-3d', 'tool-library-probe'] },

  // ---------- Your first part ----------
  { id: 'first-part', level: 99, title: 'Your first part', mins: 30, fig: null,
    body:
      '<p>Everything together: a shallow pocket in a piece of scrap, made with the <strong>QuickCut</strong> plugin (install it from ncSender’s Plugins if you don’t have it). Go step by step; each links back to its lesson.</p>',
    steps: [
      { text: 'Safety glasses on, hearing protection, dust collection ready, E-stop in reach.', lesson: 'safety' },
      { text: 'Home the machine.', lesson: 'homing' },
      { text: 'Hold a piece of scrap down: clamps or tape and glue, clear of the middle.', lesson: 'workholding' },
      { text: 'Put in a flat end bit, {3–6 mm|1/8–1/4 in}.', lesson: 'bits' },
      { text: 'Zero X and Y on the scrap’s front-left corner.', lesson: 'zero-xy' },
      { text: 'Zero Z on the scrap’s top.', lesson: 'zero-z' },
      { text: 'In QuickCut, make a rectangle pocket {40 × 30 mm, 2 mm|1.5 × 1.25 in, 0.08 in} deep, from the front-left corner, with your bit. Use its starting feeds.', lesson: 'feeds-speeds' },
      { text: 'Check it in the visualizer: origin, size, depth, clear of the clamps.', lesson: 'check' },
      { text: 'Air cut it with Z0 raised {25 mm|1 in}, then put Z0 back on the stock.', lesson: 'air-cut' },
      { text: 'Run it. Stay by the machine, listen, and watch the chips.', lesson: 'pause-stop' },
      { text: 'When the spindle has stopped, vacuum up and measure the pocket.', lesson: null }
    ],
    docs: ['quickcut', 'faq-new'] }
];

var CT_GLOSSARY = [
  ['Air cut', 'Running a program with Z0 raised, so it cuts nothing.', 'air-cut'],
  ['Alarm', 'The controller stopped because something went wrong; it won’t move until cleared.', 'limits'],
  ['Chip load', 'How thick a chip each cutting edge takes: feed ÷ (RPM × flutes).', 'feeds-speeds'],
  ['Climb milling', 'Each chip starts thick and ends thin; the bit pulls into the work. Also called a left cut.', 'climb-conventional'],
  ['Conventional milling', 'Each chip starts thin and ends thick; the bit pushes back. Also called a right cut.', 'climb-conventional'],
  ['ATC', 'Automatic tool changer: a magazine of tools the spindle swaps by itself.', 'tool-changes'],
  ['Collet', 'The slotted sleeve that grips the bit when its nut is tightened.', 'collet'],
  ['DRO', 'Digital readout: the position numbers in ncSender.', 'work-coordinates'],
  ['E-stop', 'The emergency stop button: stops the motors and, on most machines, the spindle.', 'safety'],
  ['Feed hold', 'A pause that stops on the path and keeps the program’s place.', 'pause-stop'],
  ['Feed rate', 'How fast the bit moves through the work (F).', 'feeds-speeds'],
  ['Flute', 'One cutting edge of a bit.', 'bits'],
  ['G-code', 'The text commands a program is made of.', 'gcode'],
  ['G54–G59', 'The six work offsets the controller keeps.', 'work-coordinates'],
  ['Hard limit', 'A limit switch that stops the machine when pressed.', 'limits'],
  ['Home', 'The machine’s fixed origin, found by homing to its switches.', 'homing'],
  ['Jog', 'Moving the machine by hand from ncSender.', 'jogging'],
  ['Machine coordinates', 'Positions measured from home (MPos).', 'homing'],
  ['Park', 'A spot you choose to move the spindle out of the way.', 'out-of-the-way'],
  ['Probe', 'A switch the bit or stylus touches, so the controller records exactly where.', 'probe-circuit'],
  ['Rapid', 'A fast move that doesn’t cut (G0).', 'gcode'],
  ['Safe Z', 'A height to lift to before moving across.', 'out-of-the-way'],
  ['Soft limit', 'A travel limit in the controller’s settings, checked before moving.', 'limits'],
  ['Spoilboard', 'The sacrificial board on the table you cut into when cutting through.', 'zero-z'],
  ['Stepdown', 'How much deeper each pass goes.', 'depth-stepover'],
  ['Stepover', 'How far over each row goes when clearing a pocket.', 'depth-stepover'],
  ['Tabs', 'Small bridges that hold a cut-out part in place.', 'workholding'],
  ['TLS', 'Tool length setter: a switch on the table that measures each bit’s length.', 'tls'],
  ['Tool length offset', 'The Z shift for a bit’s length, from a tool length setter.', 'tool-length'],
  ['Touch plate', 'A metal block the bit touches to find the zero.', 'touch-plate'],
  ['Work offset', 'Where work zero is, measured from home.', 'work-coordinates'],
  ['Work zero', 'X0 Y0 Z0 of a program, set on the stock.', 'work-coordinates']
];

// "{25 mm|1 in}" in lesson text: the first in millimeters, the second in inches,
// as ncSender is set. Natural values, not exact conversions.
function ctUnits(text, units) {
  return String(text == null ? '' : text).replace(/\{([^{}|]*)\|([^{}]*)\}/g, function(all, mm, inch) { return units === 'in' ? inch : mm; });
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ctUnits: ctUnits, CT_DOCS_BASE: CT_DOCS_BASE, CT_DOCS: CT_DOCS, CT_LEVELS: CT_LEVELS, CT_LESSONS: CT_LESSONS, CT_GLOSSARY: CT_GLOSSARY };
}
