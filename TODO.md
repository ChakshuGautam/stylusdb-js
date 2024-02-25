# TODO

## Resources
To browse the DB: https://www.mdbopener.com/
-- Refer: Pelican -- This is rebuilding Pelican in JS

## Roadmap / Things to try out

- [ ] Turn message saving into a batch process
- [ ] Fine tune `server.js` to expose set and get via CLI
- [ ] Turn setInterval directly via sockets
- [ ] Fine tune LMDB Manager
- [ ] Compress commands together and in memory calculate the final process
- [ ] Let candidates run the `GET` commands
   - [ ] Make sure there are no race conditions here
- [ ] Run RAFT on the browser - [Mozilla Docs on Socket](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API)
- [ ] Demo with message inter-play between nodes and other benchmarking 
- [ ] Large Keys and Small Keys optimisation



## Doubts :- 
- [ ] In message of raft when we are sending "SET" as what it should be giving error as in raft.on("data", packet) the packet is bound to be an object which is not so in this case, (sending message in server is ambiguous, the what must be in the form of a raft packet)

- [ ] When we send a message from follower to leader to set a value, there is no case to command all followers to save that message

