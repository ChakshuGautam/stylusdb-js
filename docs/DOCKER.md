# Docker Deployment Guide

## Quick Start

### Single Node
```bash
docker build -t stylusdb .
docker run -p 8081:8081 stylusdb --port 8081
```

### Multi-Node Cluster
```bash
docker-compose up -d
```

## Building the Image

```bash
docker build -t stylusdb:latest .
```

### Build Arguments
```bash
docker build --build-arg NODE_ENV=production -t stylusdb:prod .
```

## Running a Cluster

### Using Docker Compose
```bash
# Start the cluster
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the cluster
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

### Manual Docker Commands
```bash
# Create network
docker network create stylusdb-network

# Run nodes
docker run -d --name node1 --network stylusdb-network \
  -e PORT=8081 -p 8081:8081 \
  -v node1-data:/app/db \
  stylusdb

docker run -d --name node2 --network stylusdb-network \
  -e PORT=8082 -p 8082:8082 \
  -v node2-data:/app/db \
  stylusdb

# ... repeat for more nodes
```

## Environment Variables

```bash
NODE_ENV=production
PORT=8081
LOG_LEVEL=info
CLUSTER_PORTS=8081,8082,8083,8084
RAFT_ELECTION_MIN=2000
RAFT_ELECTION_MAX=5000
```

## Volumes

- `/app/db` - Database files
- `/app/logs` - Log files

## Health Checks

The container includes a health check that runs every 30 seconds:
```bash
docker ps  # Check HEALTH column
```

## Troubleshooting

### Check container logs
```bash
docker logs stylusdb-node1
docker-compose logs node1
```

### Access container shell
```bash
docker exec -it stylusdb-node1 sh
```

### Inspect network
```bash
docker network inspect stylusdb-network
```

## Production Considerations

1. **Data Persistence:** Use named volumes or bind mounts
2. **Resource Limits:** Set memory and CPU limits
3. **Logging:** Configure log drivers
4. **Security:** Run as non-root user
5. **Monitoring:** Integrate with monitoring stack

### Resource Limits Example
```yaml
services:
  node1:
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
        reservations:
          memory: 256M
```

## Kubernetes Deployment

See `k8s/` directory for Kubernetes manifests (coming soon).
