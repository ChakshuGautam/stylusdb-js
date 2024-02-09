const Raft = require("./raft/index");
const Log = require("./raft/log");
const MsgRaft = require("./index");

const argv = require("argh").argv;

const ports = [8081, 8082, 8083, 8084];
var port = +argv.port || ports[0];

const raft = new MsgRaft("tcp://0.0.0.0:" + port, {
  "election min": 2000,
  "election max": 5000,
  heartbeat: 1000,
  adapter: require("leveldown"),
  path: `./log/${port}/`,
  Log: new Log(this, {
    adapter: require("leveldown"),
    path: `./log/${port}/`,
  }),
});

ports.forEach((nr) => {
  if (!nr || port === nr) return;

  raft.join("tcp://0.0.0.0:" + nr);
});
