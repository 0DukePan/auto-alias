import * as fs from "fs"
import * as path from "path"
import { ProjectScanner } from "./scanner"
import { TsConfigGenerator } from "../generators/tsconfig-generator"
import { WebpackGenerator } from "../generators/webpack-generator"
import { ViteGenerator } from "../generators/vite-generator"
import { JestGenerator } from "../generators/jest-generator"
import { Logger } from "../utils/logger"
import { ConfigValidator } from "../utils/validator"
import { FileUtils } from "../utils/file-utils"
import type {
  ScanOptions,
  GeneratorResult,
  WatchOptions,
  ProjectConfig,
  AliasGenerator,
  ConfigFile,
  AliasConfig,
} from "../types"

export class MagicTsAlias {
  private rootDir: string
  private scanner: ProjectScanner
  private generators: Map<string, AliasGenerator>
  private logger = Logger.getInstance()
  private config: ProjectConfig

  constructor(rootDir?: string, options: ScanOptions = {}) {
    this.rootDir = path.resolve(rootDir || process.cwd())
    this.scanner = new ProjectScanner(this.rootDir, options)

    // Debug output
    this.logger.debug(`Initializing MagicTsAlias with rootDir: ${this.rootDir}`)
    this.logger.debug(`Options: ${JSON.stringify(options)}`)

    this.generators = new Map<string, AliasGenerator>([
      ["tsconfig", new TsConfigGenerator(this.rootDir)],
      ["webpack", new WebpackGenerator(this.rootDir)],
      ["vite", new ViteGenerator(this.rootDir)],
      ["jest", new JestGenerator(this.rootDir)],
    ])

    this.config = {
      rootDir: this.rootDir,
      srcDir: options.srcDir || "src",
      aliases: [] as AliasConfig[],
      configFiles: [] as ConfigFile[],
      packageManager: FileUtils.getPackageManager(this.rootDir),
    }

    this.logger.debug(`Config initialized: ${JSON.stringify(this.config)}`)
  }

  async initialize(force = false): Promise<GeneratorResult> {
    try {
      this.logger.debug("Starting initialization...")
      this.logger.startSpinner("🔍 Scanning project structure...")

      // Validate project structure
      const validation = ConfigValidator.validateProjectStructure(this.rootDir, this.config.srcDir)
      this.logger.debug(`Validation result: ${JSON.stringify(validation)}`)

      if (!validation.isValid) {
        this.logger.failSpinner()
        this.logger.error("Project validation failed")
        validation.errors.forEach((error) => this.logger.error(`  - ${error}`))
        return {
          success: false,
          message: "Project validation failed",
          errors: validation.errors,
        }
      }

      // Show warnings if any
      validation.warnings.forEach((warning) => this.logger.warn(warning))

      const aliases = await this.scanner.scanForAliases()
      this.logger.debug(`Found aliases: ${JSON.stringify(aliases)}`)
      this.logger.updateSpinner(`Found ${aliases.length} potential aliases`)

      if (aliases.length === 0) {
        this.logger.failSpinner()
        return {
          success: false,
          message: "No directories found to create aliases for",
          aliases: [],
        }
      }

      // Validate aliases
      const aliasValidation = ConfigValidator.validateAliases(aliases)
      if (!aliasValidation.isValid && !force) {
        this.logger.failSpinner()
        return {
          success: false,
          message: "Alias validation failed",
          errors: aliasValidation.errors,
        }
      }

      this.logger.succeedSpinner(`Found ${aliases.length} aliases`)

      // Display found aliases
      this.logger.info("Detected aliases:")
      aliases.forEach((alias) => {
        this.logger.verbose(`   ${alias.alias} → ${alias.path}`)
      })

      const results: GeneratorResult[] = []
      const configFiles = await FileUtils.findConfigFiles(this.rootDir)
      this.logger.debug(`Config files found: ${JSON.stringify(configFiles)}`)

      this.logger.startSpinner("⚙️  Updating configuration files...")

      // Always update tsconfig.json
      const tsconfigGenerator = this.generators.get("tsconfig")
      if (tsconfigGenerator && tsconfigGenerator.updatePaths) {
        this.logger.debug("Updating tsconfig.json...")
        try {
          const tsconfigResult = await tsconfigGenerator.updatePaths(aliases)
          results.push(tsconfigResult)

          if (tsconfigResult.success) {
            this.logger.verbose(`✅ ${tsconfigResult.message}`)
          } else {
            this.logger.error(`❌ ${tsconfigResult.message}`)
            // Log additional error details if available
            if (tsconfigResult.errors) {
              tsconfigResult.errors.forEach((error) => this.logger.error(`   ${error}`))
            }
          }
        } catch (error) {
          this.logger.error(`❌ Failed to update tsconfig.json: ${(error as Error).message}`)
          results.push({
            success: false,
            message: `Failed to update tsconfig.json: ${(error as Error).message}`,
            errors: [(error as Error).message],
          })
        }
      }

      // Update other config files if they exist
      for (const [type, generator] of this.generators) {
        if (type === "tsconfig") continue // Already handled

        const configExists = configFiles.some(
          (file) => file.includes(type) || (type === "webpack" && file.includes("webpack")),
        )

        if (configExists && generator.updateAliases) {
          this.logger.debug(`Updating ${type} configuration...`)
          try {
            const result = await generator.updateAliases(aliases)
            results.push(result)

            if (result.success) {
              this.logger.verbose(`✅ ${result.message}`)
            } else {
              this.logger.error(`❌ ${result.message}`)
              if (result.errors) {
                result.errors.forEach((error) => this.logger.error(`   ${error}`))
              }
            }
          } catch (error) {
            this.logger.error(`❌ Failed to update ${type}: ${(error as Error).message}`)
            results.push({
              success: false,
              message: `Failed to update ${type}: ${(error as Error).message}`,
              errors: [(error as Error).message],
            })
          }
        }
      }

      const allSuccessful = results.every((result) => result.success)
      const successCount = results.filter((result) => result.success).length

      if (allSuccessful) {
        this.logger.succeedSpinner(
          `Successfully synchronized ${aliases.length} aliases across ${successCount} configuration files!`,
        )
      } else {
        this.logger.failSpinner(`Updated ${successCount}/${results.length} configuration files`)
      }

      return {
        success: allSuccessful,
        message: allSuccessful
          ? `🎉 Successfully synchronized ${aliases.length} aliases across all configuration files!`
          : `⚠️  Updated ${successCount}/${results.length} configuration files`,
        aliases,
        filesModified: results.flatMap((r) => r.filesModified || []),
      }
    } catch (error) {
      this.logger.failSpinner()
      this.logger.error("Initialization failed", error as Error)

      return {
        success: false,
        message: `❌ Initialization failed: ${(error as Error).message}`,
        errors: [(error as Error).message],
      }
    }
  }

  async sync(): Promise<GeneratorResult> {
    this.logger.info("🔄 Syncing aliases...")
    return this.initialize()
  }

  async watch(options: WatchOptions = {}): Promise<void> {
    const chokidar = await import("chokidar")

    this.logger.info("👀 Starting watch mode...")
    this.logger.info(`   Watching for changes in ${this.config.srcDir}/ directory`)

    const srcPath = path.join(this.rootDir, this.config.srcDir)
    const watchOptions = {
      ignored: /(^|[/\\])\../, // ignore dotfiles
      persistent: true,
      ignoreInitial: true,
      ...options,
    }

    const watcher = chokidar.watch(srcPath, watchOptions)

    let timeout: NodeJS.Timeout
    const debounceMs = options.debounceMs || 1000

    const handleChange = (eventPath: string) => {
      clearTimeout(timeout)
      timeout = setTimeout(async () => {
        this.logger.info(`\n📁 Directory structure changed: ${path.relative(this.rootDir, eventPath)}`)
        this.logger.info("   Re-syncing aliases...")

        const result = await this.sync()
        if (result.success) {
          this.logger.success("Aliases synchronized successfully")
        } else {
          this.logger.error("Failed to sync aliases")
        }
      }, debounceMs)
    }

    watcher
      .on("addDir", handleChange)
      .on("unlinkDir", handleChange)
      .on("error", (error) => this.logger.error("Watcher error", error))

    this.logger.info("   Press Ctrl+C to stop watching\n")

    // Handle graceful shutdown
    process.on("SIGINT", () => {
      this.logger.info("\n👋 Stopping watch mode...")
      watcher.close()
      process.exit(0)
    })
  }

  async generateHelperFile(): Promise<GeneratorResult> {
    try {
      const aliases = await this.scanner.scanForAliases()
      const helperPath = path.join(this.rootDir, this.config.srcDir, "aliases.ts")

      await FileUtils.ensureDir(path.dirname(helperPath))

      const content = `// Auto-generated alias helper file
// This file is automatically updated by magic-ts-alias
// Last updated: ${new Date().toISOString()}

export const ALIASES = {
${aliases.map((alias) => `  '${alias.alias.replace("/*", "")}': '${alias.path.replace("/*", "")}'`).join(",\n")}
} as const;

export type AliasKey = keyof typeof ALIASES;

// Helper function to get alias path
export function getAliasPath(key: AliasKey): string {
  return ALIASES[key];
}

// Helper function to resolve alias
export function resolveAlias(key: AliasKey, subPath = ''): string {
  const basePath = ALIASES[key];
  return subPath ? \`\${basePath}/\${subPath}\` : basePath;
}
`

      await fs.promises.writeFile(helperPath, content, "utf8")

      return {
        success: true,
        message: `Generated alias helper file: ${helperPath}`,
        aliases,
        filesModified: [helperPath],
      }
    } catch (error) {
      return {
        success: false,
        message: `Failed to generate helper file: ${(error as Error).message}`,
        errors: [(error as Error).message],
      }
    }
  }

  async dryRun(): Promise<GeneratorResult> {
    try {
      this.logger.info("🧪 Running dry-run mode...")

      const aliases = await this.scanner.scanForAliases()
      const configFiles = await FileUtils.findConfigFiles(this.rootDir)

      this.logger.info(`\n📁 Would generate ${aliases.length} aliases:`)
      aliases.forEach((alias) => {
        console.log(`   ${alias.alias} → ${alias.path}`)
      })

      this.logger.info(`\n⚙️  Would update ${configFiles.length} configuration files:`)
      configFiles.forEach((file) => {
        console.log(`   ${path.relative(this.rootDir, file)}`)
      })

      return {
        success: true,
        message: `Dry-run completed. Would update ${configFiles.length} files with ${aliases.length} aliases.`,
        aliases,
      }
    } catch (error) {
      return {
        success: false,
        message: `Dry-run failed: ${(error as Error).message}`,
        errors: [(error as Error).message],
      }
    }
  }

  getProjectInfo(): ProjectConfig {
    return { ...this.config }
  }
}