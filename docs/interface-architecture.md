# Interface Architecture — Football Intelligence Desk

## Product Thesis
This product is a decision console for three linked jobs:

1. Build and audit training data
2. Produce trustworthy pre-match model outputs
3. Review whether the outputs deserve action

That means the interface architecture should separate:

- operational truth
- analytical truth
- decision truth

If these collapse into one page, users will confuse "data exists" with "prediction is trustworthy."

## Information Architecture

```text
Football Intelligence Desk
|
+-- Command Center
|   +-- Today's issue queue
|   +-- Crawl health
|   +-- Urgent alerts
|   +-- Upcoming cutoff timeline
|
+-- Match Lab
|   +-- Match summary
|   +-- Lineups and absences
|   +-- Feature factors
|   +-- Odds movement
|   +-- Model outputs
|   +-- Source trace
|
+-- Data Coverage
|   +-- Source freshness
|   +-- Field completeness
|   +-- Parser failures
|   +-- Entity mapping review
|
+-- Training Studio
|   +-- Dataset registry
|   +-- Feature set versions
|   +-- Training runs
|   +-- Metrics and artifacts
|
+-- Backtest Review
|   +-- Walk-forward windows
|   +-- Calibration
|   +-- Slice analysis
|   +-- Profit simulation
|
+-- World Cup Projection
    +-- National team pool
    +-- Projected XI
    +-- Cohesion and strength snapshots
    +-- Scenario comparison
```

## System Architecture To Expose In The UI

```text
sources -> raw snapshots -> normalized records -> entity resolution
        -> point-in-time snapshots -> feature store -> model runs
        -> market outputs -> review notes
```

Each layer should have a visible UI home:

- `raw snapshots` -> Data Coverage / Source Trace
- `entity resolution` -> Mapping Review panel
- `point-in-time snapshots` -> Match Lab / Snapshot header
- `feature store` -> Feature Factors panel
- `model runs` -> Training Studio
- `market outputs` -> Match Lab / Decision summary

## Navigation Model

### App shell
- Fixed left rail for primary modules
- Top context strip for date, issue number, selected competition, and cutoff state
- Main content region sized for dense work
- Optional right drawer for notes, source trace, and warning history

### Why this shell
- Left rail preserves muscle memory in a tool used repeatedly
- Top strip keeps time-sensitive context visible
- Right drawer keeps secondary evidence close without overloading the main canvas

## Primary Screens

## 1. Command Center

### Job
Answer: "What needs my attention before the next stop time?"

### Layout

```text
+----------------------------------------------------------------------------------+
| Date | Current Issue | Next Stop Time | Coverage Status | Pending Alerts         |
+----------------------------------------------------------------------------------+
| Priority Queue                                                                    |
| [Match Card] [Match Card] [Match Card]                                           |
+--------------------------------------+-------------------------------------------+
| Crawl Health                         | Upcoming Matches                           |
| source freshness                     | cutoff timeline                            |
| parser failures                      | lineup readiness                           |
| unresolved mappings                  | market movement flags                      |
+--------------------------------------+-------------------------------------------+
| Notes / Analyst log / Today's changes                                           |
+----------------------------------------------------------------------------------+
```

### Key interactions
- Filter queue by issue, competition, and data readiness
- Jump from match card directly into Match Lab
- Expand one alert into root cause details

## 2. Match Lab

### Job
Answer: "For this one match, what does the data say, what is missing, and should I trust the forecast?"

### Layout

```text
+----------------------------------------------------------------------------------+
| Home vs Away | Kickoff | Issue/Seq | Handicap | Headline Probability | Confidence |
+----------------------------------------------------------------------------------+
| Lineups & Absences         | Feature Factors             | Odds Timeline         |
| predicted XI               | attack vs defense deltas    | opening -> latest     |
| confirmed XI               | rolling form                | event markers         |
| missing starters           | fatigue / travel            | market consensus      |
+----------------------------+-----------------------------+-----------------------+
| Model Stack                                                                     |
| WDL | Handicap | Totals | Exact score candidates | scenario notes                  |
+-------------------------------------------+--------------------------------------+
| Comparable historical matches             | Source Trace / Manual Notes         |
+----------------------------------------------------------------------------------+
```

### Direction
- This page is dossier-like and evidence-first
- Keep the headline recommendation short and subordinate to the evidence
- Missing data should degrade confidence visibly

## 3. Data Coverage

### Job
Answer: "Can I trust what has been crawled and normalized?"

### Layout

```text
+----------------------------------------------------------------------------------+
| Freshness Summary | Parse Success | Unmapped Entities | Snapshot Delays             |
+----------------------------------------------------------------------------------+
| Field Completeness Heatmap                                                       |
+--------------------------------------+-------------------------------------------+
| Source Health Table                    | Mapping Review Queue                     |
| last crawl                             | unresolved team alias                    |
| last successful parse                  | unresolved player alias                  |
| broken selectors                       | low-confidence match mapping             |
+--------------------------------------+-------------------------------------------+
```

### Direction
- More operations room than analytics dashboard
- Strong red and orange reserved for things that can poison training or inference

## 4. Training Studio

### Job
Answer: "What exactly did I train, with which cutoff, and how well did it generalize?"

### Layout

```text
+----------------------------------------------------------------------------------+
| Dataset | Feature Set | Cutoff Type | Date Range | Leakage Guard | Run Status      |
+----------------------------------------------------------------------------------+
| Run Comparison Table                                                              |
+--------------------------------------+-------------------------------------------+
| Metrics                               | Artifacts                                 |
| log loss                              | feature importance                        |
| brier score                           | calibration plot                          |
| accuracy                              | confusion slices                          |
+--------------------------------------+-------------------------------------------+
| Experiment Notes / Decisions Log                                                  |
+----------------------------------------------------------------------------------+
```

### Direction
- Avoid devops jargon overload
- Make point-in-time assumptions visible in the first row of every run card

## 5. Backtest Review

### Job
Answer: "Where does the model fail, and is the probability output actionable?"

### Layout

```text
+----------------------------------------------------------------------------------+
| Window Selector | Competition Filter | Market Filter | Benchmark                |
+----------------------------------------------------------------------------------+
| Calibration Curve                     | Profit / Drawdown                         |
+--------------------------------------+-------------------------------------------+
| Error Slice Table                      | Confidence Bucket Review                 |
| by league                              | low-confidence misses                    |
| by odds band                           | favorites vs underdogs                   |
| by lineup completeness                 | stale-odds windows                       |
+--------------------------------------+-------------------------------------------+
```

## 6. World Cup Projection

### Job
Answer: "Before the tournament starts, what does the projected national-team shape look like?"

### Layout

```text
+----------------------------------------------------------------------------------+
| Team | Coach | Last Snapshot Date | Projected Strength | Cohesion                |
+----------------------------------------------------------------------------------+
| Projected XI                            | Player Pool Confidence                   |
+--------------------------------------+-------------------------------------------+
| Club-form aggregation                   | Scenario switches                        |
| attack / midfield / defense             | starter injured                          |
| goalkeeper factor                       | alternate formation                      |
+--------------------------------------+-------------------------------------------+
```

### Direction
- More scouting-board than score page
- Emphasize uncertainty and roster instability

## Interface Hierarchy Rules

### Level 1
- Match identity
- Cutoff state
- Trust / confidence state

### Level 2
- Why the signal moved
- Which sources support the view
- What is missing or stale

### Level 3
- Auxiliary notes
- Historical comparables
- Manual overrides

## Component Library Priorities

Build these first:

1. `AppShell`
2. `MatchCard`
3. `SignalCard`
4. `CoverageBadge`
5. `OddsTimeline`
6. `FeatureFactorTable`
7. `ConfidenceMeter`
8. `SourceTraceDrawer`
9. `ExperimentRunTable`
10. `HeatmapGrid`

## Interaction Patterns

- Hover reveals deeper evidence, never core meaning
- Right drawer keeps context without route churn
- Filters should be visible chips, not hidden modal forms
- One-click jump from operational alerts to affected match or source

## Responsive Notes

- Desktop: full three-column Match Lab
- Tablet: right drawer collapses below the center column
- Mobile: focus on queue lookup, alerts, and match summary only

## What This Product Should Not Feel Like

- A sportsbook homepage
- A crypto dashboard
- A generic AI analytics panel
- A cluttered admin template with football labels pasted on top
