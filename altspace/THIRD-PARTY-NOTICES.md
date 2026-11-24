# Mini Golf: third-party notices

Mini Golf (snippet `mini-golf`, script `pk-mini-golf.js`, kit bundles `mini-golf`) is a multiplayer port of
MinimalGolfVR to Altspace. Port source: the fork of https://github.com/dilmerv/MinimalGolfVR, branch `altspace`, folder
`altspace/`. A copy of this file is inside every kit bundle (`Assets/Kit/THIRD-PARTY-NOTICES.md`).

## MinimalGolfVR: code, scene, materials and shaders

- Source: https://github.com/dilmerv/MinimalGolfVR (commit `cc7ed63`)
- Copyright (c) 2026 Dilmer Valecillos. Licence: MIT (`LICENSE` at the repository root):

  > Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
  > documentation files (the "Software"), to deal in the Software without restriction, including without limitation the
  > rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit
  > persons to whom the Software is furnished to do so, subject to the following conditions: The above copyright notice
  > and this permission notice shall be included in all copies or substantial portions of the Software.
  > THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE
  > WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
  > COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
  > OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

- What of it is here: the gameplay scripts translated to TypeScript (`altspace/ts/src/`, bundled into `pk-mini-golf.js`,
  MIT); the eight levels of `MinimalGolf.unity`, the ball and the board (`GolfBall.prefab`, `VR_UI_Root.prefab`), the
  materials, the physics material, and the toon and starry-sky shaders, remade for the port (changes in
  `altspace/PORT.md`, sections 10 and 12).

## Kenney Minigolf Kit

- 13 models of the Kenney Minigolf Kit 3.1 (flag, bump, gates, windmill, obstacles, hill, ramps, corner, support) and its
  `colormap.png`, as MinimalGolfVR ships them (`Assets/MinimalGolf/Kenney/MinigolfKit/`).
- By Kenney (www.kenney.nl). Licence: Creative Commons Zero, CC0 1.0 (`License.txt` in the kit;
  https://creativecommons.org/publicdomain/zero/1.0/). Credit is asked for, not required: given here.

## Sound effects (replacements)

MinimalGolfVR's seven sound effects and three music tracks carry no licence statement, so none of them is shipped. The
music is left out; the effects are replaced with these CC0 files by Kenney, downloaded and checked on 2026-11-24:

| Kit file | Replaces (upstream) | Source file | Pack and address | Licence |
|---|---|---|---|---|
| `Audio/putt1.wav` | `Golf_Ball_Hit_01.wav` | `switch15.wav` | "51 UI sound effects (buttons, switches and clicks)" by Kenney, https://opengameart.org/content/51-ui-sound-effects-buttons-switches-and-clicks | CC0 (licence field of the page) |
| `Audio/putt2.wav` | `Golf_Ball_Hit_02.wav` | `switch16.wav` | same | CC0 |
| `Audio/putt3.wav` | `Golf_Ball_Hit_03.wav` | `switch17.wav` | same | CC0 |
| `Audio/cup1.ogg` | `Ball_Fall_To_The_Empty_Hole_01.wav` | `OGG/metalPot1.ogg` | "50 RPG sound effects" by Kenney, https://opengameart.org/content/50-rpg-sound-effects (`license.txt` in the zip: "License (CC0)") | CC0 |
| `Audio/cup2.ogg` | `Ball_Fall_To_The_Empty_Hole_02.wav` | `OGG/metalPot2.ogg` | same | CC0 |
| `Audio/cup3.ogg` | `Ball_Fall_To_The_Empty_Hole_03.wav` | `OGG/metalPot3.ogg` | same | CC0 |

`Classic_Woosh.wav` (never played upstream) has no replacement.

## Fonts

- Liberation Sans (TextMesh Pro's LiberationSans SDF, from the project's TextMesh Pro essentials): SIL Open Font
  License 1.1. Inter, assigned upstream but never drawn, is not shipped.
- Space Mono Regular (the scorecard's monospaced lines; `Assets/Kit/Fonts/SpaceMono-Regular.ttf`, made into a static
  TextMesh Pro asset): Copyright 2016 The Space Mono Project Authors (https://github.com/googlefonts/spacemono), designed
  by Colophon Foundry. SIL Open Font License 1.1 (`Assets/Kit/Fonts/SpaceMono-OFL.txt`). Downloaded on 2026-11-24 from
  Google Fonts' repository, https://github.com/google/fonts/tree/main/ofl/spacemono (METADATA.pb: license "OFL").

## portkit

The script also holds the portkit runtime (MIT, `ts/portkit/LICENSE`).
