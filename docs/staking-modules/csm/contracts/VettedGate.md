# VettedGate

- [Source code](https://github.com/lidofinance/community-staking-module/blob/v2.0/src/VettedGate.sol)
- [Deployed contract](https://etherscan.io/address/0xB314D4A76C457c93150d308787939063F4Cc67E0)

`VettedGate.sol` is a supplementary contract that enables Node Operator creation for the vetted addresses, which serves as an entry point to `CSModule.sol`. Alongside Node Operator creation, a contract can assign a custom Node Operator type (bondCurveId) in `CSAccounting.sol`. Deployed using `VettedGateFactory.sol` to allow plugging of the new instances later without additional code security audits. The list of the vetted participants is upgradable for each instance of the `VettedGate.sol` individually.

## Upgradability

The contract uses [OssifiableProxy](contracts/ossifiable-proxy.md) for upgradability.

## State Variables

### PAUSE_ROLE

```solidity
bytes32 public constant PAUSE_ROLE = keccak256("PAUSE_ROLE");
```

### RESUME_ROLE

```solidity
bytes32 public constant RESUME_ROLE = keccak256("RESUME_ROLE");
```

### RECOVERER_ROLE

```solidity
bytes32 public constant RECOVERER_ROLE = keccak256("RECOVERER_ROLE");
```

### SET_TREE_ROLE

```solidity
bytes32 public constant SET_TREE_ROLE = keccak256("SET_TREE_ROLE");
```

### START_REFERRAL_SEASON_ROLE

```solidity
bytes32 public constant START_REFERRAL_SEASON_ROLE = keccak256("START_REFERRAL_SEASON_ROLE");
```

### END_REFERRAL_SEASON_ROLE

```solidity
bytes32 public constant END_REFERRAL_SEASON_ROLE = keccak256("END_REFERRAL_SEASON_ROLE");
```

### MODULE

_Address of the Staking Module_

```solidity
ICSModule public immutable MODULE;
```

### ACCOUNTING

_Address of the CS Accounting_

```solidity
ICSAccounting public immutable ACCOUNTING;
```

### curveId

_Id of the bond curve to be assigned for the eligible members_

```solidity
uint256 public curveId;
```

### treeRoot

_Root of the eligible members Merkle Tree_

```solidity
bytes32 public treeRoot;
```

### treeCid

_CID of the eligible members Merkle Tree_

```solidity
string public treeCid;
```

### isReferralProgramSeasonActive

Optional referral program ///

```solidity
bool public isReferralProgramSeasonActive;
```

### referralProgramSeasonNumber

```solidity
uint256 public referralProgramSeasonNumber;
```

### referralCurveId

_Id of the bond curve for referral program_

```solidity
uint256 public referralCurveId;
```

### referralsThreshold

_Number of referrals required for bond curve claim_

```solidity
uint256 public referralsThreshold;
```

## Functions

### resume

Resume the contract

```solidity
function resume() external onlyRole(RESUME_ROLE);
```

### pauseFor

Pause the contract for a given duration
Pausing the contract prevent creating new node operators using VettedGate
and claiming beneficial curve for the existing ones

```solidity
function pauseFor(uint256 duration) external onlyRole(PAUSE_ROLE);
```

**Parameters**

| Name       | Type      | Description           |
| ---------- | --------- | --------------------- |
| `duration` | `uint256` | Duration of the pause |

### startNewReferralProgramSeason

Start referral program season

```solidity
function startNewReferralProgramSeason(uint256 _referralCurveId, uint256 _referralsThreshold)
    external
    onlyRole(START_REFERRAL_SEASON_ROLE)
    returns (uint256 season);
```

**Parameters**

| Name                  | Type      | Description                                                   |
| --------------------- | --------- | ------------------------------------------------------------- |
| `_referralCurveId`    | `uint256` | Curve Id for the referral curve                               |
| `_referralsThreshold` | `uint256` | Minimum number of referrals to be eligible to claim the curve |

**Returns**

| Name     | Type      | Description              |
| -------- | --------- | ------------------------ |
| `season` | `uint256` | Id of the started season |

### endCurrentReferralProgramSeason

End referral program season

```solidity
function endCurrentReferralProgramSeason() external onlyRole(END_REFERRAL_SEASON_ROLE);
```

### addNodeOperatorETH

Add a new Node Operator using ETH as a bond.
At least one deposit data and corresponding bond should be provided

```solidity
function addNodeOperatorETH(
    uint256 keysCount,
    bytes calldata publicKeys,
    bytes calldata signatures,
    NodeOperatorManagementProperties calldata managementProperties,
    bytes32[] calldata proof,
    address referrer
) external payable whenResumed returns (uint256 nodeOperatorId);
```

**Parameters**

| Name                   | Type                               | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| ---------------------- | ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `keysCount`            | `uint256`                          | Signing keys count                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| `publicKeys`           | `bytes`                            | Public keys to submit                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| `signatures`           | `bytes`                            | Signatures of `(deposit_message_root, domain)` tuples https://github.com/ethereum/consensus-specs/blob/v1.4.0/specs/phase0/beacon-chain.md#signingdata                                                                                                                                                                                                                                                                                                               |
| `managementProperties` | `NodeOperatorManagementProperties` | Optional. Management properties to be used for the Node Operator. managerAddress: Used as `managerAddress` for the Node Operator. If not passed `msg.sender` will be used. rewardAddress: Used as `rewardAddress` for the Node Operator. If not passed `msg.sender` will be used. extendedManagerPermissions: Flag indicating that `managerAddress` will be able to change `rewardAddress`. If set to true `resetNodeOperatorManagerAddress` method will be disabled |
| `proof`                | `bytes32[]`                        | Merkle proof of the sender being eligible to join via the gate                                                                                                                                                                                                                                                                                                                                                                                                       |
| `referrer`             | `address`                          | Optional. Referrer address. Should be passed when Node Operator is created using partners integration                                                                                                                                                                                                                                                                                                                                                                |

**Returns**

| Name             | Type      | Description                     |
| ---------------- | --------- | ------------------------------- |
| `nodeOperatorId` | `uint256` | Id of the created Node Operator |

### addNodeOperatorStETH

Add a new Node Operator using stETH as a bond.
At least one deposit data and corresponding bond should be provided

```solidity
function addNodeOperatorStETH(
    uint256 keysCount,
    bytes calldata publicKeys,
    bytes calldata signatures,
    NodeOperatorManagementProperties calldata managementProperties,
    ICSAccounting.PermitInput calldata permit,
    bytes32[] calldata proof,
    address referrer
) external whenResumed returns (uint256 nodeOperatorId);
```

**Parameters**

| Name                   | Type                               | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| ---------------------- | ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `keysCount`            | `uint256`                          | Signing keys count                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| `publicKeys`           | `bytes`                            | Public keys to submit                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| `signatures`           | `bytes`                            | Signatures of `(deposit_message_root, domain)` tuples https://github.com/ethereum/consensus-specs/blob/v1.4.0/specs/phase0/beacon-chain.md#signingdata                                                                                                                                                                                                                                                                                                               |
| `managementProperties` | `NodeOperatorManagementProperties` | Optional. Management properties to be used for the Node Operator. managerAddress: Used as `managerAddress` for the Node Operator. If not passed `msg.sender` will be used. rewardAddress: Used as `rewardAddress` for the Node Operator. If not passed `msg.sender` will be used. extendedManagerPermissions: Flag indicating that `managerAddress` will be able to change `rewardAddress`. If set to true `resetNodeOperatorManagerAddress` method will be disabled |
| `permit`               | `ICSAccounting.PermitInput`        | Optional. Permit to use stETH as bond                                                                                                                                                                                                                                                                                                                                                                                                                                |
| `proof`                | `bytes32[]`                        | Merkle proof of the sender being eligible to join via the gate                                                                                                                                                                                                                                                                                                                                                                                                       |
| `referrer`             | `address`                          | Optional. Referrer address. Should be passed when Node Operator is created using partners integration                                                                                                                                                                                                                                                                                                                                                                |

**Returns**

| Name             | Type      | Description                     |
| ---------------- | --------- | ------------------------------- |
| `nodeOperatorId` | `uint256` | Id of the created Node Operator |

### addNodeOperatorWstETH

Add a new Node Operator using wstETH as a bond.
At least one deposit data and corresponding bond should be provided

```solidity
function addNodeOperatorWstETH(
    uint256 keysCount,
    bytes calldata publicKeys,
    bytes calldata signatures,
    NodeOperatorManagementProperties calldata managementProperties,
    ICSAccounting.PermitInput calldata permit,
    bytes32[] calldata proof,
    address referrer
) external whenResumed returns (uint256 nodeOperatorId);
```

**Parameters**

| Name                   | Type                               | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| ---------------------- | ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `keysCount`            | `uint256`                          | Signing keys count                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| `publicKeys`           | `bytes`                            | Public keys to submit                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| `signatures`           | `bytes`                            | Signatures of `(deposit_message_root, domain)` tuples https://github.com/ethereum/consensus-specs/blob/v1.4.0/specs/phase0/beacon-chain.md#signingdata                                                                                                                                                                                                                                                                                                               |
| `managementProperties` | `NodeOperatorManagementProperties` | Optional. Management properties to be used for the Node Operator. managerAddress: Used as `managerAddress` for the Node Operator. If not passed `msg.sender` will be used. rewardAddress: Used as `rewardAddress` for the Node Operator. If not passed `msg.sender` will be used. extendedManagerPermissions: Flag indicating that `managerAddress` will be able to change `rewardAddress`. If set to true `resetNodeOperatorManagerAddress` method will be disabled |
| `permit`               | `ICSAccounting.PermitInput`        | Optional. Permit to use wstETH as bond                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `proof`                | `bytes32[]`                        | Merkle proof of the sender being eligible to join via the gate                                                                                                                                                                                                                                                                                                                                                                                                       |
| `referrer`             | `address`                          | Optional. Referrer address. Should be passed when Node Operator is created using partners integration                                                                                                                                                                                                                                                                                                                                                                |

**Returns**

| Name             | Type      | Description                     |
| ---------------- | --------- | ------------------------------- |
| `nodeOperatorId` | `uint256` | Id of the created Node Operator |

### claimBondCurve

Claim the bond curve for the eligible Node Operator

_Should be called by the reward address of the Node Operator
In case of the extended manager permissions, should be called by the manager address_

```solidity
function claimBondCurve(uint256 nodeOperatorId, bytes32[] calldata proof) external whenResumed;
```

**Parameters**

| Name             | Type        | Description                                                    |
| ---------------- | ----------- | -------------------------------------------------------------- |
| `nodeOperatorId` | `uint256`   | Id of the Node Operator                                        |
| `proof`          | `bytes32[]` | Merkle proof of the sender being eligible to join via the gate |

### claimReferrerBondCurve

Claim the referral program bond curve for the eligible Node Operator

```solidity
function claimReferrerBondCurve(uint256 nodeOperatorId, bytes32[] calldata proof) external whenResumed;
```

**Parameters**

| Name             | Type        | Description                                                    |
| ---------------- | ----------- | -------------------------------------------------------------- |
| `nodeOperatorId` | `uint256`   | Id of the Node Operator                                        |
| `proof`          | `bytes32[]` | Merkle proof of the sender being eligible to join via the gate |

### setTreeParams

Set the root of the eligible members Merkle Tree

```solidity
function setTreeParams(bytes32 _treeRoot, string calldata _treeCid) external onlyRole(SET_TREE_ROLE);
```

**Parameters**

| Name        | Type      | Description                 |
| ----------- | --------- | --------------------------- |
| `_treeRoot` | `bytes32` | New root of the Merkle Tree |
| `_treeCid`  | `string`  | New CID of the Merkle Tree  |

### getReferralsCount

Get the number of referrals for the given referrer in the current or last season

```solidity
function getReferralsCount(address referrer) external view returns (uint256);
```

**Parameters**

| Name       | Type      | Description      |
| ---------- | --------- | ---------------- |
| `referrer` | `address` | Referrer address |

**Returns**

| Name     | Type      | Description                                                              |
| -------- | --------- | ------------------------------------------------------------------------ |
| `<none>` | `uint256` | Number of referrals for the given referrer in the current or last season |

### getReferralsCount

Get the number of referrals for the given referrer in the current or last season

```solidity
function getReferralsCount(address referrer, uint256 season) external view returns (uint256);
```

**Parameters**

| Name       | Type      | Description      |
| ---------- | --------- | ---------------- |
| `referrer` | `address` | Referrer address |
| `season`   | `uint256` |                  |

**Returns**

| Name     | Type      | Description                                                              |
| -------- | --------- | ------------------------------------------------------------------------ |
| `<none>` | `uint256` | Number of referrals for the given referrer in the current or last season |

### getInitializedVersion

Returns the initialized version of the contract

```solidity
function getInitializedVersion() external view returns (uint64);
```

### isReferrerConsumed

Check if the address has already consumed referral program bond curve

```solidity
function isReferrerConsumed(address referrer) external view returns (bool);
```

**Parameters**

| Name       | Type      | Description      |
| ---------- | --------- | ---------------- |
| `referrer` | `address` | Address to check |

**Returns**

| Name     | Type   | Description   |
| -------- | ------ | ------------- |
| `<none>` | `bool` | Consumed flag |

### isConsumed

Check if the address has already consumed the curve

```solidity
function isConsumed(address member) public view returns (bool);
```

**Parameters**

| Name     | Type      | Description      |
| -------- | --------- | ---------------- |
| `member` | `address` | Address to check |

**Returns**

| Name     | Type   | Description   |
| -------- | ------ | ------------- |
| `<none>` | `bool` | Consumed flag |

### verifyProof

Check is the address is eligible to consume beneficial curve

```solidity
function verifyProof(address member, bytes32[] calldata proof) public view returns (bool);
```

**Parameters**

| Name     | Type        | Description                                      |
| -------- | ----------- | ------------------------------------------------ |
| `member` | `address`   | Address to check                                 |
| `proof`  | `bytes32[]` | Merkle proof of the beneficial curve eligibility |

**Returns**

| Name     | Type   | Description                               |
| -------- | ------ | ----------------------------------------- |
| `<none>` | `bool` | Boolean flag if the proof is valid or not |

### hashLeaf

Get a hash of a leaf in the Merkle tree

_Double hash the leaf to prevent second preimage attacks_

```solidity
function hashLeaf(address member) public pure returns (bytes32);
```

**Parameters**

| Name     | Type      | Description             |
| -------- | --------- | ----------------------- |
| `member` | `address` | eligible member address |

**Returns**

| Name     | Type      | Description      |
| -------- | --------- | ---------------- |
| `<none>` | `bytes32` | Hash of the leaf |

## Events

### TreeSet

```solidity
event TreeSet(bytes32 indexed treeRoot, string treeCid);
```

### Consumed

```solidity
event Consumed(address indexed member);
```

### ReferrerConsumed

```solidity
event ReferrerConsumed(address indexed referrer, uint256 indexed season);
```

### ReferralProgramSeasonStarted

```solidity
event ReferralProgramSeasonStarted(uint256 indexed season, uint256 referralCurveId, uint256 referralsThreshold);
```

### ReferralProgramSeasonEnded

```solidity
event ReferralProgramSeasonEnded(uint256 indexed season);
```

### ReferralRecorded

```solidity
event ReferralRecorded(address indexed referrer, uint256 indexed season, uint256 indexed referralNodeOperatorId);
```
