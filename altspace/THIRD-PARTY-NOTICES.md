# Mini Golf: third-party notices

Mini Golf (snippet `mini-golf`, script `pk-mini-golf.js`, kit bundles `mini-golf`) is a multiplayer port of
MinimalGolfVR to Altspace. Port source: the fork of https://github.com/dilmerv/MinimalGolfVR, branch `altspace`, folder
`altspace/`. A copy of this file is inside every kit bundle (`Assets/Kit/THIRD-PARTY-NOTICES.md`), beside the full licence
texts it names (`Assets/Kit/Licenses/`, and TextMesh Pro's `LiberationSans - OFL.txt`, which the kit packs itself). The
SIL Open Font License 1.1 is also copied in full at the end of this file.

## MinimalGolfVR: code, scene, materials and shaders

- Source: https://github.com/dilmerv/MinimalGolfVR (commit `cc7ed63`)
- Copyright (c) 2026 Dilmer Valecillos. Licence: MIT (`LICENSE` at the repository root; full text in the bundle as
  `Licenses/MinimalGolfVR-LICENSE.txt`):

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
- By Kenney (www.kenney.nl). Licence: Creative Commons Zero, CC0 1.0 (`License.txt` in the kit, in the bundle as
  `Licenses/Kenney-MinigolfKit-License.txt`; the CC0 1.0 legal code as `Licenses/CC0-1.0-legalcode.txt`,
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

`Classic_Woosh.wav` (never played upstream) has no replacement. The CC0 1.0 legal code is in the bundle as
`Licenses/CC0-1.0-legalcode.txt`.

## Fonts

- Liberation Sans (TextMesh Pro's LiberationSans SDF, from the project's TextMesh Pro essentials): Digitized data
  copyright (c) 2010 Google Corporation with Reserved Font Arimo, Tinos and Cousine. Copyright (c) 2012 Red Hat, Inc.
  with Reserved Font Name Liberation. SIL Open Font License 1.1 (TextMesh Pro's `LiberationSans - OFL.txt`, packed in
  the bundle by the kit; the licence text is also below). Inter, assigned upstream but never drawn, is not shipped.
- Space Mono Regular (the scorecard's monospaced lines; `Assets/Kit/Fonts/SpaceMono-Regular.ttf`, made into a static
  TextMesh Pro asset): Copyright 2016 The Space Mono Project Authors (https://github.com/googlefonts/spacemono), designed
  by Colophon Foundry. SIL Open Font License 1.1 (`Assets/Kit/Licenses/SpaceMono-OFL.txt`, in the bundle as
  `Licenses/SpaceMono-OFL.txt`; the licence text is also below). Downloaded on 2026-11-24 from
  Google Fonts' repository, https://github.com/google/fonts/tree/main/ofl/spacemono (METADATA.pb: license "OFL").

## portkit

The script also holds the portkit runtime: Copyright (c) 2026 the portkit authors, MIT (`ts/portkit/LICENSE`, in the
bundle as `Licenses/portkit-LICENSE.txt`). The script's own banner carries its MIT notice.

## SIL Open Font License 1.1 (Liberation Sans, Space Mono)

The two fonts' copyright lines are above. The licence:

```
-----------------------------------------------------------
SIL OPEN FONT LICENSE Version 1.1 - 26 February 2007
-----------------------------------------------------------

PREAMBLE
The goals of the Open Font License (OFL) are to stimulate worldwide
development of collaborative font projects, to support the font creation
efforts of academic and linguistic communities, and to provide a free and
open framework in which fonts may be shared and improved in partnership
with others.

The OFL allows the licensed fonts to be used, studied, modified and
redistributed freely as long as they are not sold by themselves. The
fonts, including any derivative works, can be bundled, embedded, 
redistributed and/or sold with any software provided that any reserved
names are not used by derivative works. The fonts and derivatives,
however, cannot be released under any other type of license. The
requirement for fonts to remain under this license does not apply
to any document created using the fonts or their derivatives.

DEFINITIONS
"Font Software" refers to the set of files released by the Copyright
Holder(s) under this license and clearly marked as such. This may
include source files, build scripts and documentation.

"Reserved Font Name" refers to any names specified as such after the
copyright statement(s).

"Original Version" refers to the collection of Font Software components as
distributed by the Copyright Holder(s).

"Modified Version" refers to any derivative made by adding to, deleting,
or substituting -- in part or in whole -- any of the components of the
Original Version, by changing formats or by porting the Font Software to a
new environment.

"Author" refers to any designer, engineer, programmer, technical
writer or other person who contributed to the Font Software.

PERMISSION & CONDITIONS
Permission is hereby granted, free of charge, to any person obtaining
a copy of the Font Software, to use, study, copy, merge, embed, modify,
redistribute, and sell modified and unmodified copies of the Font
Software, subject to the following conditions:

1) Neither the Font Software nor any of its individual components,
in Original or Modified Versions, may be sold by itself.

2) Original or Modified Versions of the Font Software may be bundled,
redistributed and/or sold with any software, provided that each copy
contains the above copyright notice and this license. These can be
included either as stand-alone text files, human-readable headers or
in the appropriate machine-readable metadata fields within text or
binary files as long as those fields can be easily viewed by the user.

3) No Modified Version of the Font Software may use the Reserved Font
Name(s) unless explicit written permission is granted by the corresponding
Copyright Holder. This restriction only applies to the primary font name as
presented to the users.

4) The name(s) of the Copyright Holder(s) or the Author(s) of the Font
Software shall not be used to promote, endorse or advertise any
Modified Version, except to acknowledge the contribution(s) of the
Copyright Holder(s) and the Author(s) or with their explicit written
permission.

5) The Font Software, modified or unmodified, in part or in whole,
must be distributed entirely under this license, and must not be
distributed under any other license. The requirement for fonts to
remain under this license does not apply to any document created
using the Font Software.

TERMINATION
This license becomes null and void if any of the above conditions are
not met.

DISCLAIMER
THE FONT SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO ANY WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT
OF COPYRIGHT, PATENT, TRADEMARK, OR OTHER RIGHT. IN NO EVENT SHALL THE
COPYRIGHT HOLDER BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
INCLUDING ANY GENERAL, SPECIAL, INDIRECT, INCIDENTAL, OR CONSEQUENTIAL
DAMAGES, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF THE USE OR INABILITY TO USE THE FONT SOFTWARE OR FROM
OTHER DEALINGS IN THE FONT SOFTWARE.
```
