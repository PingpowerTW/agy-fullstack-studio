# Database Migration Standards

本目錄存放資料庫的 Schema 變更歷史與 Seed 數據。

---

## 📅 資料庫遷移命名規則 (Naming Rules)

> [!IMPORTANT]
> - 所有的 Migration 檔案必須以 14 位數字時間戳為前綴，格式為：`YYYYMMDDHHMMSS_description_name.sql`（例如 `20260708120000_create_users_table.sql`）。
> - 禁止手動在資料庫直接執行 ALTER/CREATE 指令。所有變更必須透過 Migration 腳本完成，確保環境一致性。

---

## 🧱 遷移腳本規範 (DDL Standards)
1. **雙向指示註解**：
   - 每個腳本必須包含明確的 Up (升級) 與 Down (回滾) 區塊：
     ```sql
     -- +migrate Up
     CREATE TABLE users (...);

     -- +migrate Down
     DROP TABLE users;
     ```
2. **防破壞性變更**：
   - Down 指令必須確實能還原 Up 指令所做的所有變更，且不能影響已有數據的完整性。
   - 在執行破壞性 DDL（如 DROP COLUMN）前，必須先在 ADR 中進行風險評估，並提供兩階段部署方案（先 Rename/Deprecate，確認無引用後再 Drop）。
3. **索引覆蓋**：
   - 所有定義為 FOREIGN KEY 的欄位，必須同時建立 Index 索引，防範大表 JOIN 查詢效能雪崩。
