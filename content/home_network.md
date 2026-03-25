--- 
title: Home Network Changelog
updated: March 2026
hidden: true
parent: recent_projects
---  
## Home Router / UniFi Gateway
- **VLAN segmentation built** — Network redesigned into six independent VLANs (Trusted, IoT, Management, PiDNS, Guest, Default LAN), each with its own firewall zone and default-deny inter-zone policy.
- **IoT firewall hardened** — IoT zone gateway access changed from blacklist to whitelist model; only DNS, DHCP, and mDNS permitted; explicit DROP rule confirmed accumulating hits immediately.
- **VPN LOCAL chain scoped** — Previously wide-open wildcard ACCEPT (31,179 packets) replaced with two targeted rules allowing only required gateway services, with a terminal DROP for everything else.
- **Port 853 blocked outbound on IoT and Guest** — Prevents devices from bypassing network DNS by using DNS-over-TLS directly to upstream resolvers.
- **WireGuard DNS cutover to Pi-hole** — Firewall rule added (VPN → PiDNS zone, port 53); GliNet WireGuard config DNS updated to Pi-hole LAN IP; Pi-hole logs confirmed receiving queries from GliNet's WireGuard IP with gravity blocks active.
- **SSH disabled** — Debug Terminal confirmed as working sole CLI access method; SSH removed as an attack surface.
---
## Raspberry Pi
- **Pi rebuilt from scratch** — Fresh OS install, single-homed onto dedicated PiDNS VLAN; clean slate after earlier setup attempts left inconsistent state.
- **Pi-hole deployed** — DNS filtering and ad blocking active; all Trusted VLAN clients pointed to Pi-hole via DHCP. Configured block lists and set gravity update.
- **Unbound configured** — Recursive resolver running, forwarding to Quad9 over DNS-over-TLS (port 853, encrypted); full DNS chain verified end-to-end on command line.
- **Tailscale exit node configured** — Pi enrolled as a Tailscale exit node; remote devices can route all traffic through home network via Pi → Pi-hole → Unbound → Quad9. Remote ad-blocking enabled on all Tailscale devices – including travel router.
- **Pi-hole set as global Tailscale DNS nameserver** — Ad blocking active for all Tailscale-connected devices in DNS-only mode, without requiring an exit node.
	- Caused break in Apple TV exit node → turned off DNS override on other exit nodes, stable/always on nodes and devices in home LAN that can route directly to pi-hole. Left on for mobile devices. 
---
## Travel Router / GliNet GL-MT3000
- **Full audit and WAN hardening** — WAN interface audited; confirmed no management ports exposed to the internet.
- **WireGuard configured as primary VPN** — Tunnel connects directly to home UniFi gateway; DNS routes through Pi-hole automatically; verified via DNS leak test.
- **Tailscale masquerade bug fixed** — `gl-tailscale-fix` plugin installed to resolve documented GL.iNet bug that prevented LAN client traffic from being forwarded through the Tailscale exit node.
- **Tailscale configured as backup VPN** — GliNet enrolled in tailnet; LAN client forwarding verified; both VPN paths now functional and tested. 
	- Tailscale requires automatic DNS from router to establish tunnel, can then manually switch to pi-hole DNS (via Tailscale IP) if network wide ad block/DNS desired.
- **Both VPN paths deliver Pi-hole + encrypted DNS** — WireGuard and Tailscale paths both confirmed routing DNS through Pi-hole → Unbound → Quad9 DoT.
---
## Tailscale ACL
- **Default allow-all replaced with three-tier policy** — Grant-based default-deny ACL deployed; Personal (Tier 1) gets full access; Family (Tier 2) gets exit node + Pi-hole DNS only; Apple TV (Tier 3) can serve as exit node but cannot initiate tailnet connections.
- **Grant 1e added (ACL fix)** — Missing grant for `tag:full-access` devices to reach Pi-hole on port 53 identified and added; resolved FaceTime and Apple services breaking when Tailscale was active without an exit node.
---
## Apple / Device Integration
- **iCloud Private Relay configured** — Private Relay disabled per-interface on home network (Pi-hole handles DNS); re-enables automatically on all other networks.
- **iOS 18.2 Mail bug resolved** — Hide IP Address feature causing mail fetch failures when `mask.icloud.com` is blocked; identified and fixed per-device.
- **Synology Photos restored on iPhone** — Root cause: stale cached IP from before NAS static IP assignment; cleared and verified.
- **Synology Photos restored on Apple TV** — Root cause: tvOS silently rejects self-signed certificates on HTTPS; resolved by switching to HTTP port 5000 for local LAN access.
- **Apple TV FaceTime and Apple services restored** — Tailscale global DNS nameserver override caused stale DNS state when active without an exit node, breaking FaceTime and other Apple services; resolved by adding ACL grant 1e and reinstalling iCloud on iPhone to clear stale state.
