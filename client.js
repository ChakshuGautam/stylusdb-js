/**
 * this file serves as  client to connect to the server raft nodes
 */
const net = require("net");

var netSocket = net.createConnection({ port: 6767 }, () => {
  console.log("connected to server at port", 6767);
});

const sendEvent = (op, data) => {
  let data = {
    task: op,
    data: data,
  };

  netSocket.write(JSON.stringify(data));
};

let i = 1;
(() => {
  setInterval(() => {
    // SEND 5 SEQUENTIAL SETS
    setTimeout(
      sendEvent("GET", [
        {
          command: {
            key: "a" + i,
            value: "" + i,
          },
        },
      ]),
      500
    );
    // SEND 5 SEQUENTIAL GETS
    i++;
  }, 1000);
})();

function sequentialGETCalls(times) {
  let i = 1;

  function makeCall() {
    // Your function or code that needs to be called sequentially
    let data = {
      task: "GET",
      data: [
        {
          command: {
            key: "a" + i,
          },
        },
      ],
    };
    let st = JSON.stringify(data);
    netSocket.write(st);

    i++;

    // Check if there are more calls to make
    if (i <= times) {
      // Set a timeout for 1 second before making the next call
      setTimeout(makeCall, 1000);
    }
  }

  // Start the first call
  makeCall();
}

function sequentialSETCalls(times) {
  let i = 1;
  for (let i = 0; i < times; i++) {
    let data = {
      task: "SET",
      data: [
        {
          command: {
            key: "a" + i,
            value: "" + i,
          },
        },
      ],
    };

    let st = JSON.stringify(data);
    netSocket.write(st);
    setTimeout(() => {
      console.log("waiting 1 second", 1000);
    });
  }
  //make get calls after set calls
  setTimeout(() => {
    sequentialGETCalls(5);
  }, 1000);
}

sequentialSETCalls(5);

netSocket.on("data", (buffer) => {
  const data = buffer.toString("utf8");
  console.log(data);
});
