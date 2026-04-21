---
title: Self-Hosting Audiobooks
updated: April 2026
hidden: true
parent: recent_projects
---
## Synology NAS / Container Manager
- **Container Manager installed** — Docker runtime deployed via Package Center; dedicated subnet for container-to-container traffic left at defaults (no collision with home LAN or Tailscale ranges).
- **Filesystem structure established** — `/volume1/docker/audiobookshelf/` created for container config; `/volume1/media/audiobooks/` created as library root with `metadata/` subfolder nested inside for unified backup/organization.
- **Deployed via SSH + root shell** — Chose SSH-based install over Task Scheduler for real-time feedback, easier iteration, and no leftover scheduled tasks; SSH temporarily enabled, container created, SSH left available for future maintenance.
- **JWT secret hardened** — Replaced mariushosting guide's publicly-printed example JWT_SECRET_KEY with a locally-generated 64-character secret via `openssl rand -base64 48`
- **Docker run command finalized** — `advplyr/audiobookshelf` image on port 13378, bind mounts for config/audiobooks/metadata, `--restart always` policy; container auto-recovers on NAS reboot.
---
## Libation (Local Workstation)
- **Installed on macOS** — Desktop app chosen over any NAS-hosted alternative; runs on user's laptop, outputs to local disk first for speed and resilience, with bulk transfer to NAS post-liberation for initial bulk conversion
- **Audible account linked and library synced** — Full Audible library visible in Libation; first-book activation-bytes derivation completed successfully.
- **Naming template refined iteratively** — Final template: `<first author>/<if series-><first series[{N}]> #<series#[00]> - <-if series><title short>` for folder, default `<title> [<id>]` for file. Produces clean `Author/Book/` for standalones and `Author/Series #0X - Book/` for series, with zero-padded series numbers for correct sorting.
- **Libation syntax corrected from outdated docs** — Conditionals require `<if series->...<-if series>` (with "if"); series number is `<series#>` (no space); zero-padding uses `<series#[00]>` square-bracket formatter syntax.
---
## Audiobookshelf Server Configuration
- **Library created** — "Smashdown Library" pointed at `/audiobooks` container path; Audible.com set as metadata provider via library settings (hamburger icon, not the Item Metadata Utils section).
- **Bulk metadata match run** — "Match All Books" from library three-dot menu populated author photos, bios, and descriptions from Audible/Audnexus; embedded Libation metadata preserved (no overwrites).
---
## Tailscale + Mobile Clients
- **Connection over Tailscale confirmed** — `http://<nas-tailscale-hostname>:13378` works from Safari on iPhone when Tailscale is connected; no HTTPS/reverse proxy/port forwarding needed.
- **Prologue connection failures diagnosed** — App connected fine on LAN IP but timed out on Tailscale URL; Plappa exhibited identical behavior. Isolated to specific port, not apps.
- **Tailscale ACL port allowlist updated** — Root cause: Tier 1 grant (`tag:full-access` → `tag:infra`) allowed ports 22/53/80/443/5000/5001 but not 13378; DSM responded (ports 80/5000/5001) but ABS traffic was silently dropped at the Tailscale layer. Added `tcp:13378` to the grant; connection immediately worked.
- **Prologue selected as primary iOS client** —One time fee, confirmed Tailscale-compatible per community reports, supports CarPlay. Plappa (free) deferred as secondary option.
---
## Documentation & Handoff
- **Full install guide authored** — Markdown guide covering NAS prep, SSH-based Docker install, Libation setup, first-run ABS configuration, Prologue/Plappa mobile setup, and Task Scheduler alternative in appendix.
- **Update procedure documented** — SSH + `docker pull` / `stop` / `rm` / re-run sequence; data persists in bind-mounted folders across container recreations.
