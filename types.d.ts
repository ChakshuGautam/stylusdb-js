/**
 * Type definitions for StylusDB
 */

declare module 'stylusdb' {
    // Configuration
    export interface Config {
        env: string;
        isDevelopment: boolean;
        isProduction: boolean;
        isTest: boolean;
        logging: {
            level: string;
        };
        server: {
            port: number;
            clusterPorts: number[];
        };
        raft: {
            electionMin: number;
            electionMax: number;
            heartbeat: number;
        };
        database: {
            path: string;
            mapSize: number;
            maxDbs: number;
            batchSize: number;
        };
        network: {
            timeout: number;
            socketTimeout: number;
        };
        monitoring: {
            enabled: boolean;
            port: number;
        };
    }

    // Database
    export class LMDBManager {
        constructor(path?: string, mapSize?: number, maxDbs?: number);
        openDb(dbName?: string): void;
        closeDb(): void;
        closeEnv(): void;
        set(key: string, value: string): void;
        get(key: string): string | null;
        flush(): void;
    }

    // Errors
    export class StylusDBError extends Error {
        code: string;
        constructor(message: string, code: string);
    }

    export class DatabaseError extends StylusDBError {
        operation: string;
        constructor(message: string, operation: string);
    }

    export class RaftError extends StylusDBError {
        state: string;
        constructor(message: string, state: string);
    }

    export class NetworkError extends StylusDBError {
        address: string;
        constructor(message: string, address: string);
    }

    export class ConfigurationError extends StylusDBError {
        configKey: string;
        constructor(message: string, configKey: string);
    }

    export class ValidationError extends StylusDBError {
        field: string;
        constructor(message: string, field: string);
    }

    export class TimeoutError extends StylusDBError {
        operation: string;
        timeout: number;
        constructor(message: string, operation: string, timeout: number);
    }

    export class ErrorHandler {
        static isOperationalError(error: Error): boolean;
        static formatError(error: Error): object;
        static handleRejection(reason: any, promise: Promise<any>): void;
        static handleException(error: Error): void;
    }

    // Logger
    export interface Logger {
        error(message: string, meta?: object): void;
        warn(message: string, meta?: object): void;
        info(message: string, meta?: object): void;
        http(message: string, meta?: object): void;
        verbose(message: string, meta?: object): void;
        debug(message: string, meta?: object): void;
        silly(message: string, meta?: object): void;
        createModuleLogger(moduleName: string): Logger;
    }

    // API Server
    export class APIServer {
        constructor(raftInstance: any);
        start(port?: number): any;
        stop(): void;
    }

    // Client SDK
    export interface ClientOptions {
        baseURL?: string;
        timeout?: number;
    }

    export class StylusDBClient {
        constructor(options?: ClientOptions);
        get(key: string): Promise<string>;
        set(key: string, value: string): Promise<boolean>;
        delete(key: string): Promise<boolean>;
        getClusterStatus(): Promise<object>;
        health(): Promise<object>;
    }

    // Monitoring
    export interface Monitoring {
        updateRaftState(state: string): void;
        updateRaftTerm(term: number): void;
        updateLogLength(length: number): void;
        recordOperation(operation: string): void;
        recordOperationDuration(operation: string, duration: number): void;
        updateActiveConnections(count: number): void;
        updateClusterSize(size: number): void;
        recordError(type: string): void;
        getMetrics(): Promise<string>;
        getMetricsJSON(): Promise<any[]>;
    }

    // Health Check
    export interface HealthCheck {
        register(name: string, checkFn: () => Promise<boolean>): void;
        check(): Promise<object>;
        isHealthy(): Promise<boolean>;
        ready(): Promise<boolean>;
        alive(): Promise<boolean>;
    }
}
