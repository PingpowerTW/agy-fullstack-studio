---
name: db-schema
description: 資料庫 Schema 設計與變更計畫。生成 Mermaid 實體關係圖 (ERD) 與標準 SQL 遷移腳本。
---

# Skill: /db-schema (資料庫建模與設計)

此指令用於協助使用者進行資料庫 Schema 設計。它會解析業務實體，產生高水準的資料模型，並自動生成安全的 SQL 遷移 (Migration) 腳本。

## When to Use
- 在系統設計階段，需要對新的業務模組進行建模時。
- 需要添加新資料表或修改現有表欄位，並準備產生 Schema 變更腳本時。

## 執行邏輯與流程 (Workflow)
當使用者輸入 `/db-schema` 時：
1. **實體建模分析**：
   - 詢問使用者要建模的業務實體（如 User, Order, Payment）與實體關係（1:N, N:N）。
   - 設計每個表的主鍵、外鍵、資料型別、欄位約束（`NOT NULL`, `UNIQUE`）以及必要的索引。
2. **生成視覺化圖表**：
   - 自動生成 Mermaid ERD 語法，輸出實體關係圖。
3. **生成 SQL 遷移腳本**：
   - 生成符合 `src/db/migrations/YYYYMMDDHHMMSS_name.sql` 命名的 Migration 檔案。
   - 腳本中必須包含 `-- +migrate Up` 與 `-- +migrate Down` 兩個完整區塊，嚴禁破壞性變更（如無條件的 DROP TABLE）。
4. **安全查核**：
   - 稽核是否缺少外鍵索引（以防 Join 效能崩潰）。
   - 檢查是否對敏感個資（如密碼、信用卡號）進行了加密或去識別化儲存方案。
