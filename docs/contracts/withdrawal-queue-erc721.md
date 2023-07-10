# WithdrawalQueueERC721

- [Source code](https://github.com/lidofinance/lido-dao/blob/master/contracts/0.8.9/WithdrawalQueueERC721.sol)
- [Deployed contract](https://etherscan.io/address/0x889edC2eDab5f40e902b864aD4d7AdE8E412F9B1)

A FIFO queue for the `stETH` withdrawal requests and an `unstETH` NFT representing the position in the queue.

Access to lever methods is restricted using the functionality of the
[AccessControlEnumerable](https://github.com/lidofinance/lido-dao/blob/master/contracts/0.8.9/utils/access/AccessControlEnumerable.sol)
contract and a bunch of [granular roles](#roles).

## What is WithdrawalQueueERC721?

This contract is a main entry point to exchange `stETH` for underlying ether directly from the pool. It is responsible for:

- managing a queue of withdrawal requests
- committing withdrawal request finalization as a part of the [AccountingOracle](./accounting-oracle.md) report
- storing `stETH` before and ether after the finalization
- transfer reserved ether to the user upon the claim

Also, the contract is [ERC-721](https://eips.ethereum.org/EIPS/eip-721) NFT with metadata extension representing the right to claim underlying ether once the request is finalized. This NFT is minted upon request and burned on the claim. The [ERC-4906](https://eips.ethereum.org/EIPS/eip-4906) is used to update the metadata as soon as the finalization status of the request is changed.

## Request

To request a withdrawal, one needs to approve the amount of `stETH` or `wstETH` to this contract, sign the [ERC-2612 Permit](https://eips.ethereum.org/EIPS/eip-2612), and then call the appropriate `requestWithdrawals*` method.

The **minimal** amount for a request is `100 wei`, and the **maximum** is `1000 eth`. More significant amounts should be split into several requests, which allows us to avoid clogging the queue with an extra large request.

During this call, the request is placed in the queue, and the related `unstETH` NFT is minted. The following structure represents the request:

```sol
struct WithdrawalRequestStatus {
    uint256 amountOfStETH;
    uint256 amountOfShares;
    address owner;
    uint256 timestamp;
    bool isFinalized;
    bool isClaimed;
}
```

where

- **`amountOfStETH`** — the number of `stETH` tokens transferred to the contract upon request
- **`amountOfShares`** — the number of underlying shares corresponding to transferred `stETH` tokens. See [Lido rebasing chapter](lido.md#rebase) to learn about the shares mechanic
- **`owner`** — the owner's address for this request. The owner is also a holder of the `unstETH` NFT and can transfer the ownership and claim the underlying ether once finalized
- **`timestamp`** — the creation time of the request
- **`isFinalized`** — finalization status of the request; finalized requests are available to claim
- **`isClaimed`** — the claim status of the request. Once claimed, NFT is burned, and the request is not available to claim again

:::note

The `stETH`, once requested for withdrawal and transferred to this contract, stops accruing rewards, so the amount of ether to claim will not be greater than the amount of `stETH` on the withdrawal request. Moreover, it can be reduced during the finalization.

:::

## Finalization

After filing a withdrawal request, one can only claim it once finalization occurs.
[Accounting Oracle](./accounting-oracle.md) report finalizes a batch of withdrawal requests from the queue if the following conditions are met:

- There is enough ether to fulfill the request. Ether can be obtained from the Lido buffer, which is filled from the new users' stake, Beacon chain partial and full withdrawals, protocol tips, and MEV rewards. Withdrawals are prioritized over deposits, so ether can't be deposited to the Beacon chain if some withdrawal requests can be fulfilled.
- Some amount of time has passed since
- To check that there was no massive loss for the protocol on the Beacon chain side in the period when the withdrawal request was filed. If there was and its size exceeds the daily protocol earning (extremely rare situation), the request value can be discounted proportionally to reflect this loss.

:::note

So, to put it simply. Token holders don't receive rewards but still take risks during withdrawal. Rewards are burned upon the finalization, effectively distributing them among the other token holders.

:::

So, the finalization sets the final value of the request, locks ether on the balance of this contract, and burns the underlying `stETH`.

## Claim

When the request is finalized, it can be claimed by the current owner, transferring the reserved amount of ether to the recipient's address and burning the withdrawal NFT.

To see if the request is claimable, one can get its status using `getWithdrawalStatus()` or subscribe to the event `WithdrawalsFinalized(uint256 from, uint256 to, ...)`, which is emitted once the batch of requests with ids in the range `(from, to]` is finalized.

## `ERC-721`-related Methods

### name()

Returns the token collection name.

```sol
function name() view returns (string memory);
```

### symbol()

Returns the token collection symbol.

```sol
function symbol() view returns (string memory);
```

### tokenURI()

Returns the Uniform Resource Identifier (URI) for the `_requestId` token. Returns an empty string if no base URI and no `NFTDescriptor` address are set.

```sol
function tokenURI(uint256 _requestId) view returns (string memory);
```

### balanceOf()

Returns the number of tokens in the `_owner`'s account.

```sol
function balanceOf(address _owner) view returns (uint256 balance)
```

:::note

Reverts if `_owner` is zero address

:::

### ownerOf()

Returns the owner of the `_requestId` token.

```sol
function ownerOf(uint256 _requestId) view returns (address owner)
```

:::note

Requirements:
    - `_requestId` request must exist.
    - `_requestId` request must not be claimed.

:::

### approve()

Gives permission to `_to` to transfer the `_requestId` token to another account. The approval is cleared when the token is transferred.

Emits an `Approval` event.

```sol
function approve(address _to, uint256 _requestId)
```

:::note

Requirements:
    - The caller must own the token or be an approved operator.
    - `_requestId` must exist.
    - `_to` should not be the owner

:::

### getApproved()

Returns the account approved for the `_requestId` token.

```sol
function getApproved(uint256 _requestId) view returns (address)
```

:::note

Reverts if no `_requestId` exists

:::

### setApprovalForAll()

Approve or remove `_operator` as an operator for the caller. Operators can call `transferFrom` or `safeTransferFrom` for any token owned by the caller.

```sol
function setApprovalForAll(address _operator, bool _approved)
```

:::note

Reverts if `msg.sender` is equal to `_operator`

:::

### isApprovedForAll()

Returns `true` if the `_operator` is allowed to manage all of the assets of the `_owner`.

```sol
function isApprovedForAll(address _owner, address _operator) view returns (bool)
```

### safeTransferFrom()

Safely transfers the `_requestId` token from `_from` to `_to`, checking first that contract recipients are aware of the ERC721 protocol to prevent tokens from being forever locked.
If a version with `_data` parameter is used, it passed to `IERC721Receiver-onERC721Received()` of the target smart contract as an argument.

Emits a `Transfer` event.

```sol
function safeTransferFrom(address _from, address _to, uint256 _requestId)
function safeTransferFrom(address _from, address _to, uint256 _requestId, bytes memory _data)
```

:::note

Requirements:

- `_from` cannot be the zero address.
- `_to` cannot be the zero address.
- `_requestId` token must exist and be owned by `_from`.
- If the caller is not `_from`, it must be have been allowed to move this token by either `approve()` or `setApprovalForAll()`.
- If `_to` refers to a smart contract, it must implement `IERC721Receiver-onERC721Received()`, which is called upon a safe transfer.

:::

### transferFrom()

Transfers the `_requestId` token from `_from` to `_to`.

Emits a `Transfer` event.

**WARNING**: Usage of this method is discouraged, use {safeTransferFrom} whenever possible.

```sol
function transferFrom(address _from, address _to, uint256 _requestId)
```

:::note
Requirements:

- `_from` cannot be the zero address.
- `_to` cannot be the zero address.
- `_requestId` token must be owned by `_from`.
- If the caller is not `_from`, it must be approved to move this token by either `approve()` or `setApprovalForAll()`.
:::

### getBaseUri()

Returns the base URI for computing token URI. If set, the resulting URI for each token will be the concatenation of the base URI and the `_requestId`.

```sol
function getBaseURI() view returns (string memory)
```

### getNFTDescriptorAddress()

Returns the address of the `NFTDescriptor` contract responsible for the token URI generation.

```sol
function getNFTDescriptorAddress() view returns (address)
```

## `ERC-165`-related Methods

### supportsInterface()

Returns `true` if this contract implements the interface defined by `interfaceId`. See the [ERC-165](https://eips.ethereum.org/EIPS/eip-165#how-interfaces-are-identified) to learn more about how these ids are created.

```sol
function supportsInterface(bytes4 interfaceId) view returns (bool)
```

:::note

This contract returns `true` for `IERC721`, `IERC721Metadata`, `IERC4906`, `IAccessControlEnumerable`, `IAccessControl` and `IERC165` itself

:::

## Queue-related Methods

### requestWithdrawals()

### requestWithdrawalsWstETH()

### requestWithdrawalsWithPermit()

### requestWithdrawalsWstETHWithPermit()

### getWithdrawalRequests()

### getClaimableEther()

### getWithdrawalStatus()

### claimWithdrawalsTo()

### claimWithdrawals()

### claimWithdrawal()

### findCheckpointHints()

### isBunkerModeActive()

### bunkerModeSinceTimestamp()

### getLastRequestId()

### getLastFinalizedRequestId()

### getLockedEtherAmount()

### getLastCheckpointIndex()

### unfinalizedRequestNumber()

### unfinalizedStETH()

### calculateFinalizationBatches()

### prefinalize()

## Lever methods

### Roles

- **FINALIZE_ROLE** — role to finalize withdrawal requests in the queue
- **PAUSE_ROLE** — role to pause the withdrawal on the protocol
- **RESUME_ROLE** — role to resume the withdrawal after being paused
- **ORACLE_ROLE** — role to provide required oracle-related data as the last reprot timestamp adn if the protocol is in the bunker mode
- **MANAGE_TOKEN_URI_ROLE** — role to set the parameters for constructing the token URI: the base URI or `NFTDescriptor` address



### finalize()

Finalize requests from the last finalized one up to `_lastRequestIdToBeFinalized` using `_maxShareRate` as a base share rate for `stETH`and passing along some ether as `msg.value`. The amount of ether to send should be precalculated by the `prefinalize()` method.

Emits a `BatchMetadataUpdate` and a `WithdrawalsFinalized` events

```sol
function finalize(uint256 _lastRequestIdToBeFinalized, uint256 _maxShareRate) payable
```

:::note

Requirements:

- withdrawals must not be paused
- `msg.sender` must have the `FINALIZE_ROLE` assigned
- `_lastRequestIdToBeFinalized` must be an existing unfinalized request id
- `msg.value` must be less or equal to the sum of unfinalized `stETH` up to `_lastRequestIdToBeFinalized`

:::

### pauseFor()

Pause withdrawal requests placement and finalization for particular `_duration`. Claiming finalized requests will still be available.

Emits a `Paused` event.

```sol
function pauseFor(uint256 _duration) onlyRole(PAUSE_ROLE)
```

:::note

Requirements:

- `msg.sender` must have a `PAUSE_ROLE` assigned
- `_duration` must not be zero
- the contract must not be already paused

:::

### pauseUntil()

Pause withdrawal requests placement and finalization until `_pauseUntilInclusive` timestamp. Claiming finalized requests will still be available.

Emits a `Paused` event.

```sol
function pauseUntil(uint256 _pauseUntilInclusive) onlyRole(PAUSE_ROLE)
```

:::note

Requirements:

- `msg.sender` must have a `PAUSE_ROLE` assigned
- `_pauseUntilInclusive` must not be in the past
- the contract must not be already paused

:::

### resume()

Resumes withdrawal requests placement and finalization. The contract is deployed in a paused state and should be resumed explicitly.

Emits a `Resumed` event.

```sol
function resume()
```

:::note

Requirements:

- `msg.sender` must have a `RESUME_ROLE` assigned
- the contract must not be already resumed

:::

### onOracleReport()

Updates bunker mode state and last report timestamp.

Emits a `BunkerModeEnabled` or a `BunkerModeDisabled` event.

```sol
function onOracleReport(
    bool _isBunkerModeNow,
    uint256 _bunkerStartTimestamp,
    uint256 _currentReportTimestamp
)
```

:::note

Requirements:

- `msg.sender` must have a `ORACLE_ROLE` assigned
- all timestamps must be in the past

:::

### setBaseUri()

Sets the Base URI for computing token URI. It does not expect the ending slash in provided string.

If the `NFTDescriptor` address isn't set, the `baseURI` would be used for generating the `ERC-721` token URI. Otherwise, the `NFTDescriptor` address would be used as a first-priority method.

Emits a `BaseURISet` event

```sol
function setBaseURI(string calldata _baseURI) external onlyRole(MANAGE_TOKEN_URI_ROLE)
```

:::note

Reverts if `msg.sender` has no `MANAGE_TOKEN_URI_ROLE` assigned

:::

### setNFTDescriptorAddress()

Sets the address of the `NFTDescriptor` contract responsible for token URI generation.

If the `NFTDescriptor` address isn't set, the `baseURI` would be used for generating the `ERC-721` token URI. Otherwise, the `NFTDescriptor` address would be used as a first-priority method.

Emits a `NftDescriptorAddressSet` event.

```sol
function setNFTDescriptorAddress(address _nftDescriptorAddress) onlyRole(MANAGE_TOKEN_URI_ROLE)
```

The `NFTDescriptor` contract must support an `INFTDescriptor` interface, which is defined as follows:

```sol
interface INFTDescriptor {
  function constructTokenURI(uint256 _requestId) external view returns (string memory);
}
```

:::note

Reverts if `msg.sender` has no `MANAGE_TOKEN_URI_ROLE` assigned

:::
