# Keys API

Simple Lido keys and validators HTTP API.

## Requirements

1. 2 core CPU
2. 5 GB RAM
   - Keys-API-DB — 500MB
   - Keys-API — 4GB
3. EL Full node
4. CL node for applications like the Ejector that use the [validators API](https://hackmd.io/fv8btyNTTOGLZI6LqYyYIg?view#validators). For Teku, please use the archive mode. Nimbus is currently not supported.

## Environment Variables

An annotated env sample is available in the repository:

https://github.com/lidofinance/lido-keys-api/blob/main/sample.env

## How to Run

For running `Keys Api`, please use a stable version's image hash, [available here](https://docs.lido.fi/guides/tooling/).

Below you can find a docker-compose example for running the service with a database.

https://github.com/lidofinance/lido-keys-api/blob/main/docker-compose.yml

To run using docker-compose:

```bash
docker-compose up
```

Now you can access the API on `http://localhost:${PORT}/api`.

## Monitoring

Prometheus metrics will be available on endpoint `http://localhost:${PORT}/metrics`.

You can find configs and dashboards for running Prometheus and Grafana locally in the repository: [Grafana](https://github.com/lidofinance/lido-keys-api/tree/main/grafana), [Prometheus](https://github.com/lidofinance/lido-keys-api/tree/main/prometheus).

Example of a `docker-compose.yml` with metrics setup:

https://github.com/lidofinance/lido-keys-api/blob/main/docker-compose.metrics.yml

## Additional Resources

Keys API GitHub Repository (Open Source)
https://github.com/lidofinance/lido-keys-api

API and internal logic documentation
https://hackmd.io/@lido/B1aCdW6Lo
