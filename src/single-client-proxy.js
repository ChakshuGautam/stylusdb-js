/**
 * @description This file serves as the client to send out events to the proxy server
 * @link https://stackoverflow.com/questions/35054868/sending-socket-data-separately-in-node-js -- since this is a TCP stream hence we have to separate out the stuff.
 */
const argv = require("argh").argv;
const net = require("net");
const { v4: uuidv4 } = require("uuid");

function generateBenchmarks(rawBenchmarkData) {
  // const rawBenchmarkData = JSON.parse(fs.readFileSync(jsonPath));

  let query_data = {};
  for (let query_id in rawBenchmarkData["start"]) {
    const entry = rawBenchmarkData.start[query_id];
    query_data[query_id] = {
      type: entry.type,
      time: 0.0,
    };
  }

  let removed_entries = 0;
  let lastEntry = undefined;
  for (let query_id in rawBenchmarkData["end"]) {
    if (
      typeof rawBenchmarkData.end[query_id] !== "undefined" &&
      lastEntry !== undefined &&
      typeof query_data[query_id] !== "undefined"
    ) {
      query_data[query_id].time = rawBenchmarkData.end[query_id] - lastEntry;
    } else {
      removed_entries++;
      delete query_data[query_id];
    }
    lastEntry = rawBenchmarkData.end[query_id];
  }

  console.log("\nRunning time of each query is : \n");
  console.table(query_data);
  // fs.writeFileSync(
  //   `./docs/appendix/runtimes/${jsonName}.json`,
  //   JSON.stringify(query_data, null, 2)
  // );

  let total_set = 0;
  let total_get = 0;
  let set_query_count = 0;
  let get_query_count = 0;

  for (let id in query_data) {
    let curr_ele = query_data[id];
    if (curr_ele["type"] === "SET") {
      set_query_count++;
      total_set += parseFloat(curr_ele["time"]);
    } else {
      get_query_count++;
      total_get += parseFloat(curr_ele["time"]);
    }
  }

  if (set_query_count) {
    console.log(
      "\nAverage time required in SET operation : ",
      total_set / set_query_count,
      "\n"
    );
  }
  if (get_query_count) {
    console.log(
      "\nAverage time required in GET operation : ",
      total_get / get_query_count,
      "\n"
    );
  }

  console.log("Removed entries : ", removed_entries);

  return query_data;
}

const givePayloadSkeleton = (op, key, val = null) => {
  return {
    task: op,
    data: [
      {
        command: {
          key: key,
          value: val,
        },
      },
    ],
  };
};
const generatePayload = (op, len) => {
  const payloads = [];
  for (let i = 1; i <= len; i++) {
    payloads.push(givePayloadSkeleton(op, "key_" + i, i + ""));
  }

  return payloads;
};

let nums = +argv.nums || 1000;
const setEvents = generatePayload("SET", nums);
const getEvents = generatePayload("GET", nums);

var netSocket = net.createConnection({ port: 6767 }, () => {
  console.log("connected to server at port", 6767);
});

let setFlag = argv.set;
let getFlag = argv.get;
console.log("setFlag: ", setFlag);
console.log("getFlag: ", getFlag);

const total_queries = nums + (getFlag & setFlag) * nums;

const benchmarks = {
  start: {},
  end: {},
};

process.on("SIGINT", () => {
  generateBenchmarks(benchmarks);
  require("fs").writeFileSync(
    `./benchmarks/${new Date(Date.now())}-sigint.json`,
    JSON.stringify(benchmarks),
    "utf-8"
  );
  netSocket.destroy();
  process.exit(0);
});

if (setFlag === true) {
  for (const event of setEvents) {
    const queryId = uuidv4();
    benchmarks.start[queryId] = {
      type: "SET",
      start: performance.now(),
    };
    netSocket.write(`${queryId}|` + JSON.stringify(event) + "\n");
  }
}

if (getFlag === true) {
  for (const event of getEvents) {
    const queryId = uuidv4();
    benchmarks.start[queryId] = {
      type: "GET",
      start: performance.now(),
    };
    netSocket.write(`${queryId}|` + JSON.stringify(event) + "\n");
  }
}

netSocket.on("data", (buffer) => {
  const t = performance.now();
  const data = buffer.toString("utf8");
  console.log("data in the start: ", data);
  // require("fs").writeFileSync(`./data/data-${Date.now()}.txt`, data, "utf-8");
  data
    .split("\n")
    .map((q) => {
      if (q.trim() != "Connected") {
        return q.split("<|>")[0].trim();
      }
    })
    .forEach((queryId) => {
      console.log("queryId: ", queryId);
      if (queryId && queryId.length && queryId == "ENDENDEND") {
        console.log(
          "Object.keys(benchmarks.end).length before ending: ",
          Object.keys(benchmarks.end).length
        );
        generateBenchmarks(benchmarks);
        require("fs").writeFileSync(
          `./benchmarks/${new Date(Date.now())}.json`,
          JSON.stringify(benchmarks),
          "utf-8"
        );
        // netSocket.destroy();
        return;
      }
      if (
        queryId &&
        queryId.trim().length &&
        queryId.trim() != "Connected" &&
        queryId.trim() != "ENDENDEND"
      ) {
        benchmarks.end[queryId] = t;
        console.log(
          "Object.keys(benchmarks.end).length: ",
          Object.keys(benchmarks.end).length
        );
      }
    });

  console.log(data);
  if (Object.keys(benchmarks.end).length === total_queries) {
    generateBenchmarks(benchmarks);
    require("fs").writeFileSync(
      `./benchmarks/${new Date(Date.now())}.json`,
      JSON.stringify(benchmarks),
      "utf-8"
    );
    netSocket.destroy();
  }
});
