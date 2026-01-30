# Stereum

**Stereum** is an open-source toolkit that simplifies setting up and managing Ethereum nodes, supporting solo staking and integrations like Lido’s Community Staking Module (CSM).

It provides an intuitive UI and automation tools, making node deployment and maintenance more accessible for validators.

## Full Node Setup

:::info
To use Stereum your machine must be running Ubuntu. Follow the official installation guide [here](https://ubuntu.com/tutorials/install-ubuntu-desktop).
:::

### Video Guide
<iframe width="800" height="450" src="https://www.youtube.com/embed/v5k1nlDajyI?si=wAM35LSC_Wk7I7RQ" title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />

:::warning
For Testnet setups, replace all Holesky references with Hoodi.
:::

### Configure Passwordless Sudo

Stereum requires passwordless `sudo` access to function properly. Follow these steps:

1. Open the `/etc/sudoers` file
```bash
sudo visudo
````

2. Add this line under `#includedir /etc/sudoers.d` (replace `<username>` with your user):
```text
<username> ALL=(ALL) NOPASSWD: ALL
```

3. Then log out and back in. Verify with:
```bash
sudo -l
```

If no password is requested, you’re all set.

### Download the Stereum Launcher

Visit [stereum.net](https://stereum.net/) and download the launcher for your OS.

![Download the Stereum Launcher](/img/csm-guide/stereum-1.png)

### Configure the Stereum Launcher to run Lido CSM

Open the launcher, add your server’s SSH credentials, you can save them for future use.

![Configure Stereum Launcher](/img/csm-guide/stereum-2.png)

At login, choose **One-click installation**:

![One-click Installation](/img/csm-guide/stereum-3.png)

Select **Ethereum** → **CSM** as your use case (we recommend testing on a testnet first):

![Select Use Case](/img/csm-guide/stereum-4.png)

Next, pick execution, consensus, and validator clients, as well as a sync mode (Checkpoint Sync is recommended) and MEV-Boost relays (Learn more about CSM relay requirements [here](/run-on-lido/csm/troubleshooting/mev-install#stereum)):

![Services Installation Options](/img/csm-guide/stereum-5.png)

Once confirmed, Stereum will install all services automatically.

### Check Your Setup and Upload Validator Keys

In the launcher’s **Setup** view, verify these services are running:

* Execution, consensus, and validator clients
* Flashbots MEV-Boost
* Lido Keys API & Validator Ejector
* Prometheus, Grafana, CSM Monitoring, and IPFS

![Check Services Logs](/img/csm-guide/stereum-6.png)

Confirm your validator client’s fee recipient is the Lido Execution Layer Rewards Vault:

* **Mainnet:** [`0x388C818CA8B9251b393131C08a736A67ccB19297`](https://etherscan.io/address/0x388C818CA8B9251b393131C08a736A67ccB19297)
* **Hoodi:** [`0x9b108015fe433F173696Af3Aa0CF7CDb3E104258`](https://hoodi.etherscan.io/address/0x9b108015fe433F173696Af3Aa0CF7CDb3E104258)

![Verify Fee Recipient Setting](/img/csm-guide/stereum-7.png)

If everything looks good, you’re ready to import your keys:

1. Open the **Staking** tab.
2. Drag & drop your keystore files.
3. Select the validator client configured with the Lido vault as the fee recipient.
4. Enter your keystore password and click ✓.

After import, you’ll see your validator in the UI:

![Staking Tab Import View](/img/csm-guide/stereum-8.png)

---

## Generate Validator Keys

Follow the [Generating Validator Keys guide](../../generating-validator-keys/) and ensure you set the correct withdrawal address.

### Keep your clients up to date
To keep your clients and other packages up to date for network upgrades, security releases or minor improvements please follow [this guide](/run-on-lido/csm/updates-and-maintenance/client-updates).