# CSM + DVT with SSV

**SSV Network** implements Distributed Validator Technology (DVT) by splitting a validator key into encrypted shares and distributing them across independent operators. This reduces single-operator risk, improves resilience, and strengthens decentralization. Great for home stakers who want to operate collaboratively.

#### Why Lido CSM + SSV?
- **Resilience**: Validators keep operating if one or more operators go offline.  
- **Security**: No single operator holds the full key; compromising the validator requires multiple shares.

## Preparation

:::info
SSV clusters can be formed with as few as **4 operators**, but we recommend **7 operators** as it's the minimum configuration to tolerate two malicious nodes.
:::

Before creating your SSV cluster:

1. **Appoint a coordinator** to drive the process.  
2. **Decide your operator economics** for each member’s operator:
   - **Exclusive for this cluster**: set the **operator fee to 0 $SSV** and **whitelist the cluster multisig address** so only your cluster can use the operator.
   - **Open mode**: allow others to use your operator and set a **fair SSV fee** that can be covered by your CSM operations. Ideally, **use CSM operator rewards to pay SSV fees** so your operators keep running sustainably.
3. Create a Safe multi-sig wallet (`4/7` or `5/7` threshold recommended) → [safe.global](https://safe.global/).  
4. Create a Splitter contract for rewards distribution → [splits.org](https://splits.org/).  
5. Decide how many validator keys to run based on available **ETH bond** for Lido CSM.  
6. You’ll still need **full Ethereum node connectivity** (EL+CL) and **MEV-Boost with Lido-vetted relays** as required by Lido CSM. See [Node Setup](/run-on-lido/csm/node-setup/).

---

## 1. Preparing Your Environment
SSV provides a Node Stack using Docker for easy installation and configuration of your SSV node. Please note you need to run your own execution and consensus clients, you can see how to do so in the [node setup section](/run-on-lido/csm/node-setup/).

1. Clone the SSV Stack repository and set up the environment:
```
git clone https://github.com/ssvlabs/ssv-stack.git
cd ssv-stack
cp ssv.example.env ssv.env
```

2. Configure your node:
Open `ssv.env` using:
```
nano ssv.env
```
Then edit:
- `BEACON_NODE_ADDR`: the HTTP address of the Beacon API
- `ETH_1_ADDR`: the WebSocket address of the Execution client
- `NETWORK`: the network you are running (`mainnet` or `hoodi`)

---

## 2. Starting the operator and get the Public Key
To start your node use the following command
```
docker compose up
```

Or you can start it in the background, so there won't be logs in your CLI

```
docker compose up -d
```

At the top of the logs you'll find the **Public Key** of the SSV operator. 
![Public Key](/img/csm-guide/ssv-1.png)
```
LS0tLS1CRUdJTiBSU0EgUFVCTElDIEtFWS0tLS0tCk1JSUJJakFOQmdrcWhraUc5dzBCQVFFRkFBT0NBUThBTUlJQkNnS0NBUUVBeEwzRTVuMjA2VkxVZk91dXlNUFIKZFdyd3o5VVFSMmlNSDNZSC9qWVRBamdHcnhySThaM2plU3JwTENFNmVqeVJuOFc1dW1tTUJxWEpiTzNLakpOQwprN3RVS0E5b1owaU95cUdhVEsxay84aldlcW5RcUZaNFdWM2lWUXBVbFBhVWRmMlJoWDJoa1FOSkZwQVc3V3RXCmhEM2NHK1E2TjVZc0VHQTQ5dkp3VFdtMjBRYXhHVUNQRUJtMFFHZzBNZGZLa0JKa2M1Nk1renAyN1pZMmRaQkwKeFYycFRkSkhzam1FZlBvTWIreUw1TkhxaW55RVA3eU5ERGJYL1JIUlA0QzJlWkxuQjQ3cmJTUzhkOHlPdzYxQgpaZ2NHeXkvUUU4QlNHYW9ET3JLV3krQXdWclBQdGtjU1lXblJoL2JoU01lbjZzSldRc2F6M1l6Z2w0RDZnOVV6CitRSURBUUFCCi0tLS0tRU5EIFJTQSBQVUJMSUMgS0VZLS0tLS0K
```

It will also generate a random `password` and encrypted `private_key` files on the first run. They will be stored under the `~/ssv-stack/ssv-node-data` directory. **Make sure to back them up**.

---
## 3. Register the Operator
To register your Operator in the SSV network, open [app.ssv.network](https://app.ssv.network/) and connect the wallet you will use to manage your Operator (not the cluster multisig). Then proceed to:
1. Select **Join as operator** and then **Register operator**
2. Input the Public Key from the previous step
3. Set a fee (remember if private cluster to 0, or if want to go public put a number that make sense. There's rules about updating the fees later that you can find [**here**](https://docs.ssv.network/operators/operator-management/updating-operator-fees/))
4. Review the information in the screen. If everything looks good go ahead, click **Register Transaction** and wait for the transaction to be completed.

At the end you will see a confirmation screen including an **Operator ID**. Note it down and share it with the cluster coordinator.
![Confirming the Operator Registration](/img/csm-guide/ssv-2.png)

---
## 4. Enable the DKG tool
With the DKG tool operators will be able to participate in ceremonies to generate distributed validator keys. To start the DKG node:

Open the DKG operator file

```
nano ./dkg-data/operator.yaml
```

Edit the following:
- `operatorID: <YOUR_OPERATOR_ID>`
- `ethEndpointURL: <HTTP_ADDRESS_OF_EXECUTION_CLIENT>`

Then start the service
```
docker compose --profile dkg up -d
```

To complete the DKG setup make sure to open the port `3030` and edit your operator metadata with the DKG endpoint as shown [here](https://docs.ssv.network/operators/operator-management/setting-operator-metadata).

---
## 5. Create the Cluster Management Contracts

### Multi-sig Wallet
Create a Safe multi-sig with all stakeholders as signers:
- **Hoodi Testnet Safe**: [app.safe.protofire.io/welcome](https://app.safe.protofire.io/welcome)  
- **Mainnet Safe**: [app.safe.global](https://app.safe.global)  
Threshold: **4/7** or **5/7** recommended.

### Splitter Contract
Deploy a **Splitter** via [app.splits.org](https://app.splits.org) with all operator reward addresses.
- Prefer **immutable** configuration.
- Share the contract address with all members.

---
## 6. Set up a Cluster and Distribute Validators
Once all the members have registered their operators and activated DKG we can proceed to form the cluster

1. Go to [**app.ssv.network**](https://app.ssv.network/) and connect the **multisig** wallet.
2. In the WebApp, click on **Distribute Validator** and then select **Generate new keyshares**.
3. The next screen will show you all the operators in the SSV network, select those who will be part of your cluster.
4. You will be asked how you want to generate the keyshares. Select **Offline**, then input how many validators you want to generate (e.g., 5) and the Lido Withdrawal Vault address (`0xB9D7934878B5FB9610B3fE8A5e441e8fad7E293f` for Mainnet or `0x4473dCDDbf77679A643BdB654dbd86D67F8d32f2` for the Hoodi testnet).
5. The previous step will give you a command, running it will create a folder with multiple folders inside and `deposit_data.json`, `keyshares.json` and `proofs.json` files.
6. Click on **Register Validators** and drag-and-drop the `keyshares.json` file. Please note that you won't be able to register more than 40 validators at the same.
7. Then you will be asked to provide SSV tokens to cover the fees (from both the operators and the protocol) for running the cluster. The purchase of these tokens should be agreed upon the operators.
8. Review the information and disclaimers in the following pages, then submit the transaction to register the validators.

---

## 9. Upload Keys to Lido CSM

To use your SSV validator(s) with Lido CSM:

1. **Create a Node Operator** in the Lido CSM Widget using **Extended Mode** (as described [here](/run-on-lido/csm/lido-csm-widget/operator-roles#extended-mode)).  
   - **Manager Address** → your **Safe** multi-sig  
   - **Rewards Address** → your **Splitter** contract
2. **Upload `deposit_data.json`** for the validators and provide the required **bond** as described [in this section of the guide](/run-on-lido/csm/lido-csm-widget/upload-remove-view-validator-keys#upload-keys).

---

## 10. Exiting Validators

You can exit validators directly in the **SSV App**:

1. Go to [**app.ssv.network**](https://app.ssv.network/), **sign in with the cluster multi-sig** and open the cluster page.  
2. Go to **Actions → Exit validators**.  
![Exit Validators](/img/csm-guide/ssv-3.png)
3. Select the validators you want to exit and confirm.