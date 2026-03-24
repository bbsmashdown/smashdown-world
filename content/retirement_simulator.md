---
title: Retirement Simulator Changelog
updated: January–February 2026
hidden: true
parent: recent_projects
---
## Linear Simulation (Growth Simulation Sheet)
- **Year-by-year projection engine built** — Full simulation covering ages 18–100 across three tax buckets (Tax Deferred, Roth, After-Tax), with inflation tracking, variable contribution/growth assumptions, and a summary table.
- **Variable rate assumptions table added** — Growth rate, monthly contribution, one-time contributions, and inflation all support user-defined breakpoints, enabling coast FIRE planning, life event modeling, and glide-path shifts.
- **Inflation-adjusted withdrawals implemented** — Withdrawals grow annually using prior year × (1 + inflation), mirroring Social Security COLA; initial 4% withdrawal at retirement age with a user-configurable cap (e.g., $250,000).
- **IF()-based age blanking applied** — All rows beyond `endAge` return blank rather than zero or errors, keeping the table clean and preventing cascade issues regardless of timeline.
- **FV formula bug fixed** — Root cause of $36k discrepancy vs. external calculator: annual FV term used `nper=1` instead of the full period count; fixed by referencing the simulation year count cell. Monthly and annual contributions now use separate FV components with correct compounding.
- **Simulation expanded to ages 18–100** — All five sub-tables (Summary, Tax Deferred, Roth, After-Tax, Inflation) extended to an 83-year span with draggable IF-blanked formulas.
---
## Monte Carlo Simulation Sheet
- **1,000-run Monte Carlo simulation built** — Normally distributed random returns and inflation, with percentile summary outputs (5th/25th/median/75th/95th) and a histogram visualization.
- **Stochastic growth and inflation modeled independently** — Growth uses a nominal rate (~9–10% mean, ~10% SD); inflation uses its own distribution (~3–3.5% mean, ~2–3% SD); variables are not conflated into a single real return.
- **10% SD chosen over historical 18–20%** — Higher figure captures annual volatility; 10% better represents smoothed volatility relevant to 30–40 year horizons; industry standard for long-horizon Monte Carlo planning.
- **"Include Contributions?" toggle added** — Dropdown validation cell switches contributions on/off, enabling pure decumulation scenarios without restructuring the table.
- **Working table range bug fixed** — When the Growth Simulation expanded to ages 18–100, the MC working table (F57:P121 = 64 rows) was not extended, causing #N/A errors; fixed by extending to row 139.
---
## Historical Simulation Sheet
- **Two-phase historical stress test built** — Accumulation phase loops through every historical starting year (S&P 500, bond, and CPI data from 1928–2025); decumulation phase runs the five percentile starting balances through every possible historical retirement sequence.
- **Data table engine chosen over VBA/PowerQuery** — Excel's What-If data table used for both phases for transparency and maintainability; formulas remain readable and fixable without macros.
- **Real values used for percentile ranking** — Wide historical inflation variation makes nominal comparisons misleading; real values used to rank worst/25th/median/75th/best outcomes, with cumulative inflation carried forward into decumulation.
- **Mid-year contribution approximation implemented** — Formula `balance × (1 + growth) + contributions × ((1 + growth) × 0.5 + 0.5)` approximates evenly-spread contributions using annual-only historical data; documented as a known modeling approximation.
- **OFFSET replaced with XLOOKUP in summary table** — OFFSET broke when timeline length changed with different user inputs; replaced with XLOOKUP anchored to the fixed AR column (always the last column regardless of simulation length).
- **H18 dropdown established as key decumulation input** — Cell H18 is the handoff point between the two phases; user selects which accumulation percentile scenario (worst/25th/median/75th/best) feeds the decumulation engine.
---
## Current State / Net Worth Sheet
- **Net worth snapshot sheet built** — Assets and liabilities across all account types (Checking/Savings, Non-Qualified, 529s, Tax Deferred, Roth); balances auto-populate starting values in all simulation sheets.
- **Monthly budget workbook built** — January built as master sheet; remaining months created as copies using Group Sheets; dashboard references cross-sheet totals via `SUM(January:December!CellRef)`.
