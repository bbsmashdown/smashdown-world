---
title: Obsidian Complaint Tracking System
updated: March 2026
hidden: true
parent: recent_projects
---
## Template Engine
- **Migrated from Templater to QuickAdd** — Initial build used Templater with sequential one-at-a-time prompts; migrated to QuickAdd user scripts after discovering the one-page inputs feature, enabling all fields to be collected in a single form.
- **YAML frontmatter conflict resolved** — Templater tags inside YAML prevented Obsidian from recognizing properties; solved by outputting entire file content via `tR +=` inside a single silent block so Obsidian sees clean YAML with no residual template tags.
- **ES module syntax error fixed** — QuickAdd's module system doesn't support `export`; replaced `export default` and `export const` with `module.exports` pattern.
---
## Data Entry & Forms
- **One-page form implemented** — All complaint and employee fields now collected in a single QuickAdd form instead of sequential popups; natural language date support active ("today", "yesterday", "last tuesday").
- **Dropdown default values hardened** — Dropdowns displayed the first option visually but left values blank if the user didn't interact; resolved by adding explicit `defaultValue` to every dropdown field.
- **Searchable employee suggester added** — Replaced manual ID entry with a dynamic suggester that reads all employee notes from the vault at runtime, sorts alphabetically, and supports fuzzy search; auto-updates when new employee notes are created.
- **Input order corrected** — One-page form was auto-triggering before the employee suggester due to the `quickadd.inputs` declaration; resolved by removing the declaration entirely and calling `requestInputs()` manually after the suggester.
---
## Security & Identity
- **Employee ID obfuscation evaluated and simplified** — Originally designed to store only random IDs (e.g., `EMP-K8X2`) with a separate encrypted lookup table; stakeholder review determined existing encryption layers (Cryptomator, Obsidian Sync E2EE, local hardware encryption) were sufficient without it.
- **Dual ID/name system adopted** — Both `employeeId` and `employeeName` stored as properties on every note; employee note filename equals the employee name to enable wikilinks; Bases views can toggle between anonymous (ID-only) and transparent (name visible) modes without changing any data.
---
## ID Generation
- **Sequential complaint IDs implemented** — Counter stored in a plain-text `.md` file; script reads, increments, and writes back on each run; produces IDs in `COMP-YYYY-####` format.
- **Year-based counter reset** — Separate counter file created per calendar year; numbering resets to `0001` automatically on January 1st; prior years' counters preserved for historical reference.
- **Counter file relocated** — Moved from vault root to `07 - Resources/QuickAdd Scripts/` alongside the scripts themselves for organization.
---
## Data Structure
- **Property naming standardized to camelCase** — Converted from snake_case midway through the project; cleaner appearance in Bases column headers and consistent with JavaScript conventions.
- **`referralSource` implemented as suggester** — Allows selection from common options (Nursing, Pharmacy, Patient Advocate, etc.) while also accepting free-text entry for unlisted sources.
- **`status` field added** — Defaults to `Open`; intended for manual update to `Closed` when resolved; togglable to a checkbox boolean if a simpler binary workflow is preferred.
---
## PHI Separation
- **MRN and Date of Service stripped from Obsidian vault** — Both fields are collected in the QuickAdd form but no longer written to the note's YAML frontmatter; vault now contains zero patient-identifiable care data.
- **Date of Service scoped as PHI** — Initially only MRN was stripped; after review, Date of Service was also removed as it is explicitly a care-related date under HIPAA's Safe Harbor method; Date Received and Date Reviewed were evaluated and retained as administrative workflow dates with no direct link to patient care.
- **MRN input label updated** — Field label now reads "MRN (sent to secure M365 form only — not saved in Obsidian)" to remind the user at the point of entry that it will not be persisted locally.
- **MRN copied to clipboard as fallback** — Script copies MRN to clipboard before opening the Microsoft Form; available to paste manually if pre-fill fails or browser session issues occur.
---
## M365 / Microsoft Forms Integration
- **Power Automate ruled out** — Previous session had suggested Power Automate as a bridge to M365 Excel; user's license does not include Power Automate access; replaced with Microsoft Forms native Excel sync, which requires no additional licensing.
- **Microsoft Forms → Excel auto-sync adopted** — Forms natively generates and populates a linked Excel workbook via the "Open in Excel" button on the Responses tab; new submissions append as rows automatically with no manual import needed.
- **Pre-filled form URL implemented** — QuickAdd script constructs a Microsoft Forms URL with query parameters for Complaint ID, MRN, Date of Service, and Provider; user arrives at a pre-populated form and only needs to hit Submit; eliminates copy-pasting and transcription errors.
- **`require('electron').shell.openExternal()` adopted for browser launch** — Initial `window.open()` call opened the form inside Obsidian's Electron context with no M365 session, causing a permissions error; switched to Electron's `shell.openExternal()` to open in the system default browser where the user is already logged into M365.
- **Form sharing restricted to organization** — Sharing set to "Only people in my organization can respond" to prevent anonymous submissions, since the pre-fill URL is generated locally and not shared publicly.
- **MRN Reference link added to note body** — Complaint notes include a placeholder link to the Forms-generated Excel workbook so reviewers can quickly cross-reference the MRN without leaving Obsidian.
- **Configuration block added to script** — Form URL, query parameter field codes, and Excel workbook link extracted to clearly labeled constants at the top of `Provider_Complaint.js`; no need to dig through code to update these values.
- **iOS/iPadOS entry not pursued** — `require('electron')` is desktop-only; mobile QuickAdd entry would require a `window.open` fallback and lacks a satisfactory local encryption layer; M365 Excel mobile app identified as the recommended path for read-only MRN lookups on mobile.
---
## Security Architecture (Updated)
- **Defense-in-depth maintained after PHI separation** — Even with OneDrive/M365 BAA coverage available, PHI separation was retained; MRN and Date of Service absent from vault means a compromised local device exposes no patient-identifiable care data.
- **M365 BAA confirmed covering Forms and Excel** — Microsoft Forms uses the same Azure AD authentication and encryption as the rest of M365 and falls under the same BAA as SharePoint, OneDrive, and Excel; data stored on SharePoint/OneDrive infrastructure.
- **Browser history flagged as residual risk** — Pre-fill URL contains MRN in query parameters and will appear in browser history; low risk on a managed device but noted for periodic clearing if needed.
