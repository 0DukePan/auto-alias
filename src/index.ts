export { MagicTsAlias } from "./core/magic-alias"
export { ProjectScanner } from "./core/scanner"
export { TsConfigGenerator } from "./generators/tsconfig-generator"
export { WebpackGenerator } from "./generators/webpack-generator"
export { ViteGenerator } from "./generators/vite-generator"
export { JestGenerator } from "./generators/jest-generator"

// Type exports
export type {
  AliasConfig,
  ProjectConfig,
  ScanOptions,
  CLIOptions,
  GeneratorResult,
  ConfigFile,
  WatchOptions,
} from "./types"

// Utility exports
export { Logger } from "./utils/logger"
export { ConfigValidator } from "./utils/validator"
export { FileUtils } from "./utils/file-utils"
