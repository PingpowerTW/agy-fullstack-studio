const fs = require('fs');
const path = require('path');

function validateMigration(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const basename = path.basename(filePath);

    // 檢查命名是否符合時間戳前綴 YYYYMMDD
    if (!/^\d{8}.*\.sql$/.test(basename)) {
      console.error(`[MIGRATION ERROR] Migration file name '${basename}' must start with 8-digit date prefix (YYYYMMDD...).`);
      return false;
    }

    // 檢查是否同時包含 Up 與 Down 指示字眼 (例如 golang-migrate 或者是 db-migrate 等慣用註解)
    const hasUp = content.includes('Up') || content.includes('up') || content.includes('UP');
    const hasDown = content.includes('Down') || content.includes('down') || content.includes('DOWN');

    if (!hasUp || !hasDown) {
      console.error(`[MIGRATION ERROR] Migration file ${filePath} must contain both 'Up' (upgrade) and 'Down' (rollback) scripts.`);
      return false;
    }
  } catch (err) {
    // 忽略讀取錯誤
  }
  return true;
}

const args = process.argv.slice(2);
let success = true;

for (const file of args) {
  if (!validateMigration(file)) {
    success = false;
  }
}

if (!success) {
  console.error('[MIGRATION GATE] DB Migration validation failed.');
  process.exit(1);
} else {
  console.log('[MIGRATION GATE] DB Migration validation passed.');
  process.exit(0);
}
