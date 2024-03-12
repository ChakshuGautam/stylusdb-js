const argv = require("argh").argv;
const net = require("net");

let port = +argv.port || 8081; // read the port from command line arguments
var netSocket = net.createConnection({ port: port + 1000 }, () => {
  console.log("connected to server at port", port + 1000);
});

let set = {
  task: "SET",
  data: [
    {
      command: {
        key: "key",
        value: 1000,
      },
    },
  ],
};

let get = {
  task: "GET",
  data: [
    {
      command: {
        key: "key_2",
      },
    },
  ],
};

/**
 * @link https://stackoverflow.com/questions/35054868/sending-socket-data-separately-in-node-js -- since this is a TCP stream hence we have to separate out the stuff.
 */
// write to socket
// for (let i = 0; i < 5; i++) {
//   set.data[0].command.key = "key_" + i;
//   set.data[0].command.value = i + "";
//   netSocket.write(JSON.stringify(set) + "\n");
// }

// setTimeout(() => {
netSocket.write(JSON.stringify(get));
// }, 500);

netSocket.on("data", (buffer) => {
  const data = buffer.toString("utf8");
  console.log(data);
});
