---
sidebar_position: 2
toc_min_heading_level: 2
toc_max_heading_level: 4
---

# 🔗 Working with CMv2 directly onchain

This page is for Node Operators who for whatever reason may want or need to manage their CMv2 operators through Etherscan or their own tooling instead of using the [CMv2 widget](https://cm.lido.fi/).

It describes the contracts involved, the data that must be prepared, the calls used for each operation, and the checks that should be performed before and after a transaction.

---

## Networks and requirements

| Network | Chain ID | Widget | Explorer | Contracts |
| --- | --- | --- | --- | --- |
| Mainnet | `1` | [cm.lido.fi](https://cm.lido.fi/) | [Etherscan](https://etherscan.io/) | [Deployed Contracts](/deployed-contracts/#curated-module-v2) |
| Hoodi | `560048` | [cm.testnet.fi](https://cm.testnet.fi/) | [Hoodi Etherscan](https://hoodi.etherscan.io/) | [Deployed Contracts](/deployed-contracts/hoodi/#curated-module-v2) |

To interact with the contracts, you'll need:

- the current proxy address
- the required caller
- prepared inputs for the specific operation

Some operations additionally require:

- a Merkle proof
- approval or permits for (w)stETH
- `0x02` validator deposit data

These requirements are identified in the relevant sections below.

:::info
Use Hoodi to test a flow end-to-end before enabling the equivalent Mainnet write flow.
:::

---

## Main contracts used by Node Operators

| Contract | Main use |
| --- | --- |
| `CuratedGate` | Create a Node Operator of a specific type. |
| `CuratedModule` | Validator keys, Manager/Rewards addresses, metadata ownership, delayed-penalty compensation. |
| `Accounting` | Bond, required bond, rewards/bond claims, Rewards Claimer, fee splits. |
| `MetaRegistry` | Name, description, Operator Group metadata. |
| `FeeDistributor` | Rewards Merkle tree. |
| `StakingRouter` | Lido withdrawal credentials. |

You can see the complete list of CMv2 contracts and deployed addresses for [Mainnet](/deployed-contracts/#curated-module-v2) and [Hoodi](/deployed-contracts/hoodi/#curated-module-v2).

---

## Using Etherscan

:::info
Most CMv2 operations can be executed through Etherscan once the required inputs have been prepared.

Etherscan does not generate operation-specific inputs such as Merkle proofs, validator key batches, permits, or Rewards Splitter configurations. These must be prepared separately before submitting the transaction.
:::

1. Get the current contract address from the Lido Deployed Contracts page for [Mainnet](/deployed-contracts/#curated-module-v2) or [Hoodi](/deployed-contracts/hoodi/#curated-module-v2).
2. Open the proxy address on [Etherscan](https://etherscan.io/) or [Hoodi Etherscan](https://hoodi.etherscan.io/) and select **Contract**.
3. Use **Read as Proxy** for views and **Write as Proxy** for transactions. For a non-proxy address, use **Read Contract** or **Write Contract**.
4. Connect the address that must perform the operation, enter the inputs, and set the ETH value for payable calls.
5. Review the destination, exact function signature, arguments, and value before signing. Use Etherscan's simulation option when available.
6. After confirmation, use the read functions to verify the result.

Do not send operator transactions to implementation addresses. The implementation contains the logic, but CMv2 state is held and accessed through the proxy.

Learn more in Etherscan's [Read/Write Contract guide](https://info.etherscan.com/how-to-use-read-or-write-contract-features-on-etherscan/) and [Proxy Contracts guide](https://info.etherscan.com/what-is-proxy-contract/).

---

## Conventions

The following conventions apply across multiple CMv2 operations and are useful when preparing calls through custom tooling or Etherscan.

- For direct on-chain calls, the `from` parameter on `addValidatorKeys*` and similar methods should be set to `msg.sender`. The gate-contract exception described in the Natspec applies only to calls made by the gate contracts.
- Methods that accept stETH/wstETH use:

  ```solidity
  struct PermitInput {
      uint256 value;
      uint256 deadline;
      uint8 v;
      bytes32 r;
      bytes32 s;
  }
  ```

  Pass an all-zero `PermitInput` when an existing approval already covers the amount. For bond operations, the spender is `Accounting`.
- Curated Gates and `FeeDistributor` publish OpenZeppelin `StandardMerkleTree` dumps. Proofs may be generated locally using the [`@openzeppelin/merkle-tree`](https://github.com/OpenZeppelin/merkle-tree) JavaScript library or another compatible implementation.

---

## Direct on-chain operations

### Core operations

#### View and claim rewards / excess bond

**Contract:** `Accounting` · **Callers:** Manager Address, Rewards Address, or configured Rewards Claimer

Claims can include Node Operator rewards, excess bond, or both. For published rewards, obtain `cumulativeFeeShares` and the Merkle proof from the current `FeeDistributor` tree.

```solidity
function getClaimableRewardsAndBondShares(
    uint256 nodeOperatorId,
    uint256 cumulativeFeeShares,
    bytes32[] calldata rewardsProof
) external view returns (uint256 claimableShares);
```

The result is in stETH shares. To convert shares to stETH/ETH, use `stETH.getPooledEthByShares`.

Claim using:

```solidity
function claimRewardsStETH(
    uint256 nodeOperatorId,
    uint256 stETHAmount,
    uint256 cumulativeFeeShares,
    bytes32[] calldata rewardsProof
) external returns (uint256 claimedShares);

function claimRewardsWstETH(
    uint256 nodeOperatorId,
    uint256 wstETHAmount,
    uint256 cumulativeFeeShares,
    bytes32[] calldata rewardsProof
) external returns (uint256 claimedWstETH);

function claimRewardsUnstETH(
    uint256 nodeOperatorId,
    uint256 stETHAmount,
    uint256 cumulativeFeeShares,
    bytes32[] calldata rewardsProof
) external returns (uint256 requestId);
```

To claim only available excess bond:

```
cumulativeFeeShares = 0
rewardsProof = []
```

Please note that `claimRewardsUnstETH` is subject to Withdrawal Queue amount limits.

:::warning
If the rewards tree contains only one Node Operator, its Merkle proof is empty and cannot be used for a proof-based rewards claim. A tree with at least two leaves is required.
:::

#### Change Manager and Rewards addresses

**Contract:** `CuratedModule`

**Change Manager Address**

The current Manager proposes a new address, which must then confirm the change:

```solidity
function proposeNodeOperatorManagerAddressChange(
    uint256 nodeOperatorId,
    address proposedAddress
) external;

function confirmNodeOperatorManagerAddressChange(
    uint256 nodeOperatorId
) external;
```

Passing `address(0)` to the proposal cancels a pending change. The confirmation must be sent by the proposed Manager Address.

**Change Rewards Address**

The Manager can change the Rewards Address directly:

```solidity
function changeNodeOperatorRewardAddress(
    uint256 nodeOperatorId,
    address newAddress
) external;
```

Alternatively, the current Rewards Address can propose its own replacement:

```solidity
function proposeNodeOperatorRewardAddressChange(
    uint256 nodeOperatorId,
    address proposedAddress
) external;

function confirmNodeOperatorRewardAddressChange(
    uint256 nodeOperatorId
) external;
```

The proposed Rewards Address must confirm the change. Passing `address(0)` cancels a pending proposal.

After confirmation, verify the current addresses with `getNodeOperatorManagementProperties`.

See [Roles](/run-on-lido/cm-v2/roles) for more on how Manager and Rewards addresses work.

#### Add bond

**Contract:** `Accounting` · **Caller:** anyone

Bond can be added as ETH, stETH, or wstETH. When adding validator keys, bond can instead be supplied directly through the corresponding `addValidatorKeys*` call.

Bond top-ups are permissionless and do not give the sender control over the Node Operator.

When topping up bond for a future key batch, read the current requirement for the intended batch size:

```solidity
function getRequiredBondForNextKeys(
    uint256 nodeOperatorId,
    uint256 additionalKeys
) external view returns (uint256);

function getRequiredBondForNextKeysWstETH(
    uint256 nodeOperatorId,
    uint256 additionalKeys
) external view returns (uint256);
```

Add bond independently using:

```solidity
function depositETH(uint256 nodeOperatorId) external payable;

function depositStETH(
    uint256 nodeOperatorId,
    uint256 stETHAmount,
    PermitInput calldata permit
) external;

function depositWstETH(
    uint256 nodeOperatorId,
    uint256 wstETHAmount,
    PermitInput calldata permit
) external;
```

For `depositETH`, set the ETH value to deposit. For stETH/wstETH, provide a permit or approve `Accounting` first and pass an all-zero `PermitInput`.

After confirmation, check the Node Operator's bond with `getNodeOperatorBondInfo`.

#### Compensate a General Delayed Penalty

**Contract:** `CuratedModule` · **Caller:** Manager Address

A General Delayed Penalty locks part of the Node Operator's bond. The Manager can compensate an active penalty from available bond:

```solidity
function getNodeOperatorBondInfo(
    uint256 nodeOperatorId
) external view returns (NodeOperatorBondInfo memory);

function compensateGeneralDelayedPenalty(
    uint256 nodeOperatorId
) external;
```

Read the bond state through `Accounting` before compensating. If the available bond is insufficient, top it up first.

:::warning
If the penalty is not compensated before the applicable governance settlement executes, the locked bond can be burned.
:::

See [Penalties](/run-on-lido/cm-v2/penalties) for more on penalty types.

### Validator key operations

#### Add validator keys

:::warning
Uploading validator keys directly through Etherscan is not recommended.

The inputs must be prepared manually, and Etherscan does not validate the validator data. Use the [CMv2 widget](https://cm.lido.fi/) whenever possible.
:::

**Contract:** `CuratedModule` · **Caller:** Manager Address

Validator keys can be uploaded using existing bond or by supplying any additional required bond in the same transaction.

First, generate CMv2-compatible validator keys and deposit data following the [Key Generation & Fee Recipient](/run-on-lido/cm-v2/useful-tools/key-generation) guide.

**Encode the batch**

Concatenate the public keys and signatures without separators and preserve the same order:

```
publicKeys = pubkey1 || pubkey2 || ... || pubkeyN
signatures = signature1 || signature2 || ... || signatureN
```

For `N` validators, `publicKeys` must contain `48 × N` bytes, `signatures` must contain `96 × N` bytes, and `keysCount` must equal `N`.

**Submit the keys**

```solidity
function addValidatorKeysETH(
    address from,
    uint256 nodeOperatorId,
    uint256 keysCount,
    bytes calldata publicKeys,
    bytes calldata signatures
) external payable;

function addValidatorKeysStETH(
    address from,
    uint256 nodeOperatorId,
    uint256 keysCount,
    bytes calldata publicKeys,
    bytes calldata signatures,
    IAccounting.PermitInput calldata permit
) external;

function addValidatorKeysWstETH(
    address from,
    uint256 nodeOperatorId,
    uint256 keysCount,
    bytes calldata publicKeys,
    bytes calldata signatures,
    IAccounting.PermitInput calldata permit
) external;
```

For direct Node Operator calls, set `from` to the current Manager Address sending the transaction.

Use `Accounting.getRequiredBondForNextKeys*` to determine whether additional bond is required for the batch:

- for ETH, supply the required amount as transaction value;
- for stETH/wstETH, provide a permit or approve `Accounting` first and pass an all-zero permit.

For stETH/wstETH approvals or permits, allow an additional `10 wei` to account for rounding. Any excess ETH sent to `addValidatorKeysETH` remains credited to the Node Operator's bond.

Before submitting, verify the Node Operator ID, Manager Address, `keysCount`, batch ordering, withdrawal credentials, signatures, and required bond.

After confirmation, verify the added-key count and submitted keys using the `CuratedModule` read functions.

#### Remove undeposited keys

**Contract:** `CuratedModule` · **Caller:** Manager Address

`removeKeys` removes validator keys that have not been deposited.

```solidity
function getSigningKeys(
    uint256 nodeOperatorId,
    uint256 startIndex,
    uint256 keysCount
) external view returns (bytes memory keys);

function removeKeys(
    uint256 nodeOperatorId,
    uint256 startIndex,
    uint256 keysCount
) external;
```

Read the current keys before submitting the removal. Key indices can change after each removal, so do not reuse previously fetched indices.

### Operator configuration

#### Configure Rewards Splitter

**Contract:** `Accounting` · **Caller:** Manager Address

The Rewards Splitter is optional and applies only to Node Operator rewards, not bond rebase rewards. Shares are expressed in basis points (`10_000` = 100%); any remainder stays in the Node Operator's bond.

```solidity
struct FeeSplit {
    address recipient;
    uint256 share; // basis points
}

function updateFeeSplits(
    uint256 nodeOperatorId,
    FeeSplit[] calldata feeSplits,
    uint256 cumulativeFeeShares,
    bytes32[] calldata rewardsProof
) external;
```

Review the NatSpec for `Accounting.updateFeeSplits` before changing an existing configuration, particularly when undistributed rewards exist.

:::warning
Review recipient addresses and shares carefully before setting the initial configuration.

If the Node Operator has not yet received rewards, an initial configuration may not be changeable until the first rewards are distributed.
:::

#### Set a Rewards Claimer

**Contract:** `Accounting` · **Caller:** Manager Address

A Rewards Claimer is an optional address that can trigger reward claims without receiving or redirecting the funds.

```solidity
function setCustomRewardsClaimer(
    uint256 nodeOperatorId,
    address rewardsClaimer
) external;

function getCustomRewardsClaimer(
    uint256 nodeOperatorId
) external view returns (address);
```

After confirmation, verify the configured address with `getCustomRewardsClaimer`.

#### Update metadata

**Contract:** `MetaRegistry` · **Caller:** Manager Address

Update the Node Operator name and description with:

```solidity
function setOperatorMetadataAsOwner(
    uint256 nodeOperatorId,
    string calldata name,
    string calldata description
) external;
```

This only updates the operator metadata; it does not change the Node Operator type, bond curve, or role addresses.

#### Create a Node Operator

**Contract:** `CuratedGate` · **Caller:** eligible address

Use the gate assigned to the Node Operator type during onboarding. The eligible address must provide a valid Merkle proof and send the transaction.

Find the current Entry Gate address here for [Mainnet](/deployed-contracts/#curated-module-v2) or [Hoodi](/deployed-contracts/hoodi/#curated-module-v2).

Prepare the current proof, the Manager and Rewards addresses, and the operator name and description.

```solidity
function isConsumed(address member) external view returns (bool);
function verifyProof(address member, bytes32[] calldata proof) external view returns (bool);
function treeCid() external view returns (string memory);

function createNodeOperator(
    string calldata name,
    string calldata description,
    address managerAddress,
    address rewardAddress,
    bytes32[] calldata proof
) external returns (uint256 nodeOperatorId);
```

Generate the proof outside Etherscan from the current tree published by the same gate. The eligible address must send the transaction.

After confirmation, obtain the new `nodeOperatorId` from the `NodeOperatorAdded` event in the transaction logs. Then verify the addresses, metadata, type/bond curve, and that eligibility was consumed.

:::info
Creation does not make the Node Operator eligible for deposits. The Curated Module Committee must add it to an Operator Group and assign allocation through the applicable governance flow.
:::

---

## Operations quick reference

Use this table to identify the contract, required caller, and key requirements for each operation.

| Operation | Contract | Caller | Key requirement |
| --- | --- | --- | --- |
| Create Node Operator | `CuratedGate` | Eligible address | Gate Merkle proof |
| Add bond | `Accounting` | Anyone | ETH or token approval/permit |
| Add validator keys | `CuratedModule` | Manager | Deposit data + sufficient bond |
| Remove undeposited keys | `CuratedModule` | Manager | Current key indices |
| Claim rewards / excess bond | `Accounting` | Manager, Rewards Address, or Rewards Claimer | Rewards proof when claiming rewards |
| Change Manager | `CuratedModule` | Current + proposed Manager | Two-step change |
| Change Rewards Address | `CuratedModule` | Manager, or current + proposed Rewards Address | Direct or two-step |
| Set Rewards Claimer | `Accounting` | Manager | Claimer address |
| Configure Rewards Splitter | `Accounting` | Manager | Recipients + BPS shares |
| Update metadata | `MetaRegistry` | Manager | Name + description |
| Compensate delayed penalty | `CuratedModule` | Manager | Active penalty + sufficient bond |

---

## Before a Mainnet write

Before submitting a transaction on Mainnet:

- Confirm the network, current contract address, and required caller.
- Refresh state-dependent inputs such as bond requirements, key indices, allowances, and Merkle proofs.
- Review the destination, function arguments, and ETH/token amount.
- Simulate the exact call when possible.
- After confirmation, verify the affected on-chain state.

For validator key uploads, also follow the checks described in [Add validator keys](#add-validator-keys).

Test the flow on Hoodi first when practical.

:::warning
Uploading validator keys directly through Etherscan is not recommended: the inputs must be prepared manually, and Etherscan does not validate the validator data. Use the [CMv2 widget](https://cm.lido.fi/) or validated custom tooling whenever possible.
:::
