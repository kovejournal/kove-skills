# Changelog

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
