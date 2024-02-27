const net = require("net");
const argv = require("argh").argv;
var axon = require("axon");

const registerNode = require("./raft-node");
const MsgRaft = require("./msg-raft");

/// Globals
var sockPull = axon.socket("rep");
const server = net.createServer();
let activeConnection = false,
  raftNode = undefined;

//
// We're going to start with a static list of servers. Let's start with a cluster size of
// 5 as that only requires majority of 3 servers to have a new leader to be
// assigned. This allows the failure of two servers.
//
// TODO: Figure out how to do this in BG and maybe with an orchestrator?
const ports = [8081, 8082, 8083, 8084];

// read the port from command line arguments
let port = +argv.port || 8080;

server.on("connection", (socket) => {
  if (activeConnection) {
    // this limits to one connection at a time
    // TODO: Move to multi connections
    socket.end("Another connection is already active.");
    return;
  }
  activeConnection = true;

  socket.write("Connected\n");

  socket.on("data", (data) => {
    const { type, args } = data;
    console.log(`Received request of type ${type} with arguments ${args}`);
    raftNode.command(data);
  });
  // TODO: Figure out a way to connect sockPull to the socket received with server connection
  sockPull.connect(port + 100);

  sockPull.on("message", async (task, data, reply) => {
    console.log("task: ", task);
    console.log(
      "Inside SET",
      raftNode.state === MsgRaft.LEADER ? "as leader" : "as a follower"
    );
    if (raftNode.state === MsgRaft.LEADER) {
      switch (task) {
        case "SET":
          // TODO: Test for async
          console.log("Nodes", raftNode.nodes);
          try {
            console.log("Inside SET");
            await raft.command(data);
            reply(`${JSON.stringify(data)} - ack, ${raftNode.log.length}`);
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
          raftNode.message(
            MsgRaft.LEADER,
            MsgRaft.packet("append ack", JSON.stringify(task)),
            () => {
              console.log(
                "Forwarded the set command to leader since I am a follower."
              );
            }
          );
        case "GET":
          // TODO: Test for async
          debug("Received a GET event on socket");
          // Implement round robin here based on current state of Raft
          reply(raftNode.db.get(data.key));
          // if (raft.state !== MsgRaft.LEADER) {
          //     reply(raft.db.get(data.key));
          // }
          break;
        default:
          console.log("in default and task: ", task);
          reply("error 90");
          break;
      }
    }
  });

  socket.on("close", () => {
    // client has terminated connection, the raftNode is still a part of the cluster
    activeConnection = false;
  });
});

let raftNodeServerPort = port + 1000;
server.listen(raftNodeServerPort, () => {
  // raftNode is initialised whenever the server starts to listen
  // initiaise the node
  raftNode = registerNode(port, {
    min: 2000,
    max: 5000,
    heartbeat: 1000,
  });

  // Join in other nodes so they start searching for each other.
  ports.forEach((nr) => {
    if (!nr || port === nr) return;
    raftNode.join("tcp://0.0.0.0:" + nr);
  });

  console.log(
    `Initialsied raft node at socket ${port} and raft node server on port ${raftNodeServerPort}`
  );
});
