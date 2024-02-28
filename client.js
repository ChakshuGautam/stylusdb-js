/**
 * this file serves as  client to connect to the server raft nodes
 */
const argv = require("argh").argv;
var axon = require("axon");
const net = require("net");

// var sockPush = axon.socket("req");
let port = +argv.port || 8081; // read the port from command line arguments
var netSocket = net.createConnection({ port: port + 1000 }, () => {
  console.log("connected to server at port", port + 1000);
});

// sockPush.connect(port + 1200);


// const ex = {
//   task: "EXIT",
//   data: [
//     {
//       command: {
//         key: "0",
//         value: "7",
//       },
//     },
//   ],
// };
function sequentialSETCalls(times){
    let i = 1;
  
    function makeCall() {
      // Your function or code that needs to be called sequentially
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
      let st = JSON.stringify(data)
      netSocket.write(st);
  
      i++;
  
      // Check if there are more calls to make
      if (i <= times) {
        // Set a timeout for 1 second before making the next call
        setTimeout(makeCall, 1000);
      }else{
        setTimeout(()=>{
          sequentialGETCalls(5);
        }, 1000);
      }
    }
  
    // Start the first call
    makeCall();
}

function sequentialGETCalls(times){
  let i = 1;

  function makeCall() {
    // Your function or code that needs to be called sequentially
    let data = {
      task: "GET",
      data: [
        {
          command: {
            key: "a" + i
          },
        },
      ],
    };
    let st = JSON.stringify(data)
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

sequentialSETCalls(5);


netSocket.on("data", (buffer)=>{
  const data = buffer.toString('utf8');
  console.log(data);
})

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

// const g1 = {
//   task: "GET",
//   data: [{
//     command: {
//       key : "a"
//     }
//   }]
// };
// const g2 = {
//   task: "GET",
//   data: [{
//     command: {
//       key : "b"
//     }
//   }]
// };
// const gt1 = JSON.stringify(data);
// const gt2 = JSON.stringify(data2);
// netSocket.write(gt1);
// netSocket.write(gt2)
