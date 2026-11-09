# Looking back

## Reading the record

| Question | Tool |
|---|---|
| One day, whole | `get_day` (values, foods with ids, targets, the journal note, training) |
| A stretch of days | `get_days` (up to 92 days; `as_table` reads up to a year in compact columns) |
| An exact average, total, lowest, highest, or how many days | `summarize` |
| Days whose note mentions something | `search_journal` |
| Training | `get_workouts` |
| Everything at once, for your own analysis | `export_all` (a zip they approve in Kove; see the main skill) |

- **Figures come from `summarize`, not from your own arithmetic.** It reads every day exactly. `by` breaks a
  span down by week or month, and `compare_to` computes the same figure over a second span, side by side.
- A day with nothing logged is missing, not zero. Say how many days the figure covers when it matters.
- For a yes/no field, `count` is the days answered yes.

## Is X linked to Y?

Do not decide that from a handful of days you read. Kove tests it against chance:

1. Explore if you like: `get_days` with `as_table` shows a long stretch at once.
2. `find_patterns` runs Kove's own search (every field, the weekend, the words they write, the day after) plus
   your ideas, up to 40 a search, each one of:
   - `words`: one kind of day by the words they write about it, in their language, with inflections
     (`["pizza", "pizze"]`), plus a `name` of two to five words;
   - `field`: a field by name (Kove decides how it divides the days);
   - `exercise`: the days they trained it;
   - `weekdays`: days of the week by name (`["monday"]`);
   - `lag`: 1 to 3 for the day(s) after, -1 to -3 for the day(s) before.
3. Each idea comes back with a `grade`:
   - **holds**: it cleared Kove's bar against chance after counting every comparison, and it is now on their
     Patterns page. You may report it, as what happened on those days, never as a cause.
   - **lead**: it would pass on its own but not after counting everything. Say it as a possibility to watch.
   - **nothing**: no difference beyond chance. Say so if they asked about it.
   - **untestable**: the reason comes with it (too few days, unreadable, hidden by them).
4. Ten searches a day, shared with the app, one at a time. Do not rerun a search to get a different answer.
   `find_patterns` is a write: a read-only connection does not have it.

Say it plainly: "On days you wrote about pizza, you slept about 40 minutes less" is a finding that holds;
"pizza ruins your sleep" is a claim Kove never makes.

## Keeping a reading on Insights

After they agree, `add_insights_card` puts a card on their Insights page, which Kove recomputes from their record:

- `trend` or `summary` of `fields` (or one `exercise` with its `metric`: weight, reps, distance, time, hold,
  volume, orm);
- `calendar` or `compare` (this stretch against the one before) of one `field`;
- `foods` (what they eat most, optionally one `meal`);
- `split`: days with a marker against the rest, using the same `words`, `field`, `weekdays` or `lag` as a
  pattern.

The result's `open_in_kove` link opens the page. Removing a card is done in the app.
