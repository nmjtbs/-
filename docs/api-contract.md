# API Contract — Dashboard v1

This document is the handoff contract between frontend and the future crawler/backend layer.

Frontend source of truth in code:

- [common.ts](/Users/yangjiaqi/Downloads/codex测试/赌球大世界/赌球技术选型/src/api/contracts/common.ts)
- [dashboard.ts](/Users/yangjiaqi/Downloads/codex测试/赌球大世界/赌球技术选型/src/api/contracts/dashboard.ts)
- [endpoints.ts](/Users/yangjiaqi/Downloads/codex测试/赌球大世界/赌球技术选型/src/api/endpoints.ts)

## Goals

- Separate API contracts from frontend view models
- Make all dashboard pages request-driven
- Preserve room for stale warnings, request IDs, and cutoff-specific snapshots
- Keep the payload aligned with point-in-time prediction rules

## Envelope

All successful responses use:

```ts
interface ApiSuccessResponse<T> {
  success: true
  data: T
  meta: {
    requestId: string
    generatedAt: string
    version: "v1"
    source: "mock" | "backend"
    stale: boolean
    warnings: string[]
  }
}
```

All errors should use:

```ts
interface ApiErrorResponse {
  success: false
  error: {
    code: string
    message: string
    details?: string[]
  }
  meta: ApiMeta
}
```

## Endpoint 1

`GET /api/v1/dashboard/command-center`

### Query params

- `issueNo?: string`
- `date?: string`
- `cutoffType?: "sale_time" | "stop_time" | "kickoff_minus_90m" | "confirmed_lineup"`
- `includeAlerts?: boolean`

### Response shape

```ts
{
  success: true,
  data: {
    context: {
      date: string,
      issueNo: string,
      competition: string,
      cutoffTime: string,
      cutoffType: PredictionCutoffType,
      coverageSummary: string,
      alertCount: number
    },
    actions: ActionButton[],
    queueMatches: Array<{
      matchId: string,
      issueMatchCode: string,
      displayTitle: string,
      metaLine: string,
      coverageLabel: string,
      coverageStatus: "ready" | "warning" | "risk",
      metrics: Array<{ label: string, value: string }>,
      confidence: {
        score: number,
        label: string,
        copy: string
      }
    }>,
    crawlHealth: Array<[string, string]>,
    timeline: Array<[string, string, string]>,
    warnings: Array<{
      title: string,
      copy: string,
      tone: "warning" | "danger"
    }>
  },
  meta: ApiMeta
}
```

### Semantics

- `queueMatches` is the decision queue, not the full issue list
- `coverageStatus` is page-level readiness, not crawler success alone
- `context.cutoffType` must match the feature snapshot logic used downstream

## Endpoint 2

`GET /api/v1/dashboard/matches/:matchId/lab`

### Query params

- `snapshotType?: "sale_time" | "stop_time" | "kickoff_minus_90m" | "confirmed_lineup"`

### Response shape

```ts
{
  success: true,
  data: {
    context: DashboardContext,
    matchId: string,
    actions: ActionButton[],
    hero: {
      issue: string,
      subtitle: string,
      title: string,
      handicap: string,
      snapshot: string,
      confidence: string,
      scoreline: string,
      scoreCopy: string,
      metrics: Array<{ label: string, value: string }>
    },
    probability: {
      summary: string,
      items: Array<{ label: string, value: number }>,
      confidence: {
        score: number,
        label: string,
        copy: string
      }
    },
    lineup: {
      predicted: string,
      confirmed: string,
      absences: string[]
    },
    signals: Array<{
      title: string,
      value: string,
      copy: string,
      badge: {
        label: string,
        status: "ready" | "warning" | "risk"
      }
    }>,
    featureRows: Array<[string, string, string, string]>,
    oddsEvents: Array<[string, string, string]>,
    sources: Array<{
      name: string,
      freshness: string,
      status: "ready" | "warning" | "risk",
      copy: string
    }>
  },
  meta: ApiMeta
}
```

### Semantics

- `snapshotType` controls which point-in-time world this page reflects
- `hero.snapshot` is display text; `context.cutoffType` is the contract field that matters
- `sources.status` reflects source usability for this match snapshot, not just last crawl success

## Important Rules For Backend Handoff

### 1. Never leak post-match facts into pre-match contracts

Do not place these into `command-center` or `match-lab` unless they are derived strictly from historical matches before the selected cutoff:

- current-match xG
- current-match shots
- current-match possession
- current-match full-time or half-time result

### 2. Every response must be snapshot-aware

The frontend assumes the backend can answer:

- which cutoff was used
- whether the payload is stale
- when the snapshot was generated

### 3. `matchId` must be canonical

`matchId` is the cross-page canonical key.

Do not use:

- lottery sequence as matchId
- source-specific fixture ID as matchId

Those belong in source mapping tables, not in the UI contract.

### 4. Keep response names stable

The frontend adapter layer already expects camelCase API payload fields for v1.
If backend payloads differ, normalize them before handing them to the frontend, or version the contract.

## Current Frontend Integration

Current data flow:

`mock response envelope -> service -> adapter -> typed page model -> page components`

Relevant files:

- [mockApi.ts](/Users/yangjiaqi/Downloads/codex测试/赌球大世界/赌球技术选型/src/services/mockApi.ts)
- [dashboardService.ts](/Users/yangjiaqi/Downloads/codex测试/赌球大世界/赌球技术选型/src/services/dashboardService.ts)
- [dashboardAdapters.ts](/Users/yangjiaqi/Downloads/codex测试/赌球大世界/赌球技术选型/src/adapters/dashboardAdapters.ts)

## Next Backend-Friendly Step

When the crawler/backend side starts:

1. Keep the contract files unchanged if possible
2. Replace `mockApi.ts` with a real HTTP client
3. Preserve the adapter layer
4. Return `meta.stale` and `meta.warnings` honestly, even if the payload is otherwise valid
