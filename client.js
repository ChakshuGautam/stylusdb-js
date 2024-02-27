/**
 * this file serves as  client to connect to the server raft nodes
 */
const argv = require("argh").argv;
var axon = require("axon");

var sockPush = axon.socket("req");
let port = +argv.port || 8081; // read the port from command line arguments

sockPush.connect(port + 1000);

// send a message to the raft every 5 seconds
setInterval(async () => {
  for (var i = 0; i < 5000; i++) {
    console.log("sending to socket with i: ", i);
    const data = {
      op: "SET",
      data: {
        key: i.toString(),
        value: i.toString(),
      },
    };
    sockPush.send(data, function (res) {
      console.log(`ack for SET: ${res}`);
    });
  }

  // send 10 GET Commands
  for (var i = 0; i < 10; i++) {
    sockPush.send("GET", { key: i.toString() }, function (res) {
      console.log(`Response for GET: ${res}`);
    });
  }
}, 5000);
