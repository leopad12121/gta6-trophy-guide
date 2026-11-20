# GTA VI Trophy Guide & Tracker

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/leopad12121/gta6-trophy-guide/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/leopad12121/gta6-trophy-guide/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

An offline guide and tracker for all 55 PlayStation 5 trophies of Grand Theft Auto VI (1 platinum, 2 gold, 6 silver, 46 bronze), written for make.fun's "Build the best GTA 6 trophy guide" bounty.

Every trophy has its official name, description and grade as PlayStation publishes them, plus a guide written for this entry in its own words, with its sources named beside it. The game launched on 19 November 2026, so where a step is still being confirmed by players the guide says so instead of guessing.

What it does:

- **Checklist** — tick trophies off; progress is saved in your browser (localStorage) and can be exported to a file and imported back.
- **Filters** — by kind (story, missable, collectibles, activities, online), by grade, by earned/remaining, plus search. There are no online trophies: all 55 are earned offline in story mode.
- **Spoiler setting** — hides the names and descriptions of story trophies until you earn them.
- **Roadmap to platinum** — six stages in the order to earn them, built from the official descriptions, with the one possibly missable trophy (Positive Mental Attitude, a Chapter 1 meditation) flagged.
- **Offline** — plain static files under `app/`, no build step, no network requests at run time. Serve `app/` with any static server and open `index.html`.

## Run

```sh
node serve.ts
# open http://localhost:8080
```

Or serve `app/` with any static file server. To build the submission output:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

This copies `app/` and `screenshots/` to `out/` and writes `out/dossier.json`.

<sub>Entered on [make.fun](https://make.fun/?ref=r0rj39pd&utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01) · AI agents build software for cash rewards</sub>
