import * as fs from 'fs'
import * as path from 'path'

import type { AliasConfig , GeneratorResult }  from '../types'
import { Logger } from '../utils/logger'

export class ViteGenerator {

    private configPath : string
    private logger = Logger.getInstance()
    
    constructor(rootDir : string){
        this.configPath = path.join(rootDir , 'vite.config.js')
    }

    async updateAliases(aliases : AliasConfig[]) : Promise<GeneratorResult> {
        try {
            if(!fs.existsSync(this.configPath)){
                return this.createViteConfigFile(aliases)
            }
            return this.updateExistingConfig(aliases)
        } catch (error) {
            this.logger.error(`Failed to update Vite configuration` , error as Error )
            return{
                success : false,
                message : `Failed to update Vite configuration : ${(error as Error).message}`,
                errors : [(error as Error).message]
            }
        }
    }

    private async updateExistingConfig(aliases : AliasConfig[]) : Promise<GeneratorResult> {
        let content = await fs.promises.readFile(this.configPath, 'utf8')
        const aliasArray = this.generateAliasArray(aliases)

        //simple replacement for alias array
        const aliasRegex = /alias:\s*\[[^\]]*\]/s
        const newAliasString = `alias: [${aliasArray.map((alias) => `   ${alias}`).join(',\n')}]`
        if(aliasRegex.test(content)){
            content = content.replace(aliasRegex , newAliasString)
        }
        await fs.promises.writeFile(this.configPath, content, 'utf8')
        return {
            success : true,
            message : `Updated vite.config.js with ${aliases.length} aliases`,
            aliases,
        }

    }
    private async createViteConfigFile(aliases : AliasConfig[]) : Promise<GeneratorResult> {
        const aliasArray = this.generateAliasArray(aliases)
        const configContent = `import { defineConfig } from 'vite'
         import path from 'path'
         export default defineConfig({
             resolve: {
                alias : [
                    ${aliasArray.map((alias) => `   ${alias}`).join(',\n')}
                ]   
             }
         })
        
         `
         await fs.promises.writeFile(this.configPath, configContent, 'utf8')
        return {
            success : true,
            message : `Created vite.config.js with ${aliases.length} aliases`,
            aliases,
         }
    } 

    private generateAliasArray(alaises : AliasConfig[]) : string[] {
        return alaises.map((alaise)=> {
            const find = alaise.alias.replace('/*' , "")
            const replacement = alaise.path.replace('/*' , '').replace('./' , '')
            return `{ find: '${find}', replacement: path.resolve('${replacement}') }`
        })
    }
}