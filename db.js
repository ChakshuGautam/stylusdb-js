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
    }

    openDb(dbName) {
        this.dbi = this.env.openDbi({
            name: dbName || "mydb",
            create: true
        });
    }

    closeDb() {
        this.writeTxn.commit();
        this.dbi.close();
    }

    closeEnv() {
        this.env.close();
    }

    set(key, value) {
        if (!this.writeTxn) {
            const txn = this.env.beginTxn();
            this.writeTxn = txn;
        }
        this.writeTxn.putString(this.dbi, key, value);
    }

    get(key) {
        // const txn = this.env.beginTxn({ readOnly: true });
        const value = this.writeTxn.getString(this.dbi, key);
        return value;
    }
}

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