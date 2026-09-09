export async function register() {
    if (process.env.NODE_ENV === 'development' && process.env.NEXT_RUNTIME === 'nodejs') {
        const { logger } = await import('@/utilities/logger');
        logger.initDevStdoutColorizer();
    }
}
