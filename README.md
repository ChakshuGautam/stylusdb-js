# stylusdb-js

A minimalistic implementation of a distributed KV Store

### Configuration
Modify config.json

### Installation
```sh
nvm install 16
nvm use 16
npm install
```

### Starting Server
Open four terminals and start a 4 node cluster.

```sh
DEBUG=* node index.js --port 8081
DEBUG=* node index.js --port 8082
DEBUG=* node index.js --port 8083
DEBUG=* node index.js --port 8084
```

### Benchmarks
Coming soon

### REPL
Coming soon

### TODOs
- [ ] Dockerization
- [ ] Memory profiling
- [ ] Scripts to deploy to edge
- [ ] Client implementation

### Caveats
1. WIP (Bleeding edge) - use it at your own risk.
2. Built for learning puposed only

### Contribution
1. Project is actively looking for contributors. Look at open tickets


### References
1. [REPL](https://gist.github.com/goliatone/e8f38b75aa05b2d189f68a92c61af110)
2. [Axon - Message Queue](https://github.com/tj/axon)
3. [RAFT Implementation](https://github.com/unshiftio/liferaft), copied in the project to simplify making changes and packaging.
4. [RAFT Protocol PDF](https://raft.github.io/raft.pdf)
5. [RAFT Simplified 1](https://towardsdatascience.com/raft-algorithm-explained-a7c856529f40)
6. [RAFT Simplified 2](https://towardsdatascience.com/raft-algorithm-explained-2-30db4790cdef)