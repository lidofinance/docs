# Penalties

## Reasons
There are several reasons for the CSM Node Operator's [bond](./join-csm#bond) to be penalized:
1. **The operator violated CSM participation rules enforced off-chain (e.g., EL rewards (MEV) stealing).** Penalty amount = `reported penalty + fixed fee` (can be applied across multiple NO validators);
2. **The validator's withdrawal balance is less than its [confirmed expected balance](./intro.md#validator-balance-tracking).** Penalty amount = `confirmed expected balance - withdrawal balance`. This measured loss is not scaled. For slashed validators, an [explicit slashing penalty](./validator-exits.md#slashed-validators) can be reported instead;
3. **The operator has not exited the validators in time.** Penalty amount = `exitDelayPenalty`, a fixed amount set by the DAO that is [scaled with the validator's balance](#penalty-scaling-for-larger-validators);
4. **The validator has been ejected via [EIP-7002](https://eips.ethereum.org/EIPS/eip-7002) due to an excessive number of strikes.** Penalty amount = `badPerformancePenalty`, a fixed amount set by the DAO that is [scaled with the validator's balance](#penalty-scaling-for-larger-validators);
5. **Force ejection via [EIP-7002](https://eips.ethereum.org/EIPS/eip-7002) was triggered for the validator.** Penalty amount = `min(actual TW fee paid, maxWithdrawalRequestFee)`. This is a flat fee that does not depend on validator size, so it is not scaled.

The first penalty has the form of a [delayed penalty](#immediate-and-delayed) with a challenge period. A dedicated committee (reporter) detects such a violation (e.g., EL rewards (MEV) stealing, which breaches the [Lido on Ethereum Block Proposer Rewards Policy](https://snapshot.org/#/lido-snapshot.eth/proposal/0x7ac2431dc0eddcad4a02ba220a19f451ab6b064a0eaef961ed386dc573722a7f)) and reports this fact on-chain, locking the [bond](./join-csm#bond) funds. Settlement over EasyTrack motion (settler) ensures alignment between the DAO and the detection committee. If the penalty is not settled within the `lockPeriod`, the lock expires. The expired lock can then be cleared via a permissionless method on [`Accounting`](./contracts/Accounting.md), for example by the Node Operator.

The second penalty compares the validator's withdrawal balance with its [confirmed expected balance](./intro.md#validator-balance-tracking) and is applied immediately in the reporting transaction. See [Withdrawal balance reporting](./validator-exits.md#withdrawal-balance-reporting) for the reporting flows for slashed and non-slashed validators.

The rest of the penalties are applied upon validator withdrawal reporting to avoid double penalization.

## Penalty scaling for larger validators

Some fixed, DAO-configured penalties are scaled in proportion to the validator's balance, so the penalty stays aligned with the amount of stake the validator represents. This matters for `0x02` validators, which can hold up to `2048 ETH`.

A standard `32 ETH` validator pays the base amount, and the penalty grows linearly with the validator's balance, up to `64x` the base amount for a fully topped-up `2048 ETH` validator.

## Immediate and delayed
The following penalization schemes are introduced:
1. **Immediate penalization**. For penalties that are unambiguous and can be assessed via trustless proofs;
2. **Delayed penalty with challenge period**. For cases where false positives may occur or investigation might be needed;
3. **Delayed penalty without a challenge period**. For cases where the penalty is recorded immediately but applied upon the validator withdrawal reporting.

The challenge period for delayed penalties is implemented by separating the two roles involved in the application of the penalty.

The first role is the "reporter". Members of this role can initially report a fact that should result in a penalty. [Bond](./join-csm#bond) tokens will be locked but not burned or confiscated at this stage. "Reporters" can also revoke the initial report in case of the challenge resolution in favor of the Node Operator.

The second role is called "settler". Members of this role can finalize (settle) previously reported penalties.

Separating these two roles ensures that a penalty can only be applied when two independent actors agree.

## Mechanics
A Node Operator's [bond](./join-csm#bond) can be reduced in two ways, depending on the purpose of the deduction:

- **Penalize** - the confiscated stETH shares are burned using the [Burner](/contracts/burner) contract. Burning decreases the total amount of stETH shares, so `shareRate` increases and the burned value is effectively distributed among all other stETH holders. This is used to compensate the protocol and its stakers for losses.
- **Charge** - the confiscated stETH is transferred directly to the Lido DAO (the [charge recipient](https://etherscan.io/address/0x3e40D73EB977Dc6a537aF587D48316feE66E9C8c)). This is used to cover protocol operational costs.

Most reasons in the previous section result in a penalty (burn). The amounts applied as a charge are the `keyRemovalCharge`, the delayed-exit amount (`exitDelayPenalty`), and the triggerable withdrawal request fee.

## Insufficient bond
If, after penalties have been applied, a Node Operator's [bond](./join-csm#bond) is less than required to cover the current Node Operator's validators, all new rewards will be used to replenish the NO [bond](./join-csm#bond) until it is back to the required level. Node Operators can also "top-up" the [bond](./join-csm#bond) themselves (by submitting the required difference) to be able to claim new rewards.

:::info
Any unbonded validators are requested to exit. Unbonded but not deposited keys are excluded from the stake allocation queue.
:::

If the penalty exceeds the amount of the Node Operator [bond](./join-csm#bond) available, all available [bond](./join-csm#bond) tokens are burned, and a [bond](./join-csm#bond) debt record is created for the outstanding amount, to be recovered from subsequent [bond](./join-csm#bond) top-ups and rewards.

## Bad performance strikes

### Strikes assignment

Once in a frame, the Performance Oracle delivers an additional tree root with information about "strikes" for the validators. A strike means that the validator performed below the threshold in this frame. When updating this tree, the Performance Oracle considers the previous values from the old tree. All strikes older than the `strikesLifetime` oracle frames (ex. 6 frames) are dropped.

Strikes tree leaves have a form of `{noID, validatorPubkey, [strikeTimestamps]}`.

:::info
It is crucial to note that strikes are not a penalty but an indicator of bad performance that should be considered by the Node Operators as a signal to improve their performance.
:::

### Ejection due to strikes
Once the number of strikes reaches the `strikesThreshold` (ex. 3 strikes in 6 frames), the permissionless method can trigger exit for the validator and record that a `badPerformancePenalty` should be confiscated from the Node Operator's bond upon validator withdrawal reporting.

:::warning
Ejection parameters are subject to the Lido DAO decision
:::

Validator ejection via [EIP-7002](https://eips.ethereum.org/EIPS/eip-7002) comes with a price. This price should be confiscated from the Node Operator's bond and transferred to the Lido DAO treasury to cover corresponding operational expenses.


## Useful links

- [EIP-4788](https://eips.ethereum.org/EIPS/eip-4788)
- [EIP-7002](https://eips.ethereum.org/EIPS/eip-7002)
- [Lido on Ethereum Block Proposer Rewards Policy](https://snapshot.org/#/lido-snapshot.eth/proposal/0x7ac2431dc0eddcad4a02ba220a19f451ab6b064a0eaef961ed386dc573722a7f)
