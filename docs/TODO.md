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



## List -- 27/03/24

- [ ] Implement the orchestrator
- [ ] Fix the key skipping error
- [ ] Add the load balancer -- figure out if proxy can do it on its on or if we need a dedicated load balancer
- [ ] Implement updating Get-Set based on keys in a batch
- [ ] Figure out batch size -- because we get already connected error


## Observations

- we get pauses in between sets -- is there a settimeout in teh -- log entries/indexes are getting mised 
- figure out why are log entries are not getting updated and throwing not found error.
- make the proxy connect to all the nodes in the cluster
   make this fault tolerant so that there is a exponential retry incase some node goes off
- edit the "leader" fn to send a message to the proxy when the leader changes for it to know who the current leader is
- implement a sort of load balancing to delegate requests between the raft nodes
- figure out vs-code crashing with a lot of requests -- better memory management for the app maybe?

## question

- Load Balancing -- Should we have a separate load balancer? or is rotating queries at a proxy level enough?
- Bug: Data is not being stored between restarts
