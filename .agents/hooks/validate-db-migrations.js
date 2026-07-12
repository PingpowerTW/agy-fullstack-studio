const fs = require('fs');
const path = require('path');

function validateMigration(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const basename = path.basename(filePath);

    // D011: Support .sql, .js, .ts migration files
    if (!/^\d{8}.*\.(sql|js|ts)$/.test(basename)) {
      console.error(`[MIGRATION ERROR] Migration file name '${basename}' must start with 8-digit date prefix (YYYYMMDD...) and end with .sql, .js, or .ts.`);
      return false;
    }

    // D010: Use word boundary regex to prevent false matches (e.g., 'update' matching 'up')
    const hasUp = /\bup\b/i.test(content) || /@migrate\s+up/i.test(content) || /exports\.up\b/.test(content);
    const hasDown = /\bdown\b/i.test(content) || /@migrate\s+down/i.test(content) || /exports\.down\b/.test(content);

    if (!hasUp || !hasDown) {
      console.error(`[MIGRATION ERROR] Migration file ${filePath} must contain explicit rollback/upgrade boundaries or comments containing 'up' and 'down'.`);
      return false;
    }
  } catch (err) {
    // D004: Fail-Closed — block on any read error
    console.error(`[MIGRATION ERROR] Failed to read migration file ${filePath}: ${err.message}`);
    return false;
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
