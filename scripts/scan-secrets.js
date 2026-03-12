#!/usr/bin/env node
/**
 * Secret Scanning Tool
 * Scans files for potential secrets, API keys, passwords, and credentials.
 *
 * Usage:
 *   node scripts/scan-secrets.js                    # Scan all tracked files
 *   node scripts/scan-secrets.js --staged          # Scan only staged files
 */

const { execSync } = require('child_process');
const fs = require('fs');

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

const secretPatterns = [
  { name: 'AWS Access Key', pattern: /(?:A3T[A-Z0-9]|AKIA|AGPA|AIDA|AROA|AIPA|ANPA|ANVA|ASIA)[A-Z0-9]{16}/, severity: 'high' },
  { name: 'OpenAI API Key', pattern: /sk-[a-zA-Z0-9]{48}/, severity: 'high' },
  { name: 'GitHub Token', pattern: /ghp_[0-9a-zA-Z]{36}/, severity: 'high' },
  { name: 'Database URL', pattern: /(postgresql|mysql|mongodb|redis):\/\/[^:]+:[^@]+@/i, severity: 'high' },
  { name: 'Hardcoded Password', pattern: /(?:password|passwd|pwd|secret)["'\s]*[:=][\s]*["']([^"'\n]{8,})["']/i, severity: 'high' },
  { name: 'JWT Token', pattern: /[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}/, severity: 'medium' },
  { name: 'Private Key', pattern: /-----BEGIN [A-Z ]+ KEY-----/, severity: 'critical' },
  { name: 'Slack Token', pattern: /xox[baps]-[0-9]{12}-[0-9]{12}-[A-Za-z0-9]{32}/, severity: 'medium' },
  { name: 'Stripe API Key', pattern: /(?:sk|pk)_(?:test|live)_[0-9a-zA-Z]{24}/, severity: 'high' }
];

const skipExtensions = new Set([
  '.png', '.jpg', '.jpeg', '.gif', '.bmp', '.ico',
  '.pdf', '.doc', '.docx', '.xls', '.xlsx',
  '.zip', '.tar', '.gz', '.jar', '.war',
  '.exe', '.dll', '.so', '.dylib', '.pyc', '.class'
]);

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function getFiles(params) {
  let files = [];
  if (params.staged) {
    try {
      const output = execSync('git diff --cached --name-only --diff-filter=ACMR', { encoding: 'utf-8' });
      files = output.split('\n').filter(f => f.trim());
    } catch (e) {
      log('Error getting staged files', 'red');
      process.exit(2);
    }
  } else {
    try {
      const output = execSync('git ls-files', { encoding: 'utf-8' });
      files = output.split('\n').filter(f => f.trim());
    } catch (e) {
      log('Error getting tracked files', 'red');
      process.exit(2);
    }
  }
  return files;
}

function shouldSkipFile(filePath) {
  if (!fs.existsSync(filePath)) return true;
  const ext = require('path').extname(filePath).toLowerCase();
  if (skipExtensions.has(ext)) return true;
  const skipDirs = ['node_modules', '.git', 'dist', 'build', '.next', '.terraform', 'coverage', '.claude'];
  if (skipDirs.some(dir => filePath.includes(dir))) return true;
  try {
    const stat = fs.statSync(filePath);
    if (stat.size === 0) return true;
    const fd = fs.openSync(filePath, 'r');
    const buffer = Buffer.alloc(512);
    fs.readSync(fd, buffer, 0, 512, 0);
    fs.closeSync(fd);
    if (buffer.includes(0)) return true;
  } catch (e) {
    return true;
  }
  return false;
}

function scanFile(filePath) {
  const findings = [];
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');

    secretPatterns.forEach(({ name, pattern, severity }) => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        let charCount = 0, lineNum = 1, lineContent = '';
        for (let i = 0; i < lines.length; i++) {
          if (charCount + lines[i].length >= content.indexOf(match[0])) {
            lineNum = i + 1;
            lineContent = lines[i].trim();
            break;
          }
          charCount += lines[i].length + 1;
        }

        if (isFalsePositive(match[0], lineContent, filePath)) {
          pattern.lastIndex = content.indexOf(match[0]) + match[0].length;
          return;
        }

        findings.push({
          file: filePath,
          line: lineNum,
          lineContent: lineContent.substring(0, 100),
          pattern: name,
          severity
        });
        pattern.lastIndex = content.indexOf(match[0]) + match[0].length;
      }
    });
  } catch (e) {}
  return findings;
}

function isFalsePositive(match, line, file) {
  const lowerLine = line.toLowerCase();
  const placeholders = ['your-', 'example', 'test', 'placeholder', 'changeme', 'xxx', 'dummy', 'fake', 'sample', 'demo', 'todo'];
  if (placeholders.some(p => lowerLine.includes(p))) return true;
  if (lowerLine.trim().startsWith('//') || lowerLine.trim().startsWith('#') || lowerLine.trim().startsWith('/*')) return true;
  if (file.includes('.env.example') || file.toLowerCase().includes('readme')) return true;
  if (match.includes('your-') || match.includes('example')) return true;
  return false;
}

function main() {
  const args = process.argv.slice(2);
  const params = { staged: args.includes('--staged'), files: args.filter(a => !a.startsWith('--')) };

  log('\n🔍 Scanning for secrets...\n', 'cyan');
  const files = getFiles(params);
  log(`Scanning ${files.length} files...\n`, 'cyan');

  let totalFindings = 0;
  const findingsBySeverity = { critical: [], high: [], medium: [], low: [] };

  files.forEach(file => {
    if (shouldSkipFile(file)) return;
    const findings = scanFile(file);
    if (findings.length > 0) {
      totalFindings += findings.length;
      findings.forEach(f => findingsBySeverity[f.severity].push(f));
      log(`\n${colors.red}❌ ${findings.length} potential secret(s) in ${file}:${colors.reset}`);
      findings.forEach(f => {
        const severityColor = f.severity === 'critical' || f.severity === 'high' ? 'red' : 'yellow';
        log(`  Line ${f.line}: [${f.severity.toUpperCase()}] ${f.pattern}`, severityColor);
        log(`    ${f.lineContent}`, 'yellow');
      });
    }
  });

  log('\n' + '='.repeat(60), 'cyan');
  log('SCAN COMPLETE', 'bold');
  log('='.repeat(60), 'cyan');

  const severityOrder = ['critical', 'high', 'medium', 'low'];
  let hasFindings = false;
  severityOrder.forEach(severity => {
    const count = findingsBySeverity[severity].length;
    if (count > 0) {
      hasFindings = true;
      const color = (severity === 'critical' || severity === 'high') ? 'red' : 'yellow';
      log(`  ${colors[color]}${severity.toUpperCase()}: ${count}${colors.reset}`);
    }
  });

  if (hasFindings) {
    log('\n' + colors.red + '❌ SECRETS DETECTED!' + colors.reset);
    log('Please remove or secure any sensitive information before committing.\n', 'yellow');
    process.exit(1);
  } else {
    log('\n' + colors.green + '✅ No secrets detected. Safe to commit!' + colors.reset + '\n');
    process.exit(0);
  }
}

main();
