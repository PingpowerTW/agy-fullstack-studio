-- +migrate Up
-- 升級 Schema 腳本

CREATE TABLE IF NOT EXISTS examples (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 對經常做為過濾/JOIN 條件的欄位建立索引
CREATE INDEX IF NOT EXISTS idx_examples_name ON examples(name);

-- +migrate Down
-- 回滾 Schema 腳本 (必須能完整還原 Up 做的所有操作)

DROP INDEX IF EXISTS idx_examples_name;
DROP TABLE IF EXISTS examples;
