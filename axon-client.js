const axon = require("axon");
const argv = require("argh").argv;

// Create a Push socket
const socket = axon.socket("push");

let port = +argv.port || 8081;
// Connect to the socket
socket.connect(port); // Replace 8000 with the port you want to connect to

// Data to send
const setMessages = createEventObjects(5, "SET");
const getMessages = createEventObjects(5, "GET");

// Iterate through the messages and send each one
for (const message of setMessages) {
  console.log("sending message: ", message);
  socket.send(JSON.stringify(message));
}

// WAIT for a second and send GET messages
setTimeout(() => {
  for (const message of getMessages) {
    console.log("sending message: ", message);
    socket.send(JSON.stringify(message));
  }
}, 1000);

// Close the socket when done (optional)
socket.close();

/**
 *
 * @param {number} len length of the array required
 * @param {string} op operation to be performed
 * @returns
 */
function createEventObjects(len, op) {
  const items = [];
  for (let i = 1; i <= len; i++) {
    let data = {
      task: op,
      data: [
        {
          command: {
            key: "key_" + i,
            value: i + "",
          },
        },
      ],
    };
    if (op === "GET") delete data.data[0].command.value;
    items.push(data);
  }

  return items;
}
