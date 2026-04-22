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

## Docs

完整規格與設計請直接看 [docs/README.md](./docs/README.md)。

- [docs/prd.md](./docs/prd.md): 產品範圍、角色、流程與 MVP 邊界
- [docs/system-architecture.md](./docs/system-architecture.md): 系統架構、部署與責任切分
- [docs/technical-design-cloudflare-v0.1.md](./docs/technical-design-cloudflare-v0.1.md): Cloudflare-first 技術設計基線
- [docs/api-contract.md](./docs/api-contract.md): API request/response 與驗證規格
- [docs/domain-rules.md](./docs/domain-rules.md): 狀態流轉、指派與媒體規則
- [docs/sa-decisions-mvp.md](./docs/sa-decisions-mvp.md): 已定案的 MVP 技術決策

## Current Baseline

- Frontend 與 API 目前維持在同一個 SvelteKit codebase
- 部署目標是 Cloudflare Workers
- 資料庫使用 D1
- 圖片儲存使用 R2
