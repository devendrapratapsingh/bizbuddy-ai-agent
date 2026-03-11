# Testing Guide for BizBuddy AI Agent

This document provides comprehensive information about testing strategies, tools, and procedures for the BizBuddy AI Agent application.

## 🧪 Testing Strategy

### Testing Pyramid

```
    E2E Tests (5-10%)
   /───────────────────────────────────────────────────────────────────────┐
   | Integration Tests (20-30%)  |
   |───────────────────────────────────────────────────────────────────────┘
   | Unit Tests (60-70%)         |
   |───────────────────────────────────────────────────────────────────────┘
    ╚───────────────────────────────────────────────────────────────────────╝
```

## 🧪 Test Types

### 1. Unit Tests

**Purpose**: Test individual functions, components, and services in isolation

**Tools**: Jest, React Testing Library

**Coverage Areas**:
- Utility functions
- Service methods
- Component rendering
- State management
- Helper functions

**Example Structure**:
```typescript
// src/services/ai/index.test.ts
describe('AIService', () => {
  describe('generateResponse', () => {
    it('should generate valid response from OpenAI', async () => {
      // Test implementation
    });

    it('should handle OpenAI errors gracefully', async () => {
      // Test implementation
    });
  });
});
```

### 2. Integration Tests

**Purpose**: Test interactions between different parts of the application

**Tools**: Supertest, Jest

**Coverage Areas**:
- API endpoints
- Database operations
- Service integrations
- Middleware functionality

**Example Structure**:
```typescript
// tests/integration/api/conversations.test.ts
describe('Conversations API', () => {
  describe('POST /api/protected/conversations', () => {
    it('should create a new conversation', async () => {
      // Test implementation
    });

    it('should return 400 for invalid data', async () => {
      // Test implementation
    });
  });
});
```

### 3. End-to-End (E2E) Tests

**Purpose**: Test complete user workflows from start to finish

**Tools**: Playwright, Jest

**Coverage Areas**:
- User registration and login
- Conversation flows
- Voice call functionality
- Lead management
- Dashboard interactions

**Example Structure**:
```typescript
// tests/e2e/user-flows/register-login.spec.ts
describe('User Registration and Login', () => {
  it('should allow new users to register and login', async () => {
    // Test implementation
  });

  it('should redirect to dashboard after successful login', async () => {
    // Test implementation
  });
});
```

### 4. Performance Tests

**Purpose**: Test application performance under load

**Tools**: Artillery, Jest

**Coverage Areas**:
- API response times
- Database query performance
- Concurrent user handling
- Memory usage

## 🧰 Testing Tools

### Frontend Testing

#### Jest
- JavaScript testing framework
- Built-in with React
- Snapshot testing
- Code coverage reporting

#### React Testing Library
- Component testing
- User behavior simulation
- Accessibility testing
- DOM interaction testing

#### Playwright
- End-to-end testing
- Cross-browser testing
- Mobile testing
- Visual regression testing

### Backend Testing

#### Jest
- Unit and integration testing
- Mock functions
- Asynchronous testing
- Coverage reporting

#### Supertest
- HTTP assertions
- API endpoint testing
- Request/response testing
- Middleware testing

#### Prisma Studio
- Database testing
- Data validation
- Schema testing

### Database Testing

#### Prisma Migrate
- Schema validation
- Migration testing
- Data seeding
- Rollback testing

#### Factory Pattern
- Test data generation
- Database seeding
- Mock data creation

## 📝 Test Configuration

### Jest Configuration

```json
// jest.config.js
{
  "collectCoverageFrom": [
    "src/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
    "!src/**/*.test.{ts,tsx}",
    "!src/**/*.spec.{ts,tsx}"
  ],
  "coverageThreshold": {
    "global": {
      "branches": 80,
      "functions": 80,
      "lines": 80,
      "statements": 80
    }
  },
  "testEnvironment": "jsdom",
  "setupFilesAfterEnv": ["<rootDir>/tests/setup.ts"]
}
```

### Test Scripts

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:performance": "artillery run tests/performance/load-test.yml"
  }
}
```

## 🧪 Running Tests

### Local Development

```bash
# Run all tests
npm test

# Run with watch mode
npm run test:watch

# Run with coverage
npm run test:coverage

# Run specific test file
npm test -- src/services/ai/index.test.ts

# Run end-to-end tests
npm run test:e2e

# Run performance tests
npm run test:performance
```

### CI/CD Pipeline

```yaml
# .github/workflows/test.yml
name: Test Suite

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v3

    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Run tests
      run: npm test

    - name: Run coverage
      run: npm run test:coverage

    - name: Run e2e tests
      run: npm run test:e2e
```

## 📋 Test Coverage

### Minimum Requirements

- **Unit Tests**: 80% coverage
- **Integration Tests**: 70% coverage
- **E2E Tests**: 60% coverage
- **Performance Tests**: 50% coverage

### Coverage Reporting

```bash
# Generate coverage report
npm run test:coverage

# View coverage report
open coverage/lcov-report/index.html

# Check coverage thresholds
npm test -- --coverage --watchAll=false
```

### Coverage Categories

- **Statements**: Lines executed
- **Branches**: Conditional logic
- **Functions**: Function calls
- **Lines**: Total lines

## 🧪 Test Data Management

### Test Database

```typescript
// tests/setup/database.ts
import { prisma } from '../../src/config/database';

export const setupTestDatabase = async () => {
  // Clean database
  await prisma.user.deleteMany();
  await prisma.business.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.message.deleteMany();

  // Seed test data
  const user = await prisma.user.create({
    data: {
      email: 'test@example.com',
      password: 'test123',
      name: 'Test User'
    }
  });

  return { user };
};
```

### Test Factories

```typescript
// tests/factories/userFactory.ts
export const createUser = (overrides: Partial<User> = {}) => {
  return {
    email: 'test@example.com',
    password: 'test123',
    name: 'Test User',
    ...overrides
  };
};

export const createBusiness = (overrides: Partial<Business> = {}) => {
  return {
    name: 'Test Business',
    domain: 'test.com',
    description: 'Test business description',
    ...overrides
  };
};
```

## 🔍 Debugging Tests

### Common Issues

1. **Database Connection Issues**
   - Check database URL
   - Verify database is running
   - Check connection pool settings

2. **Test Environment Issues**
   - Ensure test environment is configured
   - Check environment variables
   - Verify test database setup

3. **Async/Await Issues**
   - Use proper async/await syntax
   - Handle promises correctly
   - Use done() callback when needed

### Debugging Tools

```bash
# Debug with Node.js
node --inspect-brk node_modules/.bin/jest --runInBand

# Debug with VS Code
# Create .vscode/launch.json with Jest configuration

# Debug with Chrome DevTools
node --inspect-brk node_modules/.bin/jest --runInBand
```

### Test Logging

```typescript
// Enable detailed logging
process.env.DEBUG = 'test:*';

// Add custom logging
console.log('Test started:', testName);
console.error('Test failed:', error.message);
```

## 📚 Best Practices

### Test Naming

```typescript
// Good
describe('UserService', () => {
  describe('createUser', () => {
    it('should create a user with valid data', () => {
      // Test implementation
    });

    it('should return error for invalid email', () => {
      // Test implementation
    });
  });
});

// Bad
describe('UserService', () => {
  it('works', () => {
    // Test implementation
  });
});
```

### Test Organization

```
tests/
├── unit/                    # Unit tests
│   ├── services/            # Service layer tests
│   ├── routes/              # Route tests
│   ├── middleware/          # Middleware tests
│   └── utils/               # Utility tests
├── integration/             # Integration tests
│   ├── api/                 # API endpoint tests
│   ├── database/            # Database tests
│   └── services/            # Service integration tests
├── e2e/                    # End-to-end tests
│   ├── user-flows/          # User journey tests
│   ├── performance/         # Performance tests
│   └── visual/              # Visual regression tests
└── fixtures/               # Test data and mocks
```

### Test Isolation

```typescript
// Each test should be independent
beforeEach(async () => {
  await setupTestDatabase();
});

afterEach(async () => {
  await cleanupTestDatabase();
});

// Use test doubles and mocks
test('should call external API', async () => {
  const mockApi = jest.fn().mockResolvedValue({ success: true });
  // Test implementation
});
```

## 🧹 Test Maintenance

### Regular Tasks

1. **Update Test Data**
   - Keep test data relevant
   - Update fixtures regularly
   - Remove outdated test cases

2. **Review Test Coverage**
   - Monitor coverage reports
   - Add missing test cases
   - Remove redundant tests

3. **Performance Optimization**
   - Optimize slow tests
   - Parallelize test execution
   - Reduce test runtime

### Test Cleanup

```bash
# Remove unused tests
find tests -name '*.test.ts' -size 0 -delete

# Remove outdated fixtures
find tests/fixtures -name '*.json' -mtime +30 -delete

# Update test dependencies
npm update --dev
```

## 🚀 Advanced Testing

### Contract Testing

```typescript
// tests/contracts/api.spec.ts
describe('API Contract', () => {
  it('should return valid JSON structure', async () => {
    const response = await request(app)
      .get('/api/protected/conversations')
      .expect(200);

    expect(response.body).toHaveProperty('data');
    expect(response.body.data).toBeInstanceOf(Array);
  });
});
```

### Property-Based Testing

```typescript
// tests/property/conversation.spec.ts
describe('Conversation Properties', () => {
  it('should handle any valid message content', () => {
    fc.assert(
      fc.property(fc.string(), (content) => {
        const message = createMessage(content);
        expect(message.content).toBe(content);
      })
    );
  });
});
```

### Mutation Testing

```bash
# Install stryker
npm install -g stryker-cli

# Run mutation testing
stryker run
```

## 📋 Test Checklist

### Before Development

- [ ] Test plan created
- [ ] Test data prepared
- [ ] Test environment configured
- [ ] Dependencies installed

### During Development

- [ ] Unit tests written
- [ ] Integration tests added
- [ ] E2E tests created
- [ ] Performance tests included

### Before Release

- [ ] All tests passing
- [ ] Coverage requirements met
- [ ] Performance benchmarks met
- [ ] Security tests completed

### After Release

- [ ] Monitoring setup
- [ ] Error tracking configured
- [ ] Test automation updated
- [ ] Documentation updated