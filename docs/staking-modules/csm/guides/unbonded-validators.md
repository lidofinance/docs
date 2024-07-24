# Unbonded validators

To [upload](../join-csm#deposit-data-preparation-and-upload) validator keys to CSM, Node Operators must provide a corresponding bond amount. The Node Operator creation and upload keys methods ensure that the bond amount provided is sufficient to cover all uploaded validator keys. However, Node Operators' bonds might be penalized if they misbehave. 

If the penalty is applied, [unbonded validators](../join-csm#unbonded-validators) might appear. As the documentation [describes](../join-csm#unbonded-validators), any new unbonded validators will be requested to exit during the upcoming [VEBO](../../../contracts/validators-exit-bus-oracle.md) reports. Let's dig deeper into the process of handling unbonded validators to find out what Node Operators can do to prevent the emergence of unbonded validators and what they should do if some of their validators become unbonded.

## Unbonded validators and how they appear

Unbonded validators appear if the Node Operator's bond is no longer sufficient to cover all of the validator keys uploaded to CSM by the Node Operator.

![join-csm-4](../../../../static/img/csm/join-csm-4.png)

There are two types of the unbonded validator keys:

- **Not yet deposited but unbonded keys.** In this case, unbonded validator keys are marked as non-depositable until the Node Operator tops up the bond to make it sufficient to cover them.
- **Unbonded and deposited validator keys.**  In this case, all unbonded and deposited keys will be requested to exit in the upcoming VEBO reports.

Given the picture above, one may see that in case of a bond shortage, the very last uploaded keys are considered unbonded. Non-deposited keys will be regarded as unbonded first to avoid unnecessary exit requests. At the same time, if there are no non-deposited keys or the unbonded keys count exceeds the number of non-deposited keys, it is up to VEBO to decide on the particular keys to be requested for exit. CSM can only report the number of the deposited keys to be exited to VEBO but not the actual keys.


## How to avoid the emergence of unbonded keys and further exit requests?

There are several options available:

- **Do not violate protocol rules to avoid penalization.** If no penalty is applied, no unbonded validators will emerge.
- **Top-up bond before the unbonded validators are requested to exit.** If the penalty was already applied, there is a relatively short period of time until the next VEBO report, which most likely will contain a validator exit request. During this period, Node Operators can top-up bond to avoid exit requests for their validators.

:::warning
If the unbonded validator has already been requested to exit, Node Operators can only exit it. The bond top-up after the exit request will not reverse the request
:::

Once the validator is withdrawn, Node Operators can upload a new key with the corresponding bond amount sufficient to cover the previous bond shortage if they want to continue running with the same number of validators as before.
