/**
 * @description This file contains functions to parse and process the data received on the proxy
 */

function parseProcessRequest(data, queryQueue) {
  const res = [];
  let chunk = ""; // stores data from the stream
  chunk += data.toString();
  d_index = chunk.indexOf("\n");
  while (d_index > -1) {
    const element = chunk.substring(0, d_index);
    const [queryId, query] = element.trim().split("|", 2);
    console.log("queryId ", queryId, "query ", query);
    res.push([queryId, query]);

    chunk = chunk.substring(d_index + 1); // Cuts off the processed chunk
    d_index = chunk.indexOf("\n");
  }

  return res;
}

module.exports = { parseProcessRequest };
