/***
 * @description This file contains functions to parse the TCP stream strings
 */
const simdjson = require("simdjson");

/**
 *
 * @param {Buffer} pkt TCP stream buffer data
 */
function parseServerStream(pkt) {
  return pkt
    .toString()
    .split("\n")
    .map((str) => str.trim())
    .filter((str) => {
      return str.trim() !== "";
    })
    .map((item) => {
      item = item.trim();
      // return simdjson.lazyParse(item).valueForKeyPath("");
      return JSON.parse(item);
    });
}

// function processServerStreamPacket(item) {}

module.exports = { parseServerStream };
