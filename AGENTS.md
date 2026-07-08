# AGENTS.md (Full-Stack Developer Studio Master Configuration)

歡迎進入 **Antigravity Full-Stack Developer Studio (全端開發工作室)**。
本專案已完全將開發會話轉化為具備「設計、實作、測試、安全與維護」完整階層的虛擬全端團隊。

---

## 📂 專案目錄結構 (Project Structure)
```
claude-code-fullstack-studio/
├── AGENTS.md                       # 本主控制設定檔
├── .agents/
│   ├── settings.json               # 權限、安全與 hooks 載入規則
│   ├── agents/                     # 3 層全端角色定義 (YAML + Markdown)
│   ├── skills/                     # 核心 Slash Commands 指令實作
│   ├── hooks/                      # 自動化校驗腳本 (Secrets, Schema, Migrations)
│   ├── rules/                      # 路徑限定編碼規範 (Path-scoped Rules)
│   └── docs/
│       └── templates/              # 商業/架構/工程文件範本 (PRD, API Spec, ADR等)
├── src/
│   ├── frontend/                   # 前端應用代碼 (React/Next.js)
│   ├── backend/                    # 後端服務代碼 (Node/NestJS)
│   ├── db/
│   │   └── migrations/             # 資料庫 Schema 變更歷史 (PostgreSQL/MySQL)
│   └── devops/                     # 基礎設施 (Docker, IaC, CI/CD)
└── tests/                          # 全端測試套件 (Playwright, Jest)
```

---

## 👥 全端工作室階層 (Studio Hierarchy)
當遇到對應問題時，您（或 AI 助理）應透過 `invoke_subagent` 或在會話中載入對應的 Agent 身份來進行決策與實作：

### Tier 1: Directors (願景與決策)
*   **`product-manager`**：定義 PRD 商業邏輯，審核 Epic/Stories 是否滿足需求。
*   **`system-architect`**：負責架構決策、API 標準及資料庫 Schema，編寫 ADR。
*   **`delivery-manager`**：控管 Sprint 進度、任務狀態、發佈清單。

### Tier 2: Leads (部門組長與門禁)
*   **`frontend-lead`**：把關前端 State、效能與視覺（嚴格執行 Anti-Slop、Lighthouse 90+ 門檻）。
*   **`backend-lead`**：把關後端 MVC/Clean 架構、快取與 DB 查詢（N+1 漏洞防禦）。
*   **`devops-lead`**：管理 IaC、Docker、CI/CD 流程、雲端資源限制。
*   **`qa-lead`**：把關測試策略與單元測試覆蓋率（強制 80% 門檻）。
*   **`security-lead`**：把關安全（防止 SQL 注入、XSS、認證缺失、Secrets 洩漏）。

### Tier 3: Specialists (專業執行者)
*   **`ui-specialist`**, **`state-specialist`**, **`api-designer`**, **`database-engineer`**, **`infra-specialist`**, **`qa-tester`**, **`seo-accessibility-analyst`**

---

## ⚡ 核心 Slash Commands (Skills)
在 Antigravity 中可以使用以下指令（已實作於 `.agents/skills/`）：

*   **啟動**：`/start` (初始化工作流) | `/setup-stack` (初始化目錄)
*   **設計**：`/prd` (撰寫需求) | `/db-schema` (Schema 設計) | `/api-spec` (API 規格) | `/design-system` (UI 規範)
*   **開發**：`/create-stories` (拆分任務) | `/dev-story` (分支開發) | `/story-done` (交付審查) | `/refactor` (代碼重構)
*   **稽核**：`/db-audit` (資料庫稽核) | `/security-audit` (安全檢驗) | `/perf-audit` (效能檢驗)
*   **交付**：`/test-gen` (測試生成) | `/qa-check` (全面測試) | `/deploy-plan` (發佈方案) | `/changelog` (日誌生成)

---

## 🛡️ 自動化驗證門禁 (Automated Hooks)
系統會在以下時機自動執行驗證：
1.  **Pre-Commit (提交前)**：`validate-secrets.sh` 掃描敏感資訊；`validate-db-migrations.sh` 確認 DDL 檔案完整性。
2.  **Post-Edit (編輯後)**：`validate-api-schema.sh` 校驗前後端介面契約一致性。
