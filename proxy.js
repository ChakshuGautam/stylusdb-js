/**
 * @description This file serves as the basis for the event emitting proxy server that talks to the raft cluster
 */

const net = require("net");
const { EventEmitter } = require("events");

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

  processQueue() {
    if (this.isProcessing || this.queue.length === 0) {
      return;
    }
    this.isProcessing = true;
    const { query, callback, queryId } = this.queue.shift();
    this.execute(query)
      .then((result) => callback(null, queryId, result))
      .catch((error) => callback(error, queryId))
      .finally(() => {
        this.isProcessing = false;
        this.processQueue();
      });
  }

  async execute(query) {
    // TODO: Replace with KV GET SET Logic
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
    const [queryId, query] = data.toString().trim().split(":", 2);
    queryQueue.addQuery(queryId, query, (error, queryId, result) => {
      let response;
      if (error) {
        response = `${queryId}<|>Error: ${error.message}`;
      } else {
        response = `${queryId}<|>${JSON.stringify(result)}`;
      }
      socket.write(response + "\n");
    });
  });

  socket.on("close", () => {
    activeConnection = false;
  });
});

server.listen(6767, () => {
  console.log("Server listening on port 6767");
});
