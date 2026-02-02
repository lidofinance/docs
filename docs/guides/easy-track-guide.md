# Guide to Easy Track

This guide provides information about Easy Track, voting rules, use cases, step-by-step instructions and helpful tips for initiating new motions.

This guide is intended for those who use Easy Track to initiate new motions, including committee members, node operators, and others with the ability to execute their governance functions through Easy Track.

The guide consists of two sections: [General overview](#general-overview) and [Operations HOWTO](#operations-howto). If you’re here for the technical details of interacting with Easy Track, please skip to the latter.

## General overview

### What is Easy Track Motion?

Easy Track motion is a lightweight voting process considered to have passed if the minimum objections threshold hasn't been reached. In contrast to regular Aragon voting, Easy Track motions are more cost-effective (as token holders only need to vote 'contra' if they have objections, rather than voting 'pro') and easier to manage (eliminating the need for broad DAO community voting on proposals that do not spark significant debate).
To enact an Easy Track motion, the minimum objections threshold must not be reached within 72 hours after the motion has been initiated. The threshold requires support from at least 0.5% of the total LDO supply to reject the motion.

To prevent motion spam, only up to 20 active motions can exist simultaneously.

### Motivation behind Easy Track

Initially, the Lido DAO governance used to rely on Aragon voting model. The DAO approved or rejected proposals by direct governance token voting. Though transparent and reliable, it is not a convenient way to make decisions only affecting small groups of Lido DAO members. Besides, direct token voting didn’t exactly reflect all the decision-making processes within the Lido DAO and was often used only to adopt an existing consensus. Votings on such decisions often struggled to attract wider DAO attention and thus, to pass.
Easy Track has been developed as a solution to the problem of the DAO getting tired of governance.

### Easy Track use cases

The main types of votes periodically initiated by the Lido DAO via Easy Track motions are listed below:

- the Lido Node Operator increases its staking limit within the Lido protocol;
- the Simple DVT Module Committee member manages clusters, including adding new clusters, activating or deactivating existing ones, setting cluster key limits, and updating cluster manager and reward addresses;
- the Community Staking Module (CSM) Committee member updates penalties for MEV stealing;
- the Lido Ecosystem Grants Organisation (LEGO) member requests fund allocations to the LEGO program;
- the Lido Liquidity Observation Lab (LOL) member requests fund allocations to ongoing reward programs or adjusts the list of active reward programs;
- the Rewards Share Program Committee member requests fund allocations to the program or updates the participant whitelist;
- the Resourcing and Compensation Committee (RCC), Pool Maintenance Labs Ltd. (PML), or Argo Technology Consulting Ltd. (ATC) member requests grants for further allocation following their respective policies;
- the TRP Multisig Committee member requests funding for TRP-related payments;
- the Gas Rebates Multisig member requests funding to cover gas compensation expenses;
- the Treasury Management Committee member requests tokens for swaps executed via Stonks orders.

### Possible motion outcomes

A motion can have three possible outcomes:

1. **Motion passed.**
   In case the minimum objections threshold of 0.5% of the total LDO supply hasn't been reached, the motion is considered to have passed, and it can be enacted. This operation is permissionless, which means anyone can enact a passed motion. Please note, that it is still possible to object a non-enacted motion even after 72 hours of timelock. The enacted motion will be automatically de-activated and put to the motion archive available under the 'Archive motions' section of Easy Track UI.
2. **Motion rejected.**
   In case the minimum objections threshold of 0.5% of the total LDO supply has been reached, the motion is considered rejected. It will be automatically de-activated and put to the motion archive available under the 'Archive motions' section of Easy Track UI.
3. **Motion canceled.**
   In case you find out you have made a mistake when starting the motion, you can cancel the motion at any moment before it has been enacted. To do so, click on the motion to see the detailed motion view and press the 'Cancel' motion button top right. Please note, that this is on-chain action, and you will have to sign a transaction to complete it (gas costs apply).

### Links

You can read more about Easy Track functionality in the [LIP-3](https://github.com/lidofinance/lido-improvement-proposals/blob/develop/LIPS/lip-3.md).
For more in-depth technical description, please read through the full project [specification](https://github.com/lidofinance/easy-track/blob/master/specification.md).

## Operations HOWTO

- [Basic guide to Easy Track](#basic-guide-to-easy-track)
- [Node Operators guide to Easy Track](#node-operators-guide-to-easy-track)
- [LEGO guide to Easy Track](#lego-guide-to-easy-track)
- [Liquidity Observation Lab guide to Easy Track](#liquidity-observation-lab-guide-to-easy-track)

### Basic guide to Easy Track

#### Starting a new Easy Track motion

To create a new Easy Track motion, follow these steps:

1. proceed to the [Easy Track UI](https://easytrack.lido.fi);
2. click the ‘Connect' button top right;
3. make sure the checkbox next to 'Terms of Use' and 'Privacy Notice' is selected;
4. select the app you want to use to connect your wallet, make sure to use an address with permission to launch motions;
5. in the header menu of Easy Track UI click the ‘Start motion' button (you will see the motion creation interface);
6. select the type of motion you want to launch;
7. fill out the form, make sure to complete all required fields;
8. press the ‘Submit' button below the form and sign the transaction (gas costs apply);
9. if a multisig was used to create the motion, another multisig owner must now confirm the transaction in Safe.

As soon as the transaction is confirmed, the motion is started, and you can see it on the 'Active motions' page of Easy Track UI.
Notifications will be sent to inform the DAO about the motion.
From this moment on, the LDO token holders will have 72 hours to submit their objections if they have any.

Please note that the motion duration may be different for testnet deployment.

#### Using a multisig wallet to create a motion

If you want to use a multisig to create a motion, follow these steps to connect the wallet:

1. pick the 'Wallet Connect' option;
2. copy the QR code by clicking the 'Copy to clipboard' button under the code;
3. proceed to the [Safe](https://safe.global/), connect your wallet by clicking 'Connect your wallet' button top right;
4. open the 'Apps' section in the drawer menu on the left and find the Wallet Connect Safe app in the list;
5. paste the code into the field on the left.

Now the multisig is connected to the Easy Track app. You must keep the Wallet Connect Safe app tab open in your browser for transactions to pop up. You will not receive transaction requests if you don't have it open.

#### Checking the motion details from Safe Multisig UI

When a motion start transaction is created by one of the multisig signers, the remaining signers should review the addresses and transaction data before signing.

To verify the transaction, follow these steps:

1. Check the address the tx is being sent to — it should be `Easy Track` contract listed on the [Deployed Contracts page](/deployed-contracts/#easy-track).
2. Check the params of the `createMotion` call:
   1. to check `_evmScriptFactory` address use [Deployed Contracts page](/deployed-contracts/#easy-track) — the address should be listed on this page & match the type of motion is about to be started.
   2. to check `_evmScriptCallData` bytes string open the `_evmScriptFactory` contract on the etherscan & call the `decodeEVMScriptCallData` with the string from the Safe UI to see the motion params.

### Node Operators guide to Easy Track

**Motion type:**

- To initiate a new motion, select **Increase Node Operator Staking Limit** as the motion type.

**How to complete the form for a new motion:**

- Use your Node Operator ID, which can be found in the Node Operators Dashboard on [holešky](https://operators-holesky.testnet.fi/) or [mainnet](https://operators.lido.fi/) (it is the number displayed to the right of your node operator name with the # prefix).
- Enter the desired staking limit in the ‘New Limit’ field.

**Other key considerations:**

1. **Node operators can only increase staking limits for themselves.** Before initiating a motion, ensure that you have access to the address associated with the correct node operator in the Lido Node Operators Registry. You can find the correct address in the Node Operators Dashboard on [holešky](https://operators-holesky.testnet.fi/) or [mainnet](https://operators.lido.fi/)).
2. **A single motion can only address the staking limit of a single node operator.** It is not possible to increase limits for multiple node operators in one motion.
3. **The total amount of a node operator's signing keys must be greater than or equal to the new staking limit.** Make sure you have submitted enough valid signing keys before starting a motion.

### LEGO guide to Easy Track

**Motion type:**

- To initiate a new motion, select **Top up LEGO** as the motion type.

**How to complete the form for a new motion:**

- Pick the token and specify the amount of tokens you want to top up the LEGO program with.
- You can add multiple token allocations into a single motion by clicking 'One more token' below the form.

**Other key considerations:**

1. **Only a LEGO committee member can start a motion to allocate funds to LEGO program.** Before starting a motion, please make sure you have access to [the LEGO Committee multisig](https://app.safe.global/settings/setup?safe=eth:0x12a43b049A7D330cB8aEAB5113032D18AE9a9030).
2. **LEGO Easy Track motions support fund allocation in one or multiple of the following tokens: DAI, USDC, USDT and LDO.**

### Liquidity Observation Lab guide to Easy Track

**Motion type:**

- To initiate a new motion, select **Add stETH reward program**, **Remove stETH reward program** or **Top up stETH reward program** as the motion type.

**How to complete the form for a new motion:**

- When adding a new program, the title should be a human-readable description of the reward program (e.g. 'Curve ETH:stETH LP incentives').
- Fill the Ethereum address of the reward program (it could be reward contract or reward manager contract depending on the specific program) in the 'Address' field.
- When creating a motion to remove a reward program from the list or to top up a previously added program, you will be able to pick a program by the program title, rather than pasting Ethereum address. UI for topping up the rewards program takes full tokens as an input (so, the amounts are in X LDOs, not X\*1e18 LDO Weis).

**Other key considerations:**

1. **Only a Lido Liquidity Observation Lab member can start a motion to allocate funds to reward programs.** Before starting a motion, please make sure you have access to [the Liquidity Observation Lab multisig](https://app.safe.global/settings/setup?safe=eth:0x87D93d9B2C672bf9c9642d853a8682546a5012B5).
2. **Liquidity Observation Lab Easy Track motions support fund allocation in stETH only.**
3. **Easy Track supports topping up multiple reward programs in a single motion.** Though be careful, lack of consensus on one reward program will prevent the whole motion from passing.
4. **To top up a reward program via Easy Track motion, it should first be added into the list of active reward programs.** This action requires a separate Easy Track motion to complete.
5. **When no longer active, reward program should be removed from the list of active reward programs.** This action requires a separate Easy Track motion to complete.
