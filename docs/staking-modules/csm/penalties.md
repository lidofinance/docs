# Penalties

## Reasons
There are three major reasons for CSM Node Operator's [bond](./join-csm#bond) to be penalized:
1. **The validator has been slashed.** In this case, the [initial (minimal) slashing penalty](https://github.com/ethereum/consensus-specs/blob/v1.4.0/specs/altair/beacon-chain.md#modified-slash_validator) is confiscated. Penalty amount = `1 ETH`;
2. **The operator has stolen EL rewards (MEV).** Penalty amount = `amount stolen + fixed stealing fine` (can be applied across multiple NO validators);
3. **The validator's withdrawal balance is less than `DEPOSIT_AMOUNT` (32 ETH)**. Penalty amount = `DEPOSIT_AMOUNT - validator's withdrawal balance`;

The first penalty is reported permissionlessly using [EIP-4788](https://eips.ethereum.org/EIPS/eip-4788) to prove the fact of slashing. This penalty is applied immediately within the reporting transaction.

The second penalty has the form of a [delayed penalty](#immediate-and-delayed) with a challenge period. A dedicated committee (reporter) detects MEV stealing (violation of the [Lido on Ethereum Block Proposer Rewards Policy](https://snapshot.org/#/lido-snapshot.eth/proposal/0x7ac2431dc0eddcad4a02ba220a19f451ab6b064a0eaef961ed386dc573722a7f)) and reports this fact on-chain, locking the [bond](./join-csm#bond) funds. Settlement over EasyTrack motion (settler) ensures alignment between the DAO and detection committee. Once the penalty is settled (confirmed), all Node Operator's benefits are reset due to the violation of protocol rules. If the penalty is not settled for `retention_period` the locked [bond](./join-csm#bond) is automatically unlocked.

The third penalty type is calculated using the validator withdrawal balance (actual reporting is described in the section below). This penalty is applied immediately within the reporting transaction. If the initial slashing penalty is applied (first penalty type), it will be accounted for to avoid double penalization.

## Immediate and delayed
The following penalization schemes are introduced:
1. **Immediate penalization**. For penalties that are unambiguous and can be assessed via trustless proofs;
2. **Delayed penalty with challenge period**. For cases where false positives may occur or investigation might be needed;

The challenge period for delayed penalties is implemented by separating two roles involved in the application of the penalty.

The first role is the "reporter". Members of this role can initially report a fact that should result in a penalty. [Bond](./join-csm#bond) tokens will be locked but not burned or confiscated at this stage. "Reporters" can also revoke the initial report in case of the challenge resolution in favor of the Node Operator.

The second role is called "settler". Members of this role can finalize (settle) previously reported penalties.

Separating these two roles ensures that a penalty can only be applied when two independent actors agree.

## Mechanics
There are two mechanics related to Node Operator [bond](./join-csm#bond) penalization.

The first one is burning stETH shares using the [Burner](/contracts/burner) contract. Once confiscated shares are burnt, the total amount of stETH shares decreases. Hence, `shareRate` increases, effectively distributing all burned stETH value between other stETH holders.

The second mechanic is transferring confiscated stETH to the [Lido DAO Treasury](https://etherscan.io/address/0x3e40D73EB977Dc6a537aF587D48316feE66E9C8c). This approach is applied to penalties that are used to address protocol operational costs (e.g., `keyRemovalCharge`).

Penalized funds are burned for all the reasons described in the previous section. At the moment, only one penalty transferred to the Treasury is the `keyRemovalCharge`.

## Insufficient bond
If, after penalties have been applied, a Node Operator's [bond](./join-csm#bond) is less than required to cover the current Node Operator's validators, all new rewards will be used to replenish the NO [bond](./join-csm#bond) until it is back to the required level. Node Operators can also "top-up" the [bond](./join-csm#bond) themselves (by submitting the required difference) to be able to claim new rewards.

:::info
Any unbonded validators are requested to exit. Unbonded but not deposited keys are excluded from the stake allocation queue.
:::

If the penalty exceeds the amount of the Node Operator [bond](./join-csm#bond) available, all available [bond](./join-csm#bond) tokens will be burned, and no debt will occur since it will never be repaid.

## Benefits reset

A [bond](./join-csm#bond) curve different from the default one can be treated as a benefit for the Node Operator. It is crucial to ensure a reset of the benefits in case of inappropriate performance or rule violations. There are several cases when benefits can be reset for the Node Operator in CSM:
- EL rewards stealing is detected and confirmed;
- Slashing is reported for one of the NO's validators;
- One of the NO's validators is ejected using [EIP-7002](https://eips.ethereum.org/EIPS/eip-7002) (to be implemented after the Pectra hardfork bringing [EIP-7002](https://eips.ethereum.org/EIPS/eip-7002) to life);
- Based on the DAO decision;

If the Node Operator voluntarily exits all validators and claims all [bond](./join-csm#bond), benefits are not reset since there were no malicious or illegal actions from the Node Operator's side.

Detailed research on this topic is presented in a [separate document](https://hackmd.io/@lido/SygBLW5ja).

## Further reading

- [Validator exits](validator-exits.md)

## Useful links

- [EIP-4788](https://eips.ethereum.org/EIPS/eip-4788)
- [EIP-7002](https://eips.ethereum.org/EIPS/eip-7002)
- [Lido on Ethereum Block Proposer Rewards Policy](https://snapshot.org/#/lido-snapshot.eth/proposal/0x7ac2431dc0eddcad4a02ba220a19f451ab6b064a0eaef961ed386dc573722a7f)
