/**
 * Configuration management for StylusDB
 * Loads and validates configuration from environment variables and config files
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { ConfigurationError } = require('../errors');

class Config {
    constructor() {
        this.env = process.env.NODE_ENV || 'development';
        this.loadConfig();
        this.validate();
    }

    loadConfig() {
        // Default configuration
        this.config = {
            // Environment
            env: this.env,
            isDevelopment: this.env === 'development',
            isProduction: this.env === 'production',
            isTest: this.env === 'test',

            // Logging
            logging: {
                level: process.env.LOG_LEVEL || 'info',
            },

            // Server
            server: {
                port: parseInt(process.env.PORT) || 8081,
                clusterPorts: this.parseArray(process.env.CLUSTER_PORTS) || [8081, 8082, 8083, 8084],
            },

            // Raft
            raft: {
                electionMin: parseInt(process.env.RAFT_ELECTION_MIN) || 2000,
                electionMax: parseInt(process.env.RAFT_ELECTION_MAX) || 5000,
                heartbeat: parseInt(process.env.RAFT_HEARTBEAT) || 1000,
            },

            // Database
            database: {
                path: process.env.DB_PATH || './db',
                mapSize: parseInt(process.env.DB_MAP_SIZE) || 2 * 1024 * 1024 * 1024,
                maxDbs: parseInt(process.env.DB_MAX_DBS) || 10,
                batchSize: parseInt(process.env.DB_BATCH_SIZE) || 100,
            },

            // Network
            network: {
                timeout: parseInt(process.env.NETWORK_TIMEOUT) || 5000,
                socketTimeout: parseInt(process.env.SOCKET_TIMEOUT) || 10000,
            },

            // Monitoring
            monitoring: {
                enabled: process.env.ENABLE_METRICS === 'true',
                port: parseInt(process.env.METRICS_PORT) || 9090,
            },
        };

        // Load environment-specific config file if it exists
        const envConfigPath = path.join(__dirname, `${this.env}.json`);
        if (fs.existsSync(envConfigPath)) {
            const envConfig = JSON.parse(fs.readFileSync(envConfigPath, 'utf8'));
            this.mergeConfig(envConfig);
        }

        // Load local config if it exists (for overrides)
        const localConfigPath = path.join(__dirname, '../config.json');
        if (fs.existsSync(localConfigPath)) {
            const localConfig = JSON.parse(fs.readFileSync(localConfigPath, 'utf8'));
            this.mergeConfig(localConfig);
        }
    }

    parseArray(value) {
        if (!value) return null;
        if (Array.isArray(value)) return value;
        return value.split(',').map((item) => {
            const num = parseInt(item.trim());
            return isNaN(num) ? item.trim() : num;
        });
    }

    mergeConfig(newConfig) {
        // Deep merge configuration
        this.config = this.deepMerge(this.config, newConfig);
    }

    deepMerge(target, source) {
        const output = Object.assign({}, target);
        if (this.isObject(target) && this.isObject(source)) {
            Object.keys(source).forEach((key) => {
                if (this.isObject(source[key])) {
                    if (!(key in target)) {
                        Object.assign(output, { [key]: source[key] });
                    } else {
                        output[key] = this.deepMerge(target[key], source[key]);
                    }
                } else {
                    Object.assign(output, { [key]: source[key] });
                }
            });
        }
        return output;
    }

    isObject(item) {
        return item && typeof item === 'object' && !Array.isArray(item);
    }

    validate() {
        // Validate critical configuration
        if (this.config.server.port < 1024 || this.config.server.port > 65535) {
            throw new ConfigurationError('Invalid port number', 'server.port');
        }

        if (this.config.raft.electionMin >= this.config.raft.electionMax) {
            throw new ConfigurationError(
                'Election min must be less than election max',
                'raft.election'
            );
        }

        if (this.config.database.mapSize < 1024 * 1024) {
            throw new ConfigurationError(
                'Database map size must be at least 1MB',
                'database.mapSize'
            );
        }
    }

    get(key, defaultValue = undefined) {
        const keys = key.split('.');
        let value = this.config;

        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = value[k];
            } else {
                return defaultValue;
            }
        }

        return value;
    }

    set(key, value) {
        const keys = key.split('.');
        const lastKey = keys.pop();
        let target = this.config;

        for (const k of keys) {
            if (!(k in target)) {
                target[k] = {};
            }
            target = target[k];
        }

        target[lastKey] = value;
    }

    toJSON() {
        return this.config;
    }
}

// Export singleton instance
const config = new Config();
module.exports = config;
