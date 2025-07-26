# 🧠 auto-ts-alias

[![npm version](https://badge.fury.io/js/auto-ts-alias.svg)](https://badge.fury.io/js/auto-ts-alias)
[![CI](https://github.com/yourusername/auto-ts-alias/workflows/CI/badge.svg)](https://github.com/yourusername/auto-ts-alias/actions)
[![codecov](https://codecov.io/gh/yourusername/auto-ts-alias/branch/main/graph/badge.svg)](https://codecov.io/gh/yourusername/auto-ts-alias)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Professional TypeScript Alias Synchronization Tool**

Automatically scan your project structure and synchronize path aliases across all major configuration files. No more manual updates!

---

## ✨ Features

* 🔍 **Smart Scanning**: Detects project structure and common source directories automatically.
* ⚙️ **Multi-Platform Support**: Compatible with `tsconfig.json`, Webpack, Vite, and Jest.
* 👀 **Watch Mode**: Real-time alias sync on file system changes.
* 🛡️ **Validation**: Ensures project structure and aliases are valid before applying.
* 🌟 **Interactive CLI**: Offers a guided CLI experience for ease of use.
* 📦 **Zero Config**: Works out of the box with sensible defaults.
* 🤕 **Dry Run Mode**: Preview changes without applying them.
* 📄 **Helper File Generator**: Creates runtime-friendly TypeScript alias helper files.

---

## 🚀 Quick Start

```bash
# Install globally
npm install -g auto-ts-alias

# Or use npx for one-off usage
npx auto-ts-alias --init
```

---

## 📖 CLI Usage

### Basic Commands

```bash
# Initialize and apply aliases
auto-ts-alias --init

# Start watch mode for auto-sync
auto-ts-alias --watch

# Manually sync aliases
auto-ts-alias --sync

# Preview changes
auto-ts-alias --dry-run

# Use interactive mode
auto-ts-alias --interactive
```

### Advanced Options

```bash
# Use a custom source directory
auto-ts-alias --init --src-dir app

# Show verbose logs
auto-ts-alias --init --verbose

# Silence logs except for errors
auto-ts-alias --init --quiet

# Force sync despite validation errors
auto-ts-alias --init --force

# Generate only the helper file
auto-ts-alias helper

# Preview alias scan
auto-ts-alias scan

# Validate project configuration
auto-ts-alias validate
```

---

## 🏗️ How It Works

### 1. Directory Scanning

Scans your `src/` (or custom) directory for subdirectories, generating aliases like:

```
src/
├── components/     → @components
├── utils/          → @utils
├── hooks/          → @hooks
└── services/       → @services
```

A root alias (`@/*`) is always included.

### 2. Config File Updates

Updates the following config files if detected:

#### tsconfig.json

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@components/*": ["./src/components/*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

#### webpack.config.js

```js
const path = require('path');

module.exports = {
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@components': path.resolve(__dirname, 'src/components')
    }
  }
};
```

#### vite.config.ts

```ts
import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: [
      { find: '@', replacement: path.resolve(__dirname, 'src') },
      { find: '@components', replacement: path.resolve(__dirname, 'src/components') }
    ]
  }
});
```

#### jest.config.js

```js
module.exports = {
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^@components/(.*)$": "<rootDir>/src/components/$1"
  }
};
```

---

## 📒 Programmatic API

```ts
import { autoTsAlias } from 'auto-ts-alias';

const tool = new autoTsAlias('/project/path', {
  srcDir: 'src',
  excludeDirs: ['node_modules', '.git', 'dist'],
  prefix: '@',
  minDepth: 1,
  maxDepth: 4
});

await tool.initialize();
await tool.watch({ debounceMs: 500 });
await tool.generateHelperFile();

const dryRun = await tool.dryRun();
console.log(dryRun.message);

const info = tool.getProjectInfo();
console.log(info.aliases);
```

---

## 🤔 Testing

```bash
# Run tests
npm test

# Test with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

---

## 🙏 Contributing

We welcome contributions! Please see the [Contributing Guide](CONTRIBUTING.md).

1. Fork the repo
2. Create your branch: `git checkout -b feature/my-feature`
3. Commit: `git commit -m 'Add feature'`
4. Push: `git push origin feature/my-feature`
5. Open a Pull Request

---

## 📄 License

MIT License. See the [LICENSE](LICENSE) file for more info.

---

## 🙏 Acknowledgments

* Built with modern TypeScript and Node.js.
* Inspired by the challenges of managing aliases in growing projects.
* Thanks to the community for ideas, feedback, and contributions.

---

## 📞 Support

* 📖 [Docs](https://github.com/yourusername/auto-ts-alias/wiki) (Coming Soon)
* 🛠️ [Issues](https://github.com/yourusername/auto-ts-alias/issues)
* 🖊️ [Discussions](https://github.com/yourusername/auto-ts-alias/discussions) (Coming Soon)
