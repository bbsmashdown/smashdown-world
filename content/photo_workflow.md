---
title: Digital Photography Workflow
updated: March 2026
hidden: false
parent: recent_projects
---
> [Photo Workflow Visual](/attachments/photo_workflow_visual.pdf)
## Phase 1: Camera Setup & Initial Import

### Camera Settings (Before Shooting)

1. Go to the **I.Q. Tab**
   - Set Image Quality → **F+RAW** (shoots both Fuji JPEG and RAW simultaneously)
2. Go to the **Wrench Menu**
   - Set Save Data Setup → **Backup**
   - This enables a backup to card slot B and links the JPEG and RAW files together

### Import into Capture One

- Import both **RAW and JPEG** files into a **new Capture One session**
- Rename files to match, e.g.:
  - `mexico_city_23.RAF` and `mexico_city_23.jpeg`

---

## Phase 2: Initial Culling & Tagging


> Use the pre-edited Fuji Film Sim JPEGs to filter images, assign stars/tags, and sync metadata to RAW files — before permanently separating JPEGs from RAWs.

### Steps

1. **Hide all RAW files** → `⌘ + Shift + R`
2. **Color tag, star, and keyword** all JPEGs:
   - 🔴 **Red** → Trash (reject)
   - 🟡 **Yellow** → Keep
   - 🟢 **Green** → Plan to edit the RAW file
3. **Delete rejects**: Move all red-tagged photos to trash and empty trash
4. **Sync metadata** from JPEGs → `⌘ + Shift + S`
5. **Hide all JPEGs** → `⌘ + Shift + J`
6. **Show all RAW files** → `⌘ + Shift + R`
7. **Load metadata** onto RAW files → `⌘ + Shift + L`

> At this point, all photos are reviewed, rejects removed, and tags/stars are synced between the unedited RAW files and the Fuji Film Sim JPEGs.

---

## Phase 3: Export for Immediate Sharing (JPEGs)


> Separate the JPEGs for immediate sharing and quick Synology backup, while keeping the RAW files in Capture One for further editing.

### Steps

1. **Hide all RAW files** → `⌘ + Shift + R`
2. **Show all JPEGs** → `⌘ + Shift + J`
3. **Select all JPEGs** and click the **Export** button
4. Apply **both** export recipes:
   - **A. Export to Apple Photos**
     - Automatically imports into Apple Photos
     - ⚠️ Requires manual deletion of the duplicate after import is complete
   - **B. Export to Synology**
     - Exports to Synology NAS

> You will lose the Fuji JPEG after this step — these are the last copies before splitting off forever.

### Where Files End Up

| Destination | Location |
|---|---|
| **Apple Photos** | Standard library (delete duplicate after import) |
| **Synology Photos** | `Photos (shared folder)` → `Trip/Event Name` |
| **Synology RAW Backup** | `Media Backup` → `Capture One RAW Files` → `Fuji X-T3` → `Year` → `Session Folder` |

> Synology Photos automatically adds filters for Year, Lens, People, etc.

---

## Phase 4: RAW Editing, Archiving & Final Export


> Edit the green-tagged RAW selects in Capture One, then archive the full session to the NAS.

### Editing RAW Files

1. In Capture One, work only with the remaining **RAW files**
2. Select the **green-tagged** files (your selects)
3. Make edits, apply styles, etc.
4. Once a photo is **finished**:
   - Optionally change the star rating
   - Re-export all edited photos using **both** recipes:
     - **A. Apple Photos recipe** — requires manual deletion of the duplicate
     - **B. Synology recipe** — set to **overwrite** the prior JPEG

### Archiving the Session

Once all photos are edited and exported:

1. Run a **Time Machine backup**
2. In **Finder** (not Capture One), move the entire session folder to the appropriate folder on the NAS
3. **Double-click the `session.db` file** after moving it — this shows Capture One the new file location

---

## Quick Reference: Keyboard Shortcuts

| Action | Shortcut |
|---|---|
| Hide RAW files | `⌘ + Shift + R` |
| Show RAW files | `⌘ + Shift + R` |
| Hide JPEGs | `⌘ + Shift + J` |
| Show JPEGs | `⌘ + Shift + J` |
| Sync metadata | `⌘ + Shift + S` |
| Load metadata | `⌘ + Shift + L` |

---

## Color Tag Reference

| Color | Meaning |
|---|---|
| 🔴 Red | Trash — delete |
| 🟡 Yellow | Keep |
| 🟢 Green | Edit the RAW file |

---

*Workflow based on Fujifilm → Capture One → Apple Photos / Synology NAS pipeline.*
