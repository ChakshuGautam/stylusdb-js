/**
 * Health check system for StylusDB
 * Provides detailed health status of various components
 */

const logger = require('./logger').createModuleLogger('health');

class HealthCheck {
    constructor() {
        this.checks = new Map();
        this.startTime = Date.now();
    }

    /**
     * Register a health check
     * @param {string} name - Name of the check
     * @param {Function} checkFn - Async function that returns true if healthy
     */
    register(name, checkFn) {
        this.checks.set(name, checkFn);
        logger.debug(`Registered health check: ${name}`);
    }

    /**
     * Run all health checks
     * @returns {Object} Health status
     */
    async check() {
        const results = {};
        let healthy = true;

        for (const [name, checkFn] of this.checks.entries()) {
            try {
                const result = await Promise.race([
                    checkFn(),
                    this.timeout(5000), // 5 second timeout
                ]);

                results[name] = {
                    status: result ? 'healthy' : 'unhealthy',
                    timestamp: new Date().toISOString(),
                };

                if (!result) {
                    healthy = false;
                }
            } catch (error) {
                results[name] = {
                    status: 'error',
                    error: error.message,
                    timestamp: new Date().toISOString(),
                };
                healthy = false;
                logger.error(`Health check failed: ${name}`, { error: error.message });
            }
        }

        return {
            status: healthy ? 'healthy' : 'unhealthy',
            uptime: Date.now() - this.startTime,
            timestamp: new Date().toISOString(),
            checks: results,
        };
    }

    /**
     * Simplified health check (just overall status)
     */
    async isHealthy() {
        const result = await this.check();
        return result.status === 'healthy';
    }

    timeout(ms) {
        return new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Health check timeout')), ms);
        });
    }

    /**
     * Get readiness status (can accept traffic)
     */
    async ready() {
        // Can be customized based on specific readiness criteria
        return await this.isHealthy();
    }

    /**
     * Get liveness status (process is alive)
     */
    async alive() {
        // Simple check that process is responsive
        return true;
    }
}

// Export singleton
const healthCheck = new HealthCheck();

// Register default checks
healthCheck.register('process', async () => {
    return process.uptime() > 0;
});

healthCheck.register('memory', async () => {
    const usage = process.memoryUsage();
    const maxMemory = 1024 * 1024 * 1024; // 1GB threshold
    return usage.heapUsed < maxMemory;
});

module.exports = healthCheck;
