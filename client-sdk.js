/**
 * StylusDB Client SDK
 * JavaScript/Node.js client for interacting with StylusDB HTTP API
 */

const http = require('http');
const https = require('https');

class StylusDBClient {
    constructor(options = {}) {
        this.baseURL = options.baseURL || 'http://localhost:3000';
        this.timeout = options.timeout || 5000;
        this.https = this.baseURL.startsWith('https');
    }

    async request(method, path, data = null) {
        return new Promise((resolve, reject) => {
            const url = new URL(path, this.baseURL);
            const httpModule = this.https ? https : http;

            const options = {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                timeout: this.timeout,
            };

            const req = httpModule.request(url, options, (res) => {
                let body = '';

                res.on('data', (chunk) => {
                    body += chunk;
                });

                res.on('end', () => {
                    try {
                        const response = JSON.parse(body);

                        if (res.statusCode >= 400) {
                            reject(new Error(response.error || 'Request failed'));
                        } else {
                            resolve(response);
                        }
                    } catch (error) {
                        reject(new Error('Invalid JSON response'));
                    }
                });
            });

            req.on('error', reject);
            req.on('timeout', () => {
                req.destroy();
                reject(new Error('Request timeout'));
            });

            if (data) {
                req.write(JSON.stringify(data));
            }

            req.end();
        });
    }

    async get(key) {
        const response = await this.request('GET', `/api/kv/${encodeURIComponent(key)}`);
        return response.value;
    }

    async set(key, value) {
        const response = await this.request('POST', '/api/kv', { key, value });
        return response.success;
    }

    async delete(key) {
        const response = await this.request('DELETE', `/api/kv/${encodeURIComponent(key)}`);
        return response.success;
    }

    async getClusterStatus() {
        return await this.request('GET', '/api/cluster/status');
    }

    async health() {
        return await this.request('GET', '/health');
    }
}

module.exports = StylusDBClient;
