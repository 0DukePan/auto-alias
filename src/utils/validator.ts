import * as fs from "fs"
import * as path from "path"
import type { AliasConfig, ValidationResult } from "../types"

export class ConfigValidator {

  static validateAliases(aliases: AliasConfig[]): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      suggestions: [],
    }

    // Check for duplicate aliases
    const aliasNames = new Set<string>()
    const duplicates = new Set<string>()

    for (const alias of aliases) {
      if (aliasNames.has(alias.alias)) {
        duplicates.add(alias.alias)
        result.isValid = false
      }
      aliasNames.add(alias.alias)
    }

    if (duplicates.size > 0) {
      result.errors.push(`Duplicate aliases found: ${Array.from(duplicates).join(", ")}`)
    }

    // Check for conflicting paths
    const pathMap = new Map<string, string>()
    for (const alias of aliases) {
      const existingAlias = pathMap.get(alias.path)
      if (existingAlias && existingAlias !== alias.alias) {
        result.warnings.push(`Path ${alias.path} is mapped to multiple aliases: ${existingAlias}, ${alias.alias}`)
      }
      pathMap.set(alias.path, alias.alias)
    }

    // Check for invalid alias names
    for (const alias of aliases) {
      if (!/^[@a-zA-Z_$][@a-zA-Z0-9_$/]*$/.test(alias.alias.replace("/*", ""))) {
        result.errors.push(`Invalid alias name: ${alias.alias}`)
        result.isValid = false
      }
    }

    // Suggestions
    if (aliases.length === 0) {
      result.suggestions.push("No aliases found. Consider organizing your code into subdirectories.")
    }

    if (aliases.length > 20) {
      result.warnings.push("Large number of aliases detected. Consider consolidating similar directories.")
    }

    return result
  }

  static validateProjectStructure(rootDir: string, srcDir: string): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      suggestions: [],
    }

    // Check if root directory exists
    if (!fs.existsSync(rootDir)) {
      result.errors.push(`Root directory does not exist: ${rootDir}`)
      result.isValid = false
      return result
    }

    // Check if src directory exists
    const srcPath = path.join(rootDir, srcDir)
    if (!fs.existsSync(srcPath)) {
      result.errors.push(`Source directory does not exist: ${srcPath}`)
      result.isValid = false
    }

    // Check for package.json
    const packageJsonPath = path.join(rootDir, "package.json")
    if (!fs.existsSync(packageJsonPath)) {
      result.warnings.push("No package.json found. This might not be a Node.js project.")
    }

    // Check for TypeScript
    const tsconfigPath = path.join(rootDir, "tsconfig.json")
    if (!fs.existsSync(tsconfigPath)) {
      result.suggestions.push(
        "No tsconfig.json found. Consider initializing TypeScript for better development experience.",
      )
    }

    return result
  }

  static validateConfigFile(filePath: string, type: string): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      suggestions: [],
    }

    if (!fs.existsSync(filePath)) {
      result.errors.push(`Configuration file does not exist: ${filePath}`)
      result.isValid = false
      return result
    }

    try {
      const content = fs.readFileSync(filePath, "utf8")

      if (type === "tsconfig" && filePath.endsWith(".json")) {
        // Basic JSON validation for tsconfig
        JSON.parse(content.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, ""))
      }

      // Check if file is writable
      fs.accessSync(filePath, fs.constants.W_OK)
    } catch (error) {
      result.errors.push(`Invalid or unwritable configuration file: ${filePath}`)
      result.isValid = false
    }

    return result
  }
}