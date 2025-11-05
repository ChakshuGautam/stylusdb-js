const lmdb = require('node-lmdb');

class LMDBManager {
    constructor(path, mapSize, maxDbs) {
        this.env = new lmdb.Env();
        this.env.open({
            path: path || "./db",
            mapSize: mapSize || 2 * 1024 * 1024 * 1024,  // 2 GB by default
            maxDbs: maxDbs || 10
        });
        this.writeTxn = null;
        this.writeCount = 0;
        this.batchSize = 100; // Commit every 100 writes
    }

    openDb(dbName) {
        this.dbi = this.env.openDbi({
            name: dbName || "mydb",
            create: true
        });
    }

    closeDb() {
        // Commit any pending transaction
        if (this.writeTxn) {
            try {
                this.writeTxn.commit();
                this.writeTxn = null;
            } catch (e) {
                console.error("Error committing transaction on close:", e);
            }
        }
        if (this.dbi) {
            this.dbi.close();
        }
    }

    closeEnv() {
        this.closeDb();
        this.env.close();
    }

    /**
     * Commits the current write transaction and resets the counter
     * @private
     */
    _commitTransaction() {
        if (this.writeTxn) {
            try {
                this.writeTxn.commit();
                this.writeTxn = null;
                this.writeCount = 0;
            } catch (e) {
                console.error("Error committing transaction:", e);
                // Try to abort the transaction on error
                try {
                    this.writeTxn.abort();
                } catch (abortError) {
                    console.error("Error aborting transaction:", abortError);
                }
                this.writeTxn = null;
                this.writeCount = 0;
                throw e;
            }
        }
    }

    set(key, value) {
        try {
            if (!this.writeTxn) {
                this.writeTxn = this.env.beginTxn();
                this.writeCount = 0;
            }

            this.writeTxn.putString(this.dbi, key, value);
            this.writeCount++;

            // Periodically commit to avoid memory buildup and ensure data persistence
            if (this.writeCount >= this.batchSize) {
                this._commitTransaction();
            }

            console.log('wrote', key, value);
        } catch (e) {
            console.error("Error writing key-value pair:", key, value, e);
            // Abort the transaction on error
            if (this.writeTxn) {
                try {
                    this.writeTxn.abort();
                } catch (abortError) {
                    console.error("Error aborting transaction:", abortError);
                }
                this.writeTxn = null;
                this.writeCount = 0;
            }
            throw e;
        }
    }

    get(key) {
        try {
            // Use read-only transaction for reads
            const txn = this.env.beginTxn({ readOnly: true });
            const value = txn.getString(this.dbi, key);
            txn.abort(); // Always abort read-only transactions
            return value;
        } catch (e) {
            console.error("Error reading key:", key, e);
            return null;
        }
    }

    /**
     * Force commit any pending writes
     * Should be called periodically or before important operations
     */
    flush() {
        this._commitTransaction();
    }
}

module.exports = LMDBManager;

// Usage:
/*
const dbManager = new LMDBManager();
dbManager.openDb('mydb2');

console.time('SET')
for (let i = 0; i < 1000000; i++) {
    dbManager.set(1, `Hello world! ${i}`);
}
console.timeEnd('SET')

console.log(dbManager.get(1));  // Output: Hello world!

dbManager.closeDb();
dbManager.closeEnv();
*/