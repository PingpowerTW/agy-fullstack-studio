const fs = require('fs');
const path = require('path');
const vm = require('vm');

// API spec and type definition validator
function validateSpec(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const ext = path.extname(filePath);

    if (ext === '.yaml' || ext === '.yml') {
      // D009: Enhanced YAML validation — check structure beyond simple includes
      if (!content.includes('openapi:') && !content.includes('swagger:')) {
        console.error(`[SCHEMA ERROR] API Spec file ${filePath} lacks 'openapi' or 'swagger' header.`);
        return false;
      }
      if (!content.includes('paths:')) {
        console.error(`[SCHEMA ERROR] API Spec file ${filePath} lacks 'paths' section.`);
        return false;
      }
      // Validate basic YAML structure: check for tab indentation (YAML disallows tabs)
      if (/^\t/m.test(content)) {
        console.error(`[SCHEMA ERROR] API Spec file ${filePath} contains tab indentation (YAML requires spaces).`);
        return false;
      }
      // Check for duplicate top-level keys (common YAML mistake)
      const topKeys = content.match(/^[a-zA-Z][a-zA-Z0-9_-]*:/gm);
      if (topKeys) {
        const seen = new Set();
        for (const key of topKeys) {
          if (seen.has(key)) {
            console.error(`[SCHEMA ERROR] API Spec file ${filePath} has duplicate top-level key: ${key}`);
            return false;
          }
          seen.add(key);
        }
      }
    } else if (ext === '.ts') {
      // D008: Use vm.createScript for JS syntax validation
      // Note: TypeScript-specific syntax (interface, type) will cause false positives,
      // so we strip TS-only constructs before checking
      const jsContent = content
        .replace(/^import\s.*$/gm, '// import removed')
        .replace(/^export\s+/gm, '')
        .replace(/:\s*[A-Z][a-zA-Z<>\[\]|&,\s]*[;,)=]/g, (m) => m.slice(m.length - 1)) // strip type annotations
        .replace(/\binterface\s+\w+\s*\{[^}]*\}/gs, '/* interface removed */')
        .replace(/\btype\s+\w+\s*=\s*[^;]+;/g, '/* type removed */');
      try {
        new vm.Script(jsContent, { filename: filePath });
      } catch (syntaxErr) {
        // Only report if it looks like a genuine syntax error, not a TS construct
        const openBraces = (content.match(/\{/g) || []).length;
        const closeBraces = (content.match(/\}/g) || []).length;
        if (openBraces !== closeBraces) {
          console.error(`[SCHEMA ERROR] Type definition file ${filePath} has unmatched curly braces (open: ${openBraces}, close: ${closeBraces}).`);
          return false;
        }
      }
    }
  } catch (err) {
    // D004: Fail-Closed — block on any read error
    console.error(`[SCHEMA ERROR] Failed to process ${filePath}: ${err.message}`);
    return false;
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
