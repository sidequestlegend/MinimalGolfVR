# mini-golf: test evidence

Everything here ran on 2026-11-24 on Windows, Unity 6000.3.21f1, Creator SDK 4.0.29, in the Unity editor. Nothing ran
in the Altspace app, on a Quest, or with controllers (rung 5: not run; worlds stay Private).

How to run each rung again:

```
cd altspace/ts && npm test                                                    rungs 0 and 1
cd altspace/ts && npm run golden                                              remake vectors/upstream.json (dotnet 8)
portkit/tools/remote.sh altspace menu "PortKit/Kit/Build Prefabs"            the kit, ts/bindings.json (then npm run build)
portkit/tools/remote.sh altspace menu "PortKit/Kit/Build Bundles" 900
portkit/tools/remote.sh altspace menu "PortKit/Kit/Check"                    rung 2 (Logs/portkit_check.txt)
portkit/tools/playtest.sh altspace altspace/playtest/single.json mini-golf    rung 3 (includes the tunnelling pass)
portkit/tools/playtest.sh altspace altspace/playtest/tunnel.json mini-golf    the tunnelling pass alone
portkit/tools/remote.sh altspace menu "PortKit/Multiplayer/Activate Player 2"
portkit/tools/playtest.sh altspace altspace/playtest/multi.json mini-golf     rung 4
```

## Rung 0: static

`npm run typecheck` (tsc, strict) and `npm run lint` (only the platform adapters touch the page or the clock): clean.

## Rung 1: Node (no Unity)

`npm test` in `altspace/ts`: **38 tests, 38 pass, 0 fail**, on the kit builder's real `bindings.json` (hash
`8695da876f8b99001855d4b03dd802c00d237fc3`) and the re-synced portkit runtime.

- **Golden (12)**: `golden/Golden.csproj` compiles MinimalGolfVR's own gameplay C# unchanged with dotnet 8 against
  portkit's `golden/UnityStubs.cs` and `golden/MetaXRStubs.cs` (the game's own stub copy is gone). `npm run golden`
  regenerated `vectors/upstream.json` (suites: aim, club, assist, capture, layout, bounds, reveal, ui, impact, audio,
  windmill). Only the `audio` suite changed: the stubs' `Random` is now Unity's Xorshift128, and the port's
  `UnityRandom(7)` gives the same 300 `Range` draws as the stubs (checked draw for draw in the test). Everything else
  matched as before (PORT.md 11.6).
- **Rules (9)**: `levels.json` equals PORT.md 5.3 (all eight levels now read back from the imported scene, none
  provisional; level 7's hole (-3.055, 0.11, 1.463)); the bindings are the kit builder's, with b1 MinimalGolfGame,
  b2 VRGolfUI, b3 GolfPlayer and every object key the rules use.
- **Fake room (17)**: as PORT.md 11.6, now with the nine relay ops declared through `room.defineRelayOp`, clicks on aim
  pads, ball picks and RESTART HOLE bound to the per-player `GolfPlayer` (the runtime hands them to the local copy), and
  a new scenario: in a headset each hand carries its green sphere (`AttachToHand`, left sphere on point 1, right on 2);
  on desktop nothing is attached.

## Rung 2: the kit in edit mode (`PortKit/Kit/Check`)

```
PASS graphs: the SDK's check found 0 nodes the app will not run
PASS mini-golf bindings: 83 objects resolve by path; hash matches (8695da876f8b99001855d4b03dd802c00d237fc3)
PASS mini-golf android bundle: PASS Kind=Pass Reasons=[] Reports=[] Stats=files 1 (format 22), scenes 0, objects 217/1661, behaviours 199, scripts 10, calls 0, animation events 0, graph blobs 32 (605 KiB) ...
PASS mini-golf windows bundle: PASS Kind=Pass Reasons=[] Reports=[] ...
DONE
```

Graph members: relay 73, ball 25, windmill 3, all on the SDK allow list of 29,061 (`GraphWriter.Save`). Kit: 377
objects, 83 bound (8 synced, 19 clickable), 61 refs, 3 behaviours, 19 events. Bundles: Android 1,214 KiB, Windows
1,301 KiB, each with the third-party notices inside; textures: Kenney's 512 px colormap and the two font atlases.

Artifacts (`PortKit/Kit/Export Artifacts`, `altspace/dist/`, not committed): `android/mini-golf`, `windows/mini-golf`,
`pk-mini-golf.js` (MIT header), `mini-golf.jpg`, `mini-golf.snippet.html` (`position="0 1 0"` and the nine settings),
`manifest.json` (checks android PASS, windows PASS, bindings `8695da87...`, footprint 3.96 x 1 x 5.31 m: the board stands
2.7 m behind the green, as upstream's does).

## Rung 3: Play mode, one player (`playtest/single.json`)

A hand-written `<bs-snippet name="mini-golf" ... position="0 0.7 0.55">` with the built script and both bundles from the
test's local server, and `Assets/WebRoot/playtest/golf-playtest.js`, which drives the table through the SDK's desktop
player with portkit's InputSim (a mouse and keyboard of the test's own; the SDK casts its own rays and raises the page's
click and key events) and reads Unity back with the `probe` command. **RESULT 24 passed, 0 failed**
(`playtest/evidence_single.txt`, pictures `playtest/evidence_single_start.jpg`, `evidence_single_hole2.jpg`).

```
PASS the kit loads from a hand-written bs-snippet and the instance starts: hole 0
PASS the eight pooled balls have network ids of this instance (BS Synced Object added by the script): pk1/mini-golf/0/ball0 ... pk1/mini-golf/0/ball7
PASS no ball shows before a player is seated: 8 of 8 hidden
PASS the board shows hole 1 (relay op text): THE WARM UP
PASS JOIN (a UI collider, real mouse) seats the player: slot 0, button LEAVE
PASS after the reveal the ball is placed at the reset point and reported at rest (ball graph: golfRest): ball 0.000,0.713,0.348, reset point 0.000,0.714,0.348, 0.0005 m apart
PASS the own ball shows: True
INFO putt 1 from 0.410 m: pull 0.012 m + 0 steps, power 0.077, strokes 0 -> 1
INFO rolled 0.255 m toward the hole; pull per metre now 0.0482
INFO putt 2 from 0.155 m: pull 0.011 m + 0 steps, power 0.097, strokes 1 -> 2
INFO rolled 0.201 m toward the hole; pull per metre now 0.0370
INFO putt 3 from 0.047 m: pull 0.011 m (clicked to the side, turned back with 18 x LeftArrow) + 0 steps, power 0.066, strokes 2 -> 3
PASS hole 1 played to the cup with desktop controls (click the green, Space): 3 strokes, finished 1
PASS the board shows the stroke count: board '3', player 3
PASS the capture: the ball shrinks and sinks into the cup (sink op, ball graph): scale 0.080,0.080,0.080, ball 0.000,0.690,0.758, hole 0.000,0.705,0.758
PASS the hole-complete message shows: HOLE COMPLETE  •  +1 OVER PAR
PASS the scorecard records the hole: Main Editor    3                                3
PASS the next level loads 2.05 s later (THE GARDEN): THE GARDEN, LEVEL 2 / 8
PASS on hole 2 the ball is back at its reset point, level strokes 0, total kept: ball -0.075,0.715,0.250, total 3
PASS out of bounds resets the ball to the reset point, BALL RETURNED, no stroke (D1, D2): ball -0.075,0.713,0.250, strokes 0 -> 0
PASS JOIN (a UI collider, real mouse) seats the player, in a new round: slot 0, button LEAVE
PASS tunnelling, hole 1 (4.4 x 10.5 units): no full-power shot passes through a rail: forward: inside, rest at (0.00,0.26,-5.09); back: inside ...
  ... holes 2 to 5, 7, 8 the same ...
PASS tunnelling, hole 6 (11.5 x 15 units): no full-power shot passes through a rail: forward: FLEW OVER THE RAILS (launched; crossing at -3.25,4.03,8.14, peak height 4.04), rest at (-3.25,0.28,-6.25); back: inside ...
INFO tunnelling: 32 full-power shots, 0 through a rail
```

What each line exercised on the Unity side: JOIN is a click on a board collider (UI layer); the reveal is the level's
baked clip (`reveal` op); the ball is placed by the `place` op and the ball graph reports `golfRest`; each putt is a click
on the current level's aim pad (a trigger on the UI layer) where the hand would be pulled to, then Space, which sends the
`impulse` op; the ball graph's cup pull and capture test reports `golfCapture`, and the `sink` op runs the capture move;
the stroke count, messages and scorecard are `text` ops. Out of bounds: the test put the ball 20 cm under the green (a
test lever, `debug.moveBall`, standing for a fall off the table); the page saw it outside, sent `place` and showed BALL
RETURNED. Tunnelling: a full-power putt (impulse 2.0, 4.4 m/s; a click 5 cm behind the ball, then nine UpArrow) forward,
back, left and right from each hole's reset point, the ball followed in level units throughout (PORT.md 12.5).

**Things to know.**
- The one console error line in every run is the editor's own search indexer at Play start
  (`UnityEditor.Search.SearchDatabase ... IndexationOnStartup`), not the kit.
- Space state outlives a Play session in the local relay: a run that starts where an earlier one left a seat finds the
  player seated; the test then does not click JOIN (it would leave). The referee starts a new round when nobody from
  the old one is present, so each run starts on hole 1.
- **Desktop `pull` aiming and the ball's own pick**: a weak putt is a click about a centimetre behind the ball. The ball
  carries a pick sphere (click it to putt while aiming); at first it was 1.1 cm in radius and swallowed those clicks, so
  it is now the size of the ball. A putt toward the player still means clicking just beyond the ball, which the ball
  hides; the test (as a player would) clicks a quarter turn to the side and turns the aim back with 18 LeftArrow taps.

## Rung 4: two Local Multiplayer players (`playtest/multi.json`)

The main editor and a Multiplayer Play Mode clone (`PortKit/Multiplayer/Activate Player 2`) open the same page. The
player whose session id sorts first is A. They follow each other through the table's state and exchange checkpoints
(digests) as one-shots, which the runtime ignores. After hole 1, B reloads its page. **RESULT 27 passed, 0 failed**
(`playtest/evidence_multi.txt`).

```
[main] PASS JOIN (a UI collider, real mouse) seats A: slot 0, button LEAVE
[vp] PASS JOIN (a UI collider, real mouse) seats B: slot 1, button LEAVE
[main] PASS both players are seated: Main Editor slot 0, Player 2 slot 1
[main] PASS each player has a ball, and sees the other's: mine ball0, theirs ball1 active True
[vp] PASS each player has a ball, and sees the other's: mine ball1, theirs ball0 active True
[main] PASS the scorecard shows both players: Main Editor    .   ...   0 | Player 2       .   ...   0
[vp] PASS B sees A's ball move: 0.044 m
[main] PASS A sees B's ball move: 0.051 m
[main] PASS A holes out: 2 strokes
[main] PASS the hole waits for B (A holed out, B still playing): hole 1
[vp] PASS B is still on hole 1 after A holed out: hole 1
[vp] PASS B holes out: 2 strokes
[main] PASS the hole advances once both have holed out: hole 2
[vp] PASS B sees the next hole load: hole 2
[main] PASS the scorecard has both players' strokes for hole 1: [["Main Editor",2],["Player 2",2]]
[vp] INFO B reloads its page
[vp] PASS after reloading its page B is still seated on hole 2 (late join): seat 1, hole 1 (index)
[vp] PASS B's ball is back on the green under B's control after the reload: slot 1, canAct true, total 2
[main] PASS B's page, reloaded, holds the same state as A's (digest): ed13f59d / ed13f59d
[vp] PASS both pages hold the same state digest after the reload: ed13f59d / ed13f59d
```

Each player's ball is a pooled kit object with a synced transform, owned by its player (`TakeOwnership` when placed;
`takeOwnershipOnCollision` and `...OnProximity` off); "sees the other's ball move" is the other ball's position read in
Unity on the watching player's client while the owner putts.

## What remains unverified

PORT.md 12.7. In short: everything in the app and on a Quest; VR aiming, the hand spheres and haptics (desktop Play mode
has no hands); the x-ray; the windmill's angle and the reveal part by part read back from Unity; a player leaving the
room for good (only a reload ran); the host world's physics settings.
