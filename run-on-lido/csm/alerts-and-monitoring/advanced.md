---
sidebar_position: 2
---

# 🖥️ Advanced: Local Grafana Dashboard

## Setup

### Dappnode

1. Check if the Dappnode Monitoring Service (DMS) Package is already installed under **Packages**. Else, install it from the Dappstore.  
2. Access your Dappnode interface, go to the DMS Package, and open up the DMS dashboard.

![Dappnode DMS](/img/csm-guide/advanced-1.png)

[Video guide](https://www.youtube.com/watch?v=uhEiLQ4sRHo&ab_channel=SamuelChong)

### EthPillar

Run `ethpillar`. Then navigate to **21. Toolbox » 2. Monitoring: Observe Ethereum Metrics. Explore Dashboards » Install**.

### Stereum

You'll find a button to open Grafana at the top of the launcher screen. Click there and Stereum will open the local instance in your browser.

![Stereum Grafana](/img/csm-guide/advanced-2.png)

### Sedge

**Sedge** deploys validators using Docker Compose and includes optional support for Grafana and Prometheus.

* If you enabled monitoring during setup, Prometheus and Grafana containers should be running  
* You can edit your `docker-compose.yaml` or `.env` file to adjust data retention or expose metrics

### Eth Docker

No additional steps required.

### Systemd (Validator Client add-on only)

Edit the `prometheus.yml` configuration file.

```bash
sudo nano /etc/prometheus/prometheus.yml
```

Add a scrape target pointing at your validator client's metrics endpoint. Metrics have to be enabled on the client itself first, and both the flag that enables them and the port they are served on differ between clients, so check your client's own documentation for the exact values.

Then reload Prometheus so it picks up the new target:

```bash
sudo systemctl restart prometheus
```