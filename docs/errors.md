# Errors

This document lists the different error codes we are using in our implementation.

## Codes

1. Error 8: Since every socket/server (both proxy and raft node servers) accept only single connection at a time, so we return an "error-8" whenever there is a request of more than one connection.  