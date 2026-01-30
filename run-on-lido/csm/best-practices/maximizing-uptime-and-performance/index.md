---
sidebar_position: 1
---

# 📈 Maximizing Uptime and Performance

### Easy

1. Connect your validator node to your router directly via a LAN cable. WIFI connection is too unstable to perform your validator duties in a timely manner.  
2. If you are only using an integrated modem + router provided by your ISP, you might find that connecting a validator node to it degrades the quality of service for all other usage. If so, get a good router and connect it downstream to your modem. Then connect all devices to this new router instead.  
3. Update your clients in a timely manner as these usually come with performance improvement fixes  
   * Create a new server on Discord to receive alerts on new releases and patches of your execution layer and consensus layer clients. Keep this channel clean.  
   * Set alerts from the announcement channels to your own server.
4. Set up the [monitoring & alerting services](https://dvt-homestaker.stakesaurus.com/monitoring-maintenance-and-updates/set-up-monitoring-suite) so that you are alerted on any downtime promptly.
5. During normal operations, configure your clients to restart themselves automatically if they go down. This is in accordance to this guide.  
6. Prune your execution layer clients before you reach &lt;300 GB of available space.  
7. Check for scheduled sync committee duties [here](https://www.coincashew.com/coins/overview-eth/guide-or-how-to-setup-a-validator-on-eth2-mainnet/part-ii-maintenance/checking-my-eth-validators-sync-committee-duties) and block proposal duties [here](https://wenmerge.com/block-proposer-schedule/) before starting the pruning process.

### Advanced

1. [ETH Docker performance tuning tips](https://ethdocker.com/Usage/LinuxSecurity/#additional-and-recommended-linux-performance-tuning).
   * Switch the timekeeping service from the default NTP service to Chrony. 
   * Configure swapiness=1 or disable swap entirely if you have 32 GB or more RAM.  
   * Configure noatime on your disk.  
2. Community-contributed performance tuning tips.  
   * [Blockshard’s](./community-tips#blockshard)  
3. Configure Quality of Service (QoS) on your router to prioritise your validator node.  
4. Maintain your own SOPs table for dealing with the various scenarios of downtime, including edge cases. Improve on this over time based on your own setup environment.