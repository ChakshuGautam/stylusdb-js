/**
 * HTTP API Server for StylusDB
 * Provides REST API for key-value operations and cluster management
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const logger = require('./logger').createModuleLogger('api');
const config = require('./config');

class APIServer {
    constructor(raftInstance) {
        this.raft = raftInstance;
        this.app = express();
        this.setupMiddleware();
        this.setupRoutes();
    }

    setupMiddleware() {
        // Security
        this.app.use(helmet());
        this.app.use(cors());

        // Body parsing
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));

        // Rate limiting
        const limiter = rateLimit({
            windowMs: 15 * 60 * 1000, // 15 minutes
            max: 100, // Limit each IP to 100 requests per windowMs
        });
        this.app.use('/api/', limiter);

        // Request logging
        this.app.use((req, res, next) => {
            logger.info('API Request', {
                method: req.method,
                path: req.path,
                ip: req.ip,
            });
            next();
        });
    }

    setupRoutes() {
        // Health check
        this.app.get('/health', (req, res) => {
            res.json({
                status: 'healthy',
                uptime: process.uptime(),
                timestamp: new Date().toISOString(),
            });
        });

        // GET key
        this.app.get('/api/kv/:key', (req, res) => {
            try {
                const { key } = req.params;
                const value = this.raft.db.get(key);

                if (value === null || value === undefined) {
                    return res.status(404).json({
                        error: 'Key not found',
                        key,
                    });
                }

                res.json({ key, value });
            } catch (error) {
                logger.error('GET operation failed', { error: error.message });
                res.status(500).json({ error: 'Internal server error' });
            }
        });

        // SET key
        this.app.post('/api/kv', async (req, res) => {
            try {
                const { key, value } = req.body;

                if (!key || value === undefined) {
                    return res.status(400).json({
                        error: 'Missing required fields: key, value',
                    });
                }

                // Only leader can handle writes
                if (this.raft.state !== this.raft.constructor.LEADER) {
                    return res.status(503).json({
                        error: 'Not the leader',
                        leader: this.raft.leader,
                    });
                }

                await this.raft.command({ key, value });

                res.json({
                    success: true,
                    key,
                    value,
                });
            } catch (error) {
                logger.error('SET operation failed', { error: error.message });
                res.status(500).json({ error: 'Internal server error' });
            }
        });

        // DELETE key
        this.app.delete('/api/kv/:key', async (req, res) => {
            try {
                const { key } = req.params;

                // Only leader can handle writes
                if (this.raft.state !== this.raft.constructor.LEADER) {
                    return res.status(503).json({
                        error: 'Not the leader',
                        leader: this.raft.leader,
                    });
                }

                await this.raft.command({ key, value: null, operation: 'delete' });

                res.json({
                    success: true,
                    key,
                });
            } catch (error) {
                logger.error('DELETE operation failed', { error: error.message });
                res.status(500).json({ error: 'Internal server error' });
            }
        });

        // Cluster status
        this.app.get('/api/cluster/status', (req, res) => {
            res.json({
                address: this.raft.address,
                state: this.raft.state,
                term: this.raft.term,
                leader: this.raft.leader,
                nodes: this.raft.nodes.map((n) => n.address),
                logLength: this.raft.log.length,
            });
        });

        // Cluster nodes
        this.app.get('/api/cluster/nodes', (req, res) => {
            res.json({
                nodes: this.raft.nodes.map((node) => ({
                    address: node.address,
                    state: node.state || 'unknown',
                })),
            });
        });

        // 404 handler
        this.app.use((req, res) => {
            res.status(404).json({ error: 'Not found' });
        });

        // Error handler
        this.app.use((err, req, res, next) => {
            logger.error('Unhandled error', { error: err.message, stack: err.stack });
            res.status(500).json({ error: 'Internal server error' });
        });
    }

    start(port) {
        const apiPort = port || config.get('api.port', 3000);

        this.server = this.app.listen(apiPort, () => {
            logger.info(`API server listening on port ${apiPort}`);
        });

        return this.server;
    }

    stop() {
        if (this.server) {
            this.server.close();
            logger.info('API server stopped');
        }
    }
}

module.exports = APIServer;
