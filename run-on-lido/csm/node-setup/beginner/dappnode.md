# Dappnode

**Dappnode** is an open-source node management software with a highly abstracted user interface. Perfect for beginners or operators seeking maximum comfort in their setup.

## Full Node Setup

:::info
Machines purchased from the [Dappnode store](https://dappnode.com/) are plug-and-play. If you’re installing it on your own hardware, it must run on Debian. Follow the official Debian installer guide [here](https://www.debian.org/devel/debian-installer/).
:::

### Video Guide
<iframe width="800" height="450" src="https://www.youtube.com/embed/n31bSAn2IuM?si=RoLjNML8JArVVtGz" title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />

You can also follow complete playlists for:  
- [Mainnet Playlist](https://youtube.com/playlist?list=PLS0yTNR46xvGJP1H09iRFxKK09vrNTqBp&si=wx75jG1VC6s_nLFM)  
- [Testnet Playlist](https://youtube.com/playlist?list=PLS0yTNR46xvEkuuWuiucxo0ZJ8W3wPpx1&si=guuiaiEuwYYwEt2XFM)

:::warning
For Testnet setups, replace all Holesky references with Hoodi.
:::

## Installing Dappnode

Dappnode sells ready-to-use machines, like the [Lido edition](https://dappnode.com/collections/frontpage/products/home-lido).  
For a DIY install, you can either:

- Use the [ISO installer](https://docs.dappnode.io/docs/user/install/iso) (Debian + Dappnode bundled).  
- Install Debian manually and run the [Dappnode install script](https://docs.dappnode.io/docs/user/install/script).

You’ll manage Dappnode via its web UI. To access it remotely, set up a VPN:

- **WireGuard VPN**: Perfect for use after the initial setup. [YouTube guide](https://www.youtube.com/watch?ab_channel=Dappnode&v=qB0sMaNpXpU)
- **Tailscale VPN**: Fast and reliable access that can be set up after the first connection. [YouTube guide](https://www.youtube.com/watch?ab_channel=SamuelChong&index=8&list=PLS0yTNR46xvEkuuWuiucxo0ZJ8W3wPpx1&v=jdLPUo6VK_A)  

## Configure Dappnode to run Lido CSM

### Setting up the Full Node

With your VPN active, visit [http://my.dappnode/](http://my.dappnode/) → **Stakers** tab. Then select your network (Mainnet or Hoodi), pick execution & consensus clients, enable Web3signer, and choose MEV-Boost relays from [the list of Lido-vetted relays](https://enchanted-direction-844.notion.site/6d369eb33f664487800b0dedfe32171e?v=d255247c822c409f99c498aeb6a4e51d).

![Chain syncing on Dashboard](/img/csm-guide/dappnode-1.png)

Scroll down, click **Apply changes**, and wait for the chain to sync.

![Installation progress](/img/csm-guide/dappnode-2.png)

### Installing the Lido CSM package

1. Go to **DAppStore** (`http://my.dappnode/installer/dnp`), find **Lido CSM** (Mainnet/Hoodi), and click **GET**.  
2. Once installed, open the **Lido CSM** package under **Packages**.

![Lido CSM package UI](/img/csm-guide/dappnode-3.png)

This gives you the local CSM widget plus extra features:
- Upload keystores & deposit data.  
- Monitor client status on Dashboard.  
- Configure Telegram alerts in Notifications.

### Keep your clients up to date
To keep your clients and other packages up to date for network upgrades, security releases or minor improvements please follow [this guide](/run-on-lido/csm/updates-and-maintenance/client-updates).