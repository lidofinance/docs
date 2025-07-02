---
sidebar_position: 1
---

# Patching your OS

## Manual Security Update

Run update/upgrade command.&#x20;

```sh
sudo apt update -y && sudo apt upgrade -y
```

Restart your device.

```sh
sudo reboot 0
```

## Automatic Security Update

```bash
sudo apt update -y
sudo apt install -y unattended-upgrades update-notifier-common
sudo nano /etc/apt/apt.conf.d/20auto-upgrades
```

_**Add the following contents to the configuration file:**_

```
APT::Periodic::Update-Package-Lists "1";
APT::Periodic::Unattended-Upgrade "1";
APT::Periodic::AutocleanInterval "7";
Unattended-Upgrade::Remove-Unused-Dependencies "true";
Unattended-Upgrade::Remove-New-Unused-Dependencies "true";
Unattended-Upgrade::Automatic-Reboot "true";
Unattended-Upgrade::Automatic-Reboot-Time "02:00";
```

Once you're done, save and exit with `Ctrl+O`and `Enter`, then `Ctrl+X`.

_**Finally, restart the service:**_

```bash
sudo systemctl restart unattended-upgrades
```

#### Check the logs for any warnings:

```sh
sudo cat /var/log/unattended-upgrades/unattended-upgrades.log
```

If you see following warnings, proceed to the next step.

```
2024-02-01 04:48:24,012 WARNING System is on battery power, stopping
2024-02-01 06:19:01,972 WARNING System is on battery power, stopping
2024-02-01 17:53:48,650 WARNING System is on battery power, stopping
```

If your device is definitely connected to a power source, amend the `50unattended-upgrades` file directly.

```
sudo nano /etc/apt/apt.conf.d/50unattended-upgrades
```

Look for the following line and uncomment it by removing the `//` prefix.

```
// Unattended-Upgrade::OnlyOnACPower "false";
```

Once you're done, save and exit with `Ctrl+O`and `Enter`, then `Ctrl+X`. Then restart your Unattended Upgrades service.

```sh
sudo systemctl restart unattended-upgrades
```

## Configure Accurate System Time with Chrony

Accurate system time is crucial for validators, as discrepancies can cause synchronization issues and even affect validation performance. To ensure your device maintains precise time synchronization, we recommend installing and configuring `chrony`, a reliable Network Time Protocol (NTP) client.

### Install Chrony

```
sudo apt install -y chrony

```

### Verify Chrony is running and synchronizing

```
chronyc tracking

```

You should see output indicating synchronization with NTP servers, including your system's time offset. A stable offset within a few milliseconds is ideal.

### Recommended: Ensure Chrony starts on boot and runs consistently

```
sudo systemctl enable --now chrony

```

Chrony will now automatically manage your system time, ensuring consistent validator performance and reliability.