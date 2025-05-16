---
sidebar_position: 0
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 📥 Upload/Remove/View validator keys

## Deposit queue

:::info
We encourage operators to see the queue before submitting new keys, as they may have to wait some time to get deposits and there's a fee of `0.05 ETH` for removing keys while in the queue.
:::

The way validators are deposited in the CSM is through a FIFO (first in, first out) queue. You can see a visual representation of the queue under the deposit widget, or at the top of the "View Keys" tab.

![Deposit queue](/img/csm-guide/keys-1.png)

## Upload keys

* Go to the Lido CSM Widget and connect your wallet. **MAKE SURE THAT YOU ARE ON THE CORRECT NETWORK (i.e., Holesky or Mainnet).**
  * **Mainnet:** [https://csm.lido.fi/](https://csm.lido.fi/)
  * **Hoodi:** [https://csm.testnet.fi/](https://csm.testnet.fi/)
* Select `Become a Node Operator` and then `Create a Node Operator`
* On the Lido CSM Widget, upload your `deposit data file` and select the corresponding bond type (ETH, stETH, wstETH), and provide the desired bond amount

![Upload keys](/img/csm-guide/keys-2.png)

<Tabs>
  <TabItem value="copy-paste" label="Copy & Paste">
  
Print the contents of the `deposit_data.json` file on your node machine, then copy & paste the contents into the CSM Widget directly.

* Identify the actual file name of your `deposit_data.json` file on your node:

```sh
ls ~/validator_keys
```

* **Print the contents:**

```sh
sudo cat ~/validator_keys/deposit_data-<timestamp>.json
# replace <timestamp> with the actual numbers in your file name
```

  </TabItem>
  <TabItem value="upload-file" label="Upload File">
  
Transfer the `deposit_data-<timestamp>.json` file from the USB used in the validator key generation step onto your working device (e.g., laptop with MetaMask), then upload the file.

  </TabItem>
</Tabs>

* Finally, select `Submit`, sign the transaction with your connected wallet, and you are all set.
* Now you just need to wait for the Lido CSM to deposit your validator keys (using your `deposit data file`). This is a first-in, first-out process so expect a queue when demand is high. More details on this process [here](https://operatorportal.lido.fi/modules/community-staking-module#block-25614a13674b465f875db871081091f9).

:::info
**DO NOT DEPOSIT 32 ETH** using the deposit data file generated this way as the Lido CSM will make the deposit for you. _**Doing so will result in a loss of funds.**_
:::

## Remove keys

The Node Operator can delete uploaded keys voluntarily (e.g., duplicate keys) if it has not been deposited yet. 

A fee is confiscated from the Node Operator's bond on each deleted key to cover maximal possible operational costs associated with the queue processing. Keys (via the deposit data file) can be deleted in continuous batches (e.g., from index 5 to 10).

More details [here](https://operatorportal.lido.fi/modules/community-staking-module#block-051fceb673504a489e541e3615984084).

* Go to the Lido CSM Widget, under the **KEYS** header
* Select the **REMOVE** tab on the widget
* Select the keys you want to remove—

![Remove keys](/img/csm-guide/keys-3.png)

Once your keys have been removed, the associated bond amounts that you deposited earlier will be available for claiming under the **Bond & Rewards** tab.

![Post-remove status](/img/csm-guide/keys-4.png)

:::warning
Keys that have been deposited cannot be deleted and only can be exited.
:::

## View keys

You can also view the status of the keys pertaining to your uploaded deposit data file and take the necessary actions.

![View keys](/img/csm-guide/keys-5.png)

| Status                                                                 | What it means                                                                                 | What to do?                                                                                      |
| ---------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| <span style={{color: 'green'}}><strong>Active</strong></span>            | Key has been deposited & is either pending activation or active on the [beacon chain].        | Make sure your validator node is online to perform its duties                                    |
| **Depositable**                                                        | Key is valid and bond is sufficient. Pending deposit from Lido Protocol                       | Maintain sufficient bond amounts                                                                 |
| **Exited**                                                             | Key has been exited                                                                           | None                                                                                             |
| <span style={{color: 'orange'}}><strong>Unbonded</strong></span>         | Bond is insufficient for this key, which can be Active or otherwise                           | - Active key: Top up bond or exit key<br />- Non-active key: Top up bond or do nothing             |
| <span style={{color: 'red'}}><strong>Duplicated</strong></span>          | Key has been uploaded twice                                                                   | Remove duplicate key                                                                             |
| <span style={{color: 'red'}}><strong>Invalid</strong></span>             | Uploaded key has an invalid signature                                                         | Remove key                                                                                       |
| <span style={{color: 'red'}}><strong>Stuck</strong></span>               | Exit request for Active Key was not fulfilled within 96 hours                                 | Exit key                                                                                        |

[beacon chain]: https://holesky.beaconcha.in/