import dayjs from 'dayjs';

const colors = {
    reset: '\x1b[0m',
    bold: '\x1b[1m',
    dim: '\x1b[90m', // Dim Gray
    levelDefault: '\x1b[38;2;255;87;51m', // #FF5733 Orange-Red
    timestamp: '\x1b[38;2;41;128;185m', // #2980B9 Blue
    context: '\x1b[38;2;255;105;180m', // #FF69B4 Pink
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    red: '\x1b[31m',
    cyan: '\x1b[36m',
    magenta: '\x1b[35m',
    whiteBold: '\x1b[1;37m',
};

export class LoggerService {
    private readonly contextName: string;

    constructor(contextName = 'NextServer') {
        this.contextName = contextName;
    }

    private formatMessage(
        level: string,
        message: string,
        levelColor = colors.levelDefault,
    ): string {
        const timestamp = dayjs().format('DD-MM-YYYY HH:mm:ss');
        const coloredTimestamp = `${colors.timestamp}${timestamp}${colors.reset}`;
        const coloredLevel = `${levelColor}${level}${colors.reset}`;
        const coloredContext = `${colors.context}${this.contextName}${colors.reset}`;

        return `[${coloredTimestamp}] - [${coloredLevel}]: [${coloredContext}] ${message}`;
    }

    info(message: string): void {
        console.log(this.formatMessage('info', message, colors.green));
    }

    warn(message: string): void {
        console.warn(this.formatMessage('warn', message, colors.yellow));
    }

    error(message: string, stack?: string): void {
        const msg = stack ? `${message}\n${colors.red}${stack}${colors.reset}` : message;
        console.error(this.formatMessage('error', msg, colors.red));
    }

    debug(message: string): void {
        console.debug(this.formatMessage('debug', message, colors.cyan));
    }

    private colorMethod(method: string): string {
        switch (method.toUpperCase()) {
            case 'GET':
                return `${colors.cyan}${colors.bold}${method}${colors.reset}`;
            case 'POST':
                return `${colors.green}${colors.bold}${method}${colors.reset}`;
            case 'PUT':
            case 'PATCH':
                return `${colors.yellow}${colors.bold}${method}${colors.reset}`;
            case 'DELETE':
                return `${colors.red}${colors.bold}${method}${colors.reset}`;
            default:
                return `${colors.magenta}${colors.bold}${method}${colors.reset}`;
        }
    }

    private colorDuration(ms: number): string {
        const color = ms > 500 ? colors.red : ms > 100 ? colors.yellow : colors.green;
        return `${color}${ms}ms${colors.reset}`;
    }

    initDevStdoutColorizer(): void {
        const stdout = typeof process !== 'undefined' ? (process as any)['stdout'] : undefined;
        if (!stdout || typeof stdout.write !== 'function') return;
        if (
            (globalThis as unknown as { __DEV_LOGGER_INITIALIZED__?: boolean })
                .__DEV_LOGGER_INITIALIZED__
        )
            return;
        (
            globalThis as unknown as { __DEV_LOGGER_INITIALIZED__?: boolean }
        ).__DEV_LOGGER_INITIALIZED__ = true;

        const originalWrite = stdout.write.bind(stdout);

        stdout.write = (chunk: any, encoding?: any, callback?: any): boolean => {
            if (typeof chunk === 'string' || Buffer.isBuffer(chunk)) {
                const str = chunk.toString();
                const match = str.match(
                    /^\s*(GET|POST|PUT|PATCH|DELETE|OPTIONS|HEAD)\s+(.+?)\s+(\d{3})\s+in\s+(\d+(?:\.\d+)?(?:ms|s))(?:\s+\((.+)\))?/,
                );

                if (match) {
                    const [, method, url, statusStr, durationStr, breakdown] = match;
                    const status = parseInt(statusStr, 10);
                    const durationMs =
                        durationStr.endsWith('s') && !durationStr.endsWith('ms')
                            ? Math.round(parseFloat(durationStr) * 1000)
                            : parseInt(durationStr.replace('ms', ''), 10);

                    const coloredIp = `${colors.dim}::1${colors.reset}`;
                    const coloredMethod = this.colorMethod(method);
                    const coloredUrl = `${colors.whiteBold}${url}${colors.reset}`;
                    const statusColor =
                        status >= 500 ? colors.red : status >= 400 ? colors.yellow : colors.green;
                    const coloredStatus = `${statusColor}${status}${colors.reset}`;
                    const coloredDuration = this.colorDuration(durationMs);
                    const coloredBreakdown = breakdown
                        ? ` ${colors.dim}(${breakdown.replace('application-code:', 'app:')})${colors.reset}`
                        : '';

                    const formattedMsg = `${coloredIp} - "${coloredMethod} ${coloredUrl}" ${coloredStatus} (${coloredDuration})${coloredBreakdown}`;
                    const level = status >= 500 ? 'error' : status >= 400 ? 'warn' : 'info';
                    const levelColor =
                        status >= 500 ? colors.red : status >= 400 ? colors.yellow : colors.green;

                    originalWrite(this.formatMessage(level, formattedMsg, levelColor) + '\n');
                    return true;
                }
            }

            return originalWrite(chunk, encoding, callback);
        };
    }

    logHttpRequest(params: {
        ip: string;
        method: string;
        url: string;
        status: number;
        durationMs: number;
    }): void {
        const { ip, method, url, status, durationMs } = params;

        const coloredIp = `${colors.dim}${ip}${colors.reset}`;
        const coloredMethod = this.colorMethod(method);
        const coloredUrl = `${colors.whiteBold}${url}${colors.reset}`;
        const statusColor =
            status >= 500 ? colors.red : status >= 400 ? colors.yellow : colors.green;
        const coloredStatus = `${statusColor}${status}${colors.reset}`;
        const coloredDuration = this.colorDuration(durationMs);

        const message = `${coloredIp} - "${coloredMethod} ${coloredUrl}" ${coloredStatus} (${coloredDuration})`;

        if (status >= 500) {
            this.error(message);
        } else if (status >= 400) {
            this.warn(message);
        } else {
            this.info(message);
        }
    }
}

export const logger = new LoggerService('NextServer');
