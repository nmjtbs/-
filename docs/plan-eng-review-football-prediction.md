# Football Prediction Plan Eng Review

Generated on 2026-03-22 by `gstack-plan-eng-review`

## Step 0: Scope Challenge

Current scope is too wide for a first implementation:

- full lottery issue ingestion
- multi-source football crawling
- player/team/match/odds/lineup/weather/referee coverage
- World Cup national-team transfer modeling
- multi-market prediction for score, half/full time, total goals, handicap, and 14-match products

Opinionated recommendation:

- Reduce MVP to `胜平负 + 让球胜平负 + 总进球`
- Limit competitions to `5-8` stable leagues plus official lottery issue mapping
- Use only pre-match observable features at inference time
- Treat World Cup as a second-stage pipeline, not part of MVP

Mode: `SCOPE_REDUCED`

## Architecture Review

### Proposed pipeline

```text
        source sites
   (lottery / stats / lineups / odds)
                |
                v
        [crawler adapters]
                |
                v
      raw snapshots (html/json)
                |
                v
      normalized source tables
                |
                v
   entity resolution + match mapping
                |
                v
      point-in-time feature builder
                |
                v
      labels + train/valid splits
                |
                v
      xgboost probability models
                |
                v
    derived betting market outputs
```

### Boundary rules

- Raw layer stores source-truth snapshots with `source`, `crawl_time`, and source IDs.
- Normalized layer maps source-specific fields into canonical schema only.
- Feature layer is the only place that computes rolling windows, diffs, and lineup aggregations.
- Prediction layer consumes only point-in-time features available before `stop_time`.

## Findings

### 1. Critical: point-in-time leakage risk is not yet controlled

Your plan mixes three different categories:

- pre-match observable data
- model-inferred latent strength
- post-match realized statistics

The phrase "`预测的真实特征值去反哺预测`" is the main danger point. If realized World Cup team stats or later-updated pages leak into pre-match features, the model will look strong offline and fail live.

Recommendation:

- Define every feature with an `available_at` timestamp
- Ban all post-kickoff fields from inference feature sets
- Split tables into `pre_match_features`, `post_match_facts`, and `derived_labels`

### 2. Critical: no canonical identity layer has been planned yet

This project needs more than spiders. It needs stable identity resolution for:

- team aliases
- player aliases
- competition aliases
- source match IDs to official lottery match mapping

Without this, odds, lineups, stats, and official lottery records will not join reliably.

Recommendation:

- Add `teams`, `players`, `competitions`, and `match_mappings` master tables
- Store `source_name`, `source_entity_id`, `canonical_id`, `confidence`
- Make unresolved mappings a first-class review queue, not a silent fallback

### 3. High: official lottery matches and football match records must be separated

`lottery_issue_matches` is not the same thing as a canonical football match record.

Risks:

- same teams, slightly different kickoff times
- neutral venue vs home/away ambiguity
- localized names vs international names
- postponements and official resettlement behavior

Recommendation:

- Keep `lottery_issue_matches` separate from `matches`
- Introduce `lottery_match_mapping`
- Never use official seq/issue as the global match primary key

### 4. High: odds need time-series storage, not just open/close fields

For betting use cases, `closing_odds` is valuable, but movement is often more predictive than a single final point.

Recommendation:

- Store odds as snapshots with `bookmaker`, `market_type`, `selection`, `odds`, `captured_at`
- Derive `open`, `close`, `delta`, `last_6h_delta`, `volatility`, and `market_consensus`
- Freeze the final usable inference snapshot at your real prediction cutoff

### 5. High: World Cup modeling needs a national-team projection layer

Club form does not transfer directly to national-team match strength.

Missing design pieces:

- player eligibility and nationality
- call-up probability
- expected starting XI probability
- tactical role fit under the current coach
- injury status near release window

Recommendation:

- Add `national_team_player_pool`
- Build projected XI features from likely call-ups, not all eligible players
- Train World Cup models as a separate pipeline that consumes league-derived player strength aggregates

### 6. High: target strategy is too wide for an initial model family

Trying to directly predict all betting products at once will overcomplicate the first system.

Recommendation:

- Model A: `胜平负` three-class probability
- Model B: `home_goals`
- Model C: `away_goals`
- Derive `让球胜平负`, `总进球`, `比分`, `半全场` from these outputs later

### 7. Medium: crawler architecture needs anti-drift and replay support

Pure crawling is workable, but only if raw source pages are replayable.

Recommendation:

- Persist raw HTML/JSON snapshots
- Version parser logic by source
- Add parser contract tests with saved fixtures
- Add source health metrics: success rate, parse success rate, field completeness

### 8. Medium: evaluation plan should optimize probability quality, not only accuracy

For lottery and betting-style tasks, calibrated probabilities matter more than top-1 accuracy.

Recommendation:

- Primary metrics: `log loss`, `brier score`, calibration curves
- Secondary metrics: accuracy, top-k score coverage
- Backtest by rolling time windows, never random split

## Data Model Recommendation

Start with these tables:

- `lottery_issues`
- `lottery_issue_matches`
- `matches`
- `match_mappings`
- `team_match_stats`
- `player_match_stats`
- `lineups`
- `absences`
- `odds_snapshots`
- `feature_snapshots`
- `predictions`

Add these master tables immediately:

- `teams`
- `players`
- `competitions`
- `venues`

## Test Review Diagram

```text
[source crawl succeeds]
        |
        +--> raw snapshot persisted
        |       test: raw file written, metadata complete
        |       fail: page structure changed and parser silently stores empty payload
        |
        +--> parser normalizes fields
        |       test: fixture-based parser contract per source
        |       fail: "shots_on_target" selector drifts and becomes null for all rows
        |
        +--> entity resolution joins teams/players/matches
        |       test: alias mapping + low-confidence queue behavior
        |       fail: wrong team match joins odds from another fixture
        |
        +--> point-in-time feature builder
        |       test: features only use rows available before cutoff
        |       fail: lineup or odds snapshot from after stop_time leaks into training
        |
        +--> label builder
        |       test: official handicap and score recompute labels correctly
        |       fail: postponed or cancelled matches produce wrong labels
        |
        +--> training split
        |       test: rolling split has no future leakage
        |       fail: random shuffle inflates offline metrics
        |
        +--> model inference
        |       test: missing lineup/odds fallback path works
        |       fail: live prediction crashes when one source is delayed
        |
        +--> market derivation
                test: WDL / handicap / totals derived consistently from base outputs
                fail: totals and exact-score distributions disagree
```

## Test Plan

### Affected Pages/Routes

- Lottery issue source pages: verify issue list, match list, official results, and handicap extraction
- Match stat source pages: verify scoreline, match facts, and team stat extraction
- Lineup/absence source pages: verify expected XI, confirmed XI, injury, and suspension extraction
- Odds source pages: verify snapshot capture and time ordering

### Key Interactions To Verify

- Crawl same match from multiple sources and map to one canonical match
- Rebuild normalized rows from raw snapshots after parser change
- Generate point-in-time features at `sale_time`, `stop_time`, and `kickoff_time - 90m`
- Recompute official play labels from official handicap and final score

### Edge Cases

- Postponed, cancelled, or abandoned matches
- Neutral venue matches mislabeled as home/away
- Team rename and localized alias changes
- Missing confirmed lineup, but expected lineup exists
- Missing odds close snapshot because source delayed

### Critical Paths

- Daily issue ingestion -> canonical match mapping -> odds snapshot collection -> pre-match feature generation -> prediction export
- Historical crawl replay -> normalized stat rebuild -> rolling feature backfill -> walk-forward training
- World Cup player pool aggregation -> projected XI build -> national-team pre-match feature export

## Opinionated Recommendation Set

- Choose boring technology: `Scrapy + Playwright + PostgreSQL + Parquet + Polars + XGBoost`
- Keep one canonical schema and many source adapters
- Make leakage prevention a schema rule, not a code review hope
- Separate league model pipeline from World Cup projection pipeline
- Do not start with player-level maximum coverage; start with high-signal stable fields

## What To Build First

Phase 1:

- lottery issue crawler
- historical match/result crawler
- odds snapshot crawler
- lineups/absences crawler
- canonical IDs and match mapping
- point-in-time feature builder
- WDL / handicap / totals baseline models

Phase 2:

- richer team and player technical stats
- parser fixture test suite
- calibration and backtesting reports
- inference service and scheduled refresh

Phase 3:

- World Cup projected squad and XI builder
- player-to-national-team transfer features
- richer derived market distributions

## Inline Diagram Comment Candidates

When code exists, add inline ASCII diagrams to:

- `feature_engineering/point_in_time.py`
- `entity_resolution/match_mapping.py`
- `labels/lottery_labels.py`
- `pipelines/world_cup_projection.py`

## Completion Summary

- Step 0: scope reduced per recommendation
- Architecture: 5 major decisions need to be locked
- Test Review: diagram produced, 8 gap classes identified
- What already exists: requirements and candidate feature inventory are strong
- TODOS.md updates: not created
- Failure modes: 3 critical gaps flagged
- Lake Score: 4/4 recommendations chose the complete option
