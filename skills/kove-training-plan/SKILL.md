---
name: kove-training-plan
description: Use when the person asks Kove for a training plan, a workout routine or program, or wants to change, progress or restructure the plans they already have in Kove. A recipe for building plans from what they already do and what they want, saving them to Kove as plans they can run at the gym, and adjusting them later.
license: Apache-2.0
compatibility: Needs Kove's MCP server (https://app.kovejournal.com/mcp) connected and signed in to a Kove account.
metadata:
  author: Kove
  homepage: https://kovejournal.com
---

# Building a training plan in Kove

The `kove` skill holds the rules this recipe relies on, and its training reference
(`kove/references/training.md`) explains plans and sets in detail. Read them first if they are not loaded.

## 1. What they already do

- `get_overview`: their existing plans (ids and names), what Kove remembers (injuries, equipment, schedule).
- `get_workouts` with `from` four to eight weeks back: which movements, how often, at what loads.
- `get_plan` for any plan they want to change.

## 2. Ask only what you do not know

In one short round, and only the questions the record has not answered:

- the goal (strength, muscle, a race, general health, getting back into it);
- days a week and minutes a session;
- where and with what (a gym, home with dumbbells, no equipment);
- anything that hurts or that a professional told them to avoid.

Save a lasting answer (an injury, the equipment they have) with `remember` once they have told you.

## 3. Propose before saving

- Choose movements with `search_exercises` and use the names it gives: they resolve to Kove's library, which
  brings the muscles, the how-to and the history together.
- Lay the plan out in text first: one plan per session ("Push", "Pull", "Legs", or "Full body A" and "B"),
  each exercise with sets, reps, rest and a short note. Leave the weight out when you do not know their load:
  they choose it at the first session, and you can offer to add it to the plan afterwards.
- Use a superset (two or more exercises back to back, rest after the round) when they ask for one or when time
  is short, pairing movements that do not compete (a push with a pull). Mark it with a shared `superset` letter.
- Keep a beginner's plan short and conservative. Keep what they already do well unless they ask to change it.
- Wait for a yes.

## 4. Save

- `save_plan` for each session: `name`, a `description` (how to run it and how to progress, in a few lines of
  markdown), and the `exercises`.
- Tell them in one sentence what was saved, and that each plan runs in the Kove app at the gym as a checklist
  with a rest timer. Offer a reminder on their training days (`set_reminder`, with `days` by name: `["monday", "thursday"]`).

## 5. Changing a plan later

- `save_plan` with `plan` (its id or name): exercises sent are added or changed. Leaving one out never removes
  it; name it in `remove_exercises` to take it out.
- Swapping one movement for another is a remove plus an add, in one call.
- Putting exercises they already have into a superset: send each by name with the same `superset` letter, and
  nothing else changes. `leave_superset` takes one out again.
- Logged sets are never touched by a plan change.

## 6. Progression

When they ask "should I go up?", or after a review of their sessions with `get_workouts`:

- every target rep made in the last two sessions: offer the next small step;
- the last three sessions short of the plan: offer to bring the plan to the best of those sessions, said about
  the plan, never about them;
- change targets only after a yes.

This is general training guidance, not medical advice. Pain, dizziness, pregnancy, a heart or joint condition,
or a recent injury: suggest they check the plan with a doctor or a physiotherapist.
