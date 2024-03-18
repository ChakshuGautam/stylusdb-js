/**
 * @description This file serves as the basis for the event emitting proxy server that talks to the raft cluster
 * @link https://stackoverflow.com/questions/35054868/sending-socket-data-separately-in-node-js -- since this is a TCP stream hence we have to separate out the stuff.
 * @link https://stackoverflow.com/questions/12872563/issues-when-reading-a-string-from-tcp-socket-in-node-js
 */

const argv = require("argh").argv;
const net = require("net");
const { EventEmitter } = require("events");

let port = +argv.port || 8081; // read the port from command line arguments

class QueryQueue extends EventEmitter {
  constructor() {
    super();
    this.queue = [];
    this.isProcessing = false;
  }

  addQuery(queryId, query, callback) {
    this.queue.push({ query, callback, queryId });
    this.emit("newQuery");
  }

  async execute(query) {
    console.log("inside execute");
    return new Promise((resolve, reject) => {
      var client = net.createConnection({ port: port + 1000 }, () => {
        console.log("connected to server at port", port + 1000);
      });
      // write this query to socket
      console.log("query: ", query);
      client.write(JSON.stringify(query) + "\n");
      client.on("data", (data) => {
        if (data === undefined) {
          console.log("*****************");
          console.log("data is undefined");
          console.log("*****************");
        }
        if (data.toString().trim() != "Connected") {
          console.log(
            "data in response of proxy socket write:",
            data.toString()
          );
          resolve(data.toString());
          client.destroy();
        } else {
          console.log("data: ", data.toString());
        }
      });

      client.on("close", () => {});

      client.on("error", reject);
    });
  }

  processQueue() {
    if (this.isProcessing || this.queue.length === 0) {
      return;
    }
    this.isProcessing = true;
    const { query, callback, queryId } = this.queue[0];

    this.execute(query)
      .then((result) => {
        console.log("result: ", result);
        console.log("result.toString(): ", result.toString());
        if (result.toString().trim() === "error 8") {
          let e = new Error("Error 8 Another connection active trying again");
          callback(e, queryId);
        } else this.queue.shift();
        return callback(null, queryId, result);
      })
      .catch((error) => {
        console.log("error: ", error);
        console.log("error.toString(): ", error.toString());
        return callback(error, queryId);
      })
      .finally(() => {
        this.isProcessing = false;
        this.processQueue();
      });
  }
}

const queryQueue = new QueryQueue();
queryQueue.on("newQuery", () => queryQueue.processQueue());

const server = net.createServer();
let activeConnection = false;

server.on("connection", (socket) => {
  if (activeConnection) {
    socket.end("Another connection is already active.");
    return;
  }
  activeConnection = true;

  socket.write("Connected\n");
  let chunk = ""; // stores data from the stream
  socket.on("data", (data) => {
    console.log("data: ", data.toString());
    chunk += data.toString();
    d_index = chunk.indexOf("\n");
    while (d_index > -1) {
      const element = chunk.substring(0, d_index);
      console.log("element: ", element);
      const [queryId, query] = element.trim().split("|", 2);
      console.log("queryId ", queryId, "query ", query);
      queryQueue.addQuery(queryId, query, (error, queryId, result) => {
        let response;
        if (error) {
          response = `${queryId}<|>Error: ${error.message}`;
        } else {
          console.log("result in final formatter: ", result);
          response = `${queryId}<|>${JSON.stringify(result)}`;
        }
        socket.write(response + "\n");
      });
      chunk = chunk.substring(d_index + 1); // Cuts off the processed chunk
      d_index = chunk.indexOf("\n");
    }
    // data = data
    //   .toString()
    //   .split("\n")
    //   .map((str) => {
    //     console.log("str: ", str);
    //     return str.trim();
    //   })
    //   .filter((str) => str !== "")
    //   .forEach((element) => {});
  });

  socket.on("close", () => {
    activeConnection = false;
  });
});

server.listen(6767, () => {
  console.log("Server listening on port 6767");
});
