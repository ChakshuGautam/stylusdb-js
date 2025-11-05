/**
 * Monitoring and metrics for StylusDB
 * Prometheus-compatible metrics exposure
 */

const promClient = require('prom-client');
const logger = require('./logger').createModuleLogger('monitoring');

class Monitoring {
    constructor() {
        // Create a Registry to register metrics
        this.register = new promClient.Registry();

        // Add default metrics (CPU, memory, etc.)
        promClient.collectDefaultMetrics({ register: this.register });

        // Custom metrics
        this.setupMetrics();

        logger.info('Monitoring initialized');
    }

    setupMetrics() {
        // Raft state metric
        this.raftState = new promClient.Gauge({
            name: 'stylusdb_raft_state',
            help: 'Current Raft state (0=follower, 1=candidate, 2=leader)',
            registers: [this.register],
        });

        // Current term
        this.raftTerm = new promClient.Gauge({
            name: 'stylusdb_raft_term',
            help: 'Current Raft term',
            registers: [this.register],
        });

        // Log length
        this.logLength = new promClient.Gauge({
            name: 'stylusdb_log_length',
            help: 'Length of the Raft log',
            registers: [this.register],
        });

        // Database operations
        this.dbOperations = new promClient.Counter({
            name: 'stylusdb_db_operations_total',
            help: 'Total number of database operations',
            labelNames: ['operation'],
            registers: [this.register],
        });

        // Operation duration
        this.operationDuration = new promClient.Histogram({
            name: 'stylusdb_operation_duration_seconds',
            help: 'Duration of database operations',
            labelNames: ['operation'],
            buckets: [0.001, 0.01, 0.1, 0.5, 1, 5],
            registers: [this.register],
        });

        // Active connections
        this.activeConnections = new promClient.Gauge({
            name: 'stylusdb_active_connections',
            help: 'Number of active connections',
            registers: [this.register],
        });

        // Cluster size
        this.clusterSize = new promClient.Gauge({
            name: 'stylusdb_cluster_size',
            help: 'Number of nodes in the cluster',
            registers: [this.register],
        });

        // Errors
        this.errors = new promClient.Counter({
            name: 'stylusdb_errors_total',
            help: 'Total number of errors',
            labelNames: ['type'],
            registers: [this.register],
        });
    }

    // Update methods
    updateRaftState(state) {
        const stateValue = { follower: 0, candidate: 1, leader: 2 }[state] || -1;
        this.raftState.set(stateValue);
    }

    updateRaftTerm(term) {
        this.raftTerm.set(term);
    }

    updateLogLength(length) {
        this.logLength.set(length);
    }

    recordOperation(operation) {
        this.dbOperations.inc({ operation });
    }

    recordOperationDuration(operation, duration) {
        this.operationDuration.observe({ operation }, duration);
    }

    updateActiveConnections(count) {
        this.activeConnections.set(count);
    }

    updateClusterSize(size) {
        this.clusterSize.set(size);
    }

    recordError(type) {
        this.errors.inc({ type });
    }

    // Get metrics in Prometheus format
    async getMetrics() {
        return await this.register.metrics();
    }

    // Get metrics as JSON
    async getMetricsJSON() {
        const metrics = await this.register.getMetricsAsJSON();
        return metrics;
    }
}

// Export singleton
const monitoring = new Monitoring();
module.exports = monitoring;
