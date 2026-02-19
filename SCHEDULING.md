# Smart Scheduling

## Formulas

- Dogs: Estrus ~ every 6 months; fertile window day 9–14.
  - Next heat: `lastHeat + 180 days`
  - Fertile window: `[nextHeat+9, nextHeat+14]`
- Cats: Cycles ~21 days; fertile window day 2–5.
  - Next heat: `lastHeat + 21 days`
  - Fertile window: `[nextHeat+2, nextHeat+5]`

## Cron Logic

- Job: daily at 08:00 UTC.
- For each available pet with `updatedAt` as surrogate for `lastHeatDate`:
  - Compute window, if `now ∈ [fertileStart, fertileEnd]` → create notification and emit `instantAlert`.

See server/services/scheduler.js.
