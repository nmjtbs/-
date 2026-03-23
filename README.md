# Football Intelligence Desk

一个面向中国体育彩票足球竞猜场景的研究与决策控制台。

当前仓库已经包含两部分：

- 前端工作台：`Vite + React + TypeScript`
- 后端骨架：`FastAPI + Pydantic + XGBoost runtime`

项目目标不是做普通比分展示页，而是做一套围绕 **point-in-time 特征快照、玩法概率输出、赛前证据展示** 的内部分析平台。  
当前重点支持的链路是：

- 体彩期号视角的 `Command Center`
- 单场证据视角的 `Match Lab`
- 基于 `feature_snapshot` 的 XGBoost 赛前推理
- 异步训练入口骨架

## 当前状态

已经完成：

- 设计系统与信息架构
- 前端路由、状态管理、typed contract、mock adapter
- Dashboard API contract
- FastAPI 后端骨架
- `GET /api/v1/dashboard/command-center`
- `GET /api/v1/dashboard/matches/{matchId}/lab`
- `POST /api/v1/predictions/matches/{matchId}`
- `POST /api/v1/admin/training-runs`
- `GET /api/v1/admin/training-runs/{runId}`
- mock repository
- file-based mock model registry
- backend tests

当前还没做：

- 真实数据库 repository
- 爬虫接入
- 完整训练平台
- 自动模型发布
- 世界杯专项 projection

## 技术栈

### Frontend

- `Vite`
- `React`
- `TypeScript`
- `react-router-dom`
- `zustand`

### Backend

- `FastAPI`
- `Pydantic v2`
- `SQLAlchemy 2.0`
- `XGBoost`
- `RQ + Redis` 训练队列骨架
- `pytest`

## 仓库结构

```text
.
├── backend/                  # FastAPI 后端
│   ├── app/
│   │   ├── api/              # 路由
│   │   ├── core/             # 配置、HTTP 错误、middleware
│   │   ├── jobs/             # 异步训练队列接入
│   │   ├── model_runtime/    # XGBoost 模型运行时
│   │   ├── repositories/     # repository interface + mock impl
│   │   ├── schemas/          # Pydantic schema
│   │   └── services/         # 业务服务层
│   ├── models/mock/          # mock 模型元数据
│   └── tests/                # 后端测试
├── docs/                     # 设计、API、对接文档
├── src/                      # React 前端
├── styles/                   # 全局样式和 design tokens
├── package.json              # 前端脚本
└── README.md
```

## 快速开始

### 1. 启动前端

要求：

- `Node.js 18+`
- `npm`

安装依赖并启动：

```bash
npm install
npm run dev
```

常用命令：

```bash
npm run build
npm run preview
npm run typecheck
```

### 2. 启动后端

要求：

- `Python 3.9+`
- 建议单独使用虚拟环境

进入后端目录并安装：

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install .[dev]
```

启动 FastAPI：

```bash
uvicorn app.main:app --reload --app-dir .
```

常用命令：

```bash
pytest -q tests
```

### 3. 前后端当前运行方式

当前前端默认还是通过 mock service 工作；后端已经可以独立运行并返回真实 HTTP 结构，但还没有把前端的 service 层切到真实后端地址。

也就是说现在是：

- 前端：可独立开发 UI 和 contract
- 后端：可独立开发 API 和 repository
- 联调：下一步再把前端改成请求真实 backend

## 已实现接口

### Dashboard

- `GET /healthz`
- `GET /api/v1/dashboard/command-center`
- `GET /api/v1/dashboard/matches/{matchId}/lab`

### Prediction

- `POST /api/v1/predictions/matches/{matchId}`

当前正式支持：

- `target = wdl`

### Training Admin

- `POST /api/v1/admin/training-runs`
- `GET /api/v1/admin/training-runs/{runId}`

## 核心约束

### 1. 一切以 point-in-time 为前提

所有赛前展示和赛前预测，都必须严格遵守所选 cutoff：

- `sale_time`
- `stop_time`
- `kickoff_minus_90m`
- `confirmed_lineup`

不能把当前比赛的赛后统计混入赛前 snapshot。

### 2. `matchId` 必须是 canonical key

前端、后端、数据库必须统一使用 canonical `match_id`。  
不能直接用：

- 体彩序号
- 第三方源站 fixture id

### 3. 模型读取的是 `feature_snapshot`

当前 XGBoost 推理链路不会在请求里临时拼“最新数据”，而是固定读取：

- `feature_snapshot_id`
- `cutoff_type`
- 有序特征向量

## 关键文档

### 产品与设计

- [DESIGN.md](./DESIGN.md)
- [docs/interface-architecture.md](./docs/interface-architecture.md)
- [docs/page-wireframes.md](./docs/page-wireframes.md)
- [docs/ui-development-tasks.md](./docs/ui-development-tasks.md)

### API 与后端

- [docs/api-contract.md](./docs/api-contract.md)
- [docs/backend-database-handoff.md](./docs/backend-database-handoff.md)
- [docs/plan-eng-review-football-prediction.md](./docs/plan-eng-review-football-prediction.md)

## 数据库与爬虫协作边界

当前分工假设是：

- 爬虫模块：由别的同学负责
- 数据库表与视图：由别的同学负责
- 当前仓库：先把前端、后端、contract、模型运行时和联调边界定住

数据库同学优先需要提供的对象已经写在：

- [docs/backend-database-handoff.md](./docs/backend-database-handoff.md)

最关键的是两类对象：

- dashboard 聚合读模型
- point-in-time `feature_snapshots`

## 下一步建议

最推荐的推进顺序是：

1. 数据库同学按对接文档提供真实表或视图
2. 后端新增 `PostgresDashboardRepository`
3. 后端新增 `PostgresFeatureSnapshotRepository`
4. 前端把 mock service 切到真实 backend
5. 补 `Data Coverage`、`Training Studio` 页面
6. 扩展 `wdl` 以外的目标，如 `handicap`、`total_goals`

## 备注

当前仓库里的后端模型注册表使用的是 mock 元数据文件，仅用于打通运行时和测试流程，不代表最终模型产物管理方案。
