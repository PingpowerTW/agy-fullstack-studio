const fs = require('fs');
const path = require('path');

// D003: Regex rules — support unquoted values, new OpenAI format, multi-DB protocols
const rules = [
  { name: 'API Key (Generic)', regex: /(key|api_key|apikey|secret|token)\s*[:=]\s*['"]?[a-zA-Z0-9_\-]{16,}['"]?/i },
  { name: 'OpenAI API Key', regex: /sk-(proj-)?[a-zA-Z0-9]{40,}/ },
  { name: 'Google API Key', regex: /AIzaSy[a-zA-Z0-9_\-]{33}/ },
  { name: 'Database Password URL', regex: /(postgres(ql)?|mysql|mongodb(\+srv)?|redis):\/\/[^:]+:[^@]+@/i }
];

// D007: Known safe placeholder values that should not trigger alerts
const safePlaceholders = [
  'your_api_key_here', 'CHANGE_ME', 'development_secret', 'test_token',
  'placeholder', 'example_key', 'dummy_secret', 'xxx', 'TODO'
];

// D003: Binary file extensions to skip (avoid false positives on binary data)
const binaryExts = ['.png', '.jpg', '.jpeg', '.gif', '.pdf', '.zip', '.tar', '.gz', '.exe', '.dll', '.ico', '.woff', '.woff2', '.ttf', '.eot', '.svg'];

function scanFile(filePath) {
  try {
    const stat = fs.statSync(filePath);
    if (!stat.isFile()) return true;

    // Exclude special directories and this file itself
    const basename = path.basename(filePath);
    if (filePath.includes('.git') || filePath.includes('node_modules') || basename === 'validate-secrets.js') {
      return true;
    }

    // D003: Skip binary files
    if (binaryExts.includes(path.extname(filePath).toLowerCase())) {
      return true;
    }

    const content = fs.readFileSync(filePath, 'utf8');
    for (const rule of rules) {
      const match = content.match(rule.regex);
      if (match) {
        // D007: Check if matched value is a known safe placeholder
        const matchedValue = match[0];
        const isSafe = safePlaceholders.some(ph => matchedValue.toLowerCase().includes(ph.toLowerCase()));
        if (isSafe) continue;

        console.error(`[SECURITY ERROR] Found potential ${rule.name} in: ${filePath}`);
        return false;
      }
    }
  } catch (err) {
    // D004: Fail-Closed — block on any read error instead of silently passing
    console.error(`[SECURITY ERROR] Failed to read/scan file ${filePath}: ${err.message}`);
    return false;
  }
  return true;
}

// Get file list from args or scan default directories
const args = process.argv.slice(2);
let success = true;

if (args.length > 0) {
  for (const file of args) {
    if (!scanFile(file)) {
      success = false;
    }
  }
} else {
  // Default: recursively scan src and .agents directories
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
