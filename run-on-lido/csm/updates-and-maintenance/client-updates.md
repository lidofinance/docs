---
sidebar_position: 0
---

# Client Updates

## Dappnode

If there are updates available to your clients, they'll appear on the right-hand side of your Dappnode Dashboard:

![Dappnode Update Button](/img/csm-guide/update-1.png)

Click on the package and then on the **Update** button and follow the instructions for the update. It should install automatically after checking parameters are correct.

You'll be prompted to enable automatic updates for all your packages. It is recommended to update manually as certain client versions conflict with one another. This way, you have full control over which client versions to run for your setup.

## EthPillar

Run `ethpillar`. Navigate to each client used and select **Update to latest release**.

## Stereum

If there are updates available to your clients they'll appear on the right-hand side of the **Note** tab:

![Stereum Update Notice](/img/csm-guide/update-2.png)

Click on the package you wish to update, and then confirm the installation.

## Sedge

If you want to update your clients, first update the `.env` file and change the following lines:

```bash
EC_IMAGE_VERSION=<client:version>
CC_IMAGE_VERSION=<client:version>
VL_IMAGE_VERSION=<client:version>
```

Run:

```bash
sedge down
sedge run
```

## Eth Docker

Run the following commands:

```bash
ethd down
ethd update
ethd up
```

## Systemd

:::warning
This sub-section applies to your validator client and Mev-boost client. Replace the **CLIENT** portion of the following commands with the actual service names.
:::

### Stop your client

```bash
sudo systemctl stop CLIENT.service
```

### Download the latest version

:::info
**Releases Pages:**

- Nimbus: https://github.com/status-im/nimbus-eth2/releases
- Lighthouse: https://github.com/sigp/lighthouse/releases
- Prysm: https://github.com/OffchainLabs/prysm/releases
- Lodestar: https://github.com/ChainSafe/lodestar/releases
- Teku: https://github.com/ConsenSys/teku/releases
- Mev-boost: https://github.com/flashbots/mev-boost/releases/
:::

Download the latest validator client binary:

```bash
curl -LO DOWNLOAD_URL
```

Download the corresponding checksum file:

```bash
curl -LO CHECKSUM_URL
```

Verify the checksum:

```bash
echo "CHECKSUM  DOWNLOADED_CLIENT_FILE_NAME" | sha256sum --check
```

_**Expected output:**_ `nimbus_validator_client: OK`

:::info
Each downloadable file comes with its checksum. Replace with the actual checksum and URL.

Make sure to choose the amd64 version. Right-click the link and select **Copy link address** for `curl`.
:::

If checksum is verified, extract and install:

```bash
tar xvf DOWNLOADED_CLIENT_FILE_NAME
sudo cp LATEST_CLIENT_BINARIES /usr/local/bin
```

Clean up:

```bash
cd
rm -r ALL_DOWNLOADED_FILES
```

### Restart the validator client

```bash
sudo systemctl start CLIENT.service
sudo systemctl status CLIENT.service
```

Monitor logs:

```bash
sudo journalctl -fu CLIENT.service -o cat | ccze -A