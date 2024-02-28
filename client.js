/**
 * this file serves as  client to connect to the server raft nodes
 */
const argv = require("argh").argv;
var axon = require("axon");
const net = require('net');

// var sockPush = axon.socket("req");
let port = +argv.port || 8081; // read the port from command line arguments
var netSocket = net.createConnection({port: port + 1000}, ()=>{
  console.log("connected to server at port", port + 1000);
});

// sockPush.connect(port + 1200);

const data = {
  task: "SET",
  data: [{
    command: {
      key : "a",
      value: "26"
    }
  }]
};
const data2 = {
  task: "SET",
  data: [{
    command: {
      key : "b",
      value: "27"
    }
  }]
};
const st = JSON.stringify(data);
const st2 = JSON.stringify(data2);
netSocket.write(st);
netSocket.write(st2);

// send a message to the raft every 5 seconds
// setInterval(async () => {
//   for (var i = 0; i < 5000; i++) {
//     console.log("sending to socket with i: ", i);
//     const data = {
//       op: "SET",
//       data: {
//         key: i.toString(),
//         value: i.toString(),
//       },
//     };
//     sockPush.send(data, function (res) {
//       console.log(`ack for SET: ${res}`);
//     });
//   }

//   // send 10 GET Commands
//   for (var i = 0; i < 10; i++) {
//     sockPush.send("GET", { key: i.toString() }, function (res) {
//       console.log(`Response for GET: ${res}`);
//     });
//   }
// }, 5000);

const g1 = {
  task: "GET",
  data: [{
    command: {
      key : "a"
    }
  }]
};
const g2 = {
  task: "GET",
  data: [{
    command: {
      key : "b"
    }
  }]
};
const gt1 = JSON.stringify(data);
const gt2 = JSON.stringify(data2);
netSocket.write(gt1);
netSocket.write(gt2)