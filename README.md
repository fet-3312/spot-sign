# Spot Sign

Spot Sign 是提供外勤業務回報餐廳簽約狀況的內部系統，讓業務可在外勤過程快速更新拜訪結果，主管也能追蹤餐廳指派與簽約進度。

## 專案內容

- 以地圖為主的外勤拜訪與回報流程
- 記錄餐廳簽約狀態、聯絡人、備註與現場照片
- 支援主管檢視回報紀錄與指派餐廳負責業務

## Quick Start

```sh
pnpm install
pnpm dev
```

常用指令：

```sh
pnpm check
pnpm lint
pnpm test
pnpm build
```

## Local Demo Accounts

登入本機平台基線時，可使用以下測試帳號：

- Sales rep: `rep@spot-sign.local` / `rep-demo-pass`
- Supervisor: `supervisor@spot-sign.local` / `supervisor-demo-pass`

可透過環境變數調整預設試跑區域與本機儲存位置：

- `SPOT_SIGN_DEFAULT_AREA_LATITUDE`
- `SPOT_SIGN_DEFAULT_AREA_LONGITUDE`
- `SPOT_SIGN_DEFAULT_AREA_RADIUS_METERS`
- `SPOT_SIGN_DEV_SQLITE_PATH`
- `SPOT_SIGN_DEV_OBJECT_STORAGE_PATH`

## Docs

完整規格與設計請直接看 [docs/README.md](./docs/README.md)。

- [docs/prd.md](./docs/prd.md): 產品範圍、角色、流程與 MVP 邊界
- [docs/system-architecture.md](./docs/system-architecture.md): 系統架構、部署與責任切分
- [docs/technical-design-cloudflare-v0.1.md](./docs/technical-design-cloudflare-v0.1.md): Cloudflare-first 技術設計基線
- [docs/api-contract.md](./docs/api-contract.md): API request/response 與驗證規格
- [docs/domain-rules.md](./docs/domain-rules.md): 狀態流轉、指派與媒體規則
- [docs/sa-decisions-mvp.md](./docs/sa-decisions-mvp.md): 已定案的 MVP 技術決策
- [docs/business-flows.md](./docs/business-flows.md): PD 展開後的業務流程圖與跨角色交接點
- [docs/implementation-tasks.md](./docs/implementation-tasks.md): RD/PM 可直接採用的任務拆解與交付順序
- [docs/testing-guide.md](./docs/testing-guide.md): 驗證策略、驗收清單與多 Agent 挑戰檢查方式

## Current Baseline

- Frontend 與 API 目前維持在同一個 SvelteKit codebase
- 部署目標是 Cloudflare Workers
- 資料庫使用 D1
- 圖片儲存使用 R2
