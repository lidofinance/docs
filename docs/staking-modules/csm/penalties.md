# Penalties

## Immediate and delayed
The following penalization schemes are introduced:
1. **Immediate penalization** (for penalties that are unambiguous and can be assessed via trustless proofs);
2. **Delayed penalty with challenge period** (for cases where false positives may occur or investigation might be needed);

The challenge period for delayed penalties is implemented by separating two roles involved in the application of the penalty. 

The first role is the "reporter". Members of this role can initially report a fact that should result in a penalty. Bond funds will be locked but not burned or confiscated at this stage. "Reporters" can also revoke the initial report in case of the challenge resolution in favor of the Node Operator.

The second role is called "settler". Members of this role can finalize (settle) previously reported penalties.

Separating these two roles ensures that a penalty can only be applied when two independent actors agree. 

## Reasons
There are three major reasons for CSM Node Operator's bond to be penalized:
1. **The validator has been slashed.** In this case, the [initial (minimal) slashing penalty](https://github.com/ethereum/consensus-specs/blob/dev/specs/altair/beacon-chain.md#modified-slash_validator) is confiscated. Penalty amount = `1 ETH` (`EFFECTIVE_BALANCE / 32`);
2. **The operator has stolen EL rewards (MEV).** Penalty amount = `amount stolen + fixed stealing fine` (can be applied across multiple NO validators);
3. **The validator's withdrawal balance is less than `DEPOSIT_AMOUNT` (32 ETH)**. Penalty amount = `32 - validator's withdrawal balance`;

The first penalty is reported permissionlessly using [EIP-4788](https://eips.ethereum.org/EIPS/eip-4788) to prove the fact of slashing. This penalty is applied immediately within the reporting transaction.

The second penalty has the form of a delayed penalty with a challenge period. A dedicated committee (reporter) detects MEV stealing and reports this fact on-chain, locking the bond funds. Settlement over EasyTrack motion (settler) ensures alignment between the DAO and detection committee. Once the penalty is settled (confirmed), all Node Operator's benefits are reset due to the violation of protocol rules. If the penalty is not settled for `retention_period` the locked bond is automatically unlocked.

The third penalty type is calculated using the validator withdrawal balance (actual reporting is described in the section below). This penalty is applied immediately within the reporting transaction. If the initial slashing penalty is applied (first penalty type), it will be accounted for to avoid double penalization.

## Mechanics
There are two mechanics related to Node Operator bond penalization.

The first one is burning stETH shares using the [Burner](https://docs.lido.fi/contracts/burner). Once confiscated shares are burnt, the total amount of stETH shares decreases. Hence, `shareRate` increases, effectively distributing all burned stETH value between other stETH holders.

The second mechanic is transferring confiscated stETH to the [Lido DAO Treasury](https://etherscan.io/address/0x3e40D73EB977Dc6a537aF587D48316feE66E9C8c). This approach is applied to penalties that are used to address protocol operational costs (e.g., `removalCharge`).

Penalized funds are burned for all the reasons described in the previous section. At the moment, only one penalty transferred to the Treasury is the `removalCharge`.

## Bond shortage
If, after penalties have been applied, a Node Operator's bond is less than required to cover the current Node Operator's validators, all new rewards will be used to replenish the NO bond until it is back to the required level. Node Operators can also "top-up" the bond themselves (by submitting the required difference) to be able to claim new rewards.

If the amount of the penalty exceeds the amount of the Node Operator bond available, all available funds are burned.

## Benefits reset

A bond curve different from the default one can be treated as a benefit for the Node Operator. It is crucial to ensure a reset of the benefits in case of inappropriate performance or rule violations. There are 4 cases when benefits can be reset for the Node Operator in CSM:
- EL rewards stealing is detected and confirmed;
- Slashing is reported for one of the NO's validators;
- One of the NO's validators is ejected due to insufficient CL balance (to be implemented after the Pectra hardfork);
- Based on the DAO decision;

If the Node Operator voluntarily exits all validators and claims all bond, benefits are not reset since there were no malicious or illegal actions from the Node Operator's side.

Detailed research on this topic is presented in a [separate document](https://hackmd.io/@lido/SygBLW5ja).

## Further reading

- [Validator exits](validator-exits.md)

## Useful links

- [EIP-4788](https://eips.ethereum.org/EIPS/eip-4788)