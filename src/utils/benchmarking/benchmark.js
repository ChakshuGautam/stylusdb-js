/**
 * @description This file acts as the base file for benchmarking the performance of the queries
 */
const fs = require("fs");
const { ChartJSNodeCanvas } = require("chartjs-node-canvas");
const argv = require("argh").argv;

const jsonName = argv.name || "json1";

function generateBenchmarks(jsonPath) {
  const rawBenchmarkData = JSON.parse(fs.readFileSync(jsonPath));

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
  fs.writeFileSync(
    `./docs/appendix/runtimes/${jsonName}.json`,
    JSON.stringify(query_data, null, 2)
  );

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

async function make_graph(jsonPath) {
  const benchmark1 = generateBenchmarks(jsonPath);

  const data1 = [];
  for (let ele in benchmark1) {
    data1.push(benchmark1[ele].time);
  }

  const labels = [];
  for (let i = 1; i <= data1.length; i++) {
    labels.push(i);
  }

  console.log(data1.length);

  const configuration = {
    type: "line", // for line chart
    data: {
      labels: labels,
      datasets: [
        {
          // label: "Sample 1",
          data: data1,
          fill: false,
          borderColor: ["rgb(51, 204, 204)"],
          borderWidth: 1,
          // xAxisID: "xAxis1", //define top or bottom axis ,modifies on scale
        },
      ],
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: "Response Time (in ms)", // Add your unit here
          },
        },
        x: {
          beginAtZero: true,
          title: {
            display: true,
            text: "Request Number", // Add your unit here
          },
        },
      },
    },
  };

  const width = 800; //px
  const height = 800; //px
  const backgroundColour = "white";
  const chartJSNodeCanvas = new ChartJSNodeCanvas({
    width,
    height,
    backgroundColour,
  });

  const dataUrl = await chartJSNodeCanvas.renderToDataURL(configuration);
  const base64Image = dataUrl;

  var base64Data = base64Image.replace(/^data:image\/png;base64,/, "");
  console.log(jsonName);
  fs.writeFile(
    `./src/utils/benchmarking/graph/out-${jsonName}.png`,
    base64Data,
    "base64",
    function (err) {
      if (err) {
        console.log(err);
      }
    }
  );
  return dataUrl;
}

make_graph(`./src/utils/benchmarking/json/${jsonName}.json`);
