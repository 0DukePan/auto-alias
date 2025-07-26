#!/usr/bin/env node

import { Command } from "commander"
import chalk from "chalk"
import inquirer from "inquirer"
import { MagicTsAlias } from "../core/magic-alias"
import { Logger } from "../utils/logger"
import { ConfigValidator } from "../utils/validator"
import type { CLIOptions, ScanOptions } from "../types"

const logger = Logger.getInstance()

const program = new Command()

program.name("magic-ts-alias").description("🧠 Automated TypeScript alias synchronization tool").version("1.0.0")

// Interactive mode function
async function runInteractiveMode(magicAlias: MagicTsAlias): Promise<void> {
  console.log(chalk.yellow("🎯 Interactive Mode\n"))

  const answers = await inquirer.prompt([
    {
      type: "list",
      name: "action",
      message: "What would you like to do?",
      choices: [
        { name: "🚀 Initialize aliases", value: "init" },
        { name: "🔄 Sync existing aliases", value: "sync" },
        { name: "👀 Start watch mode", value: "watch" },
        { name: "🧪 Run dry-run", value: "dryRun" },
        { name: "📄 Generate helper file", value: "helper" },
        { name: "📊 Show project info", value: "info" },
      ],
    },
  ])

  switch (answers.action) {
    case "init":
      const initResult = await magicAlias.initialize()
      console.log(initResult.success ? chalk.green(initResult.message) : chalk.red(initResult.message))
      break

    case "sync":
      const syncResult = await magicAlias.sync()
      console.log(syncResult.success ? chalk.green(syncResult.message) : chalk.red(syncResult.message))
      break

    case "watch":
      await magicAlias.watch()
      break

    case "dryRun":
      const dryResult = await magicAlias.dryRun()
      console.log(dryResult.success ? chalk.blue(dryResult.message) : chalk.red(dryResult.message))
      break

    case "helper":
      const helperResult = await magicAlias.generateHelperFile()
      console.log(helperResult.success ? chalk.green(helperResult.message) : chalk.red(helperResult.message))
      break

    case "info":
      const info = magicAlias.getProjectInfo()
      console.log(chalk.blue("\n📊 Project Information:"))
      console.log(`   Root Directory: ${info.rootDir}`)
      console.log(`   Source Directory: ${info.srcDir}`)
      console.log(`   Package Manager: ${info.packageManager}`)
      console.log(`   Aliases: ${info.aliases.length}`)
      break
  }
}

// Helper function to create ScanOptions with only defined values
function createScanOptions(options: CLIOptions): ScanOptions {
  const scanOptions: ScanOptions = {}

  if (options.srcDir !== undefined) {
    scanOptions.srcDir = options.srcDir
  }

  return scanOptions
}

program
  .option("-i, --init", "Initialize and generate aliases")
  .option("-w, --watch", "Watch for changes and auto-sync")
  .option("-s, --sync", "Sync aliases to configuration files")
  .option("-d, --dry-run", "Show what would be changed without making changes")
  .option("-v, --verbose", "Show detailed output")
  .option("-q, --quiet", "Suppress non-error output")
  .option("--src-dir <dir>", "Source directory to scan (default: src)")
  .option("--config-path <path>", "Custom tsconfig.json path")
  .option("--force", "Force update even if validation fails")
  .option("--interactive", "Run in interactive mode")
  .action(async (options: CLIOptions) => {
    try {
      // Configure logger
      if (options.verbose) logger.setLevel("verbose")
      if (options.quiet) logger.setQuiet(true)

      console.log(chalk.cyan.bold("🧠 Magic TypeScript Alias Tool"))
      console.log(chalk.gray("   Automated alias synchronization for modern web projects\n"))

      // Debug: Show what options were received
      if (options.verbose) {
        console.log(chalk.gray("Debug: Received options:"), options)
      }

      // Create scan options with only defined values
      const scanOptions = createScanOptions(options)
      const magicAlias = new MagicTsAlias(process.cwd(), scanOptions)

      if (options.interactive) {
        await runInteractiveMode(magicAlias)
      } else if (options.watch) {
        console.log(chalk.blue("Starting watch mode..."))
        await magicAlias.watch()
      } else if (options.sync) {
        console.log(chalk.blue("Syncing aliases..."))
        const result = await magicAlias.sync()
        console.log(result.success ? chalk.green(result.message) : chalk.red(result.message))
      } else if (options.dryRun) {
        console.log(chalk.blue("Running dry-run..."))
        const result = await magicAlias.dryRun()
        console.log(result.success ? chalk.blue(result.message) : chalk.red(result.message))
      } else if (options.init) {
        console.log(chalk.blue("Initializing aliases..."))
        const result = await magicAlias.initialize(options.force)
        console.log(result.success ? chalk.green(result.message) : chalk.red(result.message))

        if (result.success) {
          console.log(chalk.blue("Generating helper file..."))
          const helperResult = await magicAlias.generateHelperFile()
          console.log(helperResult.success ? chalk.green(helperResult.message) : chalk.yellow(helperResult.message))
        }
      } else {
        // Default behavior - show help or run init
        console.log(chalk.yellow("No action specified. Running initialization..."))
        const result = await magicAlias.initialize()
        console.log(result.success ? chalk.green(result.message) : chalk.red(result.message))
      }

      console.log(chalk.gray("\n✨ Done!"))
    } catch (error) {
      console.error(chalk.red("❌ CLI Error:"), (error as Error).message)
      if (options.verbose) {
        console.error(chalk.gray((error as Error).stack))
      }
      process.exit(1)
    }
  })

// Individual commands
program
  .command("scan")
  .description("Scan project structure and show potential aliases")
  .option("--src-dir <dir>", "Source directory to scan")
  .action(async (options) => {
    try {
      console.log(chalk.cyan("🔍 Scanning project structure..."))
      const scanOptions = createScanOptions(options)
      const magicAlias = new MagicTsAlias(process.cwd(), scanOptions)
      const result = await magicAlias.dryRun()

      if (result.success && result.aliases) {
        console.log(chalk.cyan("📁 Detected aliases:\n"))
        result.aliases.forEach((alias) => {
          console.log(`   ${chalk.yellow(alias.alias)} → ${chalk.gray(alias.path)}`)
        })
      } else {
        console.log(chalk.red("Failed to scan project structure"))
      }
    } catch (error) {
      console.error(chalk.red("❌ Scan failed:"), (error as Error).message)
      process.exit(1)
    }
  })

program
  .command("helper")
  .description("Generate TypeScript alias helper file")
  .action(async () => {
    try {
      console.log(chalk.cyan("📄 Generating helper file..."))
      const magicAlias = new MagicTsAlias()
      const result = await magicAlias.generateHelperFile()
      console.log(result.success ? chalk.green(result.message) : chalk.red(result.message))
    } catch (error) {
      console.error(chalk.red("❌ Helper generation failed:"), (error as Error).message)
      process.exit(1)
    }
  })

program
  .command("validate")
  .description("Validate project structure and configuration")
  .action(async () => {
    try {
      console.log(chalk.cyan("🔍 Validating project structure..."))
      const rootDir = process.cwd()
      const validation = ConfigValidator.validateProjectStructure(rootDir, "src")

      if (validation.isValid) {
        console.log(chalk.green("✅ Project structure is valid"))
      } else {
        console.log(chalk.red("❌ Project validation failed:"))
        validation.errors.forEach((error) => console.log(`   ${error}`))
      }

      validation.warnings.forEach((warning) => console.log(chalk.yellow(`⚠️  ${warning}`)))
      validation.suggestions.forEach((suggestion) => console.log(chalk.blue(`💡 ${suggestion}`)))
    } catch (error) {
      console.error(chalk.red("❌ Validation failed:"), (error as Error).message)
      process.exit(1)
    }
  })

// Add error handling for the program itself
program.configureOutput({
  writeErr: (str) => process.stderr.write(chalk.red(str)),
  writeOut: (str) => process.stdout.write(str),
})

// Handle uncaught errors
process.on("uncaughtException", (error) => {
  console.error(chalk.red("❌ Uncaught Exception:"), error.message)
  if (process.env.NODE_ENV === "development") {
    console.error(error.stack)
  }
  process.exit(1)
})

process.on("unhandledRejection", (reason, promise) => {
  console.error(chalk.red("❌ Unhandled Rejection at:"), promise, "reason:", reason)
  process.exit(1)
})

// Parse command line arguments
try {
  program.parse()
} catch (error) {
  console.error(chalk.red("❌ CLI parsing error:"), (error as Error).message)
  process.exit(1)
}