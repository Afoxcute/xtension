# Contributing to Solana Wallet Browser Extension

Thank you for your interest in contributing to the Solana Wallet Browser Extension! This document provides guidelines and instructions for contributing to this project.

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** to your local machine
3. **Install dependencies**:
   ```bash
   npm install
   # or
   yarn install
   ```
4. **Set up your development environment** as described in the [README.md](README.md)

## Development Workflow

1. **Create a new branch** for your feature or bugfix:
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-bugfix-name
   ```

2. **Make your changes** and test them thoroughly

3. **Build the extension** to verify everything works:
   ```bash
   npm run build:extension
   # or
   yarn build:extension
   ```

4. **Test in multiple browsers** (Chrome, Firefox, etc.)

5. **Commit your changes** with clear, descriptive commit messages:
   ```bash
   git commit -m "Add feature: your feature description"
   ```

6. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

7. **Create a Pull Request** from your fork to the main repository

## Code Style Guidelines

- Use consistent indentation (2 spaces)
- Follow JavaScript best practices
- Add comments for complex logic
- Keep functions small and focused
- Use meaningful variable and function names

## Testing

Before submitting a Pull Request, please test your changes:

1. **Build the extension**:
   ```bash
   npm run build:extension
   ```

2. **Load the extension in your browser** as described in the README

3. **Test all functionality** related to your changes

4. **Test in different environments**:
   - Railway deployment
   - GitHub Pages
   - Local development

## Pull Request Process

1. **Update the README.md** with details of changes if applicable
2. **Update the TROUBLESHOOTING.md** if your changes might affect users' experience
3. **Ensure all tests pass**
4. **Describe your changes** in the Pull Request description
5. **Link any related issues** in the Pull Request description

## Feature Requests and Bug Reports

If you have ideas for new features or have found a bug:

1. **Check existing issues** to see if it has already been reported
2. **Create a new issue** with a clear description and as much relevant information as possible
3. **Use issue templates** if available

## Code of Conduct

- Be respectful and inclusive
- Focus on the technical merits of contributions
- Help others learn and grow
- Accept constructive criticism gracefully

## License

By contributing to this project, you agree that your contributions will be licensed under the project's MIT License. 