# Mini golf: port analysis (MinimalGolfVR to an Altspace snippet)

Read-only analysis of the upstream clone at `C:\workspace\AltspaceGames\mini-golf`. Nothing was built, compiled, run or opened in Unity. Scene and prefab facts were read from the YAML text with a small parser, matching scripts by the GUIDs in their `.meta` files.

Reference conventions used below:

- A bare script name such as `MinimalGolfGame.cs:528` means `Assets/MinimalGolf/Scripts/MinimalGolfGame.cs`, line 528.
- `SCENE` is `Assets/MinimalGolf/Scenes/MinimalGolf.unity`. `BALL` is `Assets/MinimalGolf/Prefabs/GolfBall.prefab`. `UIPREFAB` is `Assets/MinimalGolf/Prefabs/VR_UI_Root.prefab`. `TESTS` is `Assets/Tests/PlayMode/MinimalGolfPlayModeTests.cs`.
- "Scene value" means the value serialized in `SCENE`, which often differs from the default written in the C# file. The scene value is what the game runs with, so the port uses it.
- "Not determined" marks anything that could not be settled by reading files.

---

## 1. Upstream at a glance

| Item | Value | Where |
|---|---|---|
| Repository | dilmerv/MinimalGolfVR | `README.md:1` |
| Commit analysed | `cc7ed63002e3cc5aa65d504cd8ef2f4d90c846bd`, 2026-08-31, "Added a persistent preview toggle" (`master` and `upstream/master`) | `git log -1` |
| Newer upstream work, not in this commit | branch `upstream/feature/hands` (tip `af8c7a2`, 2026-09-09): hand tracking, `VRGolfClub.cs` +533 lines, a new `HandAimLogicTests.cs`, changed physics material | `git diff --stat cc7ed63 upstream/feature/hands` |
| Unity | 6000.5.6f1 (0e0577a1a2ac) | `ProjectSettings/ProjectVersion.txt:1-2` |
| Entry scene | `Assets/MinimalGolf/Scenes/MinimalGolf.unity`, the only scene in the build list (1,030,995 bytes, 1,262 YAML objects) | `ProjectSettings/EditorBuildSettings.asset:8-10` |
| Company and product | LearnXR, "Minimal Golf", version 0.1.0 | `ProjectSettings/ProjectSettings.asset:15-16,151` |
| Colour space, stereo | Linear, single-pass instanced | `ProjectSettings/ProjectSettings.asset:48-49` |
| Physics project settings | gravity -9.81, bounce threshold 1, sleep threshold 0.14, contact offset 0.01, 6 solver iterations, fixed step 0.02 | `ProjectSettings/DynamicsManager.asset:7-13`, `ProjectSettings/TimeManager.asset:6` |

Packages (`Packages/manifest.json:3-52`, resolved in `Packages/packages-lock.json`):

| Package | Version | Needed by the port |
|---|---|---|
| com.meta.xr.sdk.all (core, interaction, haptics, platform, audio, voice, mrutilitykit) | 205.0.0 (audio 85.0.0, voice 85.0.1) | No. Replaced, see section 4 |
| com.unity.render-pipelines.universal | 17.5.0 (target has 17.3.0) | Shader only |
| com.unity.inputsystem | 1.20.0 | No (editor fallbacks only) |
| com.unity.ugui / com.unity.textmeshpro | 2.5.0 / 5.0.0 (target has ugui 2.0.0) | UI prefab |
| com.unity.xr.openxr, xr.management, xr.meta-openxr | 1.17.1, 4.7.0, 2.5.1 | No |
| com.unity.test-framework | 1.7.0 | Tests only |
| com.unity.pipeline | 0.4.0-exp.1 | No (the author's agent tooling) |
| com.unity.visualscripting, timeline, ai.navigation, collab-proxy | 1.9.11, 1.8.12, 2.0.14, 2.13.3 | Not used by game code |

Upstream code size: 15 runtime scripts, 3,427 lines (`Assets/MinimalGolf/Scripts`); 2 inspector scripts, 115 lines (`Assets/MinimalGolf/Editor`); 1 test file, 263 lines; 4 project editor scripts, 327 lines (`Assets/Editor`). Total 4,132. The plan's "~3,560" is close to the runtime figure.

Licences found in the repo:

| Thing | Licence | Evidence |
|---|---|---|
| Code and project | MIT, "Copyright (c) 2026 Dilmer Valecillos" | `LICENSE:1-3` |
| Kenney Minigolf Kit 3.1 (126 FBX, 1 PNG) | CC0. Credit asked for, not required | `Assets/MinimalGolf/Kenney/MinigolfKit/License.txt`, `README.md:28-29` |
| Inter-Regular.otf | SIL OFL 1.1, reserved font name "Inter" | `Assets/MinimalGolf/Fonts/Inter-LICENSE.txt:1-5` |
| LiberationSans.ttf and its TMP font asset (TextMesh Pro essentials) | SIL OFL 1.1 | `Assets/TextMesh Pro/Fonts/LiberationSans - OFL.txt` |
| Three music tracks | **No licence statement anywhere** | see 6.4 |
| Seven sound effects | **No licence statement anywhere** | see 6.4 |
| `Assets/MinimalGolf/UI/MinimalGolfCursor.png` | No statement. Not used by any scene or script (`CustomGameCursor.cs:8-9` is a stub) | grep of the repo |
| Meta XR SDK and its controller models | Not vendored; pulled by the package manager under Meta's SDK licence | `Packages/manifest.json:3` |

`README.md:3` says the VR conversion was produced with "Meta Muse Code" (an AI coding agent). The plans it worked from are in `.agents/plans/`.

---

## 2. Feature checklist

Everything the game does at commit cc7ed63. Values are scene values unless marked. Each line is a statement a test can check.

### A. Course and level loading

| # | Statement | Upstream |
|---|---|---|
| A1 | The course has 8 levels, played in this order: THE WARM UP (par 2), THE GARDEN (3), WINDMILL WAY (4), BUMPER BEND (4), GRAND TOUR (5), HILLSIDE TURN (4), EASY ASCENT (4), SUMMIT RUN (6). Total par 32. | `SCENE:2061` (`levels` array), `SCENE:18674-18675, 2731-2732, 22733-22734, 19323-19324, 23071-23072, 12053-12054, 10038-10039, 30151-30152` |
| A2 | On start, level 1 loads and the total stroke count is 0. | `MinimalGolfGame.cs:228-232, 706-712` |
| A3 | All 8 levels are always visible. Only the current one has a ball. Non-current levels sit at their authored offsets (level 2 at local (10,0,19) up to level 8 at (-40,0,89), times the 0.05 table scale). | `MinimalGolfGame.cs:763-775`, level transforms in `SCENE` |
| A4 | When the level changes, the new level takes the previous level's local position and rotation, and the previous level takes the new one's (a swap). The first load moves nothing. Reloading the same level moves nothing. | `MinimalGolfGame.cs:718-752` |
| A5 | Loading a level sets level strokes to 0 and clears "level complete", "capturing", "aiming", "course complete", shot power and aim direction. | `MinimalGolfGame.cs:754-761` |
| A6 | Loading a level shows the message "LEVEL n  •  NAME" for 1.65 s. | `MinimalGolfGame.cs:822` |
| A7 | Loading a level destroys any existing ball of that level. | `MinimalGolfGame.cs:780-791` |
| A8 | Loading a level plays its reveal: every listed part starts 6 level-local units away and slides to its authored place. Direction cycles by part index: left, right, up, down, forward, back. Each part takes 0.55 s with an ease-in-out curve; part i starts 0.08 + i x 0.055 s after the start. | `LevelRevealAnimator.cs:53-104, 142-152`, `SCENE:18716-18743` |
| A9 | Reveal length is 0.08 + 0.55 + (parts - 1) x 0.055 s. Part counts in the scene: 12, 19, 21, 20, 22, 27 (one empty entry, still counted), 20, 19, giving 1.235, 1.62, 1.73, 1.675, 1.785, 2.06, 1.675, 1.62 s. | `LevelRevealAnimator.cs:38`, `animatedParts` arrays in `SCENE` |
| A10 | The reveal runs on unscaled time. Colliders move with the parts. | `LevelRevealAnimator.cs:84, 94` |
| A11 | The ball appears at the level's "Ball Reset Point" only after the reveal length has passed, and only if that level is still current. It starts at rest, dynamic, at scale 1, parented under the level's `PLAYER` group. | `MinimalGolfGame.cs:557-601, 793-797` |
| A12 | While a level is revealing: no aiming, no cup assist, no out-of-bounds check, no course rotation, and the restart input is ignored. An aim in progress is cancelled. | `MinimalGolfGame.cs:258, 284-285, 353, 554`, `VRGolfClub.cs:308-312` |

### B. Aiming and the shot (the "club")

| # | Statement | Upstream |
|---|---|---|
| B1 | A player may act only when: a level is loaded, the ball exists, the level is not revealing, the ball is not being captured, the level is not complete, and the ball's speed (3D) is at most 0.10 m/s. | `MinimalGolfGame.cs:552-555`, `SCENE:2090` |
| B2 | Each hand carries a "club": an invisible point at the controller with a translucent green sphere (radius 0.05 m, colour 0.3/0.9/0.6, opacity 0.2). There is no club model. | `VRGolfClub.cs:74-235`, `SCENE:11612-11653, 12833-12874` |
| B3 | An aim starts when the controller is within 0.19 m (0.11 + 0.08) of the ball's centre and that hand's index trigger goes from released to held (analog above 0.45, or the digital press). | `VRGolfClub.cs:245-246, 251-262, 269-284`, `SCENE:11648-11649` |
| B4 | If the trigger is pressed near the ball while B1 is false, the message "WAIT FOR THE BALL" shows (1.25 s) and no aim starts. | `MinimalGolfGame.cs:391-397` |
| B5 | The aim's start point is the controller position moved to the ball's height. The start causes a haptic pulse (0.3, 0.5) on that hand. | `VRGolfClub.cs:272-277, 318-323`, `MinimalGolfGame.cs:398-400` |
| B6 | While the trigger stays held: pull = start - current hand position, horizontal only. Power = clamp01(min(length of pull, 0.16) / 0.16). Direction = pull normalised, or zero when the squared length is at most 0.000001. The ball will travel along the pull, away from where the hand has moved to (a slingshot). | `MinimalGolfGame.cs:415-428`, `SCENE:2091` |
| B7 | While aiming, a line is drawn from the ball's centre along the direction, length = lerp(0, 0.3, power) metres (0 when the direction is zero), width 0.01 m. Colour: 89E0B3 at power 0, F3C96B at 0.55, E1822F at 1, linear between. The line is hidden when not aiming. | `MinimalGolfGame.cs:492-526`, `SCENE:2073-2075` |
| B8 | While aiming with power above 0.05, the aiming hand vibrates with amplitude power x 0.3. | `VRGolfClub.cs:287-295` |
| B9 | Releasing the trigger ends the aim. If power is below 0.001 or the squared direction length is below 0.001, nothing is shot and no stroke is counted. | `MinimalGolfGame.cs:430-443`, `SCENE:2092` |
| B10 | Otherwise the ball receives one impulse of lerp(0.005, 2.0, power) along the horizontal direction (`ForceMode.Impulse`; ball mass 0.45, so 0.011 to 4.44 m/s). Level strokes and total strokes each go up by 1. | `MinimalGolfGame.cs:528-545`, `SCENE:2087-2088`, `BALL:136` |
| B11 | A shot plays one of three hit sounds and vibrates both controllers (0.5, 0.7). The aiming hand then gets (0.6, 0.8) for a shot, or (0.2, 0.3) for a release that did not shoot. | `MinimalGolfGame.cs:546-548`, `VRGolfClub.cs:298-306` |
| B12 | The shot is refused, with no stroke, if B1 is false at release, if the direction is near zero, or if power is under the minimum. | `MinimalGolfGame.cs:444-451, 530-536` |
| B13 | Either hand can aim. Nothing stops the second hand from starting a new aim while the first is aiming: the aim start is overwritten and whichever hand releases first shoots. | `VRGolfClub.cs:269-284`, `MinimalGolfGame.cs:391-413` (no check of `dragging`) |
| B14 | The physics trigger callbacks on the club are overridden every frame by the distance test, so only the distance test decides "near the ball". | `VRGolfClub.cs:245-246, 360-371` |
| B15 | The ball is never made kinematic while aiming (the lines that did so are commented out). | `MinimalGolfGame.cs:405-411, 622, 655` |

There is no swing, no club velocity and no club-ball collision anywhere in upstream.

### C. The cup

| # | Statement | Upstream |
|---|---|---|
| C1 | The hole is not physical. The gold rim and dark disc are decoration without colliders; the green is a solid box. | object names and components in `SCENE` (for example "Dark Circular Cup (Decorative No Collider)") |
| C2 | Every physics step, when the player is not aiming, the level is not revealing, the ball is not being captured, the level is not complete and the ball is dynamic: if the ball's horizontal distance to the hole centre is at most 0.04 m and its horizontal speed at most 0.6 m/s, it is accelerated toward the hole by lerp(0.35, 1.2, c x c) m/s2, where c = 1 - clamp01(distance / 0.04). No force when the distance is 0.001 m or less. | `MinimalGolfGame.cs:351-377`, `SCENE:2093-2098` |
| C3 | Capture begins when, inside the assist zone, the distance is at most 0.008 m, the horizontal speed at most 0.35 m/s, and the height difference to the hole centre under 1.25 m. | `MinimalGolfGame.cs:378-382` |
| C4 | Capture: play one of three hole sounds; vibrate the right controller (1, 0.9); over 0.10 s (smoothstep) move the ball to the hole's x/z at 0.055 m below its start height while scaling to 0.88; then over 0.52 s move it to 0.32 m below the hole centre while scaling to 0.08. | `MinimalGolfGame.cs:642-693` |
| C5 | Then the level is complete and the message "HOLE COMPLETE  •  UNDER PAR!" shows for 2.2 s when strokes are at most par, otherwise "HOLE COMPLETE  •  +N OVER PAR". "ON PAR!" exists in the code but can never be shown. | `MinimalGolfGame.cs:695-697` |
| C6 | 2.05 s later the next level loads with totals kept. After level 8 the course is complete instead. | `MinimalGolfGame.cs:698-703` |

### D. Out of bounds, resets and restarts

| # | Statement | Upstream |
|---|---|---|
| D1 | Each frame (level loaded, not complete, not revealing, not capturing) the ball is tested in level-local space: outside when y < -2.25, or abs(x) > width/2 + 2.5, or abs(z) > length/2 + 2.5. | `MinimalGolfGame.cs:281-295`, `MiniGolfLevel.cs:49-55` |
| D2 | An outside ball is replaced by a fresh ball at the Ball Reset Point, the message "BALL RETURNED" shows for 1.25 s, both controllers vibrate (0.3, 0.4), and **no stroke is added**. The penalty branch exists but is never called. | `MinimalGolfGame.cs:293-294, 603-640` |
| D3 | A reset also clears aiming, capturing and "level complete", and stops every running coroutine of the game object (pending ball spawn, capture sequence, level advance). | `MinimalGolfGame.cs:605-612` |
| D4 | Restart input (left controller Menu button; R in the editor): when the course is complete it restarts the course; otherwise, if the level is not revealing, it cancels any aim, reloads the current level (reveal replays, level strokes to 0, **total strokes unchanged**) and shows "LEVEL RESTARTED" for 1.0 s, replacing the level banner. | `MinimalGolfGame.cs:244-260, 830-836` |
| D5 | When the course is complete, A or X on either controller (Enter or Space in the editor) restarts the course from level 1 with the total reset to 0. No other gameplay input works in that state. | `MinimalGolfGame.cs:262-279, 825-828` |
| D6 | The "PLAY AGAIN" button gets a click listener that restarts the course, but the scene has no EventSystem and no pointer, so nothing can click it in upstream. Its label says "TRIGGER" while the working input is A/X. | `VRGolfUI.cs:145-147`, `UIPREFAB:3854`, no EventSystem object in `SCENE` |

### E. Course rotation and the rig

| # | Statement | Upstream |
|---|---|---|
| E1 | With the right thumbstick (or the left when the right is deflected less than half way) pushed past 0.6 sideways, the whole set of levels turns about the vertical axis at 70 degrees/s times the stick value. Only while B1 is true and the player is not aiming. | `MinimalGolfGame.cs:298-309, 324-327`, `SCENE:2085` |
| E2 | The code saves and restores the ball's world pose and velocities around the rotation, intending the ball to stay still in the world while the course turns under it. Whether the ball in fact stays or turns with the course is **not determined** (the restore is followed by `Physics.SyncTransforms()`, which may re-apply the rotated transform). | `MinimalGolfGame.cs:310-335` |
| E3 | The player rig is clamped to the origin every frame of the rotation handler: the player cannot move, so rotation is the only way to see the course from another side. | `MinimalGolfGame.cs:337-348` |
| E4 | The course sits 0.55 m in front of the tracking origin at height (eye height - 0.5) m, or 0.75 m if that is under 0.4, and is scaled to 0.05. Whether a device build ends at 1.1 m or 0.88 m is **not determined** (it depends on the eye anchor height at `Awake`). | `VRCoursePlacement.cs:25-43`, `SCENE:27379-27381` |

### F. Reveal volumes (the x-ray effect)

| # | Statement | Upstream |
|---|---|---|
| F1 | Each club carries an invisible reveal volume: radius 0.075 m, edge softness 0.02 m, centred on the controller. | `ProximityRevealVolume.cs:95-99`, `SCENE:23034-23040, 25561-25567` |
| F2 | A volume is active only while that hand's grip is held (analog above 0.55 or the digital press). Editor only: G or Left Shift. `README.md` says "U", which the code does not read. | `ProximityRevealVolume.cs:45-76` |
| F3 | While active, objects tagged `RevealOccluder` are clipped per pixel inside the sphere: fully cut at the radius, fading back in over the softness. With two active volumes a pixel is cut if it is inside either. | `RevealClip.hlsl:14-54`, `RevealVolumeManager.cs:183-220` |
| F4 | Seven objects carry the tag: the gate on level 1, the wide gate and twin gates on level 2, the windmill on level 3, the bend gate on level 4, the grand gate and final twin gates on level 5. | `SCENE:1013, 15696, 17047, 20433, 25475, 26533, 29082` |
| F5 | While active, those objects are also drawn double-sided (cull off), so the inside of a tunnel shows; back-face culling returns when no volume is active. The outline, shadow and depth passes are clipped the same way. | `RevealVolumeManager.cs:289-313`, `MinimalGolfToon.shader:98-100, 286-290, 334-338` |
| F6 | Nothing else is affected: the ball, the green and the rails never fade. | `RevealVolumeManager.cs:246-268` |
| F7 | The whole-object fade path for other shaders, the 0.5 s tag rescan and the "leak cleanup" exist only to cope with shaders and editor states the shipped scene does not have. | `RevealVolumeManager.cs:122-151, 333-450` |

### G. User interface

All four panels are world-space canvases under `VR_UI` (local position (0.0031, -0.3, 0.7), scale 3.36, relative to the course anchor), text in LiberationSans SDF. The Inter font is assigned to two fields but never used (`VRGolfUI.cs:17`).

| # | Statement | Upstream |
|---|---|---|
| G1 | Game card, always visible: title "MINIMAL GOLF"; the current level's name; "LEVEL n / 8"; labels "STROKES" and "PAR" with the level stroke count and par; label "COURSE PROGRESS" with 8 pips. | `VRGolfUI.cs:167-179`, `UIPREFAB:68, 311, 660, 797, 2052, 2929, 3141, 3642` |
| G2 | Pips: levels already finished are seafoam 8BCBA8; the current one is orange E1822F and 10 units tall; later ones are pale FAF1D2 at 18% and 6 units tall. | `VRGolfUI.cs:181-196` |
| G3 | Power meter, visible only while aiming: label set to "PUTT STRENGTH" (the prefab text says "PULL STRENGTH"), percent = round(power x 100) with a "%" sign, 12 segments; segment i is lit when power is at least (i + 1)/12, in the aim-line colour, otherwise pale at 13%. | `VRGolfUI.cs:198-216`, `UIPREFAB:1371, 2532` |
| G4 | Feedback toast, visible while the message timer runs: shows the current message; opacity = clamp01(seconds left x 3.2), so it fades over the last 0.3125 s. | `VRGolfUI.cs:218-226` |
| G5 | Course-complete panel, visible only when the course is complete: "COURSE COMPLETE", "EIGHT SMALL COURSES • ONE GRAND SCORE", the total stroke count, "TOTAL STROKES", and a "PLAY AGAIN  •  TRIGGER" button. | `VRGolfUI.cs:228-235`, `UIPREFAB:1658, 3278, 3854, 4750` |
| G6 | Messages and their durations: "LEVEL n  •  NAME" 1.65 s; "WAIT FOR THE BALL" 1.25 s; "BALL RETURNED" 1.25 s; "HOLE COMPLETE  •  ..." 2.2 s; "LEVEL RESTARTED" 1.0 s. A new message replaces the old one. | `MinimalGolfGame.cs:294, 395, 697, 822, 835, 844-848` |

### H. Sound and haptics

| # | Statement | Upstream |
|---|---|---|
| H1 | A shot plays one of `Golf_Ball_Hit_01..03.wav`, chosen at random, never the same clip twice in a row. | `AudioManager.cs:106-109, 164-187`, `SCENE:3697-3700` |
| H2 | A capture plays one of `Ball_Fall_To_The_Empty_Hole_01..03.wav`, same rule. | `AudioManager.cs:111-114` |
| H3 | Effects play at volume 0.70, spatial blend 0.2, priority 32, as one-shots on a single source at the scene origin. | `AudioManager.cs:213-230`, `SCENE:3707` |
| H4 | Ball collisions call the collision sound, but no clip is assigned, so they are silent. Hits on the object named "Green Playing Surface" are skipped before that. | `GolfBallImpact.cs:7-15`, `SCENE:3705` |
| H5 | `Classic_Woosh.wav` is assigned as the rotation sound but nothing ever plays it. | `AudioManager.cs:121-124`, `SCENE:3706`, no caller in the repo |
| H6 | Background music: one of three tracks at random at volume 0.32, 2D, not looped; when a track ends another is chosen, never the same twice in a row; a failed start is retried after 0.25 s (1 s when there are no tracks). | `AudioManager.cs:68-79, 126-162` |
| H7 | Any ball collision with relative speed of at least 0.35 m/s vibrates both controllers with amplitude lerp(0.2, 0.9, s), s = inverse-lerp(0.35, 7.5, speed), at most once per 0.18 s. | `CameraImpactShake.cs:28-39`, `GolfBallImpact.cs:9`, `SCENE:5837-5839` |
| H8 | Other haptics: see B5, B8, B11, C4, D2. Upstream never switches a vibration off; its length is whatever the Meta runtime applies (not determined here). | 11 `SetControllerVibration` calls, section 4 |

### I. Scenery and environment

| # | Statement | Upstream |
|---|---|---|
| I1 | The windmill blades on level 3 turn at 72 degrees/s about their local Z axis, in the physics step, all the time (also when level 3 is not current). Two diagonal box colliders turn with them; two fixed boxes are the tower. | `WindmillRotor.cs:9-12`, `SCENE:1029-1045, 1074` |
| I2 | The sky is a procedural night sky (gradient, twinkling stars, slow rotation, rare comets) driven every frame from 23 inspector values. It never changes with gameplay. | `EnvironmentController.cs:104-110, 175-223`, `SCENE:14158` block |
| I3 | Scene lighting: one directional "WARM SUN" (colour 0.99/0.71/0.58, intensity 1.25, no shadows), linear fog 15 to 34 m in 779EBE, three-colour ambient at 0.72. | `SCENE:14-29, 1646` block |
| I4 | Frame rate target 120, vsync off. | `MinimalGolfGame.cs:105-106` |

### J. Physics constants the feel depends on

| # | Statement | Upstream |
|---|---|---|
| J1 | Ball: mass 0.45, linear damping 0.65, angular damping 0.9, gravity on, interpolation on, continuous dynamic collision detection, sphere collider radius 0.16 (8 mm in the world at table scale), visual sphere 0.32 across. | `BALL:136-154, 174, 31` |
| J2 | One physics material on the ball and on all 116 course colliders: dynamic and static friction 0.01, bounciness 0.2, both combine modes "average". | `Assets/MinimalGolf/Physics/Playful Ball Physics.asset:11-15`, `BALL:162` |
| J3 | Course colliders: 92 boxes and 24 non-convex mesh colliders on Kenney pieces, all static, all on layer 0, none are triggers. | `SCENE` (counted) |
| J4 | Project-wide: bodies fall asleep below a mass-normalised energy of 0.14 (about 0.53 m/s), and contacts slower than 1 m/s do not bounce. | `ProjectSettings/DynamicsManager.asset:9, 11` |
| J5 | The table scale is 0.05, so a level is 0.22 to 0.60 m wide and 0.52 to 1.13 m long. All shot, assist and capture numbers above are in world metres tuned for that scale. | `SCENE:27381`, sizes in section 5.3 |

### K. Edge cases and oddities to reproduce or decide on

| # | Statement | Upstream |
|---|---|---|
| K1 | A hole finished in exactly par says "UNDER PAR!" (C5). | `MinimalGolfGame.cs:696` |
| K2 | Restarting a level does not take its strokes back out of the total (D4). | `MinimalGolfGame.cs:830-836, 711-712` |
| K3 | Restart during the capture or during the 2.05 s wait: the level reloads, but the capture coroutine is not stopped (only `DebugLoadLevel` and `ResetBall` stop coroutines). During the wait it still advances to the next level 2.05 s after the capture ended. During the sink it touches a destroyed ball. | `MinimalGolfGame.cs:698-703, 830-842` |
| K4 | The capture offsets (0.055 m and 0.32 m, C4) were not rescaled for the table: the 1.6 cm ball sinks 32 cm, far below the 2.5 cm thick base, while shrinking to 8%. | `MinimalGolfGame.cs:662, 679`, plan text in `.agents/plans/2026-08-15-minigolf-prompt-to-threejs.md:29` |
| K5 | The height test of C3 (1.25 m) is always true at table scale. | `MinimalGolfGame.cs:378` |
| K6 | A ball that leaves the course during the reveal wait or while "level complete" is not returned (D1's conditions). | `MinimalGolfGame.cs:281-295` |
| K7 | The level-swap layout drifts over rounds: after a full round level 8 is at the play position and level k sits where level k + 1 was authored; restarting swaps level 8 with level 1. | `MinimalGolfGame.cs:718-740` |
| K8 | Flat-screen leftovers that are never used in the scene: `maximumDragDistance` 0.35, flat aim-line lengths 0.35 to 3.2, minimum power 0.035 (used only when there is no rig), `cameraSize`, `runtimeLocalPosition`, `RestoreRuntimeTransform`. | `MinimalGolfGame.cs:22-23, 46, 422, 435`, `MiniGolfLevel.cs:10, 24, 42-47` |

---

## 3. State and timing

### 3.1 Upstream state (single player)

| State | Type | Where | Multiplayer scope (proposal in 3.4) | Writer |
|---|---|---|---|---|
| `currentLevelIndex`, `currentLevel` | int | `MinimalGolfGame.cs:63-64` | Shared per instance | Referee |
| Level layout (which level sits in which authored slot) | implicit in transforms | `MinimalGolfGame.cs:718-740` | Shared: a permutation of 8 | Referee |
| Reveal playing, reveal start | bool, coroutine | `LevelRevealAnimator.cs:34-37` | Shared: start time on the synced clock | Referee |
| `courseComplete` | bool | `MinimalGolfGame.cs:70` | Shared | Referee |
| `levelStrokes`, `totalStrokes` | int | `MinimalGolfGame.cs:65-66` | Per player | That player |
| `levelComplete` | bool | `MinimalGolfGame.cs:69` | Per player ("holed out"), plus a shared "hole finished" | Player, then referee |
| `capturing` | bool | `MinimalGolfGame.cs:68` | Per player | That player |
| `dragging`, `dragStartWorld`, `aimDirection`, `shotPower` | aim state | `MinimalGolfGame.cs:67, 71-73` | Local only (never sent) | - |
| `feedback`, `feedbackUntil` | string, time | `MinimalGolfGame.cs:74-75` | Local only | - |
| Ball pose and velocity | Rigidbody | level `ball` reference, `MiniGolfLevel.cs:13` | Per player, a synced object | Its owner |
| Ball scale during capture | Transform | `MinimalGolfGame.cs:660-692` | Not carried by object sync; replayed locally from a "holed" event | - |
| Course yaw | Transform | `MinimalGolfGame.cs:325` | Left out (section 10) | - |
| Club: `aiming`, `wasTriggerHeld`, `overlappingBall`, `aimStartWorld` | per hand | `VRGolfClub.cs:28-32` | Local only | - |
| Reveal volume active, centre | per hand | `ProximityRevealVolume.cs:76, 95` | Local only (each player sees their own x-ray) | - |
| Windmill angle | Transform | `WindmillRotor.cs:11` | Shared, derived from the synced clock, nothing sent | - |
| Last sound indices | int x 3 | `AudioManager.cs:24-26` | Local only | - |
| Haptic cooldown | time | `CameraImpactShake.cs:15` | Local only | - |

### 3.2 Timers and time sources

| Timer | Length | Clock | Where |
|---|---|---|---|
| Reveal of a level | 1.235 to 2.06 s (A9) | unscaled | `LevelRevealAnimator.cs:38, 77-104` |
| Ball spawn after reveal | same length | real time | `MinimalGolfGame.cs:593-601` |
| Capture: centring, sinking | 0.10 s, 0.52 s | scaled delta time | `MinimalGolfGame.cs:665-689` |
| Wait before next level | 2.05 s | scaled | `MinimalGolfGame.cs:698` |
| Feedback messages | 1.0, 1.25, 1.65, 2.2 s; fade 0.3125 s | unscaled | `MinimalGolfGame.cs:844-848`, `VRGolfUI.cs:221-225` |
| Haptic cooldown on impacts | 0.18 s | unscaled | `CameraImpactShake.cs:30, 38` |
| Windmill | 72 degrees/s | fixed step 0.02 s | `WindmillRotor.cs:11` |
| Cup assist | every fixed step | fixed | `MinimalGolfGame.cs:351` |
| Out-of-bounds test, club input, UI refresh | every frame | frame | `MinimalGolfGame.cs:242`, `VRGolfClub.cs:237`, `VRGolfUI.cs:59` |
| Music restart attempts | 0.25 s, 1 s | audio DSP clock | `AudioManager.cs:75, 130, 139, 146` |
| Reveal tag rescan | 0.5 s | scaled | `RevealVolumeManager.cs:172-177` |
| Pose log, editor preview retry | 0.5 s | - | `MinimalGolfGame.cs:234-240`, `VREditModePreview.cs:120-123` (debug and editor only) |

### 3.3 Random numbers and saved data

- Random numbers: only `Random.Range` for choosing a sound or music clip (`AudioManager.cs:155, 157, 176, 180`). No gameplay randomness.
- Saved data: none. No `PlayerPrefs`, no files. The only file writes are in the editor-only test recorder (`Assets/Editor/TestHistoryRecorder.cs`), which is not ported.

### 3.4 Multiplayer design (proposal)

Upstream is one player, one ball, one table. The proposal keeps every rule of section 2 per player and adds only what several players on one table need.

**One table, one current hole.** The table shows one playable level, so every player in an instance is on the same hole. The hole number, the level layout permutation, the reveal start time and "course complete" are shared and written by the referee (README runtime: one referee per instance).

**A ball per player.** The kit holds 8 ball objects (`ball0` to `ball7`), each a copy of the upstream prefab in its own colour. The script sets each one's network id (`pk1/mini-golf/<inst>/ball<k>`) and adds `BS.SyncedObject` with `takeOwnershipOnCollision`, `takeOwnershipOnProximity` and `takeOwnershipOnGrab` all false, so nobody takes a ball by walking past it (the defaults would: `Docs/multiplayer/overview.md` "Who owns it"). The referee assigns a free slot to a joining player; that player calls `TakeOwnership()` and from then on their physics moves the ball for everyone. Other players' copies are kinematic followers (same doc, "How it moves").

**Balls do not collide with each other** (pairwise `Physics.IgnoreCollision`, which is on the graph allow-list). A remote ball is kinematic on your client, so a real collision would treat it as an immovable object and the two owners would disagree about the result. Upstream has one ball, so no upstream rule is lost.

**Free play or turns** (setting `mode`):

- `free` (default): everyone putts whenever rule B1 holds for their own ball.
- `turns`: order is slot order. The current player is the first in order who has not holed out. A turn ends when their ball is at rest after a stroke, is returned from out of bounds, or is captured. Others who try to aim get "NOT YOUR TURN" (a new message, shown the same way as "WAIT FOR THE BALL").

**Hole completion.** A player who is captured has holed out: their card gets the stroke count, they see the upstream "HOLE COMPLETE" message, and their ball stays sunk. The hole is finished when every seated player has holed out (or timed out, below). The referee then waits the upstream 2.05 s and loads the next level for everyone; after level 8 the course is complete for everyone.

**Shared scorecard.** One space-state leaf `v.card` = `{ rows: { <uid>: { name, slot, joinedAtHole, strokes: [8 entries, null for holes not played], left: bool } } }`, written by the referee from what each player reports. A second panel on the board shows it: a row per player, a column per hole with par, and the total. Each player's own game card (G1) keeps showing their own level strokes.

**Per-player state** (one user-state leaf per player per instance, within the README's limit of four): `{ slot, hole, levelStrokes, totalStrokes, holed, capturing, seq }`. Written only by that player. It disappears 30 s after they leave, which is why finished holes are copied to `v.card`.

**Referee leaf** `v.game` = `{ g, n, hole, layout[8], phase: "reveal"|"play"|"holeDone"|"complete", revealStart, advanceAt, order[], turn, firstHoledAt }`. All times are synced-clock seconds, so a new referee can take over a pending timer.

**Joining mid-round.** The joiner receives the full state, clicks JOIN on the board, gets a slot and a ball at the current hole's reset point with 0 level strokes. Earlier holes stay empty on their row (shown as "-") and their total counts only the holes they played; the row shows "joined at hole n". Joining during a reveal: the reveal is a function of `revealStart`, so the joiner's copy starts part-way. Joining after the course is complete: they wait for PLAY AGAIN.

**Leaving mid-round.** On `user-left` the referee keeps the slot for that uid for 30 s (the same grace user state has), then frees it, hides the ball and marks the row `left`. The row stays on the card until the next course restart. Hole completion is re-evaluated without them, so a leaver cannot block the group. If the referee leaves, the runtime elects a new one, which continues from `v.game`.

**Not blocking the group.** Upstream has no stroke or time limit. Proposed, both off-able: `hole-timeout` (default 120 s, counted from the first player holing out; players still out are recorded as their strokes so far, marked "DNF") and `stroke-limit` (default 0, off). In `turns` mode a `turn-seconds` limit (default 45) passes the turn without a stroke.

**Restarts.** "Restart my hole" keeps upstream rule D4 for that player only: ball back to the reset point, level strokes to 0, total unchanged, "LEVEL RESTARTED" shown. It does not replay the reveal for everyone (changed, section 10). "Play again" after the course is complete restarts the course for everyone (D5), clears the card and resets every total.

**Everyone gone.** Space state lasts 24 h. If a player arrives and no seated uid from `v.game.order` is present, the instance prefix `pk1.mini-golf.<inst>.` is deleted and a new round starts.

**Trust.** As in every port here, all state is public and writable by anyone in the room; a modified client can write any score.

---

## 4. Platform-call census

Counts are occurrences in the runtime scripts.

| API | Count | Files and lines | Replacement on Altspace | Gap and its cost |
|---|---|---|---|---|
| `OVRInput.Get` / `GetDown` / `GetUp` on the index trigger (analog and digital) | 4 | `VRGolfClub.cs:251, 252, 259, 260` | Scene events `button-pressed` / `button-released` with `BS.ButtonType.TRIGGER` and `side`, plus `trigger-axis-update` (`Docs/javascript-api/scene-settings.md:207-235`). In Play mode key 3 is the right trigger | None in the app. The 0.45 analog threshold becomes the app's own trigger threshold unless the axis event is used |
| `OVRInput.Get` on the hand trigger (grip), analog and digital | 3 | `ProximityRevealVolume.cs:56, 58, 60` | `button-pressed` / `button-released` with `GRIP` | No analog grip value: the 0.55 threshold becomes the app's. In Play mode grip is "grabbing with the mouse" |
| `OVRInput.GetDown(Button.Start / RawButton.Start, LTouch)` | 2 | `MinimalGolfGame.cs:245, 246` | **Gap**: the SDK has no Menu/Start button event, and the app uses that button itself. Replaced by a RESTART HOLE button on the board (click) and key R on desktop (`key-press`) | VR players reach to the board instead of pressing a controller button |
| `OVRInput.GetDown(Button.One)` (A or X) | 2 | `MinimalGolfGame.cs:275, 276` | `button-pressed` with `PRIMARY` exists, but A is jump in the app. Replaced by the PLAY AGAIN button (click), which upstream draws but cannot click | None; arguably a fix |
| `OVRInput.Get(Axis2D.PrimaryThumbstick)` | 2 | `MinimalGolfGame.cs:303, 305` | `controller-axis-update` exists. Feature left out (section 10) | Players walk around the table instead of turning it |
| `OVRInput.SetControllerVibration(frequency, amplitude, hand)` | 11 | `MinimalGolfGame.cs:547, 548, 632, 633, 657`; `VRGolfClub.cs:277, 294, 303, 305`; `CameraImpactShake.cs:36, 37` | `scene.SendHapticImpulse(amplitude, seconds, BS.HandSide)` (`scene-settings.md:163-168`). Frequency has no equivalent; a duration must be chosen (proposed 0.08 s, 0.25 s for the capture) | Works in the app only: nothing on desktop or in Play mode. **The approved plan lists "no haptics" as a gap; the SDK docs say otherwise** |
| `OVRInput.Controller.LTouch / RTouch` | 23 mentions | 4 files | `BS.HandSide.LEFT / RIGHT` | None |
| `OVRCameraRig` (find, create, anchors, clamp to origin) | 18 mentions | `MinimalGolfGame.cs:26, 129-208, 238-239, 339-347, 422, 435, 506, 535`; `AudioManager.cs:51`; `VRCoursePlacement.cs:28`; `VREditModePreview.cs` (8) | The app owns the player. Controller positions come from the `pose-update` scene event (`leftHand`, `rightHand`, `head`, world space; `Docs/javascript-api/scene-events.md:164-178`) | `pose-update` arrives at most 30 times a second and not at all while the player is still; in Play mode only with local multiplayer on. Aiming resolution is lower than upstream's per-frame read |
| `OVRManager` (added at run time, floor-level tracking origin) | 2 | `MinimalGolfGame.cs:138-139` | None needed | None |
| `OVRControllerHelper`, `OVRControllerPrefab` instances | 9 mentions, 2 prefab instances | `VREditModePreview.cs:156-296`; `SCENE` (prefab guid `d9809c5e...`) | The app draws avatars and hands | None |
| `OVRProjectSetup` by reflection | 7 | `Assets/Editor/CheckProjectSetup.cs`, `VRProjectSetupFixAll.cs` | Not ported (editor) | None |
| Input System `Keyboard.current`, `Mouse.current` | 7 | `MinimalGolfGame.cs:249-250, 267-268`; `VRGolfClub.cs:331-350` (all inside `#if UNITY_EDITOR`) | `key-press`, `key-release`, `IsKeyDown` for the keyboard; object `click` events with a world hit point for the mouse (`Docs/javascript-api/gameobject-api.md:181-188`) | **Gap**: there is no mouse-button-held or mouse-move event for the page, so a desktop drag cannot be read. Desktop aiming becomes click-to-aim then click-to-putt (section 8.4) |
| Legacy `Input.GetKey*`, `GetMouseButton*` | 7 | `MinimalGolfGame.cs:252, 271`; `ProximityRevealVolume.cs:67, 68`; `VRGolfClub.cs:334, 343, 352` | Same as above | Same |
| `Application.targetFrameRate`, `QualitySettings.vSyncCount` | 2 | `MinimalGolfGame.cs:105-106` | Dropped: world-wide state, the app decides | None |
| `RenderSettings.skybox`, `DynamicGI.UpdateEnvironment`, `Camera.main.clearFlags` | 10 | `EnvironmentController.cs:134-171` | Not in the snippet (world-wide state, forbidden by the README). The showcase scene sets the sky as its own | A world that adds the snippet does not get the night sky |
| `Shader.SetGlobal*`, `Material.EnableKeyword`, `renderer.materials` | 17 + 4 | `RevealVolumeManager.cs:92-93, 186-218, 294-312` | Generated graph: `Shader.SetGlobalVector/Float/Int`, `Material.EnableKeyword/SetFloat` are on the allow-list (`Bridge~/vs-allowlist.frozen.txt`) | The x-ray centre follows the hand at the pose rate, a few frames late |
| `Rigidbody.AddForce` (impulse for the shot, acceleration for the assist) | 2 | `MinimalGolfGame.cs:376, 542` | Shot: `BS.Rigidbody.AddForce(v, BS.ForceMode.Impulse)` from the page (one call). Assist: a generated graph on the ball running each physics step | The page ticks at 20 Hz and reads velocities a few frames late (`Docs/components/physics.md:80`), so the assist cannot live in the page |
| `Instantiate` / `Destroy` of the ball | 4 | `MinimalGolfGame.cs:563, 575, 580, 785, 791` | Pooled ball objects: teleport to the reset point and re-activate. A copy made at run time would get a different id on every player (`Docs/multiplayer/overview.md`, "Where IDs come from"), so a synced ball must be an object every client already has | None visible |
| `LineRenderer` positions, width, colours | 12 | `MinimalGolfGame.cs:120-127, 492-526` | A kit `LineRenderer` driven through a new relay op (94 `LineRenderer` members are allow-listed) | Updates at the pose rate |
| uGUI and TMP writes (`TMP_Text.text`, `Image.color`, `RectTransform.sizeDelta`, `CanvasGroup.alpha`, `SetActive`) | about 20 | `VRGolfUI.cs:167-235` | Relay ops `text`, `active`; new ops for image colour and size. **`CanvasGroup` is not on the allow-list**: the toast fade must use `Graphic.CrossFadeAlpha` or per-graphic colour | None expected |
| `AudioSource.PlayOneShot` | 1 | `AudioManager.cs:196` | `BSAudioSource` on a kit object with the 6 clips, clip index from bindings (`$clip`) | None |
| `AudioListener` juggling | 1 block | `AudioManager.cs:49-66` | Dropped; the app owns the listener | None |
| `FindFirstObjectByType`, `FindObjectsByType`, `GameObject.Find` | 21 | 8 files | Bindings (paths relative to the kit root) | None |
| `DontDestroyOnLoad`, static singletons | 2 + 3 | `AudioManager.cs:9, 41`; `RevealVolumeManager.cs:17-18, 67`; `CameraImpactShake.cs:7` | Per-instance objects in the runtime | None; required so two tables can coexist |
| Project physics settings (sleep threshold 0.14, bounce threshold 1) | - | `ProjectSettings/DynamicsManager.asset:9, 11` | Sleep: `Rigidbody.sleepThreshold` per ball from a graph (allow-listed). Bounce threshold: **gap**, it is global only and the app's value applies (Unity's default is 2) | Contacts between 1 and 2 m/s that bounce upstream will not bounce. The ball's rest behaviour is kept |
| Layer collision matrix | - | `ProjectSettings/DynamicsManager.asset` (all collide) | The app's matrix applies, not the world's (`Docs/building-in-unity/layers.md`) | The player's body bumps the Default layer: see risk 2 |

---

## 5. Object model

### 5.1 Scene hierarchy relevant to play

```
WARM SUN                      Light (directional), URP light data
GAME SYSTEMS                  MinimalGolfGame, VRGolfUI
  Aiming Line  [inactive]     LineRenderer (material "Aiming Line Toon", world space, 2 points)
AUDIO MANAGER                 AudioSource, AudioManager, AudioSource
OVRCameraRig                  OVRCameraRig, OVRManager, CameraImpactShake, VREditModePreview
  TrackingSpace
    CenterEyeAnchor           Camera (near 0.01, far 80), AudioListener
    LeftHandAnchor/LeftControllerAnchor
      OVRController Left      Meta package prefab
      VR Club Left            SphereCollider (trigger), VRGolfClub
        ProximitySphere       sphere mesh, SphereCollider (trigger), scale 0.1
          RevealVolume        ProximityRevealVolume
    RightHandAnchor/RightControllerAnchor   (same, "VR Club Right")
Environment                   EnvironmentController
VRCourseAnchor                VRCoursePlacement            local (0, 1.1, 0.55)
  VRCourseLevels              scale 0.05
    Level 1 - THE WARM UP     MiniGolfLevel, LevelRevealAnimator      local (0,0,0)
      COURSE     base, green, 2 tee markers
      RAILS      box rails
      OBSTACLES  Kenney pieces, planters, bumpers
      HOLE       "Hole Center - Cup Assist Target", rim, dark cup, flag
      PLAYER     "Ball Reset Point"
    Level 2 ... Level 8       same five groups, at (10,0,19) (-10,0,19) (-20,0,49) (20,0,49) (-30,0,69) (30,0,69) (-40,0,89)
  VR_UI_Root (prefab)
    VR_UI                     local (0.0031, -0.3, 0.7), scale 3.36
      GamePlayCard, PowerMeter, FeedbackToast, CourseComplete   (world-space canvases)
```

Object lines in `SCENE`: GAME SYSTEMS 2023, AUDIO MANAGER 3577, OVRCameraRig 5788, VR Club Right 11612, VR Club Left 12833, VRCourseLevels 14118, Environment 14158, VRCourseAnchor 27344, WARM SUN 1646, Aiming Line 1198.

### 5.2 Behaviours and their serialized fields (scene values)

Script GUIDs were taken from the `.meta` files (for example `MinimalGolfGame.cs.meta` = `1b18f4e055b1340f799c5dc860767b83`).

**MinimalGolfGame** on GAME SYSTEMS (`SCENE:2061-2098`)

| Field | Value or reference |
|---|---|
| `levels` | the 8 `MiniGolfLevel` components in order |
| `gameCamera` | Camera on CenterEyeAnchor |
| `uiFont` | Inter-Regular.otf (unused) |
| `aimingLine` | LineRenderer on "Aiming Line" |
| `aimingLineWidth` 0.01, `vrAimingLineMinLength` 0, `vrAimingLineMaxLength` 0.3 | code defaults 0.01, 0.02, 0.55 |
| `flatAimingLineMinLength` 0.35, `flatAimingLineMaxLength` 3.2 | unused |
| `ovrRig`, `vrCourseAnchor`, `vrCourseLevels`, `vrUIAnchor` | the rig, the two course transforms, the UI prefab root |
| `vrAnchorLocalPosition` (0, 0.75, 0.65), `vrAnchorLocalScale` (1,1,1), `vrCourseLevelsLocalScale` 0.042 | never applied by code |
| `thumbstickRotationSpeed` 70 | code default 30 |
| `golfBallPrefab` | Rigidbody of `GolfBall.prefab` |
| `maximumImpulse` 2, `minimumImpulse` 0.005 | code default for the minimum is 0.08 |
| `maximumDragDistance` 0.35, `playableSpeed` 0.1 | |
| `vrMaximumDragDistance` 0.16, `vrMinShotPower` 0.001 | code default for the minimum is 0.045 |
| `assistRadius` 0.04, `captureRadius` 0.008 | code default for the assist is 0.08 |
| `maximumAssistedSpeed` 0.6, `maximumCaptureSpeed` 0.35, `minimumPullAcceleration` 0.35, `maximumPullAcceleration` 1.2 | |

**MiniGolfLevel** on each level: `levelName`, `par`, `cameraSize` (unused), `ball` (empty in the scene, filled at run time), `ballSpawn` (the "Ball Reset Point" transform), `holeCenter` (the "Hole Center - Cup Assist Target" transform), `revealAnimator` (same object), `courseWidth`, `courseLength`, `runtimeLocalPosition` (unused).

**LevelRevealAnimator** on each level: `animatedParts` (12 to 27 transforms, section A9, in order: course, rails, obstacles, hole decoration; the hole centre and ball reset point are not in the list), `revealDirections` (the six axis directions), `startDelay` 0.08, `partDuration` 0.55, `partStagger` 0.055, `easing` (two keys (0,0) and (1,1) with zero tangents, which is the smoothstep 3t2 - 2t3), `revealDistance` 6.

**VRGolfClub** x 2 (`SCENE:11648-11653, 12869-12874`): `controller` 2 (right) / 1 (left), `game`, `overlapRadius` 0.11, `triggerThreshold` 0.45, `sphereRadius` 0.05, `sphereOpacity` 0.2, `sphereColor` (0.3, 0.9, 0.6, 1), `showSphere` true. The trigger collider radius is forced to 0.06 at `Awake` (`VRGolfClub.cs:43`).

**ProximityRevealVolume** x 2: `revealRadius` 0.075, `edgeSoftness` 0.02, `targetTag` "RevealOccluder", `invertInside` false, `enabledReveal` true, `requireGrip` true, `gripThreshold` 0.55.

**VRGolfUI** on GAME SYSTEMS: `game`, `uiFont` (unused), `vrCourseAnchor`, `vrUIAnchor`, and the four canvases of the UI prefab. Everything else is found by child name at run time (`VRGolfUI.cs:88-149`): "Title", "Course", "Level", "LabelStrokes", "Strokes", "LabelPar", "Par", "ProgressLabel", "ProgressGroup/Pip0..7", "Label", "Percent", "Seg0..11", "Feedback", "Sub", "ScoreBox/Total", "ScoreBox/Label", "PlayAgain", "PlayAgain/Label".

**AudioManager** on AUDIO MANAGER (`SCENE:3692-3707`): `musicTracks` (3 MP3), `musicVolume` 0.32, `shotClips` (3 WAV), `holeClips` (3 WAV), `collisionClip` none, `rotationClip` Classic_Woosh.wav, `sfxVolume` 0.7. Two AudioSources on the same object; the first found is the music source, the second the effects source, and their settings are overwritten at `Awake` (`AudioManager.cs:199-230`).

**CameraImpactShake** on the rig: `cooldown` 0.18, `minimumImpact` 0.35, `fullImpact` 7.5, `minimumAmplitude` 0.01, `maximumAmplitude` 0.067 (the two amplitudes are computed and not used).

**VRCoursePlacement** on VRCourseAnchor: `forwardDistance` 0.55, `heightBelowEye` 0.5, `tableScale` 0.05.

**WindmillRotor**: added to the blades child of the windmill model (`SCENE:1043-1045, 1062-1074`), `degreesPerSecond` 72.

**EnvironmentController** on Environment: `skyboxMaterial` StarrySky.mat, `autoAssignSkybox` true, and 20 sky values (star density 4, sharpness 200, intensity 0.81, comet frequency 0.025 and so on).

**GolfBallImpact**: on the ball prefab (`BALL:176-187`), no fields.

**VREditModePreview** on the rig: editor-only preview poses. Not ported.

UnityEvents: none are serialized. The PLAY AGAIN button's `m_OnClick` is empty (`UIPREFAB`, Button on "PlayAgain"); the listener is added in code (`VRGolfUI.cs:146-147`). Animators and animation clips: none in the project (0 `.controller`, 0 `.anim`). Timeline, particle systems, shader graphs of the game: none.

### 5.3 Levels

Levels exist only as scene objects. There is no level data file, no ScriptableObject and no level prefab.

| Level | Par | Width x length (local units) | World size at 0.05 | Ball reset point | Hole centre | Reveal parts | Notable pieces |
|---|---|---|---|---|---|---|---|
| 1 THE WARM UP | 2 | 4.4 x 10.5 | 0.22 x 0.53 m | (0, 0.29, -4.05) | (0, 0.11, 4.15) | 12 | 1 gate |
| 2 THE GARDEN | 3 | 6.2 x 14.5 | 0.31 x 0.73 | (-1.5, 0.29, -6) | (1.55, 0.11, 5.95) | 19 | wide gate, twin gates, 2 planters |
| 3 WINDMILL WAY | 4 | 7 x 20 | 0.35 x 1.0 | (0, 0.29, -8.45) | (1.65, 0.11, 8.25) | 21 | windmill, 2 islands, diamond, triangle |
| 4 BUMPER BEND | 4 | 7.4 x 18 | 0.37 x 0.9 | (-1.55, 0.29, -7.55) | (1.55, 0.11, 7.45) | 20 | wide gate with grass banks, 2 bumpers, diamond, island |
| 5 GRAND TOUR | 5 | 8.5 x 21.5 | 0.43 x 1.08 | (0, 0.29, -9.25) | (0, 0.11, 9.2) | 22 | 2 gates with banks, island, triangle, diamond |
| 6 HILLSIDE TURN | 4 | 11.5 x 15 (L shape) | 0.58 x 0.75 | (-3.25, 0.29, -6.25) | (4.35, 0.11, 5) | 27 | 3 hills, 12 rails |
| 7 EASY ASCENT | 4 | 7.5 x 13.3 | 0.38 x 0.67 | (0, 0.29, -5.35) | about (-3.06, 0.11, 1.46): the HOLE group is moved to (2.8, 0, 3.65) and turned about -90 degrees, child at (-2.2, 0.11, 5.85). Computed here, to be confirmed in the editor | 20 | ramp, landing, 2 round corners |
| 8 SUMMIT RUN | 6 | 8.5 x 13.3 | 0.43 x 0.67 | (0, 0.29, -5.25) | (0.65, 1.11, 5.3) on a raised landing | 19 | large launch ramp, 2 supports |

What a level is made of (whole scene): 148 Unity primitives (88 cubes, 46 cylinders, 14 spheres) and 33 instances of 13 Kenney models. 92 box colliders (including 4 collider-only objects on the windmill) and 24 non-convex mesh colliders added to Kenney pieces as prefab overrides. Several Kenney pieces are scaled unevenly (for example the support at (14, 0.8, 7), the hill at (3.7, 2.05, 2.65)). Only 3 objects under the levels have a rotation other than identity besides the Kenney pieces: the two windmill blade colliders and level 7's HOLE group.

Kenney models used: `flag-blue`, `bump`, `structure-gate`, `structure-gate-wide`, `structure-gates`, `windmill`, `obstacle-diamond`, `obstacle-triangle`, `hill-square`, `ramp-medium`, `ramp-large`, `round-large-corner`, `support-low` (all in `Assets/MinimalGolf/Kenney/MinigolfKit/Models/FBX format/`).

The scene embeds 175 material copies for these objects ("... (Instance)"), which reduce to 7 distinct materials identical to the `.mat` assets: Dark Green Rails (76 uses: rails, planters, plant stems, bumpers), Course Green (40: greens, grass banks, plant crowns), Cup Gold Rim (24: tee markers, cup rims), Warm Cream Base (11), Kenney Colormap Toon (11), Dark Cup (8), Obstacle Accent (5). The kit should use the 7 shared materials.

### 5.4 Ball, club, audio, layers

- Ball prefab: section J1. Rigidbody block `BALL:128-154`, collider `BALL:155-175`, impact script `BALL:176-187`. The visual child casts and receives no shadows.
- Club: no rigidbody, two trigger sphere colliders (0.06 on the club, 0.5 on the unit sphere scaled to 0.1), no physics material. It never touches the ball physically.
- Audio sources: two on AUDIO MANAGER, no clips assigned in the scene, no mixer. Clips: section 6.4.
- Layers: every gameplay object is on layer 0 (Default). The canvases are not on a special layer. Tags used: `MainCamera` on the eye anchors and the custom tag `RevealOccluder` (`ProjectSettings/TagManager.asset`, last entry). The other 27 custom tags in that file belong to Meta samples.

---

## 6. Assets

### 6.1 Models

- 126 FBX files, 3,784,352 bytes in total, all from the Kenney kit. Largest: `spline-concave-looping.fbx` (58,048 bytes), then the three `ball-*.fbx` (56,400 each). 13 are used (5.3); the rest need not be imported.
- Triangle counts were not measured (that needs an import). The used files are between about 10 and 45 kB each.
- No models from other sources. The ball and all greens, rails and planters are Unity primitives.

### 6.2 Textures

| File | Size | Use |
|---|---|---|
| `.../FBX format/Textures/colormap.png` | 512 x 512, 8,706 bytes | Kenney palette, the only texture in play |
| `Assets/MinimalGolf/UI/MinimalGolfCursor.png` | 1254 x 1254, 508,859 bytes | Unused |
| `TestDashboard/thumbnails/*.png` | 60 files | Test screenshots, not game assets |
| `Docs/Images/Demo_1..3.gif` | 10.5, 1.1, 6.9 MB | README only |

No texture is over 2048 px. The TMP font atlas lives inside `LiberationSans SDF.asset` (2.26 MB); the target project supplies its own.

### 6.3 Shaders and materials

| Shader | File | Kind | Needed changes for URP 17.3 and Quest |
|---|---|---|---|
| "Minimal Golf/Toon" | `Assets/MinimalGolf/Shaders/MinimalGolfToon.shader` (343 lines) + `RevealClip.hlsl` (56 lines) | Hand-written URP HLSL, 4 passes: outline, forward, shadow caster, depth only | Must be re-made in part. (1) The outline pass uses the light mode "MinimalGolfOutline" (`:29`), which only draws because upstream's renderer assets carry a Render Objects feature for it (`Assets/Settings/Mobile_Renderer.asset:67-80`, `PC_Renderer.asset:68-81`). A host world has no such feature, so the outline silently disappears: retag the pass (for example `SRPDefaultUnlit`) or drop outlines. (2) The shadow and depth passes lack the stereo output macro (`:256-261, 317-322`); add it for single-pass instanced rendering. (3) `_REVEAL_CLIP` is a `shader_feature` switched on at run time (`:39, 124, 240, 306`); in a bundle that variant only exists if a material has it on at build time. Make the reveal always compiled and controlled by the globals, and rename the globals with a port prefix. (4) No DepthNormals pass, so host worlds using SSAO will not see these objects in it. (5) The forward pass blends alpha in the opaque queue (`:113`); keep, it is how the soft edge works |
| "MinimalGolf/StarrySky" | `Assets/MinimalGolf/Shaders/StarrySky.shader` (10,324 bytes) | Built-in-pipeline CG skybox, one pass, 3 x 3 cell loop per pixel | Not in the kit. Used as the showcase scene's own skybox if it compiles there unchanged (not verified) |
| Club sphere | created in code with "Universal Render Pipeline/Unlit" (`VRGolfClub.cs:159-208`) | Stock | A stock URP Unlit transparent material in the kit |
| TMP text | TMP SDF shaders | Stock | The target project's TMP shaders. `Assets/TextMesh Pro` in upstream holds 18 shaders and 4 shader graphs, all stock TMP |

Materials: 10 `.mat` assets in `Assets/MinimalGolf/Materials` (9 toon, 1 sky). The toon assets have `_REVEAL_CLIP` saved as enabled, a leftover the code comments call a leak (`RevealVolumeManager.cs:120-121`); harmless because the mask returns 1 when no volume is active. Outline width in the assets is 0.002.

`BundleCheckPolicy.cs` in the SDK has no rule that names shaders, clips or materials (grep found none); it polices scripts and events. A custom shader in a kit is therefore expected to pass the bundle check, but that is unverified until rung 2.

### 6.4 Audio

| File (under `Assets/Audio/`) | Format | Length | Bytes | Licence |
|---|---|---|---|---|
| `SFX/Golf_Ball_Hit_01.wav`, `_02`, `_03` | 48 kHz, 24-bit, stereo | 0.54, 0.50, 0.51 s | 159,088; 148,288; 152,068 | none stated |
| `SFX/Ball_Fall_To_The_Empty_Hole_01.wav`, `_02`, `_03` | same | 0.71, 0.80, 1.76 s | 207,610; 233,764; 512,164 (largest) | none stated |
| `SFX/Classic_Woosh.wav` | same | 0.53 s | 156,820 | none stated; also unused (H5) |
| `Music/Dresden_The_Flamingo_Hall_Pass_instrumental_1_51.mp3` | MP3 | 1:51 by its name | 1,793,292 | **none stated** |
| `Music/Dresden_The_Flamingo_Just_A_Lil_Treat_instrumental_2_38.mp3` | MP3 | 2:38 by its name | 2,530,571 | **none stated** |
| `Music/Moments_Light_In_June_background_vocals_2_05.mp3` | MP3 | 2:05 by its name | 2,013,139 | **none stated** |

What was checked for a statement about the audio: `README.md` (credits Kenney only, `:28-29`), `LICENSE`, `AGENTS.md`, all five files in `.agents/plans/`, every `.cs` file, and the files' own metadata. Results:

- The only mention of the tracks is an instruction to copy "3 tracks ... from `Assets/Audio/Music/`" into a web build (`.agents/plans/2026-08-15-minigolf-prompt-to-threejs.md:7, 23`). No source, author or licence.
- The MP3 tags hold only an encoder ("Pro Tools", Lavf), an originator reference, a UMID and a date each (2025-09-04, 2024-06-10, 2026-06-15). No title, artist, copyright or licence frame.
- The file names follow an "Artist_Title_version_minutes_seconds" pattern typical of commercial music-library downloads. Which library was **not determined**.
- The WAV files carry no metadata chunks at all (only `JUNK`, `fmt`, `FLLR`, `data`). Their names read like stock-library effect names. Source **not determined**.

Decision: the three music tracks are left out, as planned. **The seven sound effects have exactly the same problem** and the plan does not mention them: see section 10.

### 6.5 Fonts

`Inter-Regular.otf` (258,992 bytes, OFL) is referenced by two fields and rendered nowhere. All text uses TMP's LiberationSans SDF. The kit uses the target project's LiberationSans SDF and does not carry Inter.

### 6.6 Which files are safe in Unity 6000.3.21f1

Upstream was saved by 6000.5.6f1. Unity does not support opening a newer project in an older editor, so each asset kind was sorted by how it is stored, and the YAML kinds were compared against 1,035 YAML files and 2,351 `.meta` files from the 6000.3.21f1 projects on this machine (portkit template and spike, BilliardsWorld, FlightWorld, SplatTestWorld).

Plain binaries or plain text, safe:

| Kind | Count | Note |
|---|---|---|
| FBX | 126 | Re-imported by the target editor |
| PNG | 2 (+60 test thumbnails) | |
| WAV, MP3 | 7, 3 | |
| OTF, TTF | 1, 1 | |
| `.shader`, `.hlsl` | 2 game + 1 include (plus stock TMP) | Text; compile risk is about URP versions, not the file format |
| `.cs`, `.asmdef`, `.inputactions`, `.txt`, `.md` | 22, 3, 1, - | Never compiled in the port |

Unity YAML, version-sensitive:

| Kind | Count | Finding |
|---|---|---|
| Scene | 1 | Every class's `serializedVersion` equals what the 6000.3.21f1 projects contain (GameObject 6, Transform 2, MeshCollider 5, BoxCollider 3, SphereCollider 3, Rigidbody 5, Material 8, PrefabInstance 2, LineRenderer 3, Camera 2, AudioSource 4, RenderSettings 10, LightmapSettings 13, Canvas 3), **except `Light`: 13 upstream against 12 at most locally**, with one field the local files never have (`m_ShapeRadius`). `Canvas` has one extra field (`m_UseReflectionProbes`). No MeshRenderer or MeshFilter differences were found |
| Prefabs | 2 | `GolfBall.prefab`: Rigidbody 5 with `m_LinearDamping`, matches. `VR_UI_Root.prefab`: the TextMeshProUGUI, Image, Button, CanvasScaler and GraphicRaycaster blocks have no field that local 6000.3 files lack |
| Materials | 10 (+2 TMP) | Material version 8, matches |
| Physics material | 1 (`.asset`, class `PhysicsMaterial`, version 2) | No local file of this class to compare with; the class name is the Unity 6 one |
| URP assets and volume profiles | 8 in `Assets/Settings` | Written by URP 17.5. Not needed: the port project has its own |
| TMP font assets and settings | 2 + several | Stock; use the target project's |
| XR, Oculus, Meta and simulator config assets | about 20 | Not needed |
| `.meta` files | 302 | `ModelImporter` version **24501 upstream against 24300 at most locally**. `TextureImporter` 13, `AudioImporter` 8 and `TrueTypeFontImporter` 4 match. No extra importer fields were found |
| Shader graphs, animator controllers, animation clips, timelines, VFX | 0 of the game's own | Nothing to convert |

Reading: the scene will probably open, and the light that carries the one newer class is not wanted in a kit anyway. The real unknowns are (a) whether the FBX `.meta` files with importer version 24501 are accepted or reset, (b) whether sub-object ids inside the FBX files stay the same after re-import (the scene refers to them: for example root transform `-8679921383154817045` and root object `919132149155446097` in every Kenney file, `SCENE:943-1045`), and (c) the broken references the scene will have without the Meta packages (the rig scripts and two controller prefab instances). None of this could be tested without opening Unity.

### 6.7 Rebuilding the levels from data, if the scene does not open

There is no level data, but the scene file is text and was parsed completely for this document without Unity (293 transforms, 36 prefab instances, 181 embedded materials). Two sources:

1. **The scene text (the truth).** Extend `portkit/tools/importer` to write `levels.json` from `SCENE`: per level its name, par, width, length, reset point, hole centre and layout slot; per part its group, name, kind (cube, cylinder, sphere, or a Kenney file name), local position, rotation quaternion and scale, one of the 7 materials, collider (box with size and centre, non-convex mesh, or none), occluder flag and reveal index; plus the windmill's four collider boxes and the blades node. The kit builder then creates Unity primitives and instantiates the 13 FBX files, which are binary and import cleanly. This reproduces the geometry exactly and needs no upstream YAML to load.
2. **The deleted builder script (a cross-check).** Upstream once generated the scene from code: `Assets/MinimalGolf/Editor/MinimalGolfSceneBuilder.cs`, 1,163 lines, removed in commit `e08b6b2` ("Removed the builder procedure"). `git show e6d326c:Assets/MinimalGolf/Editor/MinimalGolfSceneBuilder.cs` has one `Create...` method per level (`:551-805`) and helpers for gates, windmill colliders, tee markers and planters. It is stale: the scene was edited by hand in 11 later commits (for example `4f9a17f` "Fixed colliders on wind mill"), and its physics material values (0.55, 0.65, 0.14) are not the shipped ones. Use it to understand intent, not as data.

Recommendation: build the kit from `levels.json` (source 1) in any case. It removes the dependency on a newer-version scene, drops the 175 material copies, and gives the Node tests the same level table the kit uses.

---

## 7. Translation map

In porting order. "ts" lines are an estimate of what remains after dropping editor code, gizmos and Meta plumbing.

| # | Upstream file (lines) | Goes to | What moves | Hard parts |
|---|---|---|---|---|
| 1 | `MiniGolfLevel.cs` (57) | `ts/src/MiniGolfLevel.ts` (~50) | Level data from bindings, `IsRevealing`, `IsOutsideCourse` | `InverseTransformPoint` without Unity: needs the level's world matrix from holder position, rotation, scale and the layout slot. Must match Unity's maths in 32-bit floats |
| 2 | `LevelRevealAnimator.cs` (215) | `ts/src/LevelRevealAnimator.ts` (~70) for timing (`TotalDuration`, `IsPlaying`, part offsets) + **Unity side**: one baked AnimationClip per level (or a per-frame graph) built by the kit builder from the same numbers | The motion itself | Up to 27 parts per level cannot be moved from the page at 20 Hz. The clip must run on unscaled time and be startable part-way for late joiners. Empty entries still count in the stagger (A9) |
| 3 | `MinimalGolfGame.cs` (852) | `ts/src/MinimalGolfGame.ts` (~450) + **Unity side**: (a) a per-ball fixed-step graph for the cup assist and the capture test (`:351-388`), reporting capture to the page; (b) a per-ball graph or tween for the capture move and shrink (`:642-693`); (c) out-of-bounds sampling | Level loading and swapping, aim maths, shot, strokes, messages, restart rules | Splitting one class into shared state (hole, layout, phase) and per-player state. Five coroutines become scheduler entries with deadlines on the synced clock. The assist needs 50 Hz and fresh velocity, which the page does not have. Velocity for rule B1 arrives late (`WatchProperties`), so "ball at rest" must be decided on the owner and tolerate lag. `StopAllCoroutines` side effects (D3, K3) need a deliberate decision. About 190 lines of rig setup and editor input are dropped (`:129-226, 247-279, 337-348`) |
| 4 | `VRGolfClub.cs` (418) | `ts/src/VRGolfClub.ts` (~130) | The `Update` logic (`:237-316`) driven by `button-pressed`, `button-released`, `trigger-axis-update` and `pose-update`; the desktop path is new | The pose stream stops when the hand is still and is at most 30 Hz; edge detection must come from button events, not polling. About 230 lines are sphere-material creation, gizmos and editor mouse code and are replaced by a kit object |
| 5 | `VRGolfUI.cs` (237) | `ts/src/VRGolfUI.ts` (~150) | All text and colour rules (G1 to G5), plus the new scorecard | `Mathf.RoundToInt` rounds halves to even, `Math.round` does not (G3). `CanvasGroup` is not allow-listed. Per-frame refresh becomes "send only on change" |
| 6 | `AudioManager.cs` (240) | `ts/src/AudioManager.ts` (~70) | No-repeat clip choice, volumes | Music code is removed. Decide who hears a shot (section 8.3) |
| 7 | `GolfBallImpact.cs` (17), `CameraImpactShake.cs` (46) | `ts/src/GolfBallImpact.ts`, `ts/src/CameraImpactShake.ts` (~50 together) | Impact strength to haptic amplitude, cooldown | `collision-enter` gives a point and a normal but **no relative velocity**; the strength needs the ball's speed before the hit, or a graph that reads `Collision.relativeVelocity` |
| 8 | `ProximityRevealVolume.cs` (151), `RevealVolumeManager.cs` (490) | `ts/src/ProximityRevealVolume.ts` (~50), `ts/src/RevealVolumeManager.ts` (~80) + **Unity side**: the shader and a relay op for shader globals and cull mode | Grip gating, the two-volume union, radius and softness | About 400 lines of tag scanning, property-block fallback and leak cleanup do not apply (F7). The custom tag cannot exist in Altspace (`Docs/building-in-unity/tags.md`); occluders come from bindings |
| 9 | `WindmillRotor.cs` (26) | **Unity side**: a small graph setting the blade angle from `BS.SyncedClock.NowSeconds`. `ts/src/WindmillRotor.ts` (~15) only for the angle function used in tests | - | All clients must agree on the angle because each simulates their own ball against it. Upstream turns a collider that has no rigidbody; whether to add a kinematic one is a tuning choice |
| 10 | `VRCoursePlacement.cs` (45) | Folded into snippet settings (`position`, `table-scale`) | - | None |
| 11 | `EnvironmentController.cs` (286) | **Unity side**, showcase scene only: the sky material with the scene's values | - | Not part of the snippet |
| 12 | `VREditModePreview.cs` (336), `CustomGameCursor.cs` (11), `Assets/MinimalGolf/Editor/*` (115), `Assets/Editor/*` (327) | Not ported | - | Editor tooling and a stub |
| - | (new) | `ts/src/GolfRound.ts` (~400) | Slots, ball ownership, turn order, shared hole completion, scorecard, join and leave | Not an upstream file: the README's "one file per upstream gameplay file" rule has no place for it. Proposed as an explicit exception |

Totals: about 2,100 upstream lines are gameplay worth translating; roughly 1,100 lines of TypeScript for the upstream logic, 400 new for multiplayer, and four Unity-side pieces (reveal clips, ball assist graph, capture tween, windmill graph) plus the shader.

---

## 8. Snippet design

### 8.1 Identity

- Slug `mini-golf` (proposal; not registered until Shane's go-ahead).
- `single`: no. Several tables in one world are fine; every id, state key and message carries the instance key.
- Players: up to 8 seated per instance (8 pooled balls); any number of spectators.
- Title "Mini Golf". The name "Minimal Golf" on the game card is upstream's title; keeping or replacing it is a question for Shane (section 10).

### 8.2 Settings

All flat strings, read with a fallback.

| Attribute | Default | Meaning |
|---|---|---|
| `position` | `0 1 0` | World position of the play spot: the centre of the current level at green height |
| `rotation` | `0 0 0` | Euler degrees. This replaces upstream's thumbstick rotation |
| `scale` | `1` | Holder scale, multiplied with `table-scale`. Leave at 1 |
| `room` | (empty) | Instance key, per the README naming rule |
| `table-scale` | `0.05` | Upstream's table scale (`SCENE:27381`). All shot, assist and capture distances and impulses are multiplied by `table-scale / 0.05`. Other values change the feel because gravity does not scale; only 0.05 is checked against upstream |
| `mode` | `free` | `free` or `turns` (3.4) |
| `max-players` | `8` | 1 to 8 |
| `show-other-levels` | `true` | Upstream shows all 8 levels around the play spot (A3). `false` hides the non-current ones for a compact table |
| `hole-timeout` | `120` | Seconds after the first player holes out; 0 = never |
| `stroke-limit` | `0` | Strokes per hole before a player is recorded and moved on; 0 = none, as upstream |
| `turn-seconds` | `45` | `turns` mode only; 0 = none |
| `desktop-aim` | `pull` | `pull`: the clicked point is where the hand would be pulled to, as upstream. `target`: the ball goes toward the click |
| `reveal` | `true` | The x-ray volumes |
| `board` | `0 0.3 0.75` | Local position of the UI board relative to the play spot (upstream: (0.003, -0.3, 0.7) below and behind the table, facing a player who cannot move) |
| `sfx-volume` | `0.7` | Upstream `sfxVolume` |
| `haptics` | `true` | |
| `windows`, `android` | (empty) | Bundle addresses for tests, per the README |

### 8.3 Gizmos

```html
<bs-gizmo type="position" attribute="position"/>
<bs-gizmo type="box" attribute="position" size="0.7 0.3 1.3"/>
<bs-gizmo type="box" attribute="position" position="-0.26 0 2.26" size="4.0 0.3 5.1"/>
<bs-gizmo type="position" attribute="board"/>
<bs-gizmo type="plane" attribute="board" size="1.0 0.35"/>
```

- First box: the footprint of the largest current level (0.60 m wide for level 6, 1.13 m long for level 5).
- Second box: the footprint of all 8 levels at their authored offsets (x from -2.24 to 1.72 m, z from -0.29 to 4.81 m at scale 0.05). It only applies with `show-other-levels="true"`. Gizmo sizes are fixed in the markup and do not follow `table-scale`.

### 8.4 Per instance

Holder `pk1:mini-golf:<inst>`; network ids `pk1/mini-golf/<inst>/ball0..7`; space-state prefix `pk1.mini-golf.<inst>.`; the level layout permutation; the relay graph's holder filter; the sound source; the ball-to-ball ignore pairs. The reveal shader globals are per client, not per instance: only the local player's hands drive them, so two tables in one world share them without conflict.

### 8.5 Player actions

| Action | VR | Desktop |
|---|---|---|
| Join the round | Point and click JOIN on the board | Click JOIN |
| Aim | Bring a hand within 0.19 m of your own ball, hold the trigger, pull back up to 16 cm (rules B3 to B8, unchanged) | Click on the green: the click point is the pull point (or the target, per `desktop-aim`); power from its distance to the ball, full at 16 cm x scale. The aim line and power meter show the result. Click again to adjust |
| Putt | Release the trigger (B9 to B12) | Click your own ball, or press Space or Enter |
| Cancel an aim | Release with almost no pull (B9) | Press Esc or C |
| X-ray | Hold grip: a 7.5 cm hole around that hand (F1 to F5) | Hold G: the hole is centred on your own ball (the editor key upstream uses, `ProximityRevealVolume.cs:67`) |
| Restart my hole | Click RESTART HOLE on the board (D4) | Same, or press R (upstream's editor key) |
| Play again | Click PLAY AGAIN when the course is complete (D5, D6) | Same |
| Leave | Click LEAVE, or walk away and time out, or leave the world | Same |
| Turn the course | Not available; walk around it (section 10) | Not available |

How the desktop click works: the page only gets `click` with a world hit point on colliders on the UI or Menu layer. Each level gets a thin trigger box on the UI layer just above the green (an "aim pad", active for the current level only), and each ball a small trigger sphere on the UI layer. The physics colliders stay where they are.

Sound: the shooter plays the hit and hole sounds locally and sends a one-shot so the others hear them at the table. The spatial blend becomes fully 3D with a short range, so a table does not sound across a whole world (changed, section 10).

### 8.6 Contract changes this game needs

The README says to extend it in the same change. Needed:

- Relay ops: `line` (LineRenderer two points, width, colour, enabled), `uiColor` (Image or TMP colour), `uiSize` (RectTransform size), `fade` (`Graphic.CrossFadeAlpha`), `shaderGlobal` (vector, float, int), `matFloat` (for the cull mode), `assist` (arm or disarm the ball graph with a hole target index and the six numbers), `sink` (start the capture tween), `rbInit` (sleep threshold on a ball).
- A graph-to-page callback other than `clock`: the ball graph must tell the page "captured" and "impact with speed v".
- Platform interface: scene-level input (`button-pressed`, `button-released`, `trigger-axis-update`, `pose-update`, `key-press`, `key-release`), `SendHapticImpulse`, `Rigidbody.AddForce`, `WatchProperties` for velocity, `TakeOwnership` and `DoIOwn`. The bindings `events.kind` list covers object events only.

---

## 9. Test plan

### 9.1 Golden vectors (upstream C# compiled with dotnet against stubs)

The stubs must cover `UnityEngine` (Vector3, Vector2, Quaternion, Mathf, Color, Color32, Time, MonoBehaviour, Transform, Rigidbody with a recording `AddForce`, AnimationCurve for the two-key ease), `OVRInput`, `OVRCameraRig`, TMP and uGUI types. Outputs are compared in 32-bit floats (`Math.fround`) with a small tolerance.

| Vector set | Upstream code | Inputs to sweep |
|---|---|---|
| Aim maths: power and direction | `MinimalGolfGame.cs:415-428` | start and current points, including zero pull, pull beyond 0.16, vertical-only movement |
| Release gating and impulse | `MinimalGolfGame.cs:430-456, 528-550` | power around 0.001, direction around the 0.001 threshold, ball speed around 0.10; expect stroke counts and the recorded impulse |
| Aim line length and colour | `MinimalGolfGame.cs:505-525` | power 0 to 1 in steps, including 0.55 |
| Cup assist force and capture test | `MinimalGolfGame.cs:364-382` | distance 0 to 0.06, speed 0 to 0.7 |
| Capture path | `MinimalGolfGame.cs:659-692` | position and scale at sampled times |
| Par message | `MinimalGolfGame.cs:696` | strokes under, at and over par (pins K1) |
| Level layout after a sequence of loads | `MinimalGolfGame.cs:718-752` | a full round, a restart, level restarts (pins K7) |
| Out of bounds | `MiniGolfLevel.cs:49-55` | points around each limit for all 8 sizes, with a rotated and scaled level |
| Reveal timing and positions | `LevelRevealAnimator.cs:38, 70, 91-94, 142-152` | part counts 12 to 27, times 0 to total |
| Clip choice | `AudioManager.cs:149-187` | a seeded stub random, 1,000 draws, never the same twice |
| UI values | `VRGolfUI.cs:181-225` | pip colours and heights for each hole, segment fill, percent rounding at .5 values, toast opacity |
| Haptic strength | `CameraImpactShake.cs:28-39` | impact speeds 0 to 10, calls inside and outside the cooldown |
| Reveal mask | `RevealClip.hlsl:14-54` re-typed as C#, checked against `RevealVolumeManager.cs:373, 387` | distance around radius and softness, one and two volumes |

Not suitable for vectors: anything that depends on PhysX (how far a ball rolls, bounces, ramps). That is checked in Play mode.

### 9.2 The upstream play-mode tests

`TESTS` has four tests on the real scene:

| Test | What it does | Lines |
|---|---|---|
| T1 | Level 1: impulse 7.2 straight at the hole, expects completion and then level 2 "THE GARDEN" | `:115-152` |
| T2 | Level 1: impulse 5 to the left, expects one more stroke, no completion, and more than 0.5 m from the hole after 3.5 s | `:154-179` |
| T3 | Level 2: up to three shots (7.0, 5.0, 6.2); if that fails it teleports the ball onto the hole; expects completion and then "WINDMILL WAY" | `:181-237` |
| T4 | Level 3: weak impulse 2, expects no completion and more than 0.6 m from the hole | `:239-262` |

Findings:

- They do not use the game's shot code. They call `AddForce` on the ball directly and raise the private stroke counters by reflection (`:65-96`), so rules B1 to B12 are untested upstream.
- They check the UI only through `GetUIValues` (`MinimalGolfGame.cs:93-101`), not the panels.
- Their numbers look like the pre-VR, full-size tuning: impulses of 5 to 7.2 against a current maximum of 2.0, and distances of 0.5 and 0.6 m on a level that is now 0.53 m long. The recorded runs in `TestDashboard/` are dated 2026-08-10, five days before "VR support added". Whether they still pass at cc7ed63 was **not determined** (running them is out of scope).
- The fallback scene path in `:23` points at `Assets/Scenes/MinimalGolf.unity`, which no longer exists.

Reuse: the four scenario shapes are worth keeping (hole in one, miss, several shots with a forced capture as a fallback, blocked by the windmill). The numbers must be re-derived for the table scale and the shots must go through `TryApplyShot`. The newer `HandAimLogicTests.cs` on `upstream/feature/hands` is outside this commit.

### 9.3 Node scenarios (fake room, several clients, virtual time)

The ball is a stub in Node: the test scripts where it rests or that it reached the cup.

| # | Scenario | Checks |
|---|---|---|
| N1 | One client plays all 8 holes with scripted results | Stroke counts, messages and durations, level order, layout permutation, course complete, play again resets totals |
| N2 | Two clients, `free` mode, different stroke counts | Hole ends only when both have holed out; card rows; advance 2.05 s after the second capture |
| N3 | Two clients, `turns` mode | Order, "NOT YOUR TURN", turn passes at rest, at out of bounds and at capture; `turn-seconds` skip |
| N4 | Third client joins during hole 3, and another during a reveal | Slot, ball at the reset point, empty earlier holes, reveal joined part-way |
| N5 | A seated client leaves mid-hole; then the referee leaves during the 2.05 s wait | Slot kept 30 s then freed, hole not blocked, new referee advances at the stored time |
| N6 | `hole-timeout` and `stroke-limit` | DNF recording |
| N7 | Restart my hole during play, during capture and during the wait | The chosen behaviour for D4 and K3 |
| N8 | Out of bounds | "BALL RETURNED", no stroke, coroutine side effects of D3 |
| N9 | Two instances of mini-golf plus another game in one room | No shared keys, ids or messages |
| N10 | Everyone leaves, a stranger arrives next day | Stale round is cleared |
| N11 | Joins, leaves and referee loss in random order (seeded) | All clients reach the same state digest; leaf sizes within budget |

### 9.4 Play mode, one player (rung 3)

A scenario bot drives the page through a test hook and prints PASS or FAIL lines.

| # | Scenario |
|---|---|
| P1 | Kit loads, every binding resolves, 8 balls get distinct network ids, non-current balls hidden |
| P2 | Level 1: aim from the reset point straight at the hole with a power found by search; the ball reaches the assist zone, is captured, sinks, and level 2 loads (T1's shape, through the real shot code) |
| P3 | Level 1: shot to the left; one stroke, no capture (T2's shape) |
| P4 | Level 2: up to three shots, then place the ball on the hole; capture and advance (T3's shape) |
| P5 | Level 3: weak shot; blocked, no capture; windmill angle equals 72 x clock (T4's shape) |
| P6 | Place the ball outside each bound: returned, no stroke |
| P7 | Aim while the ball moves: "WAIT FOR THE BALL"; release with a tiny pull: no stroke |
| P8 | All 8 levels: reveal length matches A9, ball appears after it, levels 7 and 8 can be finished (ramp and raised hole) |
| P9 | Restart my hole; course complete; play again |
| P10 | Reveal on and off (key G): occluder materials receive the globals; the ball stays visible |
| P11 | Ball rest time after a full-power shot, and the bounce off a rail at about 1.5 m/s, compared with numbers recorded from upstream if those can be obtained (they need upstream to run, which this analysis did not do) |

### 9.5 Local Multiplayer, two players (rung 4)

| # | Scenario |
|---|---|
| M1 | Both join; each putts their own ball; each sees the other's ball move; both pages reach the same state digest after two holes |
| M2 | Player 1 walks through player 2's ball and clicks it: ownership does not change (`DoIOwn` stays false for player 1), the ball does not move |
| M3 | Player 2 reloads (late join) mid-hole: same hole, same layout, card intact, own ball back under their ownership |
| M4 | The main editor's player (referee) leaves during a hole: player 2 becomes referee, the hole can still end and advance |
| M5 | The windmill angle and the reveal animation are in step on both |
| M6 | A shot's sound is heard by the other player; a capture's shrink is seen by the other player |

Local Multiplayer is desktop only, so trigger, grip, pose and haptics are exercised only through the keyboard stand-ins (key 3 for the trigger) and remain unproven until rung 5.

---

## 10. Changed or left out, then open risks and questions

### 10.1 Changed

| # | Change | Reason |
|---|---|---|
| 1 | One player becomes up to 8, with a shared hole, per-player balls and a scorecard (3.4) | The brief; upstream rules are kept per player |
| 2 | Balls do not collide with each other | Remote balls are kinematic; real collisions would be unfair and inconsistent |
| 3 | The ball is pooled and teleported instead of destroyed and instantiated | Synced objects need the same id on every client; a run-time copy gets a per-player id |
| 4 | Restart input moves from the left Menu button to a board button (and R on desktop); "restart my hole" no longer replays the reveal | No Menu button event; a reveal replay would move the course under everyone else's ball |
| 5 | PLAY AGAIN becomes clickable; A/X no longer restarts | Upstream's button cannot be clicked (D6); A is jump in the app |
| 6 | Desktop play is added: click to aim, click or key to putt | Upstream has no flat-screen mode at this commit, and the page cannot read a mouse drag |
| 7 | Cup assist, capture move, windmill and reveal run in generated graphs or baked clips, not in the page | The page ticks at 20 Hz and sees physics late |
| 8 | Windmill angle comes from the synced clock | All clients must see the same blades |
| 9 | Sounds become 3D at the table and are relayed to other players | A snippet lives in someone else's world; upstream's near-2D sound would be heard everywhere or by nobody else |
| 10 | Haptics get an explicit duration; frequency is dropped | The SDK call takes amplitude and seconds |
| 11 | Toon outline pass retagged, stereo macros added, reveal variant always compiled, 175 material copies reduced to 7 | Section 6.3; host worlds lack upstream's renderer feature |
| 12 | The level-swap layout is stored as a permutation in shared state | Late joiners must see the same layout (K7) |
| 13 | Per-ball sleep threshold 0.14 set at start | Upstream sets it project-wide, which a snippet may not |
| 14 | New messages: "NOT YOUR TURN", DNF marks, "joined at hole n" | Multiplayer only |

### 10.2 Left out

| # | Left out | Reason |
|---|---|---|
| 1 | The three music tracks (`Assets/Audio/Music/*.mp3`) and all music code | No licence statement anywhere (6.4) |
| 2 | Thumbstick course rotation (E1, E2) and the rig clamp (E3) | Players can walk around the table here; a shared rotation would move other players' balls; the upstream behaviour for the ball is itself unclear. The `rotation` setting places the table |
| 3 | The night sky, fog, sun and ambient as part of the snippet (I2, I3) | World-wide state. They go into the showcase world only |
| 4 | `Classic_Woosh.wav` | Never played upstream (H5) |
| 5 | Collision sound | No clip assigned upstream (H4) |
| 6 | Inter font, cursor image | Unused upstream |
| 7 | Frame-rate and vsync settings, listener handling, tracking-origin setup | The app owns them |
| 8 | Editor preview, inspectors, setup fixers, test recorder and dashboard | Editor tooling |
| 9 | Hand tracking | Only on `upstream/feature/hands`, after the analysed commit |
| 10 | Whole-object fade fallback of the reveal manager | Never used by the shipped scene (F7) |
| 11 | Bounce threshold 1 | Global physics setting; cannot be set per object |

### 10.3 Open risks, ranked

1. **Physics feel through synced objects at 1:20 scale.** An 8 mm ball (below the default contact offset of 0.01 m), a rigidbody under a parent scaled to 0.05, owner-simulated and followed elsewhere about 100 ms late, in a host world whose bounce threshold and layer matrix are not ours. Whether a script-added `BS.Rigidbody` keeps the prefab's mass, damping and interpolation is not stated for kit objects (`Docs/components/physics.md:97` covers the Inspector case). Needs a spike before any level tuning: full-power shot on level 1, level 7 ramp, level 8 launch.
2. **The player's body and the table.** The body collides with the Default layer and the app's collision matrix applies, so a player standing in the table could push course parts' neighbours or balls. Balls on the UI layer would be untouchable by body and hands and clickable, but whether UI-layer bodies collide with Default-layer course colliders in the app is not documented. Spike.
3. **Fixed-step graphs and callbacks.** The design assumes a generated graph can run every physics step on a ball and call back into the page. The README names only the `clock` reply. If that is not available, the assist must run from the page at 20 Hz with late velocities, and holes will feel different.
4. **Aim input quality in the headset.** `pose-update` is at most 30 Hz, silent while the hand is still, and reports the hand, not the controller anchor upstream uses. A 16 cm pull at that rate should be fine, but the start-of-aim position may be stale by a frame or more. Rung 5 only.
5. **Opening upstream YAML in 6000.3.21f1** (6.6). Mitigated by building from `levels.json` (6.7).
6. **Custom shader on Quest inside a kit**: allowed by the bundle check as far as its policy file shows, unverified; single-pass stereo fixes are needed; shader variants must survive bundle stripping.
7. **Ownership hand-over.** When an owner leaves, the SDK gives their ball to "the player who owns the fewest objects" after about a second, with no event. The receiving client must notice by polling `DoIOwn` and park the ball, or the ball may roll under someone else's physics.
8. **Reveal clips and colliders.** Moving up to 27 collider-carrying parts by animation each time a level loads is cheap, but a seated player's ball must not be on the level while it reveals; the round logic guarantees that only if restarts never replay the reveal.
9. **The runtime is not there yet.** `portkit/ts` does not exist at the time of writing (the README lists it), so everything in 8.6 is a request against an interface still to be frozen.

### 10.4 Questions for Shane

1. **Sound effects.** The seven WAV files have no licence or source, exactly like the music. Leave them out and use CC0 replacements (Kenney publishes CC0 impact and interface sounds), or ask the upstream author where they come from?
2. **The plan says "Club is a grabbable" and schedules a "golf club hits" spike.** Upstream has no club object and no swing: the shot is a pull-back and release with one impulse (B2 to B12). Port the upstream mechanic as it is (recommended, and no frame-critical spike is needed), or add a physical grabbable putter as a new mechanic?
3. Tabletop scale 0.05 as upstream, or a larger, walk-around course? Larger scales need the physics retuned and are not "the same game".
4. Upstream quirks: keep or fix? K1 ("UNDER PAR!" at par), K2 (restart keeps strokes in the total), K4 (ball sinks 32 cm), D2 (no penalty for leaving the course). The default here is to keep them and list them.
5. Defaults for `hole-timeout` (120 s) and `stroke-limit` (off): acceptable, or should upstream's "no limit at all" be the default?
6. Scoring for a late joiner: empty holes and a partial total (proposed), or par plus a fixed number for missed holes?
7. Title on the game card: keep "MINIMAL GOLF" or use the snippet's own name?
8. `desktop-aim` default: `pull` (literal upstream slingshot) or `target` (click where the ball should go)?
