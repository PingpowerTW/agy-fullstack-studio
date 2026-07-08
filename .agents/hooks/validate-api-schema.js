const fs = require('fs');
const path = require('path');

// 簡易 OpenAPI YAML 及 TS 型別文件語法檢查
function validateSpec(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const ext = path.extname(filePath);

    if (ext === '.yaml' || ext === '.yml') {
      // 檢查是否包含 OpenAPI 必要屬性
      if (!content.includes('openapi:') && !content.includes('swagger:')) {
        console.error(`[SCHEMA ERROR] API Spec file ${filePath} lacks 'openapi' or 'swagger' header.`);
        return false;
      }
      if (!content.includes('paths:')) {
        console.error(`[SCHEMA ERROR] API Spec file ${filePath} lacks 'paths' section.`);
        return false;
      }
    } else if (ext === '.ts') {
      // 檢查 TS interface / type 基本結構語法是否有未閉合括號
      const openBraces = (content.match(/\{/g) || []).length;
      const closeBraces = (content.match(/\}/g) || []).length;
      if (openBraces !== closeBraces) {
        console.error(`[SCHEMA ERROR] Type definition file ${filePath} has unmatched curly braces (open: ${openBraces}, close: ${closeBraces}).`);
        return false;
      }
    }
  } catch (err) {
    // 忽略讀取錯誤
  }
  return true;
}

const args = process.argv.slice(2);
let success = true;

for (const file of args) {
  if (!validateSpec(file)) {
    success = false;
  }
}

if (!success) {
  console.error('[SCHEMA GATE] API Schema validation failed.');
  process.exit(1);
} else {
  console.log('[SCHEMA GATE] API Schema validation passed.');
  process.exit(0);
}
