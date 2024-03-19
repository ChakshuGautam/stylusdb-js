/**
 * @description This file serves as the base of communication to be undertaken as a part of
 */

const debug = require("diagnostics")("raft");
const argv = require("argh").argv;

var LifeRaft = require("./raft/index");
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

// TODO: a setInterval loop to commit the logs to followers every 5 seconds

// setInterval(async () => {
//   // logic to send commit events here
// }, 5000);

module.exports = MsgRaft;
