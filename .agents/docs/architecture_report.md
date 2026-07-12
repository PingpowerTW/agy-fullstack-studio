# Antigravity Full-Stack Developer Studio — 系統架構分析報告

本報告針對 **Antigravity Full-Stack Developer Studio** 的專案結構、配置管理、自動化門禁（Hooks）及核心委派匯流排（Message Bus）進行深入的靜態分析與架構說明。

---

## 1. 專案目錄結構分析

以下為本專案的整體目錄結構與核心檔案配置。所有路徑均以專案根目錄為基準進行相對路徑標記：

```text
.
├── AGENTS.md                          # 全端工作室的主控制設定與虛擬團隊協作協議
├── .agents/                           # Agent 機制的核心工作區
│   ├── settings.json                  # 安全權限與自動化門禁 (Hooks) 的載入與觸發規則
│   ├── core/                          # 核心訊息匯流排與代理人模擬執行環境
│   │   ├── delegation.ts              # 核心訊息匯流排（MessageBus）與 Agent 狀態機實作
│   │   ├── package.json               # 核心執行環境依賴與啟動腳本
│   │   └── node_modules/              # 執行依賴模組
│   ├── agents/                        # 虛擬團隊 8 個角色的 Markdown 定義與指令約束檔
│   │   ├── sentinel.md                # 專案指揮官定義
│   │   ├── orchestrator.md            # 協調員定義
│   │   ├── system-architect.md        # 系統架構師定義
│   │   ├── product-manager.md         # 產品經理定義
│   │   ├── backend-lead.md            # 後端主導定義
│   │   └── ...                        # 其他角色定義檔
│   ├── hooks/                         # 自動化門禁檢驗腳本（Shell 外殼與 Node.js 邏輯）
│   │   ├── validate-secrets.sh        # 敏感資訊掃描器 Shell 啟動器
│   │   ├── validate-secrets.js        # 敏感資訊掃描器 Node.js 實作
│   │   ├── validate-api-schema.sh     # API 契約校驗器 Shell 啟動器
│   │   ├── validate-api-schema.js     # API 契約校驗器 Node.js 實作
│   │   ├── validate-db-migrations.sh  # 資料庫遷移校驗器 Shell 啟動器
│   │   └── validate-db-migrations.js  # 資料庫遷移校驗器 Node.js 實作
│   ├── memory/                        # 動態寫入的專案記憶與執行狀態記錄區
│   │   ├── BRIEFING.md                # 專案任務摘要與驗收條件（Sentinel 產生）
│   │   ├── plan.md                    # 動態產生的專案執行計劃（Orchestrator 產生）
│   │   └── progress.log               # 全域訊息流轉日誌（MessageBus 寫入）
│   └── docs/                          # 系統架構與審計報告目錄
│       ├── architecture_report.md     # [本報告] 系統架構分析報告
│       └── tech_debt_report.md        # 技術債與安全審計報告
└── src/                               # 實質開發原始碼目錄
    ├── frontend/                      # 前端網頁應用原始碼
    ├── backend/                       # 後端伺服器與 API 原始碼
    ├── db/                            # 資料庫配置
    │   └── migrations/                # 資料庫變更遷移腳本 (.sql)
    └── devops/                        # 基礎設施與部署配置
```

### 核心檔案互動關係說明
1. **控制層面 (`AGENTS.md` -> `.agents/agents/`)**：`AGENTS.md` 定義了跨角色的協作規則。各角色 Markdown 檔案則定義了特定 Agent 的 prompt、專業邊界與行為指南。
2. **安全與門禁 (`.agents/settings.json` -> `.agents/hooks/`)**：平台主程式在啟動時讀取 `settings.json` 的安全配置，在呼叫特定開發工具前後攔截執行流，執行 `hooks/` 目錄下的驗證腳本。
3. **執行與流轉 (`.agents/core/delegation.ts` -> `.agents/memory/`)**：委派匯流排啟動後，Sentinel 與 Orchestrator 根據當前任務狀態，將協作資訊動態寫入至 `memory/` 中（例如 `BRIEFING.md` 與 `plan.md`），並由 MessageBus 將所有通訊日誌寫入 `progress.log`。

---

## 2. 虛擬團隊角色與階層關係

為了達到全自動化的全端開發，專案在 `AGENTS.md` 中設計了三層式的虛擬團隊結構（Tier 0 至 Tier 2），每層皆有其特定的職責範圍與上下級關係。

```
                    ┌─────────────────────────┐
                    │     Tier 0: Sentinel    │ (指揮官)
                    └────────────┬────────────┘
                                 │ 發送 BRIEF 指令
                                 ▼
                    ┌─────────────────────────┐
                    │ Tier 0: Orchestrator    │ (協調員)
                    └────────────┬────────────┘
                                 │ 任務指派 (TASK_ASSIGN)
                                 ▼
         ┌───────────────────────┴───────────────────────┐
         ▼                                               ▼
┌──────────────────┐                            ┌──────────────────┐
│ Tier 1: Directors│ (PM / 架構師 / 交付經理)    │  Tier 2: Leads   │ (前端/後端/QA/安全)
└──────────────────┘                            └────────┬─────────┘
                                                         │ 任務回報 (TASK_REPORT)
                                                         ▼
                                                ┌──────────────────┐
                                                │ Tier 0: Auditor  │ (驗收稽核員)
                                                └────────┬─────────┘
                                                         │ 回報結果 (AUDIT_RESULT)
                                                         ▼
                                                  VICTORY CONFIRMED!
```

### 2.1 角色階層定義

#### Tier 0: 指揮與協調 (Command & Coordination)
*   **Sentinel (專案指揮官)**：虛擬團隊的起點。負責引導工作對話、分析使用者需求，定義驗收標準並寫入 `.agents/memory/BRIEFING.md`。隨後向 Orchestrator 發送啟動訊號。
*   **Orchestrator (協調員)**：整個開發生命週期的控制核心。負責將需求拆解為 Milestone 與 Task，產生動態計畫 `.agents/memory/plan.md`。透過事件總線指派工作，追蹤進度，並在完成時向 Auditor 發起稽核。
*   **Auditor (驗收稽核員)**：獨立的品質控制角色。不參與程式碼編寫，只負責在所有 Task 完成後對工作目錄的產出物進行靜態與動態檢查，判定是否達成 Sentinel 訂定的驗收標準。

#### Tier 1: Directors (中階管理與設計)
*   **Product Manager (產品經理)**：負責消除需求模糊地帶，管理 PRD 契約。
*   **System Architect (系統架構師)**：負責系統元件設計、資料庫 Schema 定義與 API 路由規劃。
*   **Delivery Manager (交付經理)**：負責監控發佈品質與進度瓶頸。

#### Tier 2: Leads (底層開發執行)
*   **Frontend Lead (前端開發)**：負責前端元件與狀態管理實現。
*   **Backend Lead (後端開發)**：負責伺服器 API 與資料庫訪問邏輯。
*   **DevOps Lead (運維部署)**：負責容器配置與 CI/CD 流程。
*   **QA Lead (測試驗證)**：負責編寫單元測試與端到端測試。
*   **Security Lead (安全審計)**：負責程式碼安全掃描與漏洞阻擋。

### 2.2 兩階段工作流 (Two-Phase Workflow)
1.  **Phase 1 (需求釐清)**：使用者發送 `/teamwork-preview`，Sentinel 協同 Product Manager 與 System Architect 進行需求分析，產出標準化 briefing。
2.  **Phase 2 (自動委派)**：使用者發送 `/teamwork-launch` 啟動 Tier 0 指揮層，Orchestrator 根據 Briefing 分派任務給 Tier 2 Leads，並由 QA 與 Auditor 進行最終自動驗收。

---

## 3. 核心訊息匯流排委派機制與訊息流轉

`.agents/core/delegation.ts` 檔案實作了整個 Multi-Agent 模擬的核心。其內部以 Node.js `EventEmitter` 為基礎，實現了一個發行/訂閱者模式（Publish/Subscribe）的 `MessageBus`。

### 3.1 訊息結構 (Message Schema)
所有在匯流排流轉的訊息必須符合以下 TypeScript 介面：
```typescript
interface Message {
  id: string;                                                      // 訊息唯一識別碼
  sender: string;                                                  // 發送端 Agent 角色名稱
  recipient: string;                                               // 接收端 Agent 角色名稱（或 "All"）
  type: 'BRIEF' | 'PLAN' | 'TASK_ASSIGN' | 'TASK_REPORT' | 'AUDIT_REQUEST' | 'AUDIT_RESULT' | 'HEARTBEAT';
  payload: any;                                                    // 訊息內容載荷
  timestamp: string;                                               // ISO 時間戳記
}
```

### 3.2 訊息流轉鏈條 (Execution Sequence Flow)

以下是 `delegation.ts` 啟動後，各虛擬代理人之間的訊息交互與文件寫入歷程：

1.  **系統啟動 (System Boot)**
    *   主執行程序啟動並實例化 `MessageBus`、`Sentinel`、`Orchestrator`、`BackendWorker`、`Auditor`。
    *   `Sentinel` 呼叫 `boot()` 方法，向 `All` 發送 `HEARTBEAT` 訊息：
        *   `Payload: 'Sentinel service started. Initializing workspace...'`
    *   `Sentinel` 在目錄 `.agents/memory/` 寫入 `BRIEFING.md`，定義需求與驗收標準。
2.  **需求移交 (Briefing Delegation)**
    *   `Sentinel` 發送 `BRIEF` 訊息給 `Orchestrator`：
        *   `Payload: { briefingPath: '.agents/memory/BRIEFING.md', ... }`
3.  **計畫制定 (Planning)**
    *   `Orchestrator` 監聽到 `Orchestrator` 事件，解析 `BRIEF` 訊息並呼叫 `createPlan()`。
    *   `createPlan()` 初始化任務陣列，並將計畫寫入 `.agents/memory/plan.md`。
    *   `Orchestrator` 發送 `PLAN` 訊息給 `Sentinel`：
        *   `Payload: { message: 'Plan formulated and written...', planSummary: [...] }`
4.  **任務分派與執行 (Task Assignment & Execution)**
    *   `Orchestrator` 呼叫 `executeCurrentMilestone()`，將 Milestone 狀態改為 `RUNNING`。
    *   `Orchestrator` 向 `All` 發送 `HEARTBEAT` 廣播，宣告開始該里程碑。
    *   `Orchestrator` 向 `BackendWorker` 發送 `TASK_ASSIGN` 訊息：
        *   `Payload: { taskId: 't1_1', title: 'Setup Environment', ... }`
    *   `BackendWorker` 監聽到指派事件，模擬異步任務（設定 1000ms 延遲）。
    *   任務完成後，`BackendWorker` 回報 `TASK_REPORT` 訊息給 `Orchestrator`：
        *   `Payload: { taskId: 't1_1', status: 'COMPLETED', ... }`
5.  **里程碑完成與稽核請求 (Milestone Completion & Audit Request)**
    *   `Orchestrator` 接收到 `TASK_REPORT`，更新計畫並寫入 `plan.md`。
    *   判定當前里程碑所有任務均已完成後，向 `Auditor` 發送 `AUDIT_REQUEST`：
        *   `Payload: { message: 'All tasks completed successfully. Requesting final victory verification.' }`
6.  **品質稽核與勝利宣告 (Audit & Victory)**
    *   `Auditor` 接收到稽核請求，向 `All` 發送 `HEARTBEAT` 宣告開始驗收。
    *   `Auditor` 模擬驗收檢驗（設定 1500ms 延遲），隨後向 `Orchestrator` 回報 `AUDIT_RESULT` 訊息：
        *   `Payload: { passed: true, feedback: 'Automated victory check bypassed for testing.' }`
    *   `Orchestrator` 接收到結果為 `passed: true`，向 `All` 發送最終 `HEARTBEAT` 訊息：
        *   `Payload: 'VICTORY CONFIRMED! Closing framework orchestration.'`
7.  **工作階段關閉 (Session Close)**
    *   主執行程序在 5000ms 倒數結束後，呼叫 `bus.close()` 關閉日誌寫入串流並結束運行。

---

## 4. 設定檔與自動化門禁機制

為了確保 AI Agent 執行的安全與程式碼品質，本架構在 `.agents/settings.json` 中配置了安全權限邊界，並在工具鏈調用前後設計了自動化門禁機制（Hooks）。

### 4.1 權限控制與指令過濾
`settings.json` 的 `permissions` 欄位規範了代理人可執行的指令白名單與黑名單：
*   **Allowed Commands (白名單)**：僅限非破壞性指令，如 `npm test`、`npm run dev`、`docker compose up` 以及 `git status/log/diff`。
*   **Blocked Commands (黑名單)**：阻擋具有系統級破壞或敏感資訊外洩風險的指令，如強行刪除根目錄 (`rm -rf /`)、強行推動 Git 分支 (`git push --force`) 以及查看環境變數檔案 (`cat .env`)。

### 4.2 Hooks 機制運作原理
門禁機制分為兩個觸發時機點：
1.  **Pre-Tool-Use (工具使用前門禁)**：在 Agent 執行任何修改檔案、寫入指令的工具前執行。此處註冊了 `secrets-scanner`，匹配規則為 `*`（所有操作均須受檢）。
2.  **Post-Tool-Use (工具使用後門禁)**：在工具變更檔案成功後觸發，用以驗證變更內容是否符合架構規範。此處註冊了兩個校驗器：
    *   `api-schema-validator`：當變更的檔案符合 `src/frontend/types/**/*.ts` 或 `src/backend/**/*.ts` 時觸發。
    *   `migration-validator`：當變更的檔案符合 `src/db/migrations/**/*.sql` 時觸發。

### 4.3 驗證門禁腳本邏輯分析

#### A. 敏感資訊掃描器 (`.agents/hooks/validate-secrets.js`)
*   **正則過濾規則**：
    *   `API Key (Generic)`：匹配含有 key/secret/token 等鍵值且長度大於 16 位的引號字串。
    *   `OpenAI API Key`：匹配 `sk-` 開頭且長度為 48 位的金鑰。
    *   `Google API Key`：匹配 `AIzaSy` 開頭且長度為 33 位的金鑰。
    *   `Database Password URL`：匹配 PostgreSQL 連線格式 `postgres(ql)://...:...@` 中包含密碼的區段。
*   **執行流程**：若無傳入參數，則遞迴遍歷整個 `src` 與 `.agents` 目錄。一旦在檔案內容中匹配到上述正則，即回傳 `process.exit(1)` 攔截操作，否則回傳 `process.exit(0)` 放行。

#### B. API 契約校驗器 (`.agents/hooks/validate-api-schema.js`)
*   **執行流程**：
    *   對於 YAML 檔案：使用簡單的字串比對，檢查是否包含 `openapi:` 或 `swagger:` 與 `paths:`，藉此判斷是否為合格的 API 描述檔。
    *   對於 TS 檔案：採用極簡的花括號數量匹配（`{` 與 `}` 總數是否相等），若數量不一致則回報語法錯誤，退出碼為 1。

#### C. 資料庫遷移校驗器 (`.agents/hooks/validate-db-migrations.js`)
*   **執行流程**：
    *   檔案名稱校驗：必須以 8 位數字日期開頭且副檔名為 `.sql`（如 `20260711_init.sql`）。
    *   雙向變更校驗：讀取 SQL 檔案內容，必須同時包含 `Up` (或 `up`, `UP`) 與 `Down` (或 `down`, `DOWN`) 註解或指令，以確保 Rollback 機制完備，否則以退出碼 1 進行攔截。

---

## 5. 系統架構限制與改善建議

1.  **Orchestrator 與 Auditor 的硬編碼限制**：目前的 `delegation.ts` 僅為工作流模擬，其計畫生成與稽核結果均為 Mock 實現。未來應接入 LLM 語意解析器以達到真正的動態計畫拆解與真實產出物稽核。
2.  **模擬角色的缺失**：`MessageBus` 中定義了 `FrontendWorker` 與 `DatabaseWorker` 的日誌配色，但代碼中並無此二角色的類別實現，導致任務指派僅能分配給 `BackendWorker`，全端工作流不夠完整。
3.  **執行緒安全與事件阻斷風險**：由於 `EventEmitter.emit` 預設為同步執行，在事件流中的任何 Agent 監聽器若發生執行期異常，會向上擊穿 MessageBus，導致整個 Node 進程崩潰。建議在 `publish` 發送事件時加入防禦性異常隔離。
4.  **校驗機制的誤報與漏報**：目前 Hook 採用的正則與大括號計數法十分脆弱。例如，程式碼中的括號註解會導致 API 校驗失效，而無引號的 `.env` 敏感機密則會繞過 Secrets 掃描。未來應改用 AST（Abstract Syntax Tree）語法樹解析以及更嚴謹的 Fail-Closed 異常處理機制。
