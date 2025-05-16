---
sidebar_position: 0
---

# 🔧 Setting the Fee Recipient for CSM Validators

When running validators via Lido Community Staking Module (CSM), it is **mandatory** to set the fee recipient to the **Lido Execution Layer Rewards Vault**:

- **Mainnet:** [`0x388C818CA8B9251b393131C08a736A67ccB19297`](https://etherscan.io/address/0x388C818CA8B9251b393131C08a736A67ccB19297)
- **Hoodi testnet:** [`0x9b108015fe433F173696Af3Aa0CF7CDb3E104258`](https://hoodi.etherscan.io/address/0x9b108015fe433F173696Af3Aa0CF7CDb3E104258)

:::warning
For **Hoodi Testnet** users:

Use [`0x9b108015fe433F173696Af3Aa0CF7CDb3E104258`](https://hoodi.etherscan.io/address/0x9b108015fe433F173696Af3Aa0CF7CDb3E104258) instead of [`0x388C818CA8B9251b393131C08a736A67ccB19297`](https://etherscan.io/address/0x388C818CA8B9251b393131C08a736A67ccB19297) in the guides below.
:::

Failure to do so may result in [MEV stealing penalties](https://docs.lido.fi/staking-modules/csm/guides/mev-stealing), including:

- A **penalty** equal to the stolen execution layer rewards plus a fixed fine  
- Your **bond being locked** until the full penalty amount is returned

This guide shows you how to correctly set the fee recipient on various platforms. It does not cover how to set up or run a validator node from scratch.

:::success
You can verify the fee recipient address on the [Lido Deployed Contracts](https://docs.lido.fi/deployed-contracts/) page.
:::

---

## Dappnode

Dappnode sets the fee recipient through the **Staking Brain** in the Web3Signer package, either during key import or by editing existing validator keys.

### Set fee recipient when importing new validator keys

1. In the side panel, go to **“Stakers”**, then select the **Web3Signer** package and click **“Upload Keystores”**.  
2. Enable **“Use same tag for every file”**, and in the **“Staking Protocol”** dropdown, select **“Lido”**. This automatically sets the fee recipient to:  
   ```text
   0x388C818CA8B9251b393131C08a736A67ccB19297
   ```  
3. Click **“Submit Keystores”** to complete the import.  

![Dappnode Import Fee Recipient](/img/csm-guide/fee-1.png)

---

### Change fee recipient on existing validator keys

1. In the side panel, go to **“Stakers”**, then select **Web3Signer** → **Upload Keystores**.  
2. Review the **Fee Recipient** field for each validator key. If it’s wrong or blank, click the **edit** icon.  
3. Set it to  
   ```text
   0x388C818CA8B9251b393131C08a736A67ccB19297
   ```  
4. Click **“Submit Keystores”**.  

![Dappnode Edit Fee Recipient](/img/csm-guide/fee-2.png)

:::warning
**Known Nimbus issue:**  
When using Nimbus on Dappnode, the Web3Signer fee-recipient may not stick. Instead, Nimbus’ own setting is used. See the [bug report](https://research.lido.fi/t/proposed-blocks-with-wrong-fee-recipient-due-to-dappnode-nimbus-bug/9057).  
We recommend not running Nimbus on Dappnode for CSM until it’s fixed.
:::

---

## Eth Docker

### 1) Validator-key level

With ETH Docker running, in your terminal:

```bash
./ethd keys list
./ethd keys set-recipient 0xPUBKEY 0x388C818CA8B9251b393131C08a736A67ccB19297
```

Replace `0xPUBKEY` with the key you want to update.

---

### 2) Client-level

In your `~/eth-docker` folder:

```bash
cd ~/eth-docker
nano .env
```

Make sure you have:

```env
FEE_RECIPIENT=0x388C818CA8B9251b393131C08a736A67ccB19297
```

Save & exit, then:

```bash
./ethd update
./ethd up
```

---

## Sedge

```bash
cd <your-sedge-folder>/sedge-data
nano .env
```

Ensure:

```env
FEE_RECIPIENT=0x388C818CA8B9251b393131C08a736A67ccB19297
```

Save & exit, then:

```bash
./sedge down
./sedge run
```

---

## Stereum

1. Open your node page in the Stereum Launcher.  
2. Click the **settings** icon for your Validator Client.  

![Stereum Fee Settings](/img/csm-guide/fee-3.png)

3. Find **Default Fee Recipient** and verify/update to:  
   `0x388C818CA8B9251b393131C08a736A67ccB19297`  
4. Confirm & restart your node.

---

## SSV Network

1. Go to the [SSV dApp](https://app.ssv.network/) and log in.  
2. Click **Fee Address** in the top right.  

![SSV Fee Address](/img/csm-guide/fee-4.png)

3. Enter `0x388C818CA8B9251b393131C08a736A67ccB19297` and click **Update**.

:::caution
Fee Recipient is set **per wallet**, not per cluster.  
If you run other protocols in parallel, use a **different wallet** for each.
:::

---

## Obol

When you create a DVT cluster via Obol’s Launchpad and select **Lido CSM**, the fee recipient is automatically set:

![Obol Fee Recipient](/img/csm-guide/fee-5.png)

If you use the CLI, set it manually in your cluster definition before creation.

:::caution
Double-check before finalizing — it **cannot** be changed afterward.  
If wrong, you must exit & recreate with the correct address.
:::

---

## Systemd

In your service file (e.g. `/etc/systemd/system/validator.service`), update the `ExecStart` line:

```bash
# Lighthouse example
ExecStart=/usr/local/bin/lighthouse vc \
  --suggested-fee-recipient=0x388C818CA8B9251b393131C08a736A67ccB19297 \
  [other flags...]
```

```bash
# Prysm example
ExecStart=/usr/local/bin/validator \
  --suggested-fee-recipient=0x388C818CA8B9251b393131C08a736A67ccB19297 \
  [other flags...]
```

```bash
# Teku example
ExecStart=/usr/local/bin/teku/bin/teku validator-client \
  --validators-proposer-default-fee-recipient=0x388C818CA8B9251b393131C08a736A67ccB19297 \
  [other flags...]
```

```bash
# Nimbus example
ExecStart=/usr/local/bin/nimbus_validator_client \
  --suggested-fee-recipient=0x388C818CA8B9251b393131C08a736A67ccB19297 \
  [other flags...]
```

```bash
# Lodestar example
ExecStart=/usr/bin/lodestar validator \
  --suggestedFeeRecipient=0x388C818CA8B9251b393131C08a736A67ccB19297 \
  [other flags...]
```

Finally:

```bash
sudo systemctl daemon-reload
sudo systemctl restart <your-validator-service>
```