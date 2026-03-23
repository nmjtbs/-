# UI Development Tasks — Football Intelligence Desk

## Goal
Turn the current design system and interface architecture into an implementable front-end task list.

This task breakdown assumes:

- desktop-first web app
- internal research console
- component-first implementation
- mock data first, real data later

## Delivery Strategy

Build in this order:

1. App foundation
2. Shared layout and tokens
3. Shared data-display components
4. Command Center
5. Match Lab
6. Data Coverage
7. Training Studio
8. Backtest Review
9. World Cup Projection

Do not start by building all pages independently. The design depends on a stable shell and a shared component language.

## Milestone 1 — Foundation

### Task 1.1: Create app shell
- Build `AppShell`
- Build left rail navigation
- Build top context strip
- Build main content container
- Build optional right-side drawer region

Acceptance criteria:
- Left rail supports active state
- Top strip can show date, issue, competition, and cutoff status
- Main area supports one-column, two-column, and three-column layouts
- Drawer can be toggled without shifting the entire page

### Task 1.2: Define design tokens
- Add color tokens from [DESIGN.md](/Users/yangjiaqi/Downloads/codex测试/赌球大世界/赌球技术选型/DESIGN.md)
- Add typography tokens
- Add spacing tokens
- Add radius, border, and shadow tokens
- Add semantic status colors

Acceptance criteria:
- Tokens are defined centrally
- Tables and numeric displays use tabular figures
- Primary and secondary button styles match the design system

### Task 1.3: Create page layout primitives
- `PageHeader`
- `SectionCard`
- `SplitPanel`
- `MetricGrid`
- `EmptyState`
- `WarningBanner`

Acceptance criteria:
- All primitives support compact and dense dashboard layouts
- Cards maintain consistent padding and heading hierarchy

## Milestone 2 — Shared Component Library

### Task 2.1: Build navigation components
- `NavRail`
- `NavItem`
- `ContextStrip`
- `FilterChip`
- `BreadcrumbLabel`

### Task 2.2: Build match and status components
- `MatchCard`
- `CoverageBadge`
- `ConfidenceMeter`
- `StatusPill`
- `CountdownBadge`

Acceptance criteria:
- Match cards support issue number, teams, kickoff, handicap, and readiness state
- Confidence meter supports at least three states: high, medium, low

### Task 2.3: Build data-display components
- `SignalCard`
- `MetricStat`
- `FeatureFactorTable`
- `BacktestSliceTable`
- `ExperimentRunTable`
- `HeatmapGrid`

Acceptance criteria:
- Tables support sticky headers
- Numeric cells align consistently
- Dense data remains readable without visual clutter

### Task 2.4: Build analytical panels
- `OddsTimelinePanel`
- `PredictionDistributionPanel`
- `ModelComparisonCard`
- `LineupStabilityStrip`
- `SourceTraceDrawer`

Acceptance criteria:
- Odds timeline supports event markers
- Prediction panel supports WDL and totals distributions
- Source trace panel can show freshness and source lag

## Milestone 3 — Command Center

### Page objective
Answer: what needs attention before the next stop time?

### Task 3.1: Build Command Center page frame
- Add `PageHeader`
- Add priority queue region
- Add crawl health panel
- Add upcoming matches panel
- Add notes/log panel

### Task 3.2: Build priority queue cards
- Reuse `MatchCard`
- Add readiness flag
- Add data-missing warning state
- Add one-click route to Match Lab

### Task 3.3: Build operational summary panels
- `CrawlHealthSummary`
- `UpcomingCutoffTimeline`
- `AlertList`

Acceptance criteria:
- A user can identify the next affected match within 5 seconds
- Broken data sources are visually obvious
- Queue cards scan cleanly in rows of 2-4

## Milestone 4 — Match Lab

### Page objective
Answer: what does the data say for this match, and should I trust it?

### Task 4.1: Build Match Lab frame
- Hero match header
- Three-column main body
- Bottom evidence region

### Task 4.2: Build hero region
- `MatchHeaderBoard`
- `HeadlineProbabilityCard`
- `OfficialHandicapBadge`
- `SnapshotStateLabel`

### Task 4.3: Build left column
- `LineupPanel`
- `AbsenceList`
- `LineupStabilityStrip`

### Task 4.4: Build center column
- `FeatureFactorTable`
- `SignalCard` group for attack, defense, fatigue, and rest
- `ComparableMatchesPanel`

### Task 4.5: Build right column
- `OddsTimelinePanel`
- `ModelComparisonCard`
- `PredictionDistributionPanel`

### Task 4.6: Build bottom evidence area
- `SourceTraceDrawer`
- `ManualNotesPanel`
- `WarningBanner` stack

Acceptance criteria:
- The page shows one clear top-level judgment
- Missing inputs reduce visible trust/confidence
- User can inspect both model output and source evidence without route changes

## Milestone 5 — Data Coverage

### Page objective
Answer: can I trust the crawled and normalized data?

### Task 5.1: Build coverage summary row
- freshness summary
- parse success summary
- unresolved entity count
- snapshot delay summary

### Task 5.2: Build field completeness heatmap
- `HeatmapGrid`
- source x field x status

### Task 5.3: Build source health table
- last crawl
- last successful parse
- parser failures
- delayed snapshots

### Task 5.4: Build mapping review panel
- unresolved team aliases
- unresolved player aliases
- low-confidence match mappings

Acceptance criteria:
- Broken ingestion paths are obvious without scrolling
- Mapping problems can be filtered and reviewed separately from source failures

## Milestone 6 — Training Studio

### Page objective
Answer: what was trained, on which snapshot logic, and how well did it generalize?

### Task 6.1: Build run comparison page
- dataset selector
- feature set selector
- cutoff type selector
- experiment list

### Task 6.2: Build experiment comparison table
- `ExperimentRunTable`
- leakage guard column
- train/valid date window
- metric columns

### Task 6.3: Build artifact panels
- feature importance
- calibration artifact
- confusion or slice artifact
- notes panel

Acceptance criteria:
- Runs can be compared side by side
- Point-in-time assumptions are visible in every run summary

## Milestone 7 — Backtest Review

### Page objective
Answer: where does the model fail, and are the probabilities actionable?

### Task 7.1: Build backtest filters
- window selector
- market filter
- competition filter
- benchmark selector

### Task 7.2: Build results panels
- calibration chart panel
- profit/drawdown panel
- confidence bucket review
- slice error table

Acceptance criteria:
- Page foregrounds calibration before raw hit rate
- Error slices can be reviewed by league, odds band, and lineup completeness

## Milestone 8 — World Cup Projection

### Page objective
Answer: what does the pre-tournament national-team shape look like?

### Task 8.1: Build projection summary header
- team selector
- coach
- last snapshot date
- projected strength
- cohesion

### Task 8.2: Build projected XI section
- projected starters
- formation
- confidence per role

### Task 8.3: Build player pool and scenario panels
- player pool confidence
- club-form aggregation
- scenario switches

Acceptance criteria:
- The page emphasizes uncertainty
- It is easy to compare “default XI” with one or two scenario changes

## Cross-Cutting Tasks

### Task A: Routing and navigation state
- add routes for all six modules
- preserve selected issue, date, competition, and match in state

### Task B: Mock data contracts
- define view models for every component
- create mock JSON or TS fixtures
- keep page implementation independent from live crawlers initially

### Task C: Accessibility
- keyboard focus order
- clear table headers
- semantic status text
- non-color-only warnings

### Task D: Responsive behavior
- desktop first
- tablet fallback for three-column Match Lab
- mobile limited to monitoring surfaces

## Recommended Build Order

### Phase P0
1. App shell
2. tokens
3. SectionCard, PageHeader, MetricGrid
4. MatchCard, CoverageBadge, ConfidenceMeter
5. Command Center skeleton

### Phase P1
1. MatchHeaderBoard
2. SignalCard
3. FeatureFactorTable
4. OddsTimelinePanel
5. SourceTraceDrawer
6. Match Lab skeleton

### Phase P2
1. Data Coverage page
2. Training Studio page
3. Backtest Review page

### Phase P3
1. World Cup Projection page
2. scenario comparison details

## Definition Of Done

A module is done when:

- layout matches [DESIGN.md](/Users/yangjiaqi/Downloads/codex测试/赌球大世界/赌球技术选型/DESIGN.md)
- it works with realistic mock data
- empty, loading, and error states exist
- dense tables remain readable
- confidence and freshness states are visible
- no page looks like a generic admin template
