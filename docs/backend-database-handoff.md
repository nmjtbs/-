# 后端对数据库同学的对接文档

本文档用于对接当前已落地的后端骨架，目标是让数据库层同学明确：

- 后端已经提供哪些能力
- 数据库需要为后端提供哪些读取对象
- 哪些字段是必须的
- 哪些时间语义必须严格保证

当前后端范围：

- `Dashboard API`
- `XGBoost 推理`
- `异步训练入口`

当前不在本轮范围内：

- 爬虫实现
- 完整训练平台
- 自动上线模型
- 世界杯专项 projection

---

## 1. 当前后端已经实现的接口

### 1.1 Dashboard

- `GET /api/v1/dashboard/command-center`
- `GET /api/v1/dashboard/matches/{matchId}/lab`

### 1.2 Prediction

- `POST /api/v1/predictions/matches/{matchId}`

当前正式支持：

- `target = wdl`

### 1.3 Training Admin

- `POST /api/v1/admin/training-runs`
- `GET /api/v1/admin/training-runs/{runId}`

说明：

- 训练接口当前只是异步入口骨架
- 真正训练数据集后续由数据库层接入

---

## 2. 当前后端内部读取边界

后端不会直接依赖“某张具体表”，而是依赖以下读取能力：

- `DashboardReadRepository`
- `FeatureSnapshotRepository`
- `PredictionRepository`
- `TrainingDatasetRepository`
- `ModelRegistryRepository`

其中数据库同学本轮最需要优先支撑的是前 3 个里的前 2 个：

- dashboard 读模型
- feature snapshot 读模型

也就是说，后端最晚只需要你们提供：

1. dashboard 所需聚合结果
2. point-in-time 的 feature snapshot

---

## 3. 必须先统一的主键与时间规则

这部分是对接成败的关键。

### 3.1 主键规则

前端和后端一律使用：

- `match_id`

要求：

- 必须是 canonical match id
- 不能直接拿 `issue_no + seq`
- 不能直接拿 source fixture id

所以数据库层必须有一层映射能力，把这些东西对齐到 canonical match：

- 体彩官方场次
- 各数据源比赛
- odds 源比赛
- lineup 源比赛

最少要有一张映射表或等价视图：

- `match_mappings`

推荐字段：

- `match_id`
- `source`
- `source_match_id`
- `mapping_confidence`
- `mapping_method`
- `created_at`
- `updated_at`

### 3.2 时间规则

所有给后端的赛前数据都必须满足 point-in-time 约束。

后端当前支持的 cutoff：

- `sale_time`
- `stop_time`
- `kickoff_minus_90m`
- `confirmed_lineup`

数据库层必须保证：

- 任意一个 `cutoff_type` 下返回的数据，只能包含该时点前已知的信息
- 不能把赛后回填字段混入赛前 snapshot

这意味着所有关键记录至少要能追溯：

- `available_at`
- `captured_at`
- `snapshot_time`

如果数据库没有这套时间语义，后端虽然能接，但训练和预测会发生时间泄漏。

---

## 4. 第一阶段建议提供的数据库对象

为了让后端尽快从 fake repo 切到真实 repo，建议数据库层优先给这 6 组对象。

### 4.1 `matches`

用途：

- canonical 比赛主表
- 给 dashboard 和 prediction 提供比赛骨架

建议字段：

- `match_id`
- `competition_name`
- `season`
- `match_date`
- `kickoff_time`
- `home_team_id`
- `home_team_name`
- `away_team_id`
- `away_team_name`
- `venue_name`
- `is_neutral_venue`
- `match_status`

### 4.2 `lottery_issue_matches`

用途：

- 体彩官方期号和场次信息
- command center 的 issue 视角

建议字段：

- `issue_no`
- `issue_date`
- `sale_time`
- `stop_time`
- `settle_time`
- `match_seq`
- `match_id`
- `competition`
- `home_team`
- `away_team`
- `enabled_play_types`
- `official_handicap`
- `official_result`
- `official_full_time_score`
- `official_half_time_score`

说明：

- `match_id` 必须已经和 canonical 比赛对齐

### 4.3 `feature_snapshots`

用途：

- prediction 主输入
- match lab 的 feature rows
- 后续训练数据切片

这是当前最关键的一张表。

建议字段：

- `feature_snapshot_id`
- `match_id`
- `cutoff_type`
- `snapshot_time`
- `feature_set_version`
- `stale`
- `warnings_json`
- `features_json`

其中：

- `features_json` 建议先用 jsonb，键是 feature name，值是数值
- 后端当前需要的是数值型特征

当前最小特征集建议先支持：

- `team_shots_on_target_avg_last_5`
- `opp_shots_on_target_faced_avg_last_5`
- `rest_days_delta`
- `missing_starting_goalkeeper_flag`
- `closing_odds_delta`

说明：

- 第一阶段只要这 5 个能稳定提供，XGBoost 推理链路就能先接真数据
- 后续再扩展更多 feature names

### 4.4 `dashboard_match_snapshots`

用途：

- `GET /dashboard/matches/{matchId}/lab`

这张表或视图本质上是单场展示读模型，建议数据库层直接提供“面向页面”的聚合对象，而不是让后端现拼十几张表。

建议字段：

- `match_id`
- `cutoff_type`
- `issue_code`
- `subtitle`
- `title`
- `handicap`
- `snapshot_label`
- `confidence_grade`
- `scoreline_text`
- `scoreline_copy`
- `hero_metrics_json`
- `probability_summary`
- `probability_items_json`
- `lineup_predicted`
- `lineup_confirmed`
- `absences_json`
- `signals_json`
- `feature_rows_json`
- `odds_events_json`
- `sources_json`
- `stale`
- `warnings_json`

如果你们不想建专门页面表，也可以提供多个基础表，由后端 repo 聚合。但第一阶段为了加快交付，我更建议给一个聚合视图。

### 4.5 `dashboard_issue_snapshots`

用途：

- `GET /dashboard/command-center`

建议字段：

- `issue_no`
- `date`
- `cutoff_type`
- `competition`
- `cutoff_time`
- `coverage_summary`
- `alert_count`
- `actions_json`
- `queue_matches_json`
- `crawl_health_json`
- `timeline_json`
- `warnings_json`
- `stale`
- `meta_warnings_json`

这也是读模型对象，目标是减少后端初期聚合复杂度。

### 4.6 `predictions`

用途：

- 保存预测落库结果

建议字段：

- `prediction_id`
- `match_id`
- `cutoff_type`
- `target`
- `model_version`
- `feature_snapshot_id`
- `probabilities_json`
- `generated_at`

说明：

- 这张表不是本轮阻塞项，但后端已经预留了保存能力

---

## 5. Dashboard 对数据库的实际输出要求

### 5.1 Command Center 页面至少需要的数据

后端最终要返回：

- `context`
- `actions`
- `queueMatches`
- `crawlHealth`
- `timeline`
- `warnings`

#### `context` 必填字段

- `date`
- `issueNo`
- `competition`
- `cutoffTime`
- `cutoffType`
- `coverageSummary`
- `alertCount`

#### `queueMatches` 每条必填字段

- `matchId`
- `issueMatchCode`
- `displayTitle`
- `metaLine`
- `coverageLabel`
- `coverageStatus`
- `metrics`
- `confidence`

### 5.2 Match Lab 页面至少需要的数据

后端最终要返回：

- `context`
- `matchId`
- `actions`
- `hero`
- `probability`
- `lineup`
- `signals`
- `featureRows`
- `oddsEvents`
- `sources`

这里最容易缺的是：

- `lineup.confirmed`
- `sources`
- `oddsEvents`
- `featureRows`

如果这些字段短期拿不全，也建议数据库层先给默认空结构，不要缺 key。

---

## 6. Prediction 对数据库的实际输出要求

### 6.1 输入

预测接口目前读取：

- `match_id`
- `cutoff_type`

然后数据库层必须能给到：

- 一个唯一的 `feature_snapshot_id`
- 一个有序可映射的 feature key/value 集合

后端当前通过模型注册表中的 `feature_names` 做顺序校验，因此数据库层要保证：

- `features_json` 中至少覆盖模型要求的全部特征
- 特征名严格稳定，不要同义词混用

### 6.2 错误约定

数据库层如果拿不到 snapshot，后端会返回：

- `SNAPSHOT_NOT_FOUND`

如果 snapshot 有，但是缺字段，后端会返回：

- `FEATURE_VALIDATION_FAILED`

所以数据库层最好能区分两类问题：

1. 这个 match/cutoff 根本没有 snapshot
2. 这个 snapshot 存在，但特征不完整

---

## 7. 训练入口对数据库的最低要求

当前训练接口只需要数据库层先支持“参数合法性校验”，不要求完整训练实现。

后续真正接训练时，数据库层需要提供：

- 某个 `target`
- 某个 `cutoff_type`
- 某个 `date_range`
- 某个 `feature_set_version`

对应的训练样本集。

建议至少能产出一张训练视图：

- `training_rows_wdl_v1`

建议字段：

- `match_id`
- `match_date`
- `cutoff_type`
- `feature_snapshot_id`
- `feature_set_version`
- `label_wdl`
- `features_json`

后续可以再扩：

- `label_handicap`
- `label_total_goals`

---

## 8. 数据库同学本轮最小交付建议

如果只做最小闭环，请优先按这个顺序交付：

### P0

- canonical `match_id`
- `lottery_issue_matches`
- `feature_snapshots`
- `dashboard_issue_snapshots`
- `dashboard_match_snapshots`

### P1

- `predictions`
- 训练视图
- 更完整的 odds / lineup / source freshness 字段

---

## 9. 强约束：不能踩的坑

### 9.1 不要把 post-match 字段塞进 pre-match snapshot

例如这些不能直接进赛前 snapshot：

- 当前比赛 `xg`
- 当前比赛 `shots`
- 当前比赛 `possession`
- 当前比赛 `full_time_score`

这些只能存在于历史事实层，不能出现在当前待预测比赛的 snapshot 中。

### 9.2 不要让 `match_id` 混用

禁止：

- 这页用 canonical `match_id`
- 下一页又用 source fixture id

否则前端和后端会出现跨页跳转失配。

### 9.3 特征名必须稳定

不能今天叫：

- `closing_odds_delta`

明天改成：

- `odds_delta_close`

模型运行时依赖精确特征名。

---

## 10. 推荐对接方式

建议数据库同学按以下方式交付：

1. 先给一版字段清单确认
2. 再给建表或建视图 SQL
3. 再给 3-5 条真实样本数据
4. 后端据此实现 `PostgresDashboardRepository` 和 `PostgresFeatureSnapshotRepository`

这样能最快从 fake repository 切到真数据。

---

## 11. 当前后端代码对应位置

数据库同学如果要看后端真实依赖，可以参考这些文件：

- `backend/app/repositories/interfaces.py`
- `backend/app/schemas/dashboard.py`
- `backend/app/schemas/predictions.py`
- `docs/api-contract.md`

---

## 12. 一句话版本

对数据库层来说，当前最重要的不是“把所有原始数据都给出来”，而是先稳定提供两类对象：

- `dashboard` 聚合读模型
- `point-in-time feature snapshot`

只要这两类对象稳定，后端就能先把 dashboard 和 XGBoost 推理都接上。
