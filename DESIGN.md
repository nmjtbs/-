# Design System — Football Intelligence Desk

## Product Context
- **What this is:** A desktop-first football prediction and decision console for collecting training data, monitoring pre-match signals, running XGBoost experiments, and reviewing lottery-oriented probability outputs.
- **Who it's for:** Solo analysts or very small teams doing football data collection, model iteration, backtesting, and pre-match decision support.
- **Space/industry:** Sports analytics, football intelligence, lottery research, probability modeling.
- **Project type:** Web app / dashboard / internal research console.

## Aesthetic Direction
- **Direction:** Press Box Modernism
- **Decoration level:** Intentional
- **Mood:** Calm, credible, and tactical. The product should feel like a serious research desk inside a sports newsroom, not a sportsbook lobby and not a generic SaaS admin.
- **Reference sites:** Built from design knowledge only. No external visual research was used for this first pass.

## EUREKA
Most betting products borrow casino cues: black backgrounds, neon accents, hyper-saturated reds, and urgency-heavy widgets. That visual language is wrong for this product because your real job is not "place a bet fast" but "judge signal quality under uncertainty." This system should look more like a disciplined scouting room and less like a bookmaker front end.

## Typography
- **Display/Hero:** `Teko` — best used for scorelines, countdowns, model confidence numerals, and match headers. It brings broadcast energy without turning the whole app into sports-bar graphics.
- **Body:** `Noto Sans SC` — dependable Chinese text rendering, high readability, and strong support for dense analytical writing.
- **UI/Labels:** `Noto Sans SC`
- **Data/Tables:** `IBM Plex Sans` — use tabular numbers for odds, probabilities, and score distributions; keep `Noto Sans SC` as the Chinese fallback.
- **Code:** `IBM Plex Mono`
- **Loading:** Self-host `woff2` in production. For prototypes, a CDN fallback is acceptable. Enable `font-display: swap`.
- **Scale:** `12 / 14 / 16 / 18 / 20 / 24 / 32 / 40 / 56`

## Color
- **Approach:** Balanced
- **Primary:** `#123D36` — pitch-board green used for navigation, key headers, and primary actions
- **Secondary:** `#D4A64F` — restrained brass accent for rankings, premium highlights, and market consensus markers
- **Neutrals:** `#F6F2E9`, `#EAE3D6`, `#D4CCBD`, `#9B9488`, `#4A463F`, `#181714`
- **Semantic:** success `#2E8B57`, warning `#D97A2B`, error `#C84C3A`, info `#3F7CAC`
- **Dark mode:** Do not invert blindly. Use deep field surfaces `#101714` and `#16211D`, reduce accent saturation by roughly 15%, and preserve warm neutrals for data readability.

## Spacing
- **Base unit:** `4px`
- **Density:** Comfortable-compact
- **Scale:** `2xs(2) xs(4) sm(8) md(16) lg(24) xl(32) 2xl(48) 3xl(64)`

## Layout
- **Approach:** Hybrid editorial + grid-disciplined dashboard
- **Grid:** desktop `12` columns, tablet `8`, mobile `4`
- **Max content width:** `1600px`
- **Border radius:** `sm 6px`, `md 10px`, `lg 14px`, `xl 20px`, `pill 9999px`

## Motion
- **Approach:** Minimal-functional
- **Easing:** enter `cubic-bezier(0.16, 1, 0.3, 1)`, exit `cubic-bezier(0.7, 0, 0.84, 0)`, move `cubic-bezier(0.4, 0, 0.2, 1)`
- **Duration:** micro `80ms`, short `180ms`, medium `280ms`, long `420ms`

## Interface Principles

### 1. Research, not gambling
The interface should emphasize signal quality, source coverage, and confidence intervals before outcomes. Every prediction card should show why the model believes something, not just what it believes.

### 2. Numbers must anchor visually
Odds, implied probabilities, rank changes, and scorelines should use tabular numerals and stable card geometry. Avoid jittery tables and changing-width metric chips.

### 3. One screen should answer one question
Do not put crawling health, model training controls, and match-level betting recommendations into one giant dashboard. Separate operational monitoring from analytical judgment.

### 4. Color should encode meaning, not mood swings
Use semantic color only for state and risk. Do not color every edge or every odds movement. Reserve strong contrast for exceptions.

### 5. Editorial hierarchy over SaaS sameness
Page headers should feel like match dossiers: clear title, time context, coverage status, and most important decision in the first view. Avoid flat "card soup."

## Product Surface Map

### Primary modules
- **Command Center:** today's issue list, crawl health, upcoming matches, top alerts
- **Match Lab:** one-match deep dive with features, lineup state, odds movement, model outputs
- **Training Studio:** datasets, feature sets, runs, metrics, model registry
- **Backtest Review:** walk-forward results, calibration, profit simulation, failure slices
- **Data Coverage:** source completeness, parser health, mapping confidence, missing fields
- **World Cup Projection:** national-team player pool, projected XI, pre-tournament strength snapshots

### Navigation model
- Left rail for modules
- Top strip for current issue / competition / date context
- Right-side contextual drawer for notes, source trace, and warnings

## Screen Direction

### Command Center
- First block is not KPIs; it is today's decision queue
- Use stacked strips for `停售时间`, coverage confidence, and lineup readiness
- Show a compact alert rail for missing data, stale odds, and unresolved mappings

### Match Lab
- Hero section: teams, kickoff, issue number, official handicap, model headline
- Main body split:
  - left: lineup and absences
  - center: feature factors and derived signals
  - right: odds timeline and prediction stack
- Bottom area: source trace, notes, and comparable historical matches

### Training Studio
- Treat this as a lab notebook, not a devops page
- Default view should compare datasets and experiments side by side
- Emphasize feature-set version, cutoff type, leakage guard status, and evaluation windows

### Backtest Review
- Lead with calibration, drawdown, and slice analysis
- Avoid giant rainbow chart walls
- Show one chart cluster per question:
  - probability quality
  - market conversion quality
  - failure buckets

### Data Coverage
- Designed like an operations map
- Focus on freshness, completeness, parse stability, and unresolved entity mappings
- Make broken sources impossible to miss

## Core Components
- **Match Header Board**
- **Signal Card**
- **Coverage Badge**
- **Odds Timeline Panel**
- **Feature Factor Table**
- **Lineup Stability Strip**
- **Model Comparison Card**
- **Backtest Slice Table**
- **Source Trace Drawer**

## Component Styling Rules
- Tables use row height `40-44px`, sticky headers, zebra tint only at 2-3% contrast
- Cards have one dominant data point and one support sentence; no six-stat mini dashboards inside one card
- Primary buttons use solid pine background; secondary buttons use warm neutral outlines
- Warning banners are parchment-toned with orange edge markers, never pure yellow
- Scoreline numerals and odds numerals always use tabular figures

## Charts
- **Odds movement:** line chart with event markers for lineup confirmation and major price moves
- **Prediction distributions:** horizontal probability bars or dot plots, not pie charts
- **Feature importance:** ranked bar chart with grouped sections
- **Backtest over time:** cumulative line plus drawdown band
- **Coverage health:** heatmap by source x field x day

## Responsive Strategy
- Desktop is the primary experience
- Tablet keeps the left rail collapsible and stacks the right drawer under main content
- Mobile should support monitoring and quick lookup, not full training workflows

## Anti-Patterns
- No neon green on black sportsbook aesthetic
- No purple-gradient generic AI dashboard look
- No over-rounded glass cards
- No endless KPI ribbon above every page
- No red/green-only state encoding

## Decisions Log
| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-03-22 | Initial design system created | Created for a football prediction research console with credibility and density prioritized over betting-site theatrics |
