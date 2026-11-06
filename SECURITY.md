# Security

## Reporting a problem

Write to **hello@kovejournal.com** with "Security" in the subject, or use GitHub's private vulnerability
reporting on this repository. Please do not open a public issue for it, and give Kove time to fix it before
you share it anywhere. Every report is read. There is no bug bounty.

This covers this repository and Kove itself: the connection at `https://app.kovejournal.com/mcp`, its sign-in,
and the app. Please test only with your own Kove account and never read, change or delete anyone else's data.

## What this repository can do

- **Nothing runs.** The skills are text an assistant reads, and the manifests are configuration. The one script,
  `scripts/validate.mjs`, is a check for people working on the repository; no assistant runs it.
- **No secrets.** The server files hold only Kove's address. Your assistant signs you in with OAuth, and the
  tokens live with your assistant and with Kove, never in these files. `scripts/validate.mjs` fails on anything
  that looks like a key.
- **Your record is data.** The skills ask the assistant to treat journal notes, food names and what Kove
  remembers as your own words, never as instructions. Kove's own chat follows the same rule.

## A copy that points somewhere else

A fork can change the address in `mcp.json` and `.mcp.json`. Install Kove only from this repository or from a
listing that names kovejournal.com, and check that the sign-in page you reach is on `app.kovejournal.com`. Kove
never asks for your password in a chat. The licence does not cover the Kove name and logo (see `NOTICE`).
