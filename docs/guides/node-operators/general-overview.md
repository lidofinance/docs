# General Overview

Node Operators manage a secure and stable infrastructure for running Beacon validator clients
for the benefit of the protocol. They’re professional staking providers who can ensure the safety
of funds belonging to the protocol users and correctness of validator operations.

The general flow is the following:

1. A Node Operator expresses their interest to the DAO members. Their address gets proposed to the DAO vote for inclusion to the DAO's Node Operator list. Note that the Node Operator address should be supplied to the DAO with zero signing keys limit.

2. The DAO votes for including the Operator to the list of active operators. After successful
   voting for inclusion, the Node Operator becomes active.

3. The Node Operator generates and submits a set of signing public keys and associated signatures
   for future validators that will be managed by the Operator. When generating the signatures, the
   Operator must use withdrawal credentials derived from the withdrawal address supplied by the DAO.

4. The DAO members check the submitted keys for correctness and, if everything’s good, vote for
   approving them. After successful approval, the keys become usable by the protocol.

5. The protocol distributes the pooled ether evenly between all active Node Operators in `32 ether`
   chunks. When it assigns the next deposit to a Node Operator, it takes the first non-used signing
   key, as well as the associated signature, from the Node Operator’s usable set and performs
   a deposit to the official `DepositContract`, submitting the pooled funds. At that time, the Node
   Operator should have the validator already running and configured with the public key being used.

6. From this point, the Node Operator is responsible for keeping the validator associated with
   the signing key operable and well-behaving.

7. The protocol includes Oracles that periodically report the combined Beacon balance of all
   validators launched by the protocol. When the balance increases as a result of Beacon chain
   rewards, a fee is taken from the amount of rewards (see below for the details on how the fee
   is denominated) and distributed between active Node Operators.

8. As withdrawals are requested, protocol publishes exit requests and Node Operators exit requested validators.

## The fee

The fee is taken as a percentage from Beacon chain rewards at the moment the Oracles report
those rewards. Oracles do that once in a while — the exact period is decided by the DAO members
via the voting process.

The total fee percentage, as well as the percentage that goes to all Node Operators, is also decided
by the DAO voting and can be changed during the lifetime of the DAO. The Node Operators’ part of the
fee is distributed between the active Node Operators proportionally to the number of validators that
each Node Operator runs.

> For example, if Oracles report that the protocol has received 10 ether as a reward, the fee
> percentage that goes to Operators is `10%`, and there are two active Node Operators, running
> `2` and `8` validators, respectively, then the first operator will receive `0.2` stETH, the
> second — `0.8` stETH.

The fee is nominated in stETH, a liquid version of staked ETH introduced by the Lido protocol. The
tokens correspond 1:1 to the ether that the token holder would be able get by burning their stETH
if transfers were already enabled in the Beacon chain. At any time point, the total amount of stETH
tokens is equal to the total amount of ether controlled by the protocol on both Execution Layer and Consensus Layer sides.

When a user submits ether to the pool, they get the same amount of freshly-minted stETH tokens.
When reward is received on the Consensus Layer side, each stETH holder’s balance increases by the same
percentage that the total amount of protocol-controlled ether has increased, corrected for the
protocol fee which is taken by [minting new stETH tokens] to the fee recipients.

> For example, if the reward has increased the total amount of protocol-controlled ether by `10%`,
> and the total protocol fee percentage is `10%`, then each token holder’s balance will grow by
> approximately `9.09%`, and `10%` of the reward will be forwarded to the treasury, insurance fund
> and Node Operators.

One side effect of this is that you, as a Node Operator, will continue receiving the percentage
of protocol rewards even after you stop actively validating, if you chose to hold stETH received
as a fee.

[minting new steth tokens]: https://github.com/lidofinance/lido-dao/blob/971ac8f/contracts/0.4.24/Lido.sol#L576

## Expressing interest to the DAO holders

To include a Node Operator to the protocol, DAO holders must perform a voting. A Node Operator
is defined by an address that is used for two purposes:

1. The protocol pays the fee by minting stETH tokens to this address.
2. The Node Operator uses this address for submitting signing keys to be used by the protocol.

Pass this address to the DAO holders along with the other relevant information.

## Validator Exits Policy, Penalties, and Recovering

According to the [Lido on Ethereum Validator Exits Policy](https://github.com/lidofinance/documents-and-policies/blob/7595317b8fd2ee60ab25f5cac8eac2cc2cafa149/Lido%20on%20Ethereum%20-%20Validator%20Exits%20Policy.md) document, a Node Operator participating in the Lido on Ethereum protocol are responsible for correctly exiting validators within a specified timeframe determined by the protocol's requirements and rules set by the DAO.

In essence, if a Node Operator is unable to withdraw a validator within the time specified by the `VALIDATOR_DELINQUENT_TIMEOUT_IN_SLOTS` parameter in the `OracleDaemonConfig` contract, the accounting oracle report for that Node Operator increases the `STUCKED` field by the number of delayed validators.

Therefore, a Node Operator is penalized if they have more `STUCKED` validators than `REFUNDED` validators. While this condition is met, the Node Operator receives only half of the rewards and no new stake allocations.

Once the Node Operator manages to either withdraw the required number of validators or compensate for the lost validators and increases the `REFUNDED` count through DAO voting, the Node Operator is considered under penalty for the duration of the `STUCK_PENALTY_DELAY` period and then returns to the normal state. Rewards are automatically restored to normal, but to start receiving new stake, the Node Operator (or anyone else) must call the permissionless method `clearNodeOperatorPenalty`.

To clear penalty please send a transaction with desired `_nodeOperatorId`: [https://etherscan.io/address/0x55032650b14df07b85bF18A3a3eC8E0Af2e028d5#writeProxyContract#F2](https://etherscan.io/address/0x55032650b14df07b85bF18A3a3eC8E0Af2e028d5#writeProxyContract%23F2)
