const debug = require('diagnostics')('raft');
const argv = require('argh').argv;
var LifeRaft = require('./raft/index');
const Log = require('./raft/log');

const DBManager = require('./db');
const LMDBManager = require('./db');

let msg;

if (argv.queue) msg = require(argv.queue);
else msg = require('axon');

//
// We're going to create own custom Raft instance which is powered by axon for
// communication purposes. But you can also use things like HTTP, OMQ etc.
//
class MsgRaft extends LifeRaft {

    /**
     * Initialized, start connecting all the things.
     *
     * @param {Object} options Options.
     * @api private
     */
    initialize(options) {
        debug('initializing reply socket on port %s', this.address);

        const socket = this.socket = msg.socket('rep');

        const path = `./db/${this.address.split('tcp://0.0.0.0:')[1]}`;
        this.db = new LMDBManager(path, 2 * 1024 * 1024 * 1024, 10);
        this.db.openDb(`${this.address}`);

        socket.bind(this.address);
        socket.on('message', (data, fn) => {
            debug('received data from: ', this.address);
            debug('data', data);
            this.emit('data', data, fn);
        });

        socket.on('error', () => {
            debug('failed to initialize on port: ', this.address);
        });
    }

    /**
     * The message to write.
     *
     * @param {Object} packet The packet to write to the connection.
     * @param {Function} fn Completion callback.
     * @api private
     */
    write(packet, fn) {
        if (!this.socket) {
            this.socket = msg.socket('req');

            this.socket.connect(this.address);
            this.socket.on('error', function err() {
                console.error('failed to write to: ', this.address);
            });
        }

        debug('writing packet to socket on port %s', this.address);
        this.socket.send(packet, (data) => {
            fn(undefined, data);
        });
    }
}

//
// We're going to start with a static list of servers. A minimum cluster size is
// 4 as that only requires majority of 3 servers to have a new leader to be
// assigned. This allows the failure of one single server.
//
const ports = [
    8081,
    8082,
];

//
// The port number of this Node process.
//
var port = +argv.port || ports[0];

//
// Now that we have all our variables we can safely start up our server with our
// assigned port number.
//
const raft = new MsgRaft('tcp://0.0.0.0:' + port, {
    'election min': 2000,
    'election max': 5000,
    'heartbeat': 1000,
    adapter: require('leveldown'),
    path: `./log/${port}/`,
    'Log': new Log(this, {
        adapter: require('leveldown'),
        path: `./log/${port}/`
    }),
});

raft.on('heartbeat timeout', function () {
    debug('heart beat timeout, starting election');
});

raft.on('term change', function (to, from) {
    debug('were now running on term %s -- was %s', to, from);
}).on('leader change', function (to, from) {
    debug('we have a new leader to: %s -- was %s', to, from);
}).on('state change', function (to, from) {
    debug('we have a state to: %s -- was %s', to, from);
});

raft.on('leader', function () {
    console.log('@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@');
    console.log('I am elected as leader');
    console.log('@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@');
});

raft.on('candidate', function () {
    console.log('----------------------------------');
    console.log('I am starting as candidate');
    console.log('----------------------------------');
});

raft.on('data', function (data) {

    // console.log("From Raft 'on' data method", data);
})

raft.on('commit', function (command) {
    console.log('Inside commit');
    raft.db.set(command.key, command.value);
    console.log('Committed', command.key, command.value);
})

//
// Join in other nodes so they start searching for each other.
//
ports.forEach((nr) => {
    if (!nr || port === nr) return;

    raft.join('tcp://0.0.0.0:' + nr);
});

var axon = require('axon');
var sockPush = axon.socket('req');
var sockPull = axon.socket('rep');
sockPush.bind(port + 100);
sockPull.connect(port + 100);

sockPull.on('message', async (task, data, reply) => {

    console.log("Inside SET", raft.state === MsgRaft.LEADER)
    if (raft.state === MsgRaft.LEADER) {

        switch (task) {
            case 'SET':
                // TODO: Test for async
                // console.log("Nodes", raft.nodes);
                try {
                    console.log("Inside SET")
                    await raft.command(data);
                    reply(`${JSON.stringify(data)} - ack, ${raft.log.length}`)
                } catch (e) {
                    console.log(e);
                    reply('error 2')
                }
                break;
            default:
                reply('error 46');
        }
    } else {
        switch (task) {
            case 'GET':
                // TODO: Test for async
                // Implement round robin here based on current state of Raft
                reply(raft.db.get(data.key));
                // if (raft.state !== MsgRaft.LEADER) {
                //     reply(raft.db.get(data.key));
                // }
                break;
            default:
                reply('error 90');
                break;
        }
    }
})

// send a message to the raft every 5 seconds
setInterval(async () => {

    if (raft.state === MsgRaft.LEADER) {

        for (var i = 0; i < 5000; i++) {
            const data = {
                'key': i.toString(), 'value': i.toString()
            };
            await raft.command(data);
        }
        // sockPush.send('SET', {
        //     'key': i.toString(), 'value': i.toString()
        // }, function (res) {
        //     console.log(`ack for SET: ${res}`);
        // });
    }

    // for (var i = 0; i < 10; i++) {
    //     sockPush.send('GET', { 'key': i.toString() }, function (res) {
    //         console.log(`Response for GET: ${res}`);
    //     });
    // }
    // raft.message(MsgRaft.LEADER, { foo: 'bar' }, () => {
    //     console.log('message sent');
    // });
}, 5000);