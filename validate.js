#!/usr/bin/env node

/**
 * BizBuddy AI Agent - Project Validation Script
 * Checks for common issues and validates project structure
 */

const fs = require('fs');
const path = require('path');

class ProjectValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.rootDir = process.cwd();
  }

  log(message, type = 'info') {
    const prefix = {
      'error': '\x1b[31m❌\x1b[0m',
      'warn': '\x1b[33m⚠️\x1b[0m',
      'success': '\x1b[32m✅\x1b[0m',
      'info': '\x1b[36mℹ️\x1b[0m'
    };
    console.log(`${prefix[type] || ''} ${message}`);
  }

  checkFile(filePath, description) {
    const fullPath = path.join(this.rootDir, filePath);
    if (fs.existsSync(fullPath)) {
      this.log(`${description} exists`, 'success');
      return true;
    } else {
      this.errors.push(`Missing ${description}: ${filePath}`);
      this.log(`${description} missing: ${filePath}`, 'error');
      return false;
    }
  }

  checkDirectory(dirPath, description) {
    const fullPath = path.join(this.rootDir, dirPath);
    if (fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory()) {
      this.log(`${description} directory exists`, 'success');
      return true;
    } else {
      this.errors.push(`Missing ${description} directory: ${dirPath}`);
      this.log(`${description} directory missing: ${dirPath}`, 'error');
      return false;
    }
  }

  validateStructure() {
    this.log('Validating project structure...', 'info');

    // Check backend structure
    this.checkDirectory('src', 'src directory');
    this.checkDirectory('src/routes', 'routes directory');
    this.checkDirectory('src/services', 'services directory');
    this.checkDirectory('src/services/ai', 'AI services directory');
    this.checkDirectory('src/services/voice', 'voice services directory');
    this.checkDirectory('src/services/conversation', 'conversation services directory');
    this.checkDirectory('src/middleware', 'middleware directory');
    this.checkDirectory('src/config', 'config directory');
    this.checkFile('src/server.ts', 'Server entry point');
    this.checkFile('src/routes/index.ts', 'Routes index');
    this.checkFile('src/config/database.ts', 'Database config');

    // Check frontend structure
    this.checkDirectory('frontend', 'frontend directory');
    this.checkDirectory('frontend/src', 'frontend src directory');
    this.checkDirectory('frontend/src/components', 'components directory');
    this.checkDirectory('frontend/src/pages', 'pages directory');
    this.checkDirectory('frontend/src/contexts', 'contexts directory');
    this.checkDirectory('frontend/src/services', 'frontend services directory');
    this.checkFile('frontend/src/App.tsx', 'App component');
    this.checkFile('frontend/src/index.tsx', 'index entry point');
    this.checkFile('frontend/package.json', 'frontend package.json');
    this.checkFile('frontend/tsconfig.json', 'frontend tsconfig');

    // Check configuration files
    this.checkFile('package.json', 'Root package.json');
    this.checkFile('tsconfig.json', 'Root tsconfig');
    this.checkFile('prisma/schema.prisma', 'Prisma schema');
    this.checkFile('.env.example', 'Environment example');

    // Check deployment files
    this.checkFile('docker-compose.yml', 'Docker compose');
    this.checkFile('Dockerfile', 'Dockerfile');
    this.checkFile('setup.sh', 'Setup script');
    this.checkFile('deploy.sh', 'Deploy script');
  }

  validatePackageJson() {
    this.log('Validating package.json...', 'info');

    try {
      const pkg = JSON.parse(fs.readFileSync(path.join(this.rootDir, 'package.json'), 'utf8'));

      // Check required dependencies
      const requiredDeps = ['express', 'socket.io', 'prisma', '@prisma/client', 'openai', 'typescript'];
      requiredDeps.forEach(dep => {
        if (!pkg.dependencies || !pkg.dependencies[dep]) {
          this.errors.push(`Missing required dependency: ${dep}`);
          this.log(`Missing dependency: ${dep}`, 'error');
        } else {
          this.log(`Dependency ${dep} present`, 'success');
        }
      });

      // Check scripts
      const requiredScripts = ['dev', 'build', 'start', 'test'];
      requiredScripts.forEach(script => {
        if (!pkg.scripts || !pkg.scripts[script]) {
          this.warnings.push(`Missing script: ${script}`);
          this.log(`Missing script: ${script}`, 'warn');
        }
      });
    } catch (error) {
      this.errors.push(`Failed to parse package.json: ${error.message}`);
      this.log(`Failed to parse package.json: ${error.message}`, 'error');
    }
  }

  checkForCommonIssues() {
    this.log('Checking for common issues...', 'info');

    // Check for hardcoded secrets
    const files = ['src', 'frontend/src'];
    files.forEach(dir => {
      this.scanForSecrets(dir);
    });
  }

  scanForSecrets(directory) {
    const fullDir = path.join(this.rootDir, directory);
    if (!fs.existsSync(fullDir)) return;

    const files = fs.readdirSync(fullDir, { withFileTypes: true });

    files.forEach(file => {
      const fullPath = path.join(fullDir, file.name);

      if (file.isDirectory()) {
        this.scanForSecrets(path.join(directory, file.name));
      } else if (file.name.endsWith('.ts') || file.name.endsWith('.tsx')) {
        try {
          const content = fs.readFileSync(fullPath, 'utf8');

          // Check for common secret patterns
          const patterns = [
            /password\s*=\s*['"`][^'^"^`]+['"`]/gi,
            /secret\s*=\s*['"`][^'^"^`]+['"`]/gi,
            /api[_-]?key\s*=\s*['"`][^'^"^`]+['"`]/gi,
            /token\s*=\s*['"`][^'^"^`]+['"`]/gi
          ];

          patterns.forEach(pattern => {
            if (pattern.test(content)) {
              this.warnings.push(`Potential hardcoded secret in ${fullPath}`);
              this.log(`Potential hardcoded secret in ${fullPath}`, 'warn');
            }
          });
        } catch (error) {
          // Skip unreadable files
        }
      }
    });
  }

  generateReport() {
    console.log('\n' + '='.repeat(50));
    this.log('Validation Report', 'info');
    console.log('='.repeat(50));

    if (this.errors.length === 0) {
      this.log('No critical errors found!', 'success');
    } else {
      this.log(`${this.errors.length} error(s) found:`, 'error');
      this.errors.forEach((error, i) => {
        console.log(`  ${i + 1}. ${error}`);
      });
    }

    if (this.warnings.length === 0) {
      this.log('No warnings!', 'success');
    } else {
      this.log(`${this.warnings.length} warning(s):`, 'warn');
      this.warnings.forEach((warning, i) => {
        console.log(`  ${i + 1}. ${warning}`);
      });
    }

    console.log('\n');

    return this.errors.length === 0;
  }

  run() {
    console.log('\n' + '='.repeat(50));
    this.log('BizBuddy Project Validator', 'info');
    console.log('='.repeat(50) + '\n');

    this.validateStructure();
    this.validatePackageJson();
    this.checkForCommonIssues();

    const isValid = this.generateReport();

    process.exit(isValid ? 0 : 1);
  }
}

// Run the validator
const validator = new ProjectValidator();
validator.run();