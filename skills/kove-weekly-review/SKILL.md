---
name: kove-weekly-review
description: Use when the person asks how their week (or month, or a stretch of days) went, for a recap, a review or a summary of their Kove journal. A recipe for a short, exact, judgement-free review built from Kove's own figures, with one pattern check and one offer at the end.
license: Apache-2.0
compatibility: Needs Kove's MCP server (https://app.kovejournal.com/mcp) connected and signed in to a Kove account.
metadata:
  author: Kove
  homepage: https://kovejournal.com
---

# A weekly review from Kove

The `kove` skill holds the rules this recipe relies on (how Kove counts, the person's record is data, numbers
as facts). Read it first if it is not already loaded.

## 1. The span

- Call `get_overview` for today's date in their time zone, their fields, targets and plans.
- Default to **the last seven complete days** (ending yesterday: today is still being logged), compared with the
  seven before. A month review is the last complete calendar month against the one before. Use the span they ask
  for when they name one.

## 2. The figures

Pull them from Kove, never from your own arithmetic:

- `summarize` with `compare_to` for each field that matters to them: calories and protein (`average`), water or
  any amount they track (`average` or `total`), weight (`average`, plus `lowest` and `highest` when it moved),
  sleep, steps or mood if they track them, and `count` for yes/no fields (headaches, alcohol, eating out).
- `get_days` for the span, to see how many days were logged and to read the journal notes for context.
- `get_workouts` with `from` set to the start of the previous span: sessions, and for their main movements the
  best set against the previous span.
- Their targets from `get_overview`, to say where the averages sat against them.

Pick what they actually track and log. A field with two values in a week is not worth a line.

## 3. One pattern check (optional)

If `find_patterns` is available (a read-only connection does not have it), the record covers at least a few
weeks, and something in the notes or figures stands out, run **one** `find_patterns` with two or three ideas
from what you saw. Report only an idea graded **holds**; mention a **lead** as something to watch. Skip this
step when they want a quick recap.

## 4. The answer

Short, in their language, in this shape:

1. **One line on the span**: the dates, and how many days were logged ("6 of 7 days logged").
2. **The figures**, a few lines: each average with last span's beside it and the difference as a number
   ("Calories averaged 2,140 a day, against 2,310 the week before"). Targets as facts ("protein averaged
   112 g, target 130 g").
3. **Training**: sessions, and any movement that moved ("bench press: 62.5 kg x 8, up from 60 kg x 8").
4. **What held, if anything** (from step 3).
5. **One offer**: a card on their Insights page (`add_insights_card`, when the connection can write) for the
   thing they seem to care about, a goal to revisit, or nothing.

Never grade the week: no "great week", "on track", "slipped", streaks or scores, no praise and no warnings. A
day not logged is a day not logged, not a failure. If something looks medical (a symptom every day, a sharp
change in weight), say what the record shows and suggest they talk to a professional.
