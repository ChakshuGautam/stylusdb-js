# stylusdb-js

A minimalistic implementation of a distributed KV Store based on the Raft consensus protocol. StylusDB aims to be a SOTA JS implementation of a RAFT based highthrouput KV.

### Configuration
Modify `config.json`

### Installation
```sh
nvm install 18
nvm use 18
npm install
```

### Preparing Directories

Create the following 6 directories before contiuing to start the server below:
```bash
mkdir db log
```


### Starting Server

```sh
npm run start
```

This will start a 4 node raft cluster, a proxy server and a user-shell in a [mprocs](https://github.com/pvolok/mprocs) tui for you to develop easily.


### Benchmarks
Coming soon 

### REPL
Coming soon (WIP with [ClI](./cli.js))

### TODOs
- [ ] Dockerization
- [ ] Memory profiling
- [ ] Scripts to deploy to edge
- [ ] Client implementation
- [ ] Integrate YCSB
  - [ ] Java based
  - [ ] Go based (because TiKV uses this to benchmark themselves)

### Caveats
1. WIP (Bleeding edge) - use it at your own risk.
2. Built for learning puposes only

### References
1. [REPL](https://gist.github.com/goliatone/e8f38b75aa05b2d189f68a92c61af110)
2. [Axon - Message Queue](https://github.com/tj/axon)
3. [RAFT Implementation](https://github.com/unshiftio/liferaft), copied in the project to simplify making changes and packaging.
4. [RAFT Protocol PDF](https://raft.github.io/raft.pdf)
5. [RAFT Simplified 1](https://towardsdatascience.com/raft-algorithm-explained-a7c856529f40)
6. [RAFT Simplified 2](https://towardsdatascience.com/raft-algorithm-explained-2-30db4790cdef)