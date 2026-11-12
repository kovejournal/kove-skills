# Changelog

## 1.2.1

- The README links the skills' page on skills.sh.
- No skill changed, and the MCP Registry entry is unchanged.

## 1.2.0

- Supersets in plans. `save_plan` groups exercises into a superset with a shared `superset` letter (a coach's
  A1/A2 or B1/B2 reads as its letter), done back to back with no rest between them and one rest after each round:
  `rest_sec` on an exercise in a superset is that rest. `leave_superset` takes an exercise out, and
  `circuit: true` runs the whole plan as one round after another. `get_plan` numbers each superset and states its
  rest after each round.
- The `kove-training-plan` skill and the `kove` skill's training reference teach it: when to use a superset, and
  how to group exercises a plan already has without touching their targets.
- The daily limit on new exercises is 40 (it was 20).
- The MCP Registry entry is unchanged: Kove's server is at the same address.

## 1.1.0

- Recipes made of ingredients. `save_food` takes a recipe's `ingredients`, `servings` and `cooked_weight`
  (and the link it came from): Kove looks every ingredient up and counts each portion, and saving the same link
  again updates that recipe. `get_food` reads a recipe back with its ingredients, each with its figures and what
  it counts from, so the list can be sent back to change one line. A list that would drop most of a recipe is
  refused, with the way to send it whole.
- The `kove` skill's food reference teaches it: when a recipe is a recipe, how to change one, and that the cooked
  weight can be the assistant's estimate, marked as one.
- The MCP Registry entry is unchanged: Kove's server is at the same address.

## 1.0.3

- The README's pictures show each food's protein, carbs and fat under it, as Kove's cards now draw them, on the
  same ramen lunch as kovejournal.com.
- The ChatGPT steps state the plan rules: Business, Enterprise and Edu workspaces can add Kove with writing, Pro
  can only read, and Plus, Go and the free plan cannot add one.
- The skills and the MCP server are unchanged; the manifests change only their version.
- The repository check now also reads the README's links and pictures and the MCP Registry entry
  (`server.json`).

## 1.0.2

- Sharper pictures in the README: Kove's cards were drawn at a third of their resolution. Nothing else changed.

## 1.0.1

- A new README: the one message that connects Kove, the steps for each app (with one-click install for Cursor
  and VS Code), pictures of Kove's cards in an assistant's chat, and how Kove checks a pattern before anyone
  calls it one.
- `assets/social-preview.png` for the repository's link preview.
- The skills, the manifests and the MCP server are unchanged.

## 1.0.0

The first public release.

- The homepage is Kove's setup guide for connecting an assistant, and the README links it.
- `server.json` lists Kove's MCP server in the official MCP Registry as `com.kovejournal/kove`.
- The `kove` skill offers a full copy of the person's data (`export_all`) when they want their whole record or
  an export: one zip they approve in Kove each time, which the assistant downloads once, or they download
  themselves and upload.

## 0.1.0

- First version: the `kove`, `kove-weekly-review` and `kove-training-plan` skills, Kove's MCP server for Claude
  Code, Cursor and any Agent Plugins host, and a Claude Code marketplace in the same repository.
