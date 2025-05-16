---
sidebar_position: 1
---

# Verifying Fee Recipient for CSM Validators

You can also verify that your Fee Recipient address has been set and registered correctly on the block builder network using the external guide below.

[Verifying fee recipient registration on MEV relays](https://dvt-homestaker.stakesaurus.com/bonded-validators-setup/lido-csm/set-fee-recipient-address/verifying-fee-recipient-registered-on-mev-relays)

## What to do if Fee Recipient is wrong? {#verify-your-fee-recipient}

It’s important to **verify your fee recipient configuration before your validator proposes a block**, as incorrect settings may result in protocol penalties.

#### Check your local configuration {#check-your-local-configuration}

Make sure the fee recipient address is set to:  
`0x388C818CA8B9251b393131C08a736A67ccB19297`

Check this in your setup as follows:

- **Dappnode:** open the `Staking Brain` and review the `Fee Recipient` field for each validator.  
- **Stereum:** open the UI and check the fee recipient field in the validator client settings.  
- **Eth-Docker / Sedge:** inspect your `.env` file and confirm the `FEE_RECIPIENT` variable is set correctly.  
- **SSV:** log in to [app.ssv.network](https://app.ssv.network/), click on **Fee Address**, and verify the address.  
- **Obol:** check your cluster definition file or Launchpad configuration _before_ deploying.  
- **systemd (separate VC):** inspect your validator service file (`/etc/systemd/system/<validator-client>.service`) and confirm the correct `--fee-recipient` or equivalent flag is set.  

:::danger
Note for systemd users, make sure you **do not** set the Fee Recipient for your Solo Staking validator keys to the Lido Execution Layer Rewards Vault.
:::

#### Check client logs {#check-client-logs}

Most validator clients log the configured fee recipient address during startup.  
Check your startup logs and confirm that the fee recipient is set to the **Lido Execution Layer Rewards Vault**.

### Seek Lido's help {#seek-lidos-help}

If you're running a validator client or using a custom setup not covered in this guide, and need help setting the correct fee recipient address, the **Lido Community Validator Specialists (Chimera)** are here to help.

Join the [Lido Discord](https://discord.gg/lido) and tag:

```
@community-validator-support
```

We’ll assist you in configuring your setup correctly to avoid penalties.