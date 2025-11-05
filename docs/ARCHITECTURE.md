# StylusDB Architecture

## Overview

StylusDB is a distributed key-value store built on the Raft consensus algorithm. It provides strong consistency guarantees across a cluster of nodes.

## System Components

### 1. Raft Consensus Layer
- **Purpose:** Ensures consistency across distributed nodes
- **Implementation:** Custom Raft implementation based on the Raft paper
- **Key Features:**
  - Leader election
  - Log replication
  - Commitment and state machine
  - Heartbeat mechanism

### 2. Storage Layer (LMDB)
- **Purpose:** Persistent key-value storage
- **Technology:** Lightning Memory-Mapped Database (LMDB)
- **Features:**
  - Memory-mapped storage for performance
  - ACID transactions
  - Batch write optimization
  - Automatic commits every N operations

### 3. Network Communication (Axon)
- **Purpose:** Inter-node messaging
- **Protocol:** Request-response pattern over TCP
- **Message Types:**
  - Vote requests
  - Append entries
  - Heartbeats
  - Client operations (GET/SET)

### 4. Configuration Management
- **Environment-based configuration**
- **Support for dev/prod/test environments**
- **Dynamic configuration loading**

### 5. Logging & Monitoring
- **Structured logging with Winston**
- **Multiple log levels and transports**
- **Error handling and custom error types**

## Architecture Diagram

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Node 1    │     │   Node 2    │     │   Node 3    │
│  (Leader)   │────▶│  (Follower) │     │  (Follower) │
│             │     │             │     │             │
│ ┌─────────┐ │     │ ┌─────────┐ │     │ ┌─────────┐ │
│ │  Raft   │ │     │ │  Raft   │ │     │ │  Raft   │ │
│ └─────────┘ │     │ └─────────┘ │     │ └─────────┘ │
│ ┌─────────┐ │     │ ┌─────────┐ │     │ ┌─────────┐ │
│ │  LMDB   │ │     │ │  LMDB   │ │     │ │  LMDB   │ │
│ └─────────┘ │     │ └─────────┘ │     │ └─────────┘ │
└─────────────┘     └─────────────┘     └─────────────┘
       │                   ▲                   ▲
       │                   │                   │
       └───────────────────┴───────────────────┘
              Axon Message Passing
```

## Data Flow

### Write Operation (SET)
1. Client sends SET request to any node
2. If node is not leader, request fails
3. Leader appends entry to its log
4. Leader replicates entry to all followers
5. Followers acknowledge receipt
6. Once majority acknowledges, leader commits
7. Leader applies to state machine (LMDB)
8. Leader responds to client

### Read Operation (GET)
1. Client sends GET request to any node
2. Node reads from local LMDB
3. Returns value to client
(Note: Reads may return stale data on followers)

## Consensus Algorithm (Raft)

### States
- **Follower:** Default state, passive receiver
- **Candidate:** Transitional state during election
- **Leader:** Handles all client requests

### Leader Election
1. Follower times out (no heartbeat from leader)
2. Becomes candidate, increments term
3. Votes for itself, requests votes from others
4. If receives majority votes, becomes leader
5. Sends heartbeats to maintain leadership

### Log Replication
1. Leader receives client command
2. Appends to local log
3. Sends AppendEntries RPC to followers
4. Followers append to their logs
5. Leader waits for majority acknowledgment
6. Leader commits entry and applies to state machine

## Scalability Considerations

### Current Limitations
- Designed for 3-7 node clusters
- Single-leader write bottleneck
- No sharding or partitioning

### Performance Optimization
- Batch writes to LMDB (configurable batch size)
- Memory-mapped storage for fast reads
- Asynchronous network communication

## Future Enhancements
1. Read replicas for scalability
2. Snapshot and log compaction
3. Dynamic cluster membership
4. Multi-Raft for sharding
5. TLS encryption for inter-node communication
