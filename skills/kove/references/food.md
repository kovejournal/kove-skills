# Food in Kove

## A meal, food by food

`log_meal` takes the foods eaten, one entry each (at most 12 a call). For each:

| Field | What to send |
|---|---|
| `name` | The food in their words: "pasta al pomodoro", "greek yogurt". |
| `amount` | How much, in words, as they said it or as your hedged guess: "80 g", "a bowl (about 300 g)", "2 slices". |
| `grams` | The weight (ml for a drink), said or estimated. Kove looks the food up by it. |
| `state` | For a food that changes with cooking (pasta, rice, grains, legumes, meat, fish): `raw` (as sold, so pasta weighed dry), `cooked`, or `canned` (drained). Without it Kove cannot look such a food up and keeps your estimate. |
| `brand` | When they named one. Kove then looks for the product. |
| `calories`, `protein_g`, `carbs_g`, `fat_g`, `fiber_g` | Your estimate **for the amount eaten**. Always send it. |

Kove looks each food up in its own food table, or as a product when you give its brand, and uses its figures when
it knows the food. Otherwise it keeps yours, so your estimate is the floor, never wasted. A food in `foods` is never
matched to their saved foods: those go in `saved_foods` (below). It then adds the day up and writes one journal line for the meal. Never send a day total, and never
put calories or macros in `log_values`.

- Set `meal` (`breakfast`, `lunch`, `dinner`, `snack`) only when they said which meal. Do not guess it from the
  time of day.
- A weight with no other word means **as sold**: "80 g of pasta" is dry pasta, so `state` is `raw`, and your
  estimate is for the dry weight.
- No amount given: estimate a usual portion and say so ("about 250 g"), rather than asking every time. Ask only
  when you genuinely cannot guess (a "portion" of something with no usual size).
- **They give the figures themselves** (a label, an app, their own number): send them as the estimate with
  `figures_from_person: true`, and Kove keeps them as sent. It applies to every food in the call, so put those
  foods in a call of their own.
- `date` defaults to today in their time zone. "Yesterday's dinner" takes yesterday's date from `get_overview`.

## Photos, products and labels

- **A pack's barcode** visible in a photo: send the digits as `barcode` on that food, with `grams`. Kove logs the
  product's own figures.
- **A nutrition label**: send its per-100 g (or 100 ml) figures as `per_100`, with `grams` eaten. Kove multiplies
  them and keeps them as printed; anything the label does not state is filled from your estimate.
- If Kove cannot use a barcode or a label, it logs the food as usual and says so in the result's `note`. Pass
  that on in a few words.
- A plate of food: estimate food by food as above.

## Their saved foods and Kove's foods

- `get_overview` lists the names of their saved foods. When they mention one, use it: their own figures beat
  any estimate.
- `search_foods` finds a food in their list (`yours`, each with an `id`, figures per 100 and its portion) and in
  Kove's table and products (`kove`, each with a `ref`). A `barcode` there looks a product up by its digits.
- Then log it by reference instead of estimating, in `saved_foods` (by `id`, or by its `name`) or `kove_foods`
  (by `ref`), each with an `amount` in grams (ml for a drink), or `portions` for "one pot" or "two slices" when
  the food names its portion. A meal can mix all three lists in one call:

```json log_meal
{
  "meal": "breakfast",
  "foods": [{ "name": "banana", "amount": "1 medium (about 120 g)", "grams": 120,
              "calories": 105, "protein_g": 1.3, "carbs_g": 27, "fat_g": 0.4, "fiber_g": 3.1 }],
  "saved_foods": [{ "name": "Greek yogurt", "portions": 1 }],
  "kove_foods": [{ "ref": "the ref search_foods gave", "amount": 40 }]
}
```
- `get_food` returns one saved food in full (figures, portion, description, collections).
- **Saving a food** (`save_food`): only when they ask or agree ("save this as my usual breakfast"). Send the
  figures per 100 g by default, or the label's own amount with `per` and Kove rebases them. `portion_amount` and
  `portion_name` ("pot", 150) make "one pot" loggable. To change one, send its `id`, its `name` (a different name
  renames it) and only the figures that change. Kove's own foods cannot be changed.

## "The same as yesterday"

Read that day with `get_day` and log the same foods with the amounts it recorded, sending its figures as your
estimate. A food whose name is one of their saved foods (`get_overview` lists them) goes in `saved_foods`. If that
day holds no foods, say so and ask what they had. Never rebuild a meal from memory or guesswork.

## Fixing a food

- `get_day` lists each food with its `id`, meal, amount and figures.
- `edit_food` with that `id`: a new `grams` rescales its figures (or looks it up again), `state` ("it was
  cooked") looks it up again, `meal` moves it, and figures they state replace Kove's. The day's totals follow.
  If Kove cannot work the new figures out, the answer is `written: false` with a `detail`: send your corrected
  calories and macros with the change.
- `remove_food` takes one food off the day.
- Both change the record: say what will change and get a yes first.
- A day total they state ("I'm at 1,800 today, fix it") is `set_values` on their calories field. Use it only
  when they want that total, since the foods no longer add up to it afterwards.
