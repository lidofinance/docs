# CSM + DVT with Obol

**Obol** is an implementation of Distributed Validator Technology (DVT) that allows multiple operators to collaboratively run a validator as a cluster. This improves security, resilience, and decentralization, making it an ideal choice for home stakers who want to run validators as part of a group.  

#### Why Lido CSM + Obol?
- **Resilience**: Multiple operators share validator keys; some can go offline without penalties.  
- **Security**: An attacker needs multiple shards to compromise a cluster (vs 1 key in solo staking).  
- **Extra benefits**: [Obol credentials](https://docs.obol.org/community-and-governance/community/techne) proving proficiency as a validator operator.  

### Video Guide
<iframe width="800" height="450" src="https://www.youtube.com/embed/RfHn4k3HdV0?si=bPLrOLwGfdtrrSOL" title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />

## Preparation

:::info
Obol clusters can be formed with as few as **4 operators**, but we recommend **7 operators** as it's the minimum configuration to tolerate two malicious nodes.
:::

Before creating a cluster:  

1. **Appoint a cluster leader** to coordinate setup.  
2. Collect wallet addresses of all cluster members.  
3. Create a Safe multi-sig wallet (`4/7` or `5/7` threshold) → [safe.global](https://safe.global/).  
4. Create a Splitter contract with all members → [splits.org](https://splits.org/).  
5. Each operator generates an Obol Ethereum Node Record (**ENR**) and backs it up securely.  
6. Decide how many validator keys to run based on available **ETH bond** for Lido CSM.  
7. Each operator also needs a **full Ethereum node** and **MEV-Boost** configured with Lido-vetted relays. Please refer to [Node Setup](/run-on-lido/csm/node-setup/) to learn how.

## 1. Preparing Your Environment
Obol's client is named Charon, we will need this to use this to distribute keys and perform the actions as a group.

In this guide we will use a multi-container Docker setup that includes execution client, consensus client, MEV-Boost and the Charon client. Steps to use Obol with other integrations (e.g. Dappnode) differs in the installation of Charon, but are largely the same afterwards.

1. Clone the Charon client repository and set up the environment:
```
git clone https://github.com/ObolNetwork/charon-distributed-validator-node.git
cd charon-distributed-validator-node
mkdir .charon
cp .env.sample.hoodi .env
```

2. Ensure your user has Docker privileges:
```
sudo usermod -a -G docker $USER
```
After adding your user to the `docker` group, log out of your SSH session and reconnect.

## 2. Generate Ethereum Node Records (ENR)
Each operator needs an ENR to identify themselves in the cluster, to generate use the following command:
```
docker compose run --rm charon create enr
```
Back up the ENR securely. It will be required during cluster setup.

![ENR generation](/img/csm-guide/obol-1.png)

## 3. Set up Cluster Management Contracts
### Multi-sig Wallet
Create a Safe multi-sig wallet with all operators as signers:
- Hoodi Testnet Safe: [app.safe.protofire.io/welcome](https://app.safe.protofire.io/welcome)
- Mainnet Safe: [app.safe.global](https://app.safe.global)
Set a signing threshold of 4/7 or 5/7.

### Splitter Contract
Use [app.splits.org](https://app.splits.org) to deploy a Splitter contract with all operator reward addresses.
- Select immutable option (recommended).
- Share the deployed contract address with all members.

## 4. Create a Cluster via Obol Launchpad
1. Cluster leader opens the Launchpad:
- Mainnet: [launchpad.obol.org](https://launchpad.obol.org)
- Hoodi Testnet: [hoodi.launchpad.obol.org](https://hoodi.launchpad.obol.org)

2. Select Create Cluster, review and accept advisories, and sign confirmations.
3. Configure:
    - Cluster name & size
    - Signer addresses of all members
    - Number of validators
    - Select Lido CSM tab, this will automatically set the Withdrawal and Fee Recipient to Lido's contracts.
![Lido CSM configuration](/img/csm-guide/obol-2.png)

4. Share the cluster configuration link with all members.

## 5. Distributed Key Generation (DKG)
1. Each member opens the cluster config link, connects wallet, and verifies details.
2. Submit ENR and confirm configuration.
3. Wait for all members to accept.
4. Once ready, run the CLI command provided.
After completion, you will have:
- `cluster-lock.json` in the `.charon` folder
- `deposit-data.json` for deposits
- `validator_keys/` folder with partial key shares
Back up the `.charon` folder securely. Validator keys cannot be recreated.

![Lido CSM configuration](/img/csm-guide/obol-3.png)

## 6. Configure MEV-Boost
MEV-Boost is **required** for all CSM operators.
1. Edit the `.env` file and change:
```
BUILDER_API_ENABLED=true # This is usually at the top of the .env file
MEVBOOST_RELAYS=<vetted Lido relay URLs> # This is in the MEV-Boost section
```
2. Use only [Lido-vetted relays](https://enchanted-direction-844.notion.site/6d369eb33f664487800b0dedfe32171e)
3. All operators must use the same relay set.

## 7. Start the Node
To start the node run the following command:
```
docker compose up -d
```

Execution & consensus clients will sync. Charon + validator client will wait for activation.

## 8. Upload keys
To upload keys to Lido CSM as an Obol DV cluster, do the following:

1. **Create a Node Operator** in the Lido CSM Widget using **Extended Mode** (as described [here](/run-on-lido/csm/lido-csm-widget/operator-roles#extended-mode)).  
   - **Manager Address** → your **Safe** multi-sig  
   - **Rewards Address** → your **Splitter** contract
2. **Upload `deposit_data.json`** for the validators and provide the required **bond** as described [in this section of the guide](/run-on-lido/csm/lido-csm-widget/upload-remove-view-validator-keys#upload-keys).

## 9. Exit Validators
If you want to exit one or all of the validators in the cluster, the majority of the cluster needs to run the following commands:

**Exit a specific validator**
```
docker exec -it charon-distributed-validator-node-charon-1 /bin/sh -c 'charon exit sign \
--beacon-node-endpoints="http://lighthouse:5052" \
--validator-public-key="<VALIDATOR_PUBLIC_KEY>" \
--exit-epoch=194048'
```

**Exit all validators**
```
docker exec -it charon-distributed-validator-node-charon-1 /bin/sh -c 'charon exit sign \
--beacon-node-endpoints="http://lighthouse:5052" \
--all \
--exit-epoch=194048'
```

Once a validator has broadcasted an exit message, it must continue to validate for at least 27 hours or longer. Do not shut off your distributed validator nodes until your validator is fully exited.