---
sidebar_position: 3.5
---

# ⚡ Penalties

When you join CSM, your bond acts as collateral for all validators under your Node Operator. Penalties and charges are deducted from that bond.

## Penalties

- **General Delayed Penalty:** used for protocol violations that require review, such as execution-layer rewards being sent to the wrong address. It covers the assessed loss plus an additional fine.
- **Bad performance ejection penalty:** applied when a validator accumulates enough strikes to be ejected for repeated poor performance.
- **Slashing penalty:** covers losses associated with a slashed validator.
- **Exit delay charge:** applied when a validator does not exit within the allowed time after a protocol request.
- **Key removal charge:** applied when an uploaded key is removed before it has been deposited.
- **Triggerable Exit fee:** covers the execution-layer cost of forcing a validator exit when the Node Operator does not process it.

## What can affect your bond

| Situation | What happens |
| --- | --- |
| Removing an uploaded validator key from the queue before it is deposited | A small key removal charge is taken from the bond. |
| Repeated poor performance | A validator receives strikes when it performs below the applicable threshold. Enough strikes can trigger its exit and a Bad performance ejection penalty. |
| Missing a requested exit deadline | An exit delay charge is applied after the validator withdraws. A forced exit may also add the Triggerable Exit fee. |
| Slashing | Losses associated with the slashed validator are assessed and deducted from the bond after withdrawal. |
| Redirecting Execution Layer rewards or another protocol violation | The assessed loss and an additional fine can be reported as a General Delayed Penalty. |

When a validator exits, CSM compares its withdrawal balance with its confirmed expected balance. For a non-slashed validator, any shortfall is applied directly to the bond. Slashed validators use a [separate reporting flow](/staking-modules/csm/validator-exits#slashed-validators) so the full loss can be assessed before it is deducted.

One period of poor performance does not immediately reduce your bond. The validator first loses its Node Operator reward for that 28-day frame and receives a strike. Strikes expire after the applicable lifetime if the validator does not continue underperforming.

## Parameters by operator profile

Penalty and charge amounts, as well as performance thresholds, depend on your operator profile.

| Parameter | 0x01 Default | 0x01 ICS | 0x01 IDVTC | 0x02 Default |
| --- | --- | --- | --- | --- |
| Key removal charge | 0.02 ETH | 0.01 ETH | 0.01 ETH | 0.02 ETH |
| Performance leeway | 3% | 5% for the first 150 keys;<br />3% after | 3% | 3% |
| Strikes before ejection | 3 within 6 frames | 4 within 6 frames | 3 within 6 frames | 3 within 6 frames |
| Bad performance ejection penalty | 0.258 ETH | 0.172 ETH | 0.258 ETH | 0.258 ETH per 32 ETH of validator balance;<br />up to 16.512 ETH |
| Time to process a requested exit | 4 days | 5 days | 5 days | 4 days |
| Exit delay charge | 0.1 ETH | 0.05 ETH | 0.05 ETH | 0.1 ETH per 32 ETH of validator balance;<br />up to 6.4 ETH |
| General Delayed Penalty additional fine | 0.1 ETH | 0.05 ETH | 0.05 ETH | 0.1 ETH |

The Slashing penalty and the loss component of a General Delayed Penalty depend on the assessed loss. The Triggerable Exit fee depends on the execution-layer withdrawal request cost and does not scale with the validator balance, so these do not have fixed values in the table.

## How penalties and charges are applied

Most validator-specific penalties and exit-related charges are applied after withdrawal, when the validator's final balance and any losses can be confirmed.

A General Delayed Penalty works differently:

1. The assessed loss and additional fine are locked from the bond when the violation is reported.
2. The Node Operator can compensate the reported amount or contact the CSM support team if the report is incorrect.
3. If the report is confirmed through Easy Track, the locked amount is burned. If it is cancelled, or if the lock expires and is cleared, the bond becomes available again.

## If your bond becomes insufficient

Penalties and charges can leave some of your keys or validators unbonded. New rewards are then used to restore the required bond before they can be claimed.

If a penalty or charge is larger than the available bond, the outstanding amount is recorded as debt and recovered from future bond top-ups and rewards.

Undeposited unbonded keys stop receiving deposits. Validators that remain unbonded may be requested to exit, but you can [top up the bond](/run-on-lido/csm/lido-csm-widget/rewards-and-bonds) before the request is processed.

## Avoiding penalties and charges

- Monitor validator performance and CSM alerts.
- [Verify the fee recipient](/run-on-lido/csm/troubleshooting/setting-the-fee-recipient-for-csm-validators/verifying-fee-recipient-for-csm-validators) before your validator proposes a block.
- Follow [slashing prevention](/run-on-lido/csm/best-practices/slashing-prevention) practices.
- Process [validator exit requests](/staking-modules/csm/validator-exits) as soon as possible.
