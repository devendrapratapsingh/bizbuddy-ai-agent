# Contributing to BizBuddy AI Agent

We welcome contributions from the community! Whether you're fixing bugs, adding features, or improving documentation, your help is valuable.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 12+
- Git

### Installation

1. **Fork the repository**
   ```bash
   git clone https://github.com/your-org/bizbuddy-ai-agent.git
   cd bizbuddy-ai-agent
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Setup database**
   ```bash
   npx prisma migrate dev
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

## 🎯 Development Workflow

### Code Style

We follow the [Standard JavaScript Style](https://standardjs.com/) with some modifications:

- Use TypeScript for type safety
- Follow React hooks conventions
- Use async/await for asynchronous operations
- Write clean, readable code

### Git Workflow

1. Create a feature branch
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes

3. Commit your changes
   ```bash
   git add .
   git commit -m "feat: add new feature description"
   ```

4. Push to your branch
   ```bash
   git push origin feature/your-feature-name
   ```

5. Create a pull request

### Commit Message Format

We use Conventional Commits specification:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, missing semicolons, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Build process or auxiliary changes

**Examples:**
```
feat: add lead scoring system

fix: resolve conversation history loading issue
docs: update API documentation
```

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run unit tests
npm run test:unit

# Run integration tests
npm run test:integration

# Run end-to-end tests
npm run test:e2e

# Run with coverage
npm run test:coverage
```

### Writing Tests

- Write unit tests for all new functions and components
- Write integration tests for API endpoints
- Write end-to-end tests for user workflows
- Aim for at least 80% code coverage

## 📚 Documentation

- Update README.md for new features
- Add API documentation for new endpoints
- Update inline code comments
- Create examples for complex features

## 🔒 Security

- Never commit secrets or API keys
- Use environment variables for configuration
- Follow security best practices
- Report security vulnerabilities privately

## 📋 Code Review Process

1. Pull requests require at least one approval
2. Automated tests must pass
3. Code coverage should not decrease
4. Documentation should be updated
5. Follow the project's coding standards

## 🚀 Release Process

1. Ensure all tests pass
2. Update version in package.json
3. Update changelog
4. Create release branch
5. Tag the release
6. Merge to main

## 🤝 Community Guidelines

- Be respectful and inclusive
- Provide constructive feedback
- Help other contributors
- Follow the code of conduct

## 📧 Contact

For questions or support:
- Create an issue on GitHub
- Join our Discord community
- Email the development team

## 📖 Additional Resources

- [Project Documentation](https://github.com/your-org/bizbuddy-ai-agent/docs)
- [API Reference](https://github.com/your-org/bizbuddy-ai-agent/api)
- [Development Wiki](https://github.com/your-org/bizbuddy-ai-agent/wiki)
- [Code of Conduct](https://github.com/your-org/bizbuddy-ai-agent/CODE_OF_CONDUCT.md)