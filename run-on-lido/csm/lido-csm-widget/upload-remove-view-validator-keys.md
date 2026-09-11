---
sidebar_position: 0
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 📥 Upload/Delete/View validator keys

## Deposit queue

:::info
We encourage operators to see the queue before submitting new keys, as they may have to wait some time to get deposits, and there's a [key removal charge](/run-on-lido/csm/penalties#parameters-by-operator-profile) for removing keys while in the queue.
:::

Stake is allocated to uploaded keys through a queue. You can see a visual representation of it under the deposit widget, or at the top of the `View Keys` tab.

![Deposit queue](/img/csm-guide/keys-1.png)

The default queue is FIFO (first in, first out), so keys are served in the order they were submitted. Some operator types are also eligible to have a limited number of keys deposited through a higher-priority queue, which is processed before the default one. See [Stake allocation queue](/staking-modules/node-operators#stake-allocation-queue) for the full mechanics.

**In 0x01 CSM**, each key receives a single 32 ETH deposit once the queue reaches it.

**In 0x02 CSM**, keys are funded in two phases. The queue above allocates the initial 32 ETH deposit that activates each validator, and validators are then topped up toward the 2,048 ETH maximum through a separate top-up queue. Top-ups depend on the module's stake share limit and overall deposit demand, so a validator may never reach the full 2,048 ETH, and both phases can take longer than a standard 32 ETH deposit.

## Upload keys

:::warning
Your deposit data must use the withdrawal credential type of the module you are joining, `0x01` for 0x01 CSM or `0x02` for 0x02 CSM. See [Generating Validator Keys](/run-on-lido/csm/generating-validator-keys/) before you upload.
:::

* Go to the Lido CSM Widget and connect your wallet. **MAKE SURE THAT YOU ARE ON THE CORRECT NETWORK (i.e., Mainnet or Hoodi).**
  * **Mainnet:** [https://csm.lido.fi/](https://csm.lido.fi/)
  * **Hoodi:** [https://csm.testnet.fi/](https://csm.testnet.fi/)
* Select `Become a Node Operator` and then `Create a Node Operator`. If you don't have an operator yet, you first [choose your operator type](/run-on-lido/csm/context-and-background#operator-profiles-and-economics), which determines the module you join and the bond you post.
* On the Lido CSM Widget, upload your `deposit data file` and select the corresponding bond type (ETH, stETH, or wstETH), and provide the desired bond amount. Learn more about [bond requirements](https://operatorportal.lido.fi/modules/community-staking-module#block-2d1c307d95fc4f8ab7c32b7584f795cf).

![Upload keys](/img/csm-guide/keys-2.png)

<Tabs>
  <TabItem value="copy-paste" label="Copy & Paste">
  
Print the contents of the `deposit_data.json` file on your node machine, then copy & paste the contents into the CSM Widget directly.

* Identify the actual file name of your `deposit_data.json` file on your node:

```sh
find ~ -name "*deposit_data*" 2>/dev/null
```
The output will be a file path to your deposit data. 

* **Print the contents:**

```sh
cat <FILEPATH_TO_DEPOSIT_DATA>
# replace with the actual file path
```

  </TabItem>
  <TabItem value="upload-file" label="Upload File">
  
Transfer the `deposit_data-<timestamp>.json` file from the USB used in the validator key generation step onto your working device (e.g., laptop with MetaMask), then upload the file.

  </TabItem>
</Tabs>

* Finally, select `Submit`, sign the transaction with your connected wallet, and you are all set.
* Now you just need to wait for the Lido CSM to deposit your validator keys (using your `deposit data file`). This is a first-in, first-out process so expect a queue when demand is high. More details on this process [here](https://operatorportal.lido.fi/modules/community-staking-module#block-25614a13674b465f875db871081091f9).

:::warning
**DO NOT DEPOSIT 32 ETH** using the deposit data file generated this way, as the Lido CSM will make a deposit for you.

  _**Doing so will result in a loss of funds.**_
:::

## Remove keys

The Node Operator can delete uploaded keys voluntarily (e.g., duplicate keys) if it has not been deposited yet. 

A fee is confiscated from the Node Operator's bond on each deleted key to cover maximal possible operational costs associated with the queue processing. Keys (via the deposit data file) can be deleted in continuous batches (e.g., from index 5 to 10).

More details [here](https://operatorportal.lido.fi/modules/community-staking-module#block-051fceb673504a489e541e3615984084).

* Go to the Lido CSM Widget, under the **KEYS** header
* Select the **DELETE** tab on the widget
* Press the **Remove** button
* Select the keys you want to remove

![Remove keys](/img/csm-guide/keys-3.png)

Once your keys have been removed, the associated bond amounts that you deposited earlier will be available for claiming under the **Bond & Rewards** tab. You can learn more at the [Rewards & Bonds page of this guide](/run-on-lido/csm/lido-csm-widget/rewards-and-bonds).

:::warning
Keys that have been deposited cannot be removed and can only be manually exited from the Consensus Layer or ejected via triggerable withdrawal requests to the protocol.
:::

## Eject keys

CSM now supports ejecting validators via Execution Layer Triggerable Withdrawals (which requires an ejection fee).

However, this is not the standard exit flow. This method should be used only as a last resort, such as when you have lost access to your validator keys.

* Go to the Lido CSM Widget, under the **KEYS** header
* Select the **DELETE** tab on the widget
* Press the **Eject** button
* Select the keys you want to eject

![Eject keys](/img/csm-guide/keys-5.png)

Once the validators are fully exited, you can claim your locked bond.

## View keys

You can also view the status of the keys pertaining to your uploaded deposit data file and take the necessary actions.

![View keys](/img/csm-guide/keys-4.png)

:::info
In 0x02 CSM, a key shown as **Active** may still be receiving top-ups toward its 2,048 ETH maximum.
:::

| Status | What it means | What to do? |
| --- | --- | --- |
| <span style={{color: 'orange'}}><strong>Unchecked</strong></span> | Key has been uploaded but not yet validated by the protocol | Wait for validation. If an earlier key is Invalid, remove it so the rest can be checked |
| **Depositable** | Key is valid and bond is sufficient. Pending deposit from Lido Protocol | Maintain sufficient bond amounts |
| <span style={{color: 'orange'}}><strong>Non queued</strong></span> | Key is depositable but does not currently hold a place in the deposit queue | No action needed, the key is queued again automatically |
| **Activation pending** | Key has been deposited and is awaiting activation on the [beacon chain] | Make sure your validator node is online and ready to perform duties |
| <span style={{color: 'green'}}><strong>Active</strong></span> | Key is active on the [beacon chain] | Make sure your validator node is online to perform its duties |
| **Withdrawn** | Key has been exited and ETH has been returned to the protocol | Claim your bond and rewards under **Bond & Rewards** |
| <span style={{color: 'orange'}}><strong>Unbonded</strong></span> | Bond is insufficient for this key, which can be Active or otherwise | - Active key: Top up bond or exit key<br />- Non-active key: Top up bond or do nothing |
| <span style={{color: 'orange'}}><strong>Strikes</strong></span> | The key has accumulated strikes for performing below the threshold | Improve performance. Enough strikes can lead to ejection and a penalty |
| <span style={{color: 'red'}}><strong>Slashed</strong></span> | The validator has been slashed on the [beacon chain] | Review your setup to prevent further slashings. See [Slashing Prevention](/run-on-lido/csm/best-practices/slashing-prevention) |
| <span style={{color: 'red'}}><strong>Duplicated</strong></span> | Key has been uploaded twice | Remove duplicate key |
| <span style={{color: 'red'}}><strong>Invalid</strong></span> | Uploaded key has an invalid signature | Remove key |

[beacon chain]: https://beaconcha.in/
