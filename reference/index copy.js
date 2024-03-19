/**
 * @description This file serves as the base of communication to be undertaken as a part of
 */

const debug = require("diagnostics")("raft");
const argv = require("argh").argv;

var LifeRaft = require("./raft/index");
const Log = require("./raft/log");
const LMDBManager = require("./db");

let msg;
if (argv.queue) msg = require(argv.queue);
else msg = require("axon");

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
    debug("initializing reply socket on port %s", this.address);

    const socket = (this.socket = msg.socket("rep"));

    socket.bind(this.address);
    socket.on("message", (data, fn) => {
      debug("received data from: ", this.address);
      debug("data", data);
      this.emit("data", data, fn);
    });

    // define LMDB connection
    const path = `./db/${this.address.split("tcp://0.0.0.0:")[1]}`;
    this.db = new LMDBManager(path, 2 * 1024 * 1024 * 1024, 10);
    this.db.openDb(`${this.address}`);

    socket.on("error", () => {
      debug("failed to initialize on port: ", this.address);
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
      this.socket = msg.socket("req");

      this.socket.connect(this.address); // TODO: Check if this is safe since address can be a UUID as well
      this.socket.on("error", function err() {
        console.error("failed to write to: ", this.address);
      });
    }

    debug("writing packet to socket on port %s", this.address);
    this.socket.send(packet, (data) => {
      fn(undefined, data);
    });
  }
}

//
// We're going to start with a static list of servers. Let's start with a cluster size of
// 5 as that only requires majority of 3 servers to have a new leader to be
// assigned. This allows the failure of two servers.
//
const ports = [8081, 8082, 8083, 8084];

//
// The port number of this Node process.
//
var port = +argv.port || ports[0];

//
// Now that we have all our variables we can safely start up our server with our
// assigned port number.
//
const raft = new MsgRaft("tcp://0.0.0.0:" + port, {
  "election min": 20000,
  "election max": 50000,
  heartbeat: 10000,
  adapter: require("leveldown"),
  path: `./log/${port}/`,
  Log: new Log(this, {
    adapter: require("leveldown"),
    path: `./log/${port}/`,
  }),
});

raft.on("heartbeat timeout", function () {
  console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@");
  debug("======heart beat timeout, starting election====");
  console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@");
});

raft
  .on("term change", function (to, from) {
    console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@");
    debug("were now running on term %s -- was %s", to, from);
    console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@");
  })
  .on("leader change", function (to, from) {
    console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@");
    debug("we have a new leader to: %s -- was %s", to, from);
    console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@");
  })
  .on("state change", function (to, from) {
    console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@");
    debug("we have a state to: %s -- was %s", to, from);
    console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@");
  });

raft.on("leader", function () {
  console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@");
  console.log("I am elected as leader");
  console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@");
});

raft.on("candidate", function () {
  console.log("----------------------------------");
  console.log("I am starting as candidate");
  console.log("----------------------------------");
});

raft.on("data", function (data) {
  console.log(
    "From Raft 'on' data method",
    data,
    raft.state === Raft.LEADER
      ? " received as leader"
      : "received as not leader"
  );
  const arr = data?.data;
  if (arr && arr.length > 0)
    console.log("in data.on('data'): ", arr[0].command);
});

raft.on("commit", function (command) {
  console.log("Inside commit", command);
  raft.db.set(command.key, command.value);
  console.log("Committed", command.key, command.value);
});

//
// Join in other nodes so they start searching for each other.
//
ports.forEach((nr) => {
  if (!nr || port === nr) return;

  raft.join("tcp://0.0.0.0:" + nr);
});

var axon = require("axon");
const Raft = require("./raft/index");
var sockPush = axon.socket("req");
var sockPull = axon.socket("rep");
sockPush.bind(port + 100);
sockPull.connect(port + 100);

sockPull.on("message", async (task, data, reply) => {
  console.log(
    "Inside SET",
    raft.state === MsgRaft.LEADER ? "as leader" : "as a follower"
  );
  if (raft.state === MsgRaft.LEADER) {
    switch (task) {
      case "SET":
        // TODO: Test for async
        console.log("Nodes", raft.nodes);
        try {
          console.log("Inside SET");
          await raft.command(data);
          reply(`${JSON.stringify(data)} - ack, ${raft.log.length}`);
        } catch (e) {
          console.log(e);
          reply("error 2");
        }
        break;
      default:
        reply("error 46");
    }
  } else {
    switch (task) {
      case "SET":
        debug("Received a SET event on socket");
        // forward to leader
        raft.message(Raft.LEADER, task, () => {
          console.log(
            "Forwarded the set command to leader since I am a follower."
          );
        });
      case "GET":
        // TODO: Test for async
        debug("Received a GET event on socket");
        // Implement round robin here based on current state of Raft
        reply(raft.db.get(data.key));
        // if (raft.state !== MsgRaft.LEADER) {
        //     reply(raft.db.get(data.key));
        // }
        break;
      default:
        reply("error 90");
        break;
    }
  }
});

/*
// send a message to the raft every 5 seconds
setInterval(async () => {
  if (raft.state === MsgRaft.LEADER) {
    for (var i = 0; i < 5000; i++) {
      const command = {
        command: "SET",
        data: {
          key: i.toString(),
          value: i.toString(),
        },
      };
      await raft.command(command);
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
*/

// a setInterval loop to commit the logs to followers every 5 seconds

// setInterval(async () => {
//   // logic to send commit events here
// }, 5000);

module.exports = MsgRaft;
