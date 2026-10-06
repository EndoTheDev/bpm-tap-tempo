# bpm-tap-tempo

Tap to find a track's BPM, then see every transition option: half, double,
dotted eighth, the advanced pivot ratios, and the pitch-ride range.

Live at [endothe.dev/tools/bpm-tap-tempo](https://endothe.dev/tools/bpm-tap-tempo).

- Next.js 15 App Router + vendored shadcn/ui components (Button, Card, Input, Tooltip)
- Flat 8-tap window, median-trimmed, 3s auto-reset, spacebar support
- Manual BPM entry
- Half / double / dotted-eighth always visible; dotted-quarter, 2/3, 4/3 behind toggles
- Pitch ride cards (+/-4%, +/-6%)
- light/dark/system theme with the circular view transition, same family as
  [camelot-wheel](https://endothe.dev/tools/camelot-wheel)

Self-check of the tap and ratio math:

```bash
BPM_SELF_CHECK=1 node --experimental-strip-types lib/tap.ts
```

Part of the endothe.dev tools series - each tool is a standalone repo,
deployed from a Raspberry Pi.