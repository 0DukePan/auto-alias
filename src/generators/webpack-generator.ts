import * as fs from 'fs';
import * as path from 'path';
import type { AliasConfig, GeneratorResult } from '../types';
import { Logger } from '../utils/logger';

export class WebpackGenerator {
    private configPath: string;
    private logger = Logger.getInstance();

    constructor(rootDir: string) {
        this.configPath = path.join(rootDir, 'webpack.config.js');
    }

    async updateAliases(aliases: AliasConfig[]): Promise<GeneratorResult> {
        try {
            if (!fs.existsSync(this.configPath)) {
                return this.createWebpackConfigFile(aliases);
            }
            return this.updateExistingConfig(aliases);
        } catch (error) {
            this.logger.error(`Failed to update Webpack configuration`, error as Error);
            return {
                success: false,
                message: `Failed to update Webpack configuration: ${(error as Error).message}`,
                errors: [(error as Error).message]
            };
        }
    }

    private async createWebpackConfigFile(aliases: AliasConfig[]): Promise<GeneratorResult> {
        const aliasObject = this.generateAliasObject(aliases);
        const configContent = `const path = require('path');
module.exports = {
    resolve: {
        alias: ${JSON.stringify(aliasObject, null, 2).replace(/"/g, "'")}
    }
};
`;
        await fs.promises.writeFile(this.configPath, configContent, 'utf8');
        return {
            success: true,
            message: `Created webpack.config.js with ${aliases.length} aliases`,
            aliases,
            filesModified: [this.configPath]
        };
    }

    private async updateExistingConfig(aliases: AliasConfig[]): Promise<GeneratorResult> {
        let content = await fs.promises.readFile(this.configPath, 'utf8');
        const aliasObject = this.generateAliasObject(aliases); // Fixed: alaisObject -> aliasObject
        const aliasRegex = /alias:\s*{[^}]*}/;
        const newAliasString = `alias: ${JSON.stringify(aliasObject, null, 2).replace(/"/g, "'")}`;
        if (aliasRegex.test(content)) {
            content = content.replace(aliasRegex, newAliasString);
        } else {
            content = content.replace(/(\}\s*;?\s*$)/, `,\n    ${newAliasString}\n};`);
        }
        await fs.promises.writeFile(this.configPath, content, 'utf8');
        return {
            success: true,
            message: `Updated webpack.config.js with ${aliases.length} aliases`,
            aliases,
            filesModified: [this.configPath]
        };
    }

    private generateAliasObject(aliases: AliasConfig[]): Record<string, string> {
        const aliasObject: Record<string, string> = {};
        aliases.forEach((alias) => {
            const key = alias.alias.replace('/*', '');
            const value = alias.path.replace('/*', '').replace('./', '');
            aliasObject[key] = `path.resolve(__dirname, '${value}')`;
        });
        return aliasObject;
    }
}