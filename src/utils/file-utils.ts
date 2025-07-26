import { Logger } from "./logger";
import * as fs from 'fs';
import * as path from 'path';

export class FileUtils {
    private static logger = Logger.getInstance();

    static async ensureDir(dirPath: string): Promise<void> {
        try {
            await fs.promises.mkdir(dirPath, { recursive: true });
        } catch (error) {
            this.logger.error(`Failed to create directory ${dirPath}`, error as Error);
            throw error;
        }
    }

    static async readJsonFile<T = any>(filePath: string): Promise<T | null> {
        try {
            const content = await fs.promises.readFile(filePath, 'utf8');
            return JSON.parse(content);
        } catch (error) {
            this.logger.debug(`Failed to read JSON file: ${filePath}`);
            return null;
        }
    }

    static async writeJsonFile(filePath: string, data: any, indent = 2): Promise<void> {
        try {
            const content = JSON.stringify(data, null, indent); // Fixed typo: contenet -> content
            await fs.promises.writeFile(filePath, content);
        } catch (error) {
            this.logger.error(`Failed to write JSON file: ${filePath}`, error as Error);
            throw error;
        }
    }

    static getPackageManager(rootDir: string): 'npm' | 'yarn' | 'pnpm' {
        if (fs.existsSync(path.join(rootDir, 'pnpm-lock.yaml'))) return 'pnpm';
        if (fs.existsSync(path.join(rootDir, 'yarn.lock'))) return 'yarn';
        return 'npm';
    }

    static async findConfigFiles(rootDir: string): Promise<string[]> {
        const configFiles = [
            'tsconfig.json',
            'webpack.config.ts', // Fixed typo: weebpack -> webpack
            'webpack.config.js', // Fixed typo: weebpack -> webpack
            'vite.config.js',
            'vite.config.ts',
            'jest.config.js',
            'jest.config.ts',
            'rollup.config.js',
            'rollup.config.ts'
        ];
        const found: string[] = [];
        for (const file of configFiles) {
            const filePath = path.join(rootDir, file);
            if (fs.existsSync(filePath)) {
                found.push(filePath);
            }
        }
        return found;
    }
}