# Community Tips

## Blockshard

> I'm usually tuning networking, memory, and file descriptors. This is a `sysctl.conf` file I'm using to tune and harden a blockchain node, collected and fine-tuned over the years.
>
> &#x20;\- [Marc Bonenberger, Founder @ Blockshard](https://www.linkedin.com/in/mbonenberger)

Edit the `/etc/sysctl.conf` file.

```sh
sudo nano /etc/sysctl.conf
```

Add the following contents to the bottom of the file. **Note:** Delete any uncommented lines that were previously added. e.g.,

`vm.swappiness=10`

`vm.vfs_cache_pressure=50`

```
# =======================================
# FILE DESCRIPTORS
# =======================================
fs.file-max = 500000           # Max number of open files system-wide (also set ulimit for processes)

# =======================================
# NETWORK PERFORMANCE TUNING (TCP/IP)
# =======================================

# Congestion control and queuing discipline
net.ipv4.tcp_congestion_control = bbr  # Use BBR for better congestion handling
net.core.default_qdisc = fq            # Fair Queuing (fq) pairs well with BBR

# TCP buffer sizes (min, default, max in bytes)
net.ipv4.tcp_rmem = 4096 1048576 2097152  # Receive buffer
net.ipv4.tcp_wmem = 4096 65536 16777216   # Send buffer

# Default buffer limits for all sockets
net.core.rmem_default = 1048576
net.core.wmem_default = 1048576
net.core.rmem_max = 16777216
net.core.wmem_max = 16777216
net.core.optmem_max = 65536

# TCP settings for better throughput and resilience
net.ipv4.tcp_window_scaling = 1          # Allow larger TCP window sizes
net.ipv4.tcp_sack = 1                    # Selective acknowledgements
net.ipv4.tcp_timestamps = 1              # Timestamps for round-trip time measurement
net.ipv4.tcp_syncookies = 1              # Protect against SYN flood attacks
net.ipv4.tcp_slow_start_after_idle = 0   # Don't restart slow start after idle
net.ipv4.tcp_no_metrics_save = 1         # Don't retain metrics from past connections
net.ipv4.tcp_low_latency = 1             # Prioritize latency

# Increase the connection backlog
net.core.somaxconn = 8192                # Max incoming connection queue length

# =======================================
# SECURITY HARDENING
# =======================================
net.ipv4.icmp_echo_ignore_broadcasts = 1     # Ignore ICMP broadcasts (smurf protection)
net.ipv4.icmp_ignore_bogus_error_responses = 1

net.ipv4.conf.all.accept_redirects = 0       # Don't accept ICMP redirects
net.ipv4.conf.all.log_martians = 0           # Disable logging of packets with impossible addresses

# =======================================
# SHARED MEMORY
# =======================================
kernel.shmmax = 1073741824       # Max size of a shared memory segment (1GB)

# =======================================
# VIRTUAL MEMORY TUNING
# =======================================
vm.swappiness = 1               # Prefer RAM over swap
vm.vfs_cache_pressure = 50       # Retain inode/dentry cache longer (useful for I/O-heavy apps)
```

`CTRL+O`, `ENTER`, `CTRL+X` to save and exit.

Then load the new values and verify that the new settings are applied

```sh
sudo sysctl -p # load new values
sudo sysctl --system # verify settings are applied
```
