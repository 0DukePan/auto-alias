# 🧠 auto-ts-alias

[![npm version](https://badge.fury.io/js/auto-ts-alias.svg)](https://badge.fury.io/js/auto-ts-alias)
[![CI](https://github.com/yourusername/auto-ts-alias/workflows/CI/badge.svg)](https://github.com/yourusername/auto-ts-alias/actions)
[![codecov](https://codecov.io/gh/yourusername/auto-ts-alias/branch/main/graph/badge.svg)](https://codecov.io/gh/yourusername/auto-ts-alias)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Professional TypeScript Alias Synchronization Tool**

Automatically scan your project structure and synchronize path aliases across all configuration files. No more manual maintenance of aliases in multiple places!

## ✨ Features

- 🔍 **Smart Scanning**: Automatically detects your project structure and common source directories.
- ⚙️ **Multi-Platform**: Supports TypeScript (`tsconfig.json`), Webpack (`webpack.config.js/ts`), Vite (`vite.config.js/ts`), and Jest (`jest.config.js/ts`).
- 👀 **Watch Mode**: Real-time synchronization on file changes in your source directory.
- 🛡️ **Validation**: Built-in validation for project structure and alias configurations.
- 🎯 **Interactive**: User-friendly CLI with an interactive mode for guided operations.
- 📦 **Zero Config**: Works out of the box with sensible defaults, creating a basic `src` directory if none exists.
- 🧪 **Dry Run**: Preview changes before applying them to your configuration files.
- 📄 **Helper File Generation**: Creates a TypeScript helper file for runtime alias resolution.

## 🚀 Quick Start

\`\`\`bash
# Install globally
npm install -g auto-ts-alias

# Or use with npx (recommended for one-off runs)
npx auto-ts-alias --init
\`\`\`

## 📖 Usage

### Basic Commands

\`\`\`bash
# Initialize aliases for your project (default action if no command is given)
auto-ts-alias --init

# Watch for changes in your source directory and auto-sync
auto-ts-alias --watch

# Sync aliases manually to configuration files
auto-ts-alias --sync

# Preview changes without applying them
auto-ts-alias --dry-run

# Run in interactive mode for guided operations
auto-ts-alias --interactive
\`\`\`

### Advanced Usage

\`\`\`bash
# Custom source directory (e.g., 'app' instead of 'src')
auto-ts-alias --init --src-dir app

# Show detailed output for debugging
auto-ts-alias --init --verbose

# Suppress non-error output
auto-ts-alias --init --quiet

# Force update even if alias validation fails (use with caution)
auto-ts-alias --init --force

# Generate TypeScript alias helper file only
auto-ts-alias helper

# Scan project structure and show potential aliases
auto-ts-alias scan

# Validate project structure and configuration files
auto-ts-alias validate
\`\`\`

## 🏗️ How It Works

### 1. Project Structure Detection
\`auto-ts-alias\` scans your specified source directory (default: `src/`) for subdirectories. For each detected directory, it proposes a corresponding alias.

Example structure and generated aliases:
\`\`\`
src/
├── components/     → @components
├── utils/          → @utils
├── hooks/          → @hooks
├── services/       → @services
└── components/
    └── ui/         → @components/ui
\`\`\`
A root alias for `src/` (e.g., `@/*`) is always included.

### 2. Configuration Updates

Once aliases are detected, `auto-ts-alias` updates the relevant sections in your project's configuration files.

**tsconfig.json**
\`\`\`json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@components/*": ["./src/components/*"],
      "@utils/*": ["./src/utils/*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts", "**/*.spec.ts"]
}
\`\`\`

**webpack.config.js**
\`\`\`javascript
const path = require('path');

module.exports = {
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@components': path.resolve(__dirname, 'src/components'),
      '@utils': path.resolve(__dirname, 'src/utils')
    }
  }
};
\`\`\`

**vite.config.ts**
\`\`\`typescript
import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: [
      { find: '@', replacement: path.resolve(__dirname, 'src') },
      { find: '@components', replacement: path.resolve(__dirname, 'src/components') },
      { find: '@utils', replacement: path.resolve(__dirname, 'src/utils') }
    ]
  }
});
\`\`\`

**jest.config.js**
\`\`\`javascript
module.exports = {
  // ... other Jest configurations
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^@components/(.*)$": "<rootDir>/src/components/$1",
    "^@utils/(.*)$": "<rootDir>/src/utils/$1"
  }
};
\`\`\`

## 📚 API Reference

You can also use `auto-ts-alias` programmatically in your Node.js scripts.

\`\`\`typescript
import { autoTsAlias } from 'auto-ts-alias';

// Initialize with your project's root directory and scan options
const autoAlias = new autoTsAlias('/path/to/your/project', {
  srcDir: 'src', // Source directory to scan (default: 'src')
  excludeDirs: ['node_modules', '.git', 'dist'], // Directories to exclude from scanning
  prefix: '@', // Alias prefix (default: '@')
  minDepth: 1, // Minimum directory depth for alias creation
  maxDepth: 4 // Maximum directory depth for alias creation
});

// Initialize and generate aliases across all detected config files
await autoAlias.initialize();

// Start watch mode for real-time synchronization
await autoAlias.watch({ debounceMs: 500 }); // Optional debounce time

// Generate a TypeScript helper file (e.g., src/aliases.ts)
await autoAlias.generateHelperFile();

// Perform a dry run to see potential changes
const dryRunResult = await autoAlias.dryRun();
console.log(dryRunResult.message);

// Get current project configuration and detected aliases
const projectInfo = autoAlias.getProjectInfo();
console.log(projectInfo.aliases);
\`\`\`

## 🧪 Testing

To run the test suite:

\`\`\`bash
# Run all tests
npm test

# Run tests with coverage report
npm run test:coverage

# Run tests in watch mode (for development)
npm run test:watch
\`\`\`

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (\`git checkout -b feature/amazing-feature\`)
3. Commit your changes (\`git commit -m 'Add amazing feature'\`)
4. Push to the branch (\`git push origin feature/amazing-feature\`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with TypeScript and modern Node.js.
- Inspired by the need for better alias management in complex projects.
- Thanks to all contributors and users for their support and feedback.

## 📞 Support

- 📖 [Documentation](https://github.com/yourusername/auto-ts-alias/wiki) (Coming Soon)
- 🐛 [Issue Tracker](https://github.com/yourusername/auto-ts-alias/issues)
- 💬 [Discussions](https://github.com/yourusername/auto-ts-alias/discussions) (Coming Soon)

---

Made with ❤️ by developers, for developers.