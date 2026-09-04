# Validator Exits

:::tip
Looking for a practical guide to run nodes? Follow the [Curated Module v2 guide](/run-on-lido/cm-v2/) or the [CSM guide](/run-on-lido/csm/).
:::

![exits-1](/img/csm/exits-1.png)

## Exited and Withdrawn

The [Curated module](/contracts/node-operators-registry) uses the "exited" statuses of the validator (both [Slashed and Exited](https://notes.ethereum.org/7CFxjwMgQSWOHIxLgJP2Bw#44-Step-4-Slashed-and-Exited) and [Unslashed and Exited](https://notes.ethereum.org/7CFxjwMgQSWOHIxLgJP2Bw#45-Step-5-Unslashed-and-Exited)) as the last meaningful status in accounting since, after this status, the validator is no longer responsible for any duties on the Beacon chain (except for the rare cases of the delayed sync committee participation).

CMv2 and CSM, in turn, need to know about each validator's exact withdrawal balance to decide on [bond](/staking-modules/node-operators#bond) penalization. Hence, the module uses the "exited" counter reported by the accounting oracle only to return a correct number of "active" keys to the staking router, and implements permissionless reporting methods to report the validator's withdrawal balance once the validator is [withdrawn](https://consensys.io/shanghai-capella-upgrade#:~:text=Finally%2C%20the%20withdrawable%20validator%20is%20subject%20to%20the%20same%2C%20automated%20%E2%80%9Csweep%E2%80%9D%20that%20processes%20partial%20withdrawals%2C%20and%20its%20balance%20is%20withdrawn).

## Validator balance tracking

The module keeps a **confirmed balance** for every deposited validator key: the highest balance ever proven on the Consensus Layer through [`Verifier`](/staking-modules/contracts/Verifier). Anyone can update it with a balance proof as the validator grows from CL rewards, settled [top-ups](/staking-modules/node-operators#top-up-queue), consolidation inflows, or other CL activity. It never decreases while the validator is active, so it acts as a high-water mark capped at the validator `MAX_EB`.

It is used in three places:

- [`Verifier`](/staking-modules/contracts/Verifier) checks it to confirm that a reported withdrawal is large enough to be treated as a full withdrawal.
- The module uses it as the baseline for the [withdrawal-balance penalty](/run-on-lido/csm/penalties#what-can-affect-your-bond) applied when the validator is [withdrawn](#withdrawal-balance-reporting).
- When the confirmed balance exceeds the validator's allocated amount, the module raises the allocated amount to match, so validator balance growth is reflected in the module's tracked stake and remaining [top-up](/staking-modules/node-operators#top-up-queue) capacity. This keeps stake allocation fair.

This approach has two important caveats:

- **Stale balance proofs can cause under-penalization.** If proof delivery lags behind settled top-ups or balance growth, the confirmed balance can be lower than the validator's actual high-water mark, so a later loss is measured from an outdated baseline.
- **Consensus Layer balance decreases are assessed without determining fault.** Any decrease from the confirmed high-water mark to the withdrawal balance is charged to the Node Operator, regardless of its cause, so losses from systemic network conditions are not distinguished from operator-caused ones.

:::warning Prover bot
Confirmed balances stay accurate only if balance proofs are delivered on time, so reliable operation of the [prover bot](https://github.com/lidofinance/csm-prover-tool) is more important to module health than in earlier versions.
:::

## Voluntary exits

Node Operators exit their validators by publishing an exit message to the Ethereum Consensus Layer. Should a Node Operator decide to exit using [EIP-7002](https://eips.ethereum.org/EIPS/eip-7002) instead, they can do so via the [`Ejector`](/staking-modules/contracts/Ejector) contract.

**In CMv2**, exiting outside of a protocol-requested exit is discouraged. Operators planning to do so should notify the Curated Module Committee and the community in advance. **In CSM**, given its permissionless nature, operators can exit at any moment.

:::warning
Exiting validators using [EIP-7002](https://eips.ethereum.org/EIPS/eip-7002) is an emergency measure and should be used only in exceptional cases. It is recommended to exit validators using the standard method of publishing an exit message to the Ethereum Consensus Layer.
:::

## Protocol-initiated exits

For consistency with the core protocol and other staking modules, these modules use [VEBO](/contracts/validators-exit-bus-oracle) to request or trigger validator exits. Details about the overall processes and mechanisms through which validator exits are requested by the protocol and why are explained in the Lido on Ethereum Validator Exits SNOP 3.0 ([IPFS](https://ipfs.io/ipfs/QmW9kE61zC61PcuikCQRwn82aoTCj9yPuENGNPML9QLkSM), [GitHub](https://github.com/lidofinance/documents-and-policies/blob/main/Lido%20on%20Ethereum%20Standard%20Node%20Operator%20Protocol%20-%20Validator%20Exits.md))

From the core protocol side, validator exit can be requested to cover withdrawal requests from stETH holders or according to the DAO's decision.

From the module side, validator exits can be requested or triggered for:
- Unbonded validators. These exits are requested automatically using the `targetLimitMode = 2` (forced mode);
- Validators with an excessive number of bad performance strikes. These exits are triggered via the permissionless method on the [`ValidatorStrikes`](/staking-modules/contracts/ValidatorStrikes) contract. The strike parameters are set per Node Operator type, and are documented for CSM under [Penalties](/run-on-lido/csm/penalties#what-can-affect-your-bond).

:::info
`targetLimitMode = 2` (forced mode) was introduced within the updated version of [Staking Router](https://hackmd.io/@lido/BJXRTxMRp#Forced-Exit-Requests1). In short, it is similar to the existing `targetLimit` but exits for the validators above `targetLimit` with `targetLimitMode = 2` (forced mode) can be requested within the next [VEBO](/contracts/validators-exit-bus-oracle) report, even without a need to fulfill withdrawal requests from stETH holders.
:::

Node Operators should follow [VEBO](/contracts/validators-exit-bus-oracle) events, for example by using the [Ejector](https://github.com/lidofinance/validator-ejector), to ensure they exit validators on time.

If a Node Operator fails to exit requested validators in time:
1. VEBO will trigger exits for the delayed validators;
2. The module will penalize the Node Operator's [bond](/staking-modules/node-operators#bond) tokens for the delayed exits;
3. The module will confiscate `withdrawalRequestFee` paid by the protocol to trigger delayed validator exits from the Node Operator's [bond](/staking-modules/node-operators#bond) tokens;

Also, in exceptional cases, Lido DAO can trigger exits for Node Operator's validators based on the DAO's decision.

## Withdrawal balance reporting

The module settles a validator's exit after receiving a withdrawal report. Processing the report marks the validator as withdrawn and applies any exit-related penalties and charges, documented per module under [CMv2 Penalties](/run-on-lido/cm-v2/penalties) and [CSM Penalties](/run-on-lido/csm/penalties).

### Non-slashed validators

After a full withdrawal is included in a beacon block, anyone can submit a [withdrawal proof](/staking-modules/contracts/Verifier#processwithdrawalproof) through [`Verifier`](/staking-modules/contracts/Verifier). Reports are typically submitted by the [prover bot](https://github.com/lidofinance/csm-prover-tool) or the Node Operator.

`Verifier` validates the proof against a beacon block root obtained through [EIP-4788](https://eips.ethereum.org/EIPS/eip-4788) and forwards the proof to the module to process.

If the withdrawal amount is below the [confirmed expected balance](#validator-balance-tracking), the difference is applied as a penalty. The module also settles any previously recorded delayed-exit penalty, bad-performance penalty, and applicable execution-layer withdrawal request fee. Some of these amounts are proportional to the validator's balance while others are flat, as documented for [CMv2](/run-on-lido/cm-v2/penalties#exit-delay-fee) and [0x02 CSM](/run-on-lido/csm/penalties#parameters-by-operator-profile).

### Slashed validators

Slashed validators use a separate permissioned flow because their full losses, including missed rewards, cannot always be determined from the withdrawal amount alone:

1. Anyone can submit a valid proof of the validator's slashed status through [`Verifier.processSlashedProof`](/staking-modules/contracts/Verifier#processslashedproof). This records the slashing in the module but does not settle the withdrawal.
2. A dedicated committee, the [Curated Module Committee](https://research.lido.fi/t/proposal-transition-the-lnosg-into-the-cmc/11341) or the [CSM Committee](https://research.lido.fi/t/community-staking-module-committee/8333) depending on the module, calculates the slashing loss off-chain and submits the validator's exit balance and explicit slashing penalty through an [Easy Track](/guides/easy-track-guide) motion.
3. When the motion is enacted, the module applies the slashing penalty and any other recorded exit penalties or charges, marks the validator as withdrawn, and updates the Node Operator's required bond.

## Useful links

- [EIP-4788](https://eips.ethereum.org/EIPS/eip-4788)
- [EIP-7002](https://eips.ethereum.org/EIPS/eip-7002)
- [Lido on Ethereum Validator Exits SNOP 3.0](https://ipfs.io/ipfs/QmW9kE61zC61PcuikCQRwn82aoTCj9yPuENGNPML9QLkSM)
