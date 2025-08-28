---
sidebar_position: 2
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 🔌 Advanced Networking

## Upnp

Universal plug and play (**Upnp**) is a way for modems/routers to automatically open ports that devices connected to it are using and closes them when they are done.

To enable this, log in to your modem/router and turn it on. It's usually a one-click action located under the "Advanced", "NAT", or "Application" etc sections.

![Enable UPnP](/img/csm-guide/networking-1.png)

**Upnp** needs to be enabled on all routers upstream and finally on your modem if you have multiple layers of routers in your network.

## Port forwarding

Port forwarding allows devices outside of your home network to access devices within. For our use case, this allows you to:

1. SSH into your validator node to perform maintenance and troubleshooting even when you are on vacation
2. Addresses the "low peer count" problem on your execution layer or consensus layer client

Due to routers/modems having different interfaces, you will need to play around with your own configuration panel or look up the official manual of your router's model.

**Example:**

<Tabs>
  <TabItem value="ssh" label="SSH">

  ![Port forward SSH](/img/csm-guide/networking-2.png)

  </TabItem>
  <TabItem value="el-peer" label="EL low peer count">

  ![Port forward EL peers](/img/csm-guide/networking-3.png)

  </TabItem>
  <TabItem value="cl-peer" label="CL low peer count">

  ![Port forward CL peers](/img/csm-guide/networking-4.png)

  </TabItem>
</Tabs>

If you have a router sitting below your modem, you will need to configure port forwarding from `modem->router->validator` using the same port numbers on both the modem and the router.

#### Below is a repository of port forwarding instructions for a wide range of router models.

[PortForward.com Router Guides](https://portforward.com/router.htm)

## VPN

Setting up a VPN is useful for the following:

1. A smoother user experience for managing your validator node remotely
2. Configuring failover beacon nodes across multiple physical locations

While there are many VPNs available, the most fuss-free of all is [Tailscale](https://tailscale.com/). Not to mention, it's free to use for the first 100 connected devices.

**Quick start:**

1) Create a free account at [Tailscale](https://tailscale.com/).

2) Add devices under "Machines".

![Tailscale Machines](/img/csm-guide/networking-5.png)

3) Add your client device (e.g. working laptop) using the easy-to-follow instructions provided

<Tabs>
  <TabItem value="linux" label="Linux">

  ![Tailscale Linux](/img/csm-guide/networking-6.png)

  </TabItem>
  <TabItem value="windows" label="Windows">

  ![Tailscale Windows](/img/csm-guide/networking-7.png)

  </TabItem>
  <TabItem value="mac" label="Mac">

  ![Tailscale Mac](/img/csm-guide/networking-8.png)

  </TabItem>
</Tabs>

4) Make sure to complete the registration of the newly added device on your Tailscale account when prompted

5) Add your validator node device by running the script provided in the terminal

6) Add any other failover beacon node devices into this VPN

#### All of your devices added to this VPN will now be able to communicate/connect directly with one another via the IP addresses provided by Tailscale.