---
sidebar_position: 6
---

# 🪪 Applying for ICS and IDVTC

ICS (Identified Community Stakers) and IDVTC (Identified DVT Clusters) are 0x01 CSM operator types with more favorable bond and reward parameters than Default. See [Operator types and economics](/run-on-lido/csm/context-and-background#operator-profiles-and-economics) for the numbers.

You apply for both types in the CSM Widget. This page covers the application steps. The eligibility rules and the scoring system are on the Node Operator Portal, in the [ICS framework](https://operatorportal.lido.fi/modules/community-staking-module/ics) and the [IDVTC rules](https://operatorportal.lido.fi/modules/community-staking-module/identified-dvt-cluster-idvtc).

## Apply for ICS

:::warning
ICS is for home operators. Applications with addresses associated with professional Node Operators or validator-as-a-service (VaaS) providers are rejected.
:::

### How to get here

* Go to the [ICS application](https://csm.lido.fi/type/ics-apply) in the Lido CSM Widget

### Submit your application

1. Connect the main address you want the ICS type for, and sign a message to prove ownership. If you already run a Node Operator, use its Manager Address as the main address. The main address doesn't need to hold every proof.
2. Optionally, add up to 5 more addresses that hold your proofs. Some proofs, such as CSM Mainnet participation, are linked automatically. Others need a few extra steps first, described in [Link your proofs](#link-your-proofs).
3. Optionally, verify your X and Discord accounts to earn Proof-of-Humanity points, by publishing a message from each account or signing in with it.
4. Prove ownership of each additional address by signing a message, then submit the application.

### Link your proofs

#### Human Passport

1. Open the [Lido Passport dashboard](https://app.passport.xyz/#/lido_csm/).
2. Connect the wallet you want to score.
3. Collect Stamps to build your Humanity Score. Aim for at least 3 points, up to a maximum of 8.
4. Add that address to your ICS application. The score is applied automatically.

#### Circles

You earn Circles points once you're added to the dedicated Lido group on Circles. Only the group admins can add you, after meeting you at least once in person or in an online meeting.

Once you're in the group, link an Ethereum address to your Circles account following [this guide](https://hackmd.io/ZpLPFR77RiSGKCUqd2d5aQ?view), and add that address to your application.

#### Lido or SSV High Signal

1. Open High Signal for [Lido](https://app.highsignal.xyz/p/lido/) or [SSV](https://app.highsignal.xyz/p/ssv/), and go to **My Settings** → **Accounts**.
2. Connect your Discord account under **Social Accounts**, and your Lido forum account under **Forum Accounts** if you have one.
3. Under **Ethereum Addresses**, press **Confirm addresses** and sign with your wallet.
4. Press **Edit** on that address, select **Shared** and choose **Lido**, or select **Public**, then press **Save changes**.
5. Add the address to your ICS application.

### After you apply

Your application is checked against the framework rules, partly automatically and partly by Lido contributors and the CSM Committee. If it passes, it is marked **Approved** with an approximate date for the next update of the ICS list. If it fails, it is marked **Rejected** with a reason or a recommendation to fix it.

Approved applications are added to the on-chain ICS list in periodic updates, which the CSM Committee executes through [Easy Track](/guides/easy-track-guide).

### Claim the ICS type

- **If you don't have a Node Operator yet**, wait until your application is approved and included in a list update, then create your Node Operator with the address from your application. It gets the ICS type at creation.
- **If you want to start before that, or already have a Node Operator**, create it or keep it as Default, and claim the ICS type from the **Operator Type** section of the widget once your application is approved and included in a list update.

## Apply for IDVTC

IDVTC is for DVT clusters of four operators who each have an approved ICS application. An IDVTC cluster must:

- Run its validators with Obol or SSV. See [DVT Setup](/run-on-lido/csm/node-setup/DVT-setup/).
- Generate its keys through a DKG ceremony.
- Enroll in monitoring through the DVT provider's tooling.

Check the [IDVTC rules](https://operatorportal.lido.fi/modules/community-staking-module/identified-dvt-cluster-idvtc) on the Node Operator Portal before applying.

Apply with the [IDVTC application](https://csm.lido.fi/type/idvtc-apply) in the Lido CSM Widget. The application links the cluster to the ICS identity of each member through signatures from all four, and includes the output of your DKG ceremony as proof, `cluster-lock.json` for Obol or `proofs.json` for SSV.

An operator can hold only one Node Operator of the ICS type, and take part in only one IDVTC.
