# StylusDB Protocol

This is a set of rules that we use to distinguish between different kinds of messages we are sending.

## Proxy
This defines the types of messages we need in the proxy.
We use the '\n' as the delimiter for the messages

### 1. Request from Client

Legend: "?"

### 2. Response from Cluster Node

Legend: "+"


### 3. Information response from Cluster Node





## Raft Node Server
- Normal raft node data/commands
- Information Requests -- information about who is the current cluster leader and how to figure out which nodes are alive and which are not ; how many members are a member of the cluster