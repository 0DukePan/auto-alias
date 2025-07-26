import * as fs from 'fs'
import * as path from 'path'
import { Logger } from '../utils/logger'
import { AliasConfig, GeneratorResult } from '../types'

export class JestGenerator{
    private configPath : string
    private logger = Logger.getInstance()

    constructor(rootDir : string){
        //try to find jest config file
        const possiblePaths = [
            path.join(rootDir , 'jest.config.js'),
            path.join(rootDir , 'jest.config.ts'),
            path.join(rootDir , 'jest.config.json')
        ]
        this.configPath = possiblePaths.find((p) => fs.existsSync(p)) || possiblePaths[0]
    }
    async updateAliases(aliases : AliasConfig[]) : Promise<GeneratorResult>{
            try {
                if(!fs.existsSync(this.configPath)){
                    return this.createJestConfigFile(aliases)
                }
                return this.updateExistingConfig(aliases)
            } catch (error) {
                this.logger.error(`Failed to update Jest configuration` , error as Error )
                return{
                    success : false,
                    message : 'Failed to update Jest configuration',
                    errors : [(error as Error).message]
                }
            }
    }
    private async updateExistingConfig(aliases: AliasConfig[]): Promise<GeneratorResult> {
        let content = await fs.promises.readFile(this.configPath, 'utf8');
        const moduleNameMapper = this.generateModuleNameMapper(aliases);
      
        
        const mapperRegex = /moduleNameMapper\s*:\s*{[^}]*}/s;
        const newMapperString = `moduleNameMapper: ${JSON.stringify(moduleNameMapper, null, 4)}`;
      
        if (mapperRegex.test(content)) {
          content = content.replace(mapperRegex, newMapperString);
        } else {
          const exportRegex = /module\.exports\s*=\s*{[\s\S]*?/;
      
          if (exportRegex.test(content)) {
            content = content.replace(exportRegex, match => {
              return match + `\n  ${newMapperString},`;
            });
          } else {
            content = `module.exports = {\n  ${newMapperString}\n};`;
          }
        }      
        await fs.promises.writeFile(this.configPath, content, 'utf8');
      
        return {
          success: true,
          message: `Updated jest.config.js with ${aliases.length} aliases`,
          aliases,
          filesModified: [this.configPath],
        };
      }
      
    private async createJestConfigFile(aliases : AliasConfig[]) : Promise<GeneratorResult>{
        const moduleNameMapper = this.generateModuleNameMapper(aliases)
        const configContent = `module.exports = {
            preset : 'ts-jest',
            testEnvironment : 'node',
            moduleNameMapper : ${JSON.stringify(moduleNameMapper , null , 4)},
            testMatch: [
                '**/tests/**/*.test.ts',
                '**/*.(test|ts).(ts|tsx|js)'
            ],
            collectCoverageFrom: ["src/**/*.{ts,tsx}", "!src/**/*.d.ts"],
        }`

        await fs.promises.writeFile(this.configPath , configContent  , 'utf8')
        return {
            success : true,
            message : `Created jest.config.js with ${aliases.length} aliases`,
            aliases,
            filesModified : [this.configPath]
        }

    }

    private generateModuleNameMapper(alaises : AliasConfig[]) : Record<string , string>{
        const mapper : Record<string , string> = {}
        alaises.forEach((alias) => {
            //Convert TypeScript alias to jest moduleNameMapper format 
            const key = `^${alias.alias.replace('/*' , "/(.*)$")}`
            const value = `<rootDir>/${alias.path.replace('./' , '').replace('/*' , '$1')}`
            mapper[key] = value
        })
        return mapper
    }
}