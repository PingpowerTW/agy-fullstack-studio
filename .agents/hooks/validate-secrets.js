const fs = require('fs');
const path = require('path');

// 敏感詞 Regex 規則
const rules = [
  { name: 'API Key (Generic)', regex: /(key|api_key|apikey|secret|token)\s*[:=]\s*['"][a-zA-Z0-9_\-]{16,}['"]/i },
  { name: 'OpenAI API Key', regex: /sk-[a-zA-Z0-9]{48}/ },
  { name: 'Google API Key', regex: /AIzaSy[a-zA-Z0-9_\-]{33}/ },
  { name: 'Database Password URL', regex: /postgres(ql)?:\/\/.*:[^@]+@/i }
];

function scanFile(filePath) {
  try {
    const stat = fs.statSync(filePath);
    if (!stat.isFile()) return true;

    // 排除特定目錄與檔案
    const basename = path.basename(filePath);
    if (filePath.includes('.git') || filePath.includes('node_modules') || basename === 'validate-secrets.js') {
      return true;
    }

    const content = fs.readFileSync(filePath, 'utf8');
    for (const rule of rules) {
      if (rule.regex.test(content)) {
        console.error(`[SECURITY ERROR] Found potential ${rule.name} in: ${filePath}`);
        return false;
      }
    }
  } catch (err) {
    // 忽略讀取錯誤
  }
  return true;
}

// 獲取傳入的檔案列表或掃描暫存區
const args = process.argv.slice(2);
let success = true;

if (args.length > 0) {
  for (const file of args) {
    if (!scanFile(file)) {
      success = false;
    }
  }
} else {
  // 預設掃描整個 src 與 .agents 目錄中的檔案
  const scanDirs = ['src', '.agents'];
  function traverse(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stat = fs.lstatSync(fullPath);
      if (stat.isDirectory()) {
        if (file !== 'node_modules' && !file.startsWith('.')) {
          traverse(fullPath);
        }
      } else {
        if (!scanFile(fullPath)) {
          success = false;
        }
      }
    }
  }
  for (const d of scanDirs) {
    if (fs.existsSync(d)) traverse(d);
  }
}

if (!success) {
  console.error('[SECURITY GATE] Commit/Push blocked due to potential secrets leak. Please remove the secrets and try again.');
  process.exit(1);
} else {
  console.log('[SECURITY GATE] Secrets scan passed.');
  process.exit(0);
}
