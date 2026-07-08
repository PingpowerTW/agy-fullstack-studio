# Antigravity Full-Stack Developer Studio

`Antigravity Full-Stack Developer Studio` 是一套基於 [Antigravity-Game-Studios](https://github.com/Donchitos/Antigravity-Game-Studios) 開發理念、重新設計的**生產級全端應用開發 AI 工作室環境**。

它提供了一套完整的角色架構、工作流斜線指令、自動化門禁驗證以及路徑編碼限制規則，旨在將一個普通的 AI 開發會話升級為具備專業工程規範的虛擬全端研發團隊。

---

## 🚀 快速開始 (Getting Started)

### 1. 初始化專案
如果您在新建的或現有的全端專案中使用本模板：
1. 將本專案的所有檔案複製到您的專案根目錄中。
2. 啟動 Antigravity 會話：
   ```bash
   claude
   ```
3. 執行初始化引導指令：
   ```bash
   /start
   ```
   系統將會自動檢測您目前的專案狀態，並推薦對應的開發工作流。

---

## 👥 角色與階層 (Studio Hierarchy)
本工作室將代碼與決策分派給以下不同階層的專門代理人（定義於 `.agents/agents/`）：

1.  **Tier 1: Directors (願景與決策)**：
    *   `product-manager` (PM)：審查與拆分商業需求。
    *   `system-architect` (架構師)：負責系統設計與技術選型。
    *   `delivery-manager` (DM)：監控開發進度與發佈。
2.  **Tier 2: Department Leads (部門組長與品質守門員)**：
    *   `frontend-lead`：前端視覺美感與架構把關（整合 6 大 UI/UX 技能）。
    *   `backend-lead`：後端 API 品質、快取與 DB 查詢效能把關。
    *   `devops-lead`：基礎設施 CI/CD 與容器化資源把關。
    *   `qa-lead`：自動化測試與覆蓋率（80%）門禁。
    *   `security-lead`：靜態安全漏洞與 API Keys 洩漏把關。

---

## ⚡ 核心 Slash Commands (Skills)
您可以在 Antigravity 中使用以下指令（實作於 `.agents/skills/`）：
*   `/start`：啟動全端專案開發引導。
*   `/setup-stack`：初始化專案的前後端、資料庫與運維基礎目錄。
*   `/prd`：撰寫或審查 PRD 需求規格書。
*   `/db-schema`：資料庫 Schema 設計與變更（自動生成 Mermaid ERD 與 SQL 遷移腳本）。
*   `/api-spec`：設計前後端 OpenAPI 契約，自動產出對應型別。
*   `/dev-story`：鎖定特定 Story 開始分支開發，自動載入路徑規範。
*   `/story-done`：將 Story 交付 QA 進行整合與 UAT 審查。
*   `/security-audit`：進行全端代碼安全掃描與相依庫漏洞審查。

---

## 🛡️ 自動化驗證門禁 (Automated Hooks)
專案內建 hooks（實作於 `.agents/hooks/` 且設定於 `.agents/settings.json`），會自動執行以下稽核：
*   **防止機密洩漏**：`validate-secrets.sh` 掃描並阻止任何明文密鑰、密碼提交至 Git。
*   **API 契約校驗**：`validate-api-schema.sh` 校驗前後端介面型別的一致性。
*   **資料庫遷移校驗**：`validate-db-migrations.sh` 強制 Migration 命名規範且必須包含 Down (回滾) 腳本。
