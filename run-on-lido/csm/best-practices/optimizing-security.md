---
sidebar_position: 2
---

# 🔐 Optimizing Security

### Server machines / VMs

1. Dedicate this device / VM purely to running your validator node clients to minimise the potential attack vectors
2. Always use long and unique passwords whenever required. Use a good password manager (e.g. [bitwarden](https://bitwarden.com/)) to maintain the various passwords you will be creating **BUT NOT YOUR UNENCRYPTED SEED PHRASE**
3. Disable password login via SSH - i.e. only use SSH keys for remote access
4. Only SSH into your server using a trusted network connection - e.g. home, office. Some examples to avoid are public WiFi network at cafes
5. Disable root account logins. In this guide we disable this via disallowing root login via SSH as we will never have physical access to the server
6. Only open necessary ports and close them when they are no longer in use
7. Configure automatic system updates to stay up to date with the latest security patches continuously
8. Configure brute force protection
9. Verify the checksums of all downloaded zipped files before executing them
10. Consider using a good VPN (e.g. NordVPN) to mask your IP address

### Client machines

1. Secure your client machine by avoiding risky activities in general on this device - e.g. downloading pirated software or content, watching porn, clicking or downloading unknown links, signing unknown transactions
2. Check your system monitor for unknown applications taking up a large portion of CPU or memory periodically and especially before you SSH into your server
3. Store your SSH private keys in an offline USB drive when not in use
