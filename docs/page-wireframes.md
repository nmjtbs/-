# Page Wireframes — Football Intelligence Desk

## 1. App Shell

```text
+------------------------------------------------------------------------------------------------------+
| Left Rail                 | Top Context Strip                                                        |
|                           +--------------------------------------------------------------------------+
| Command Center            | Date | Issue | Competition | Cutoff | Search | User                     |
| Match Lab                 +--------------------------------------------------------------------------+
| Data Coverage             | Main Content Area                                  | Context Drawer      |
| Training Studio           |                                                    | notes               |
| Backtest Review           |                                                    | source trace        |
| World Cup Projection      |                                                    | warnings            |
+------------------------------------------------------------------------------------------------------+
```

## 2. Command Center

```text
+------------------------------------------------------------------------------------------------------+
| Page Header: 今日决策台                                                                              |
| Subtitle: next stop time / open alerts / coverage confidence                                         |
+------------------------------------------------------------------------------------------------------+
| Priority Queue                                                                                       |
| [MatchCard] [MatchCard] [MatchCard]                                                                  |
| [MatchCard] [MatchCard] [MatchCard]                                                                  |
+----------------------------------------------+-------------------------------------------------------+
| Crawl Health                                 | Upcoming Cutoff Timeline                              |
| source freshness                             | 18:30 Arsenal vs Liverpool                            |
| parser failures                              | 19:00 Milan vs Roma                                   |
| unresolved mappings                          | 19:35 Dortmund vs Bayern                              |
+----------------------------------------------+-------------------------------------------------------+
| Alert List                                                                                           |
| stale odds snapshot | lineup unavailable | match mapping low confidence                              |
+------------------------------------------------------------------------------------------------------+
```

## 3. Match Lab

```text
+------------------------------------------------------------------------------------------------------+
| Home vs Away | Kickoff | Issue/Seq | Handicap | Main Probability | Confidence | Snapshot Type         |
+------------------------------------------------------------------------------------------------------+
| Lineups & Absences              | Feature Factors                         | Odds + Model Stack       |
| predicted XI                    | attack delta                            | odds timeline            |
| confirmed XI                    | defense delta                           | WDL split                |
| missing starters                | rest/fatigue                            | totals split             |
| formation                       | rolling form                            | model comparison         |
+---------------------------------+-----------------------------------------+--------------------------+
| Comparable Historical Matches   | Source Trace / Notes                                               |
+------------------------------------------------------------------------------------------------------+
```

## 4. Data Coverage

```text
+------------------------------------------------------------------------------------------------------+
| Freshness | Parse Success | Unmapped Teams | Unmapped Players | Delayed Snapshots                    |
+------------------------------------------------------------------------------------------------------+
| Field Completeness Heatmap                                                                           |
+----------------------------------------------+-------------------------------------------------------+
| Source Health Table                            | Mapping Review Queue                                  |
| source | last crawl | parse ok | lag          | alias | canonical candidate | confidence            |
+----------------------------------------------+-------------------------------------------------------+
```

## 5. Training Studio

```text
+------------------------------------------------------------------------------------------------------+
| Dataset | Feature Set | Cutoff Type | Date Range | Leakage Guard | Train New Run                        |
+------------------------------------------------------------------------------------------------------+
| Experiment Run Table                                                                                 |
+----------------------------------------------+-------------------------------------------------------+
| Metrics                                        | Artifacts                                             |
| log loss                                       | feature importance                                    |
| brier score                                    | calibration chart                                     |
| accuracy                                       | notes                                                 |
+----------------------------------------------+-------------------------------------------------------+
```

## 6. Backtest Review

```text
+------------------------------------------------------------------------------------------------------+
| Window Selector | Market Filter | Competition Filter | Benchmark                                     |
+------------------------------------------------------------------------------------------------------+
| Calibration Curve                            | Profit / Drawdown                                    |
+----------------------------------------------+-------------------------------------------------------+
| Error Slice Table                             | Confidence Bucket Review                             |
| by league                                     | low / mid / high confidence                          |
| by odds band                                  | favorites / balanced / underdogs                     |
| by lineup completeness                        | stale source windows                                 |
+----------------------------------------------+-------------------------------------------------------+
```

## 7. World Cup Projection

```text
+------------------------------------------------------------------------------------------------------+
| Team | Coach | Snapshot Date | Strength | Cohesion | Scenario Toggle                                     |
+------------------------------------------------------------------------------------------------------+
| Projected XI                                 | Player Pool Confidence                               |
+----------------------------------------------+-------------------------------------------------------+
| Attack / Midfield / Defense / GK             | Club Form Aggregation                                |
+----------------------------------------------+-------------------------------------------------------+
| Alternate scenario: injury / formation change / late call-up                                         |
+------------------------------------------------------------------------------------------------------+
```

## Component-to-Page Mapping

- `AppShell`: all pages
- `PageHeader`: all pages
- `MatchCard`: Command Center
- `CoverageBadge`: Command Center, Match Lab, Data Coverage
- `ConfidenceMeter`: Match Lab, Backtest Review, World Cup Projection
- `SignalCard`: Match Lab, Training Studio
- `FeatureFactorTable`: Match Lab
- `OddsTimelinePanel`: Match Lab
- `ExperimentRunTable`: Training Studio
- `BacktestSliceTable`: Backtest Review
- `HeatmapGrid`: Data Coverage
- `SourceTraceDrawer`: Match Lab, Data Coverage
