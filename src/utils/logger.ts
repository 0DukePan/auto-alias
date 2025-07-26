import chalk from 'chalk';
import ora, { type Ora } from 'ora';

export type LogLevel = 'error' | 'warn' | 'info' | 'debug' | 'verbose';

export class Logger {
    private static instance: Logger;
    private level: LogLevel = 'info';
    private quiet = false; 
    private spinner: Ora | null = null;

    private constructor() {}

    static getInstance() {
        if (!Logger.instance) {
            Logger.instance = new Logger();
        }
        return Logger.instance;
    }

    setLevel(level: LogLevel): void {
        this.level = level;
    }

    setQuiet(quiet: boolean): void { // Fixed: quit -> quiet
        this.quiet = quiet;
    }

    private shouldLog(level: LogLevel): boolean {
        if (this.quiet && level !== 'error') return false; // Fixed: Allow errors in quiet mode
        const levels: Record<LogLevel, number> = {
            error: 0,
            warn: 1,
            info: 2,
            debug: 3,
            verbose: 4
        };
        return levels[level] <= levels[this.level];
    }

    error(message: string, error?: Error): void {
        if (!this.shouldLog('error')) return;
        this.stopSpinner();
        console.error(chalk.red('❌ Error:'), message);
        if (error && this.level === 'debug') {
            console.error(chalk.gray(error.stack));
        }
    }

    warn(message: string): void {
        if (!this.shouldLog('warn')) return;
        this.stopSpinner();
        console.warn(chalk.yellow('⚠️ Warning:'), message);
    }

    info(message: string): void {
        if (!this.shouldLog('info')) return;
        this.stopSpinner();
        console.info(chalk.blue('ℹ️ Info:'), message);
    }

    success(message: string): void {
        if (!this.shouldLog('info')) return;
        this.stopSpinner();
        console.log(chalk.green('✅ Success:'), message);
    }

    debug(message: string): void {
        if (!this.shouldLog('debug')) return;
        this.stopSpinner();
        console.log(chalk.gray('🔎 Debug:'), message);
    }

    verbose(message: string): void {
        if (!this.shouldLog('verbose')) return;
        this.stopSpinner();
        console.log(chalk.gray('🔎 Verbose:'), message);
    }

    startSpinner(text: string): void {
        if (this.quiet) return;
        this.spinner = ora(text).start();
    }

    updateSpinner(text: string): void {
        if (this.spinner) {
            this.spinner.text = text;
        }
    }

    stopSpinner(symbol?: string, text?: string): void {
        if (this.spinner) {
            if (symbol && text) {
                this.spinner.stopAndPersist({ symbol, text });
            } else {
                this.spinner.stop();
            }
            this.spinner = null;
        }
    }

    succeedSpinner(text?: string): void {
        if (this.spinner) {
            this.spinner.succeed(text);
            this.spinner = null;
        }
    }

    failSpinner(text?: string): void {
        if (this.spinner) {
            this.spinner.fail(text);
            this.spinner = null;
        }
    }
}