# Dappnode

**Dappnode** is an open-source node management software with a highly abstracted UI/UX. Perfect for beginners or operators seeking maximum comfort in their setup.

## Full Node Setup

:::info
Machines purchased from the Dappnode store are plug-and-play. If you’re installing on your own hardware, it must run Debian. Follow the official Debian installer guide [here](https://www.debian.org/devel/debian-installer/).
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

Dappnode sells ready-to-use machines (e.g. the [Lido edition](https://dappnode.com/collections/frontpage/products/home-lido)).  
For a DIY install, you can either:

- Use the [ISO installer](https://docs.dappnode.io/docs/user/install/iso) (Debian + Dappnode bundled).  
- Install Debian manually and run the [Dappnode install script](https://docs.dappnode.io/docs/user/install/script).

You’ll manage Dappnode via its web UI. To access it remotely, set up a VPN:

- **Tailscale VPN**: [YouTube guide](https://www.youtube.com/watch?ab_channel=SamuelChong&index=8&list=PLS0yTNR46xvEkuuWuiucxo0ZJ8W3wPpx1&v=jdLPUo6VK_A)  
- **WireGuard VPN**: [YouTube guide](https://www.youtube.com/watch?ab_channel=Dappnode&v=qB0sMaNpXpU)

## Configure Dappnode to run Lido CSM

### Setting up the Full Node

With your VPN active, visit [http://my.dappnode/](http://my.dappnode/) → **Stakers** tab.  
Select your network (Mainnet or Hoodi), pick execution & consensus clients, enable Web3signer, and choose MEV-Boost relays from [the operator portal](https://operatorportal.lido.fi/existing-operator-portal/ethereum-onboarding/mev-relays).

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

## Update Clients

Available updates appear on the right of the Dashboard:

![Updates prompt](/img/csm-guide/dappnode-4.png)

We recommend manual updates to avoid surprises.