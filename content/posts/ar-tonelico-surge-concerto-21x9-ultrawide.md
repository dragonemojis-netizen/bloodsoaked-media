---
title: "Exa Pico Ultrawide Project"
subtitle: "A personal preservation and reverse-engineering project exploring 21:9 support across the Ar tonelico and Surge Concerto games"
date: "2026-08-25"
excerpt: "Three downloadable 21:9 patches for the Exa Pico catalog, honestly labeled prototype and beta, plus Ciel nosurge and Qoga under investigation. I started because I wanted these games to look right on my ultrawide monitor. This is the work so far."
category: games
type: collection
medium: game
era: "2000s"
mood: Obsessive
tags:
  [
    "ar tonelico",
    "surge concerto",
    "exa pico",
    "ultrawide",
    "21:9",
    "pcsx2",
    "rpcs3",
    "mods",
    "preservation",
    "widescreen",
  ]
featured: true
editorPick: false
author: "Dakota G."
coverImage: "/images/articles/ar-tonelico-surge-concerto-21x9-ultrawide/ar-nosurge-steam-library-hero.jpg"
---

I did not set out to publish a neat little download page. I just wanted *Ar tonelico* to look right on my ultrawide monitor. Then another game in the family asked the same question, and then another, and at some point I looked up and realized I had accidentally started a whole series project.

That is the **Exa Pico Ultrawide Project** in plain terms: me trying to bring 21:9 support to games connected to the Ar tonelico / Surge Concerto catalog. Not a commercial product. Not a promise that every scene, menu, portrait, and FMV has been conquered. Just an ongoing project with prototype and beta releases that mean exactly what those labels say.

I am learning reverse engineering and game rendering as I go. I am not presenting myself as someone who has been professionally reverse engineering PS2 and PS3 games for years. Sometimes I understand exactly why a patch works. Sometimes I have a hypothesis, test it, and discover that it breaks something spectacularly. A lot of this has been trial, error, documentation, screenshots, side-by-side comparisons, reading old widescreen patches, and slowly figuring out how each game is actually built.

These games were designed around older display assumptions. You can stretch the image and fill a modern panel in five minutes. That is not what I am doing here. Change one part of presentation and you often touch a completely different system underneath:

- 3D cameras and projection
- Field and battle framing
- Dialogue and talk scenes
- Portraits and 2D overlays
- UI layout
- Pre-authored backgrounds that simply do not contain pixels outside the original frame
- Cutscenes and FMVs

Sometimes the right result is **Hor+**, holding vertical framing while revealing more of the world to the left and right. Sometimes the original artwork has nothing left to reveal, and the honest answer is empty side space, not a fake stretch. I am not trying to pretend these titles were designed for ultrawide. I am trying to improve what can be improved and write down where the software or the authored content says no.

## From the Editor: A Different Rabbit Hole

If you have been following Bloodsoaked Media lately, you may have seen my last From the Editor check-in on the homepage. Life and work have been keeping me busy, and this has always been a small personal project with only so much time to give each piece of work. In that note I said I would be back with new content soon, starting with a retrospective on the Ar tonelico trilogy once I finish Qoga, followed by a piece on *Black Flag Resynced* in the near future.

That is still the plan in broad strokes. I have not abandoned the Black Flag article. I still want to write it, and I still have extra screenshots from my playthrough sitting in that editor note for exactly that reason. But the honest update is that it has moved to the backburner for now, not because I lost interest, but because the time I have been able to give Bloodsoaked Media lately has pulled me in a different direction.

I originally started digging into these games because I wanted to play them properly on my own ultrawide monitor. Then I started digging into one game, then another, and somewhere along the way I realized I was spending an absurd amount of time learning how their cameras, rendering paths, UI, and old console hardware quirks actually worked. The ultrawide patches became a strange side road that I did not plan for, and now they are part of a larger personal project.

At the same time, playing the games themselves has made me appreciate the series more than I expected. The Ar tonelico / Exa Pico / Surge Concerto universe has become something I care about far more than I thought I would when I first loaded up *Melody of Elemia* to fix a display problem. These games have a specific kind of warmth, strangeness, and emotional sincerity that I think gets lost when people reduce them to "that anime RPG series with the dating sim bits." I think they are genuinely underrated, and I do not want to rush into writing a big retrospective until I have actually experienced the whole lineage for myself.

So the long-term goal, after I have played through the games properly, is to come back and write a full Bloodsoaked Media retrospective about the Ar tonelico / Exa Pico / Surge Concerto lineage: why these games are so interesting, why I think they have been overlooked, and why they have stuck with me. That piece is a future goal, not something already in production. Right now I am learning the games by playing them, and learning their technical guts by trying to make them behave on an ultrawide screen.

I had one plan for what I was going to spend my Bloodsoaked Media time on. Instead, I found another rabbit hole. I am still planning to return to the original idea, including the Black Flag piece when I have the time to do it justice. But for now, my curiosity led me here, and this is where the honest work is.

## Why Ultrawide Is Complicated

A lot of "widescreen patches" for older console RPGs are really one clever rewrite of a projection matrix, or one cheat that stretches everything until the black bars go away. That can look fine in a trailer and fall apart the moment a dialogue portrait, a battle HUD, or a pre-rendered event background enters the frame.

Exa Pico games stack systems that do not share one aspect-ratio brain. Field cameras, battle cameras, dialogue cameras, message windows, and FMVs often live in different pipelines. Fix the 3D field and you may leave 2D UI alone. Fix a message window and a talk-scene portrait may still disagree with the new frame. Authored backgrounds for dialogue or events were painted for a narrower stage. Expand the viewport and you can expose empty side regions that were never meant to be seen. That is not always a broken setting. Sometimes it is just the original content telling the truth.

So these releases are labeled **PROTOTYPE** and **BETA** on purpose. They are playable points along the work, not declarations that the games have been completely solved. Deeper install notes live in each package's `README.txt`. Read those before you install.

## How I'm Actually Making These

I want to be upfront about this because it is part of the story, and it connects directly to the rabbit hole above. I have been using AI coding and analysis tools as a major part of this reverse-engineering and patching workflow while I learn how these games actually work.

The AI analysis workflow I use for that work is locally hosted. The models and tools run on my own hardware rather than sending game files, ISOs, binaries, dumps, or other project data to a third-party cloud AI service. That matters to me both for privacy and because this kind of work involves poking around locally stored game binaries and extracted technical data. I am not claiming every tool involved in the broader project is local, only that the AI-assisted reverse-engineering and coding analysis itself stays on my machine.

The actual loop looks roughly like this:

1. I play and test the games myself.
2. I notice something that looks wrong, or something I want to change.
3. I direct the investigation and decide what questions need answering.
4. Locally hosted AI tools help with the repetitive technical work: scanning binaries, tracing references, comparing addresses and constants, writing analysis scripts, organizing experiments, and documenting results.
5. I review the findings, form hypotheses, decide what to try, and test the results in the actual game.
6. Bad results get rejected and documented.
7. Nothing is considered finished simply because an AI tool says it should work.

That does not mean I pressed a button and generated finished patches. It means I have a very patient assistant for the kind of grunt work that would otherwise eat weeks of my life. AI is part of the toolbox, not a magic author. Using it this way has made hobbyist reverse-engineering experiments like these dramatically more accessible to me, but the work is still iterative and still requires human judgment and real-world testing.

That pairs naturally with actually playing the games. I notice something feels wrong in a talk scene, I capture a screenshot, I go back to the patch work, I test again, and I learn a little more about how that specific game separates field rendering from dialogue presentation. Over time I have been picking up projection math, aspect ratios, camera systems, PNACH patches, PPC/MIPS assembly patterns, rendering paths, UI behavior, and how these games keep their different presentation systems apart.

Some days that learning feels great. Some days it feels like staring at a wall until a screenshot finally explains why the wall exists.

## A Note on the Versions I'm Using

The currently released patches target the official English NIS America and Koei Tecmo releases. That choice is primarily practical, not a statement about which translation I think is "better."

I personally own physical copies of the official PlayStation 2 and PlayStation 3 releases used for these projects. I create my own dumps from those copies for testing. Working from discs in my own collection gives me a clear boundary I am comfortable with: I know where the files came from, I can re-test the same version repeatedly, and I do not need to source, download, redistribute, or provide game files from elsewhere. The project downloads contain only original patch files and documentation, never game content.

I respect the work being done by fan translation and retranslation projects. This article is not taking a position on them, and nothing here should be read as a preference for the official English releases over community translation efforts. The patches simply target the specific versions I personally own and am able to test. Compatibility with other translations, regions, or modifications is untested unless I have specifically verified it.

## Available Now

Three downloadable releases. Each is version-specific. Each ships only a user-created patch archive — no game files, no ISOs, no BIOS, no copyrighted assets. You provide your own legally obtained copy of the game.

### Ar tonelico: Melody of Elemia — PROTOTYPE

**Platform:** PlayStation 2 / PCSX2  
**Status:** PROTOTYPE

![Ar tonelico — 21:9 field hallway](/images/articles/ar-tonelico-surge-concerto-21x9-ultrawide/at1-field-hallway.png)

This was the first one I really dug into. The goal was simple: make the game use the extra width of a 21:9 screen without just taking the original image and pulling it sideways until everyone looks like they have been hit with a rolling pin. This prototype adapts shared 3D presentation for 21:9 without simply stretching the whole image.

**Supported version**

- Ar tonelico: Melody of Elemia  
- USA / NTSC-U  
- SLUS-21445  
- CRC: `4437F4B1`

**What currently works**

- 21:9 Hor+ projection on the shared 3D builder
- Battle and shared-scene framing adapted for the wider 21:9 view
- 2D Method A included
- Field, battle, and world-map framing are playable
- Correct 3D proportions rather than whole-image stretching

![Ar tonelico — shop interior at 21:9](/images/articles/ar-tonelico-surge-concerto-21x9-ultrawide/at1-field-shop.png)

![Ar tonelico — world map (Em Pheyna)](/images/articles/ar-tonelico-surge-concerto-21x9-ultrawide/at1-worldmap-em-pheyna.png)

**Known limitations**

- Dialogue / event scenes can expose empty side regions because the original backgrounds were authored for narrower framing
- That exposure is authored-content behavior — not necessarily a PCSX2 display-setting failure
- FMV / IPU presentation is outside the scope of this patch
- No claim that all UI, portraits, menus, or other 2D content are fully corrected
- Other regions / CRCs are untested

**Installation basics**

1. Place `4437F4B1.pnach` in your PCSX2 cheats folder  
2. Enable **[Widescreen 21:9 Final]**  
3. **[No-Interlacing]** is optional  
4. Disable conflicting built-in 16:9 widescreen patches for this title  
5. Aspect Ratio: **Fit to Window / Screen**  
6. Cold boot after changing the patch  

This is a **PROTOTYPE**. It is not a finished or comprehensive ultrawide solution for every scene in the game.

**[Download Ar tonelico 21:9 Ultrawide Prototype v1.0](/downloads/ultrawide-21x9/Ar_Tonelico_21x9_Ultrawide_Prototype_v1.0.zip)**

*(Archive contains only `4437F4B1.pnach` and `README.txt`.)*

---

### Ar tonelico II: Melody of Metafalica — BETA v0.1

**Platform:** PlayStation 2 / PCSX2  
**Status:** BETA v0.1

![Ar tonelico II — 21:9 field at the statue](/images/articles/ar-tonelico-surge-concerto-21x9-ultrawide/at2-field-statue.png)

Metafalica is where this stopped feeling like a one-off experiment and started feeling like a series project. Field presentation at 21:9 has been personally tested and is playable. Dialogue presentation is not solved, and I am not going to dress that up.

I spent a lot of time on the dialogue problem before I understood what I was actually fighting. The field rendering and the dialogue portraits, boxes, and text are not using the same screen-space path. Fixing how the 3D world fills a 21:9 frame does not automatically fix how the talk-scene UI was authored and laid out. That is the wall I hit, and it is why this release stays at **BETA v0.1** instead of pretending the UI is done.

**Supported version**

- Ar tonelico II: Melody of Metafalica  
- USA / NTSC-U  
- SLUS-21788  
- CRC: `F95F37EE`

**What currently works**

- Custom 21:9 gameplay / field presentation
- Hor+ style projection handling for gameplay
- Battle handling adapted for the 21:9 projection
- Playable, personally tested field presentation

![Ar tonelico II — terrace battle at 21:9](/images/articles/ar-tonelico-surge-concerto-21x9-ultrawide/at2-battle-terrace.png)

![Ar tonelico II — ruins battle at 21:9](/images/articles/ar-tonelico-surge-concerto-21x9-ultrawide/at2-battle-ruins.png)

![Ar tonelico II — industrial battle at 21:9](/images/articles/ar-tonelico-surge-concerto-21x9-ultrawide/at2-battle-industrial.png)

**Known limitations**

- Dialogue portraits may appear horizontally stretched
- Dialogue boxes and frames may appear horizontally stretched
- Dialogue text may appear horizontally stretched
- Some talk-scene presentation may not display correctly
- FMVs have not been comprehensively addressed or verified
- Special cameras, minigames, late-game content, and unusual scenes are not fully tested
- Other regions / revisions / CRCs are untested

![Known limitation — bath / dialogue UI stretch in Ar tonelico II BETA](/images/articles/ar-tonelico-surge-concerto-21x9-ultrawide/at2-limitation-bath.png)

*Known BETA limitation: dialogue and related UI can still stretch horizontally. This shot is here to show that honestly, not to market the patch as "UI finished."*

**Installation basics**

1. Copy `F95F37EE.pnach` into the PCSX2 cheats folder  
2. Enable cheats  
3. Disable conflicting built-in widescreen patches for this game  
4. Aspect Ratio: **Stretch** (PCSX2 may label this Fit to Window / Fullscreen)  
5. The patch itself requests `gsaspectratio=21:9`  
6. Cold boot after installation or changes  

This is explicitly **BETA v0.1**. It is not a complete UI correction.

**[Download Ar Tonelico II 21:9 Ultrawide Patch BETA v0.1](/downloads/ultrawide-21x9/Ar_Tonelico_II_21x9_Ultrawide_Beta_v0.1.zip)**

*(Archive contains only `F95F37EE.pnach` and `README.txt`.)*

**Credits**

- **Nemesis2000** — original PCSX2 16:9 widescreen patch that helped inform the investigation. This credit does not imply endorsement, testing, or direct involvement in this BETA release.  
- **BPDStarvedBeast** — 21:9 adaptation, reverse engineering, testing, and documentation.

---

### Ar nosurge: Ode to an Unborn Star — BETA

**Platform:** PlayStation 3 / RPCS3  
**Status:** BETA

![Ar nosurge — field / dialogue presentation (FINAL beta)](/images/articles/ar-tonelico-surge-concerto-21x9-ultrawide/anosurge-field-dialogue-final.png)

Moving to PS3 did not make the problem smaller. It just moved the seams somewhere else. I am genuinely excited about where this one landed: the current BETA packages five compatible patches meant to be enabled together, each targeting a different part of the presentation stack. That said, several of those patches were verified in specific scenes, not across the entire game. Coverage is real where tested, and incomplete everywhere else.

**Supported version**

- Ar nosurge: Ode to an Unborn Star  
- USA (SCEA)  
- Title ID: `BLUS31478`  
- Tested update: APP_VER `01.01` / VERSION `01.00`  
- PPU hash: `PPU-6bba06a48dedf608a6b658b52256327caa8c1426`

**Patch package (enable all five)**

1. **Ar Nosurge 21:9 - Field & Combat 1.0** — required — Hor+ field and combat 3D  
2. **Ar Nosurge 21:9 - Dialogue Camera 1.0** — required — Hor+ dialogue-scene 3D (one tested camera)  
3. **Ar Nosurge 21:9 - Dialogue UI 1.0** — required — dialogue message window size/placement for 21:9  
4. **Ar Nosurge 21:9 - Cutscene Camera 1.0** — required — Hor+ type-6 engine/scripted cutscene 3D (one tested scene)  
5. **Ar Nosurge 21:9 - Field HUD 1.0** — required — top-left encounter bar layout for 21:9  

![Ar nosurge — combat at 21:9](/images/articles/ar-tonelico-surge-concerto-21x9-ultrawide/anosurge-combat.png)

![Ar nosurge — Dialogue UI 1.0 (Bios Shop message window)](/images/articles/ar-tonelico-surge-concerto-21x9-ultrawide/anosurge-dialogue-ui-bios-shop.png)

![Ar nosurge — cutscene FOV](/images/articles/ar-tonelico-surge-concerto-21x9-ultrawide/anosurge-cutscene.png)

**Known limitations**

- The game still uses a 1280×720 internal render target with Stretch — this is not a native ultrawide framebuffer implementation
- Dialogue camera verified with one tested talk scene so far
- Cutscene camera verified with one tested type-6 cutscene so far
- Field HUD work covers the encounter bar only; party talk HUD is unpatched
- Dialogue UI work covers the message window only; Log, Send, title, and other UI are not comprehensively covered
- Menus, FMVs, other regions, and most of the game have not been exhaustively tested

![Known limitation — field dialogue stretch reference (Ar nosurge)](/images/articles/ar-tonelico-surge-concerto-21x9-ultrawide/anosurge-limitation-field-dialogue-stretch.png)

*Limitation / research reference — not a claim that every dialogue path is finished.*

This is a **BETA**. It does not claim full-game coverage.

**[Download Ar Nosurge 21:9 Ultrawide Beta](/downloads/ultrawide-21x9/Ar_Nosurge_21x9_Ultrawide_Beta.zip)**

*(Archive contains only `ArNosurge_21x9_Ultrawide_Beta.yml` and `README.txt`.)*

## Coming Soon / Under Investigation

These entries are **not** releases. There are no public patches, no downloads, and no fabricated screenshots. They are on the map because the catalog is incomplete without them, and because I would rather say "not yet" in public than imply progress that does not exist.

### Ciel nosurge — UNDER INVESTIGATION

**Platform:** PlayStation Vita  
**Version of interest:** English fan translation

There is no release-ready ultrawide patch. There is no public download. There is currently no substantial showcase-ready implementation. The work is exploratory: looking at what may be possible with the Vita version and its English fan translation.

I have already learned how temperamental handheld-era ultrawide modification can be. Earlier experimentation with *Persona 2: Innocent Sin* on PPSSPP was technically troublesome and unpredictable. That experience is why I am not promising a Vita solution, a timeline, or even a workable outcome. Under investigation means exactly that: exploring what may be possible. Nothing ready to showcase or download yet.

### Ar tonelico Qoga: Knell of Ar Ciel — UNDER INVESTIGATION

No public patch. No release package. No finalized implementation. No substantial technical work completed yet, and no showcase screenshots. Qoga is a future project of interest for this series. That is the whole update for now: interest and investigation, without invented progress or a release date.

## Compatibility & Beta Notice

- These patches are **version-specific**. Verify game version, CRC, title ID, and update level where listed.  
- Read the included `README.txt` in each archive before installing.  
- **Prototype** and **beta** mean incomplete by definition. Expect rough edges.  
- Keep backups of your emulator configs and cheat/patch folders.  
- Do not stack conflicting built-in widescreen patches alongside these releases.  
- Provide your own legally obtained copy of each game. These downloads contain only user-created patch files.

## Found Something I Missed?

These are personal projects with a lot of ground left to cover, and I cannot pretend I have seen every scene, camera, or UI path. If you run into something broken, find something useful, or just want to help dig, I would love to hear from you.

Useful contributions include bug reports, screenshots or video of broken scenes, testing on different game versions or regions, emulator compatibility findings, technical information about the games, reverse-engineering or widescreen patching knowledge, and anything else that might help improve the work.

For bug reports, it helps a lot if you can include the game and version, emulator version, display setup, which patches are enabled, where the issue happens, and a screenshot or short clip when possible. I cannot promise individual support for every email, but thoughtful reports and findings are genuinely useful.

Reach me at [bloodsoakedmedia@gmail.com](mailto:bloodsoakedmedia@gmail.com).

## The Road Ahead

This project is not finished. These three packages are where I am willing to put my name on the work publicly: playable, documented, and labeled with the maturity they have actually earned so far.

Ciel nosurge and Ar tonelico Qoga sit further down the same road, with no promised schedule. If you try these patches, read the READMEs, match the supported versions, and treat the limitations as part of the record rather than fine print.

I'm in no rush to call something finished just because I want a release date attached to it.

More when there is something honest to show.

— D.
