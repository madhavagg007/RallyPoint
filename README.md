# RallyPoint

**Live demo:** https://madhavagg007.github.io/RallyPoint/

Offline-first multi-sport match tracker for table tennis, badminton, volleyball, squash, pickleball and beach volleyball. Vanilla JavaScript, no build step, no dependencies. Installable as a PWA.

| Setup | Live match | History |
|---|---|---|
| ![Setup](docs/setup.png) | ![Live match](docs/live-match.png) | ![History](docs/history.png) |

| Head-to-head and trends | Tournament bracket |
|---|---|
| ![Insights](docs/insights.png) | ![Tournament](docs/tournament.png) |

## Features
- **Rule-aware scoring:** win-by-2, point caps, deciding sets, side-out pickleball, serve tracking, volleyball rotation, and game/set/match-point alerts
- **Match analysis:** undo, point-by-point log, momentum chart, longest run, biggest lead, duration
- **History:** detail view, JSON and CSV export, validated JSON import with duplicate skipping
- **Stats:** per-player records, head-to-head, win-rate trend chart
- **Tournaments:** 2 to 16 players, fair bye seeding, matches scored live with winners advancing automatically (and un-advancing on undo)
- **PWA:** service-worker offline cache, install prompt, screen wake lock and haptics during matches
- **Accessible:** labelled form controls, named score buttons, live status region, keyboard shortcuts (1 / 2 / U / N), visible focus, reduced-motion support

## Run, test, deploy
```
npm start        # python3 -m http.server 8000, open http://localhost:8000
npm test         # 13 unit tests for the rules engine (Node's built-in runner, no install)
```
Service workers need http(s), not file://. To deploy, push this folder to GitHub and enable Pages, or drop it on Netlify or Cloudflare Pages.

## Structure
| File | Purpose |
|---|---|
| `js/rules.js` | Pure rules engine (scoring, serve logic, bracket building). No DOM, unit tested |
| `js/app.js` | State, rendering, history, tournament UI |
| `js/features.js` | PWA install, tournament-to-scorer link, head-to-head insights |
| `css/styles.css` | Obsidian and champagne theme |
| `sw.js`, `manifest.webmanifest` | Offline cache and install metadata |
| `icons/` | PWA icons (SVG plus 192 and 512 PNG) |
| `tests/rules.test.js` | Scoring and bracket tests |

## Data and privacy
Everything stays in `localStorage` on the device (`ttCurrent`, `ttHistory`, `ttTournament`, `ttSetup`). Nothing is sent anywhere.

## Known limitations
- Tournament matches are played as singles in the sport and format selected in "Start a match"
- Doubles serve rotation follows simplified rules; volleyball tracks rotation position, not full lineups

## Resume bullets
- Built an offline-first PWA match tracker in vanilla JS supporting 6 racket and net sports with rule-accurate scoring, undo, and per-match momentum analytics
- Extracted a DOM-free rules engine with 13 unit tests covering win-by-2, caps, deciding sets, serve logic and bracket seeding
- Implemented tournament brackets (2 to 16 players) with bye seeding that feed a live scorer and advance winners automatically
- Added service-worker caching, data import/export with input sanitisation, and an accessibility pass (labels, ARIA, focus, reduced motion)
