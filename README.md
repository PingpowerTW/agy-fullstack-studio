# ⚡ agy-fullstack-studio
### 本地持久化全端開發 AI 工作室 · Local Persistent Full-Stack AI Developer Studio

---

## 🇹🇼 繁體中文（預設） · [English](./README_EN.md)

### 導覽
[1. 專案總覽](#1-專案總覽與核心價值) · 
[2. 核心功能](#2-核心功能與能力說明) · 
[3. 目錄結構](#3-儲存庫目錄結構) · 
[4. 團隊協作協議](#4-團隊角色與協作協議) · 
[5. 自動化門禁](#5-自動化驗證門禁) · 
[6. 安裝與快速入門](#6-安裝與快速入門) · 
[7. 實戰開發工作流](#7-實戰開發工作流) · 
[8. 測試驗證](#8-測試驗證) · 
[9. 授權條款](#9-授權條款)

---

## 1. 專案總覽與核心價值

在單純依賴 AI 進行程式碼開發時，缺乏結構的對話往往會導致專案架構迅速腐爛：硬編碼的 Magic Numbers、缺漏的 DTO 驗證、雜亂無章的資料庫 SQL 拼接、沒有單元測試的裸奔程式碼，甚至是意外將敏感 Secret API Keys 提交至 Git 倉庫。

`agy-fullstack-studio` 是一個專為 **Antigravity (AGY) 平台** 與 AI 助理設計的**生產級全端應用開發工作室模板**。它引入了大型軟體開發團隊的**角色分工（3-Tier Hierarchy）**、**自動化門禁（Automated Hooks）**與**路徑限制編碼規範（Path-scoped Rules）**，讓您的 AI 助理能像一隻訓練有素的虛擬研發團隊一樣，嚴格遵守軟體工程最佳實踐。

### 為什麼使用本工作室模板？

| 現有 AI 開發的問題 | 傳統方案的缺陷 | AGY Full-Stack Studio 的解法 |
| :--- | :--- | :--- |
| **代碼腐爛與 Magic Numbers** | 依賴人工手動在 Code Review 中抓錯 | **Path-Scoped Rules**：強制路徑層級的防禦性編碼規範 |
| **前後端介面契約破裂** | 前後端改動不同步，對接時才發現噴錯 | **validate-api-schema** 門禁：自動比對 TS 型別與 OpenAPI JSON |
| **破壞性資料庫變更** | 無 Up/Down Migration，導致生產環境無法 Rollback | **validate-db-migrations**：強制雙向 Migration SQL 驗證 |
| **機密變數洩漏** | 手動寫入 `.env` 或 Hardcoded API Key 提交 | **validate-secrets** 門禁：靜態掃描阻擋 Secrets 外洩 |
| **AI 生成通用/廉價 UI** | 生成的網頁充斥 AI 漸層與過多 Emoji | **Wow Aesthetics**：深度整合 6 大高級 UI/UX 實作與審查技能 |

---

## 2. 核心功能與能力說明

### 👥 3 層工作室角色分工 (3-Tier Hierarchy)
模擬真實軟體公司，將 AI 分派給 8 席專門的 Agent（定義於 `.agents/agents/`）：
*   **Tier 1 - Directors (願景與決策)**：`product-manager` (商業邏輯與 PRD)、`system-architect` (架構決策與 ADR)、`delivery-manager` (進度與發佈)。
*   **Tier 2 - Leads (部門組長與門禁)**：`frontend-lead` (視覺美感與前端架構)、`backend-lead` (API 品質與效能)、`devops-lead` (部署與資源額度)、`qa-lead` (測試覆蓋率把關)、`security-lead` (安全防禦)。
*   **Tier 3 - Specialists (專業工程師)**：負責 UI/UX、狀態管理、資料庫實作等細部代碼。

### ⚡ 核心 Slash Commands (Skills)
在會話中可以使用以下自訂技能：
*   **啟動**：`/start` (狀態探測與引導) | `/setup-stack` (自動生成目錄與 Docker 範本) | `/detect-architecture` (分析現有技術棧)
*   **設計**：`/prd` (需求設計) | `/db-schema` (資料庫建模) | `/api-spec` (API 契約) | `/design-system` (視覺規範)
*   **開發**：`/create-stories` (任務拆分) | `/dev-story` (分支開發鎖定) | `/story-done` (交付 UAT) | `/refactor` (壞味道重構)
*   **稽核**：`/db-audit` (SQL 效能) | `/security-audit` (安全掃描) | `/perf-audit` (效能分析)

---

## 3. 儲存庫目錄結構

```
agy-fullstack-studio/
│
├── 📄 AGENTS.md                    # 本專案主控制設定與全局 Rules
├── 📄 README.md                    # 本文件
│
├── 📁 .agents/                     # Antigravity 專案自訂目錄
│   ├── 📄 settings.json            # 權限、安全與 hooks 載入規則
│   │
│   ├── 📁 agents/                  # 8 位虛擬全端專家的定義檔
│   │   ├── product-manager.md      
│   │   ├── system-architect.md     
│   │   ├── delivery-manager.md     
│   │   ├── frontend-lead.md       
│   │   ├── backend-lead.md         
│   │   ├── devops-lead.md          
│   │   ├── qa-lead.md              
│   │   └── security-lead.md        
│   │
│   ├── 📁 skills/                  # Slash Commands (Skills) 指令集
│   │   ├── start/                  
│   │   ├── setup-stack/            
│   │   ├── db-schema/              
│   │   ├── api-spec/               
│   │   ├── dev-story/              
│   │   └── security-audit/         
│   │
│   ├── 📁 hooks/                   # 自動化校驗 Hooks 腳本
│   │   ├── validate-secrets.js     #   機密掃描器核心
│   │   ├── validate-secrets.sh     #   機密掃描器外殼
│   │   ├── validate-api-schema.js  #   API 契約校驗器核心
│   │   ├── validate-api-schema.sh  #   API 契約校驗器外殼
│   │   ├── validate-db-migrations.js#  資料庫遷移校驗器核心
│   │   └── validate-db-migrations.sh#  資料庫遷移校驗器外殼
│   │
│   └── 📁 docs/
│       └── templates/              # 4 大工程文件模板
│           ├── prd-template.md     #   產品需求文件範本
│           ├── adr-template.md     #   架構決策紀錄範本
│           ├── api-spec-template.yaml# OpenAPI 規格書範本
│           └── db-schema-template.sql# 遷移 SQL 範本
│
└── 📁 src/
    ├── 📁 frontend/                # 前端應用層，載入獨立規則 README.md
    ├── 📁 backend/                 # 後端服務層，載入獨立規則 README.md
    ├── 📁 db/                      # 資料庫變更層，載入獨立規則 README.md
    └── 📁 devops/                  # 運維容器層，載入獨立規則 README.md
```

---

## 4. 團隊角色與協作協議

為了實現高品質的專案交付，AI 助理在運作時必須嚴格遵守以下**協作協議 (Collaboration Protocol)**：

1.  **向上提報 (Escalation)**：當開發中遇到需求衝突（如 UI 設計無法滿足商業邏輯），必須向上提報給 `product-manager` 裁決；若遇到技術瓶頸（如資料庫連線超載），則提報給 `system-architect` 與 `backend-lead`。
2.  **簽核流程 (Sign-off Gate)**：
    *   **前端發佈**：必須經由 `frontend-lead` 確認符合 Anti-Slop 規範與無障礙標準。
    *   **後端發佈**：必須經由 `backend-lead` 執行 `/db-audit` 並通過 N+1 查詢檢查。
    *   **安全放行**：必須經由 `security-lead` 執行 `/security-audit`，確無高危漏洞。
    *   **專案交付**：必須經由 `qa-lead` 確認單元測試覆蓋率達 80% 門檻，並取得測試憑證。

---

## 5. 自動化驗證門禁

本專案配置的 Hooks 會在特定編輯與 Git 操作時自動執行，確保任何違規代碼無法進入專案：

```
[代碼編寫/變更] ──► 觸發 Post-Tool ──► validate-api-schema.sh ──► 失敗? ──► 阻擋並要求修正
                                  └──► validate-db-migrations.sh 
                                  
[準備 Git 提交] ──► 觸發 Pre-Commit ──► validate-secrets.sh ────► 發現金鑰? ──► 阻擋 Commit
```

*   **validate-secrets**：使用特徵 Regex 與熵值分析，動態檢測程式碼中是否包含 OpenAI (`sk-...`)、Google API 等敏感金鑰與 Postgres/MySQL 的連線帳密，防止機密洩漏。
*   **validate-api-schema**：校驗前後端 TypeScript 定義與 Swagger yaml，確保型別未閉合括號或契約缺失時發出警示。
*   **validate-db-migrations**：強制所有 `src/db/migrations/` 下的檔案符合 `YYYYMMDDHHMMSS` 命名規範，且內容必須同時包含 Up 與 Down SQL 語法，拒絕破壞性 DDL。

---

## 6. 安裝與快速入門

### 1. 套用模板
將 `agy-fullstack-studio` 的 `.agents/` 目錄與 `AGENTS.md` 複製到您全端專案的根目錄中：
```bash
cp -r agy-fullstack-studio/.agents /path/to/your-project/
cp agy-fullstack-studio/AGENTS.md /path/to/your-project/
```

### 2. 啟動會話與初始化
在您的專案根目錄下，開啟 Antigravity 會話並執行初始化：
```bash
/start
```
系統會根據現有專案的結構（是否有 PRD、API 型別或代碼）提供引導。如果您是全新專案，可以先執行：
```bash
/setup-stack
```
這將會為您在專案根目錄下自動建立標準的前端、後端、資料庫與 DevOps 架構目錄。

---

## 7. 實戰開發工作流 (5 分鐘實戰)

```
/start (偵測起點) 
  └──► /prd (撰寫商業邏輯) 
         └──► /db-schema (資料庫設計 & ERD)
                └──► /api-spec (前後端 API 型別對齊)
                       └──► /dev-story (分支開發) ──► 執行 /verify ──► /story-done
```

1.  **需求分析**：輸入 `/prd`，PM 會引導您填寫需求，生成 `docs/PRD.md`。
2.  **資料庫設計**：輸入 `/db-schema`。架構師會為您產出 Mermaid ER 關係圖，並在 `src/db/migrations/` 下生成雙向 SQL 變更檔。
3.  **API 對齊**：輸入 `/api-spec`。生成標準的 OpenAPI Swagger 規格，並自動在 `src/frontend/types/` 與 `src/backend/dto/` 下生成 TypeScript 介面。
4.  **開發任務**：輸入 `/create-stories` 分解 PRD 為細部 User Story。隨後輸入 `/dev-story <ID>` 切換至 Git feature 分支並開始開發。
5.  **測試與交付**：開發完成後，輸入 `/test-gen` 自動生成單元測試，並使用 `/story-done` 交付 UAT 審查。自動化 Hooks 會確保您的代碼中沒有 Secrets，且 Migration 檔案規格正確。

---

## 8. 測試驗證

您可以手動執行校驗腳本來確認自動化門禁的正確性：

```bash
# 測試機密掃描器 (可傳入特定檔案進行測試)
node .agents/hooks/validate-secrets.js src/backend/app.ts

# 測試資料庫遷移校驗器
node .agents/hooks/validate-db-migrations.js src/db/migrations/20260708120000_init.sql
```

---

## 9. 授權條款

本專案採用 **MIT 授權條款** 釋出。詳細內容請參閱 [LICENSE](./LICENSE) 檔案。
