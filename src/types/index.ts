export interface ScanOptions {
    srcDir ?: string
    excludeDirs ?: string[]
    minDepth?: number
    maxDepth ?: number 
    prefix ?: string
}

export interface AliasConfig {
    alias : string 
    path : string 
    relativePath : string
}

export interface CLIOptions {
    init ?: boolean
    watch ?: boolean
    sync ?: boolean
    dryRun ?: boolean
    verbose ?: boolean
    quiet ?: boolean
    srcDir ?: string
    configPath ?: string
    force ?: boolean
    interactive ?: boolean
}

export interface ProjectConfig {
    rootDir : string
    srcDir: string
    aliases : AliasConfig[]
    configFiles : ConfigFile[]
    packageManager : 'npm' | 'yarn' | 'pnpm'
}

export interface ValidationResult {
    isValid : boolean
    errors : string[]
    warnings : string[]
    suggestions : string[]
}

export interface GeneratorResult {
    success : boolean
    message : string
    aliases ?: AliasConfig[]
    errors ?: string[]
    warnings ?: string[]
    filesModified ?: string[] 
}

//add a common interface for generators
export interface AliasGenerator {
   updateAliases ? (aliasses : AliasConfig[]) : Promise<GeneratorResult>
   updatePaths ? (aliases : AliasConfig[]) : Promise<GeneratorResult>
}

export interface WatchOptions {
    debounceMs ?: number
    ignoreInitial ?: boolean
    persistent ?: boolean
    followSymlinks ?: boolean
}
export interface ConfigFile {
    type : 'tsconfig' | 'webpack' | 'vite' | 'jest' | 'rollup'
    path : string
    exists : boolean
    isValid : boolean
}