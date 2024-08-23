
# How to Vote, Override, Delegate with Etherscan

This guide will walk you through how to vote, override your delegate's vote, and delegate your voting power using Etherscan. If the [Voting UI](https://vote.lido.fi/) is unavailable or you prefer to vote via Etherscan, follow these simple steps.

## Getting Started

Obtain the address of the Lido DAO `Aragon Voting` contract from the [Deployed Contracts](https://docs.lido.fi/deployed-contracts/#dao-contracts) page. Currently, it is [0xf165148978Fa3cE74d76043f833463c340CFB704](https://etherscan.io/address/0xf165148978Fa3cE74d76043f833463c340CFB704). Open this contract on Etherscan.

## Voting

### Step 1: Find the Voting ID

- Go to the **Read as Proxy** tab of the Aragon Voting contract.
- Locate the `votesLength` method (number 29) to get the current vote ID.

![](/img/etherscan-voting/vote_ID_1.png)

The number you see here is the ID of the current vote. For example, if it shows 110, that's the current vote ID.

### Step 2: Review the Proposal

- Use the `getVote` method (number 9) to review the proposal. Note that to understand the proposed changes, you will need to decode the bytecode into readable scripts.

![](/img/etherscan-voting/getVote_2.png)

### Step 3: Cast Your Vote

- Navigate to the **Write as Proxy** tab.
- Click **Connect to Web3** and connect the address where you hold LDO tokens. The indicator should turn green.

![](/img/etherscan-voting/web3_connect_3.png)

- Use the `vote` method (number 13).

![](/img/etherscan-voting/vote_4.png)

- Fill in the parameters `_voteId`, `_supports`, and `_executesIfDecided` and send the transaction:
    - `_voteId` is the vote ID from Step 1.
    - `_supports` indicates whether you support (`true`) or oppose (`false`) the vote.
    - `_executesIfDecided` should be set to `false`.

### Step 4: Sign the Transaction

Sign the transaction to cast your vote. That's it! 🎉

## Overriding

### Step 1: Check Delegate's Vote

- Go to the **Read as Proxy** tab of the Aragon Voting contract.
- Use the `getVoterState` method (number 7).

![](/img/etherscan-voting/getVoterState_5.png)

Enter the vote ID and your address to see how your delegate voted. 

### Step 2: Vote Yourself

If you disagree with the delegate's choice and wish to vote yourself, follow the steps in the **Voting Steps** section.

## Delegating Through Etherscan

### Assign a Delegate

1. Open the Aragon Voting contract.
2. Go to the **Write as Proxy** tab.
3. Use the `assignDelegate` method (number 1).
4. Click **Connect to Web3** and connect your address. The indicator should turn green.
5. Enter your delegate's address and submit the transaction.

That's it! Your delegate is assigned.

### Remove a Delegate

1. Go to the **Write as Proxy** tab.
2. Use the `unassignDelegate` method (number 2).
3. Click **Connect to Web3** and connect your address. The indicator should turn green.
4. Click **Write** without entering anything and sign the transaction.

That's it! Your delegate has been removed.
