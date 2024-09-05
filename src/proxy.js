/**
 * @description This file serves as the basis for the event emitting proxy server that talks to the raft cluster
 * @link https://stackoverflow.com/questions/35054868/sending-socket-data-separately-in-node-js -- since this is a TCP stream hence we have to separate out the stuff.
 * @link https://stackoverflow.com/questions/12872563/issues-when-reading-a-string-from-tcp-socket-in-node-js
 */

const argv = require("argh").argv;
const net = require("net");
const { EventEmitter } = require("events");
const { parseProcessRequest } = require("./utils/stream-parsers/proxy");

let port = +argv.port || 8081;
let ports = [8081, 8082, 8083, 8084]; // read the port from command line arguments
let clients = [];
let currentNodeToSend = 0;
let client = null;

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
    return new Promise((resolve, reject) => {
      // write this query to socket
      console.log("query in execute: ", query);
      client.write(query + "\n");
      client.on("data", (data) => {
        if (data && data.toString().trim() != "Connected") {
          resolve(data.toString());
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

  socket.on("data", (data) => {
    const queries = parseProcessRequest(data.toString(), queryQueue);
    for (const pair of queries) {
      console.log("pair: ", pair);
      const [queryId, query] = pair;
      if (!query) continue;
      queryQueue.addQuery(queryId, query, (error, queryId, result) => {
        let response;
        if (error) {
          response = `${queryId}<|>Error: ${error.message}`;
        } else {
          response = `${queryId}<|>${JSON.stringify(result)}`;
        }
        socket.write(response + "\n");
      });
    }
  });

  socket.on("close", () => {
    activeConnection = false;
  });
});

server.listen(6767, () => {
  console.log("Server listening on port 6767");
  // create TCP connection to the raft cluster node
  // TODO: Add failover -- connect to someother node if this node fails
  client = net.createConnection({ port: port + 1000 }, () => {
    console.log("connected to server at port", port + 1000);
  });
});
