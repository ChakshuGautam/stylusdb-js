# StylusDB

## Project Structure

This project is a normal NodeJS project with a target of using as less NPM dependencies as much possible.

### Directories

- [`./raft`](./raft/) - This directory contains a very light weight implementation of the Raft Protocol. The code inside this folder has been taken from [unshitio/liferaft](https://github.com/unshiftio/liferaft)
- [`./reference`](./reference/) - This folder is for experimentation purposes this is where the contributors store the code for WIP experiments which are to be referenced later.
- [`./scripts`](./scripts/) - This folder contains a few scripts to avoid the hassle of manually running the cluster and clients

### Files

- [`./cli.js`](./cli.js) - This file contains the implementation for a minimalistic REPL or CLI for StylusDB cause what is a DB without a CLI 🤓.
- [`./client.js`](./client.js) - This is a small implementation of a sample client to send messages to the nodes in the cluster.
- [`./db.js`](./db.js) - This contains the implementation for connecting and storing data to our storage engine. Presently this acts as an interface to `LMDB` but in future this will be a generic interface to a host of storage engines.
- [`./index.js`](./index.js) - Contains the implementation of the class defining the structure and callbacks for a node in the `StylusDB` Raft Node Cluster.
- [`./raft-node.js`](./raft-node.js) - This file contains functions to instantiate a node using the class defined in index.js. This exists as a separate file for ease of understanding right now, might be merged with `index.js` later.
- [`./server.js`](./server.js) - This file setsup a server to accept connections and respond to requests from client. This is the file where the Raft Node is instantiated and connected to the other nodes in the cluster.

## How to Contribute?
- Refer to issue tickets on [Github](https://github.com/techsavvyash/stylusdb-js)
- A list of high level goals and roadmap can be found in [TODO.md](./TODO.md)
- Rest of the steps remain same as how you'd contribute to any other open source project
  - Fork the repository
  - Make the required changes 
  - Raise a PR and ask for reviews
- In case of doubts or guidance reach out to [Yash Mittal](https://github.com/techsavvyash)

## Pre-requisties 
- Understanding of the [Raft Distributed Consensus Algorithm](ft.github.io/raft.pdf)
- Working knowledge of [NodeJS](https://nodejs.com)
- Knowledge of Distributed Systems and Distributed Databases
- Knowledge of Database Internals
