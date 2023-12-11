# Validator exits and penalties

The Lido protocol has laid out the policy on validator exit order, performance expectations over time, node operator responsibilities, and monitoring and penalties. The validators' exit should be deterministic and independent to ensure trustlessness, and the current proposed exit order is the "combined approach." Initially, the enforcement mechanisms and service level expectations are mild enough to work out initial kinks without unreasonable penalty, but penalties for non-performance should increase once the processes and mechanisms mature. Node Operators have a duty to exit validators correctly and timely, and the tooling for the semi- or fully-automated processing of validator exit requests includes the Key API Service, Ejector Oracle reports, and Validator Ejector. Node Operators must adhere to the required service levels for validator exits, or they risk being classified as delayed or delinquent.

A piece of tooling dubbed the "Monitor Daemon" is served to reconcile signalled validator exit requests with processed exits by the Ethereum Consensus Layer in order to determine if validators have been exited in a timely manner. The results of this monitoring are publicly available in order to ensure the DAO has access to the data it needs to understand the rate, flow, and efficacy of validator exits.

Although the process might be largely automated, to account for differences in infrastructure, working hours, and mechanism timings, the below are the required service levels for validator exits that Node Operators must adhere to.

If Node Operators are processing signalled validator exit requests as soon as they are available, the shortest possible time for a validator exit request to go from “signalled” to “processed” will be somewhere within the range of a few minutes to an hour. With respect to validator exit performance, each Node Operator may be considered to have one of the below three statuses.

* In good standing - validator exit requests are being processed fully, correctly, and timely.
* Delayed - validator exit requests are being processed incompletely, incorrectly, or not within the desired time frame.
* Delinquent - validator exit requests are being processed incompletely, incorrectly, or not within the maximum acceptable time frame.

|Event|Requirement to not be considered Delayed|Requirement not be considered Delinquent|
|---|---|---|
|Processing of signalled validator exit requests|All signalled requests are processed ASAP (no longer than 1 day)|Some signalled requests are taking longer than 1 but less than 4 days to process|
|Escalation of inability to execute signalled validator exit request with reason|ASAP but no longer than 1 day|ASAP but no longer than 4 days

In the case that Node Operators are not processing validator exit requests in a timely manner, the below actions shall be taken:
If a Node Operator has a status of Delayed, there should be raised an issue in internal communications with the Node Operator and request remediative action.

* If a Node Operator has a status of Delinquent, the DAO contributors can raise a formal issue with the Node Operator on the Lido research forum. While a Node Operator has a status of Delinquent:
  * no new stake will be allocated to the Node Operator (happens automatically);
  * the daily rewards sent to the Node Operator will be halved (with the remaining half sent towards that day’s rebase) (happens automatically);
  * reduced rewards will continue for the duration of a cooldown period long enough to determine whether, immediately after service restoration by the Node Operator, subsequently received validator exit requests are processed in a timely manner.
* If a Node Operator has a status of Delayed or Delinquent, the [Validators Exit Bus](./validator-exit-bus.md) Oracle off-chain module will assume that the Node Operator is unresponsive and re-route new incoming validator exit requests to operators that are not considered delinquent. Due to the re-routing of validator exit requests, the DAO shall consider (via an ad-hoc vote) overriding the total limit of active validators for the relevant Node Operator such that if/when they resume a status of in good standing, they are not benefiting at the expense of Node Operators who took over the processing of the re-routed exits requests.
* Once a Delinquent Node Operator has processed all signalled validator exit requests (and thus their number of Delinquent validators in next Accounting Oracle report is updated to 0), they will recommence receiving validator exit requests. Their status shall revert to “In good standing” after 5 days (i.e. provided any newly received validator exit requests are processed timely). During this 5 day “cooldown period” they will continue to not receive new stake and receive halved rewards.
* In the most egregious of cases (e.g. delinquency for weeks at a time) the DAO may consider an on-chain vote to “stop” the Node Operator which has the effect of setting the fees that they receive to zero (the DAO may consider such a vote at any time). If the Node Operator is unresponsive to the DAO’s requests, then the Node Operator is considered to have been effectively “off boarded” from the Lido protocol and the DAO should take further steps to formalize the exit of the Node Operator.

In the case that a Node Operator cannot, for any reason, exit a validator (e.g. loss of the private key associated with that validator), they are expected to reimburse the protocol participants by supplying the maximum irretrievable balance of the validator (i.e. 32 ETH, since anything over that can be obtained via partial rewards). Doing so renders the validator in question “unrecoverable and reimbursed” and does not count against the Node Operator in terms of assessing its validator exit request status.

#### Helpful links

* [Lido Validator Exits Policy](https://github.com/lidofinance/documents-and-policies/blob/main/Lido%20on%20Ethereum%20-%20Validator%20Exits%20Policy.md)
* [Lido Validator Exits Policy: Forum discussion](https://research.lido.fi/t/lido-validator-exits-policy-draft-for-discussion/3864)
* [Withdrawals: on Validator Exiting Order](https://research.lido.fi/t/withdrawals-on-validator-exiting-order/3048/1)
