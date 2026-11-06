# Contributing

Thanks for helping Kove work better in your assistant.

## Issues

The most useful issue is a conversation that went wrong: what you said, what the assistant did with Kove, and
what you expected. Leave out anything from your journal you would rather not share. Name the assistant and
model if you know them.

Questions about your Kove account, your data or billing go to hello@kovejournal.com, not here.

## Changing a skill

- The skills describe Kove's tools as they are. A change that teaches a tool or an argument Kove does not have
  will not be merged: every skill is also checked against Kove's own tool list before a release.
- Keep them short and plain. Skills are read by a model on every task, so every line has to earn its place.
- Write for every assistant, not one: no host-specific tool prefixes, no scripts.
- Numbers are facts, never verdicts, and no diet-culture words. These come from Kove's own voice and are not up
  for debate here.
- No en or em dashes.
- Run `node scripts/validate.mjs` before opening a pull request.

## How changes land

This repository is published from Kove's own source, one commit per release. A pull request that is accepted is
applied there and arrives here with the next release, so it is closed rather than merged, and the changelog entry
for that release thanks you by your GitHub name.

What you contribute is licensed under the Apache License 2.0, like the rest of the repository (section 5 of the
licence), so nothing else needs signing.
