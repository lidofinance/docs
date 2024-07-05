# InsuranceFund

- [Source code](https://github.com/lidofinance/insurance-fund/blob/main/contracts/InsuranceFund.sol)
- [Deployed contract](https://etherscan.io/address/0x8B3f33234ABD88493c0Cd28De33D583B70beDe35)
- [LIP-18](https://github.com/lidofinance/lido-improvement-proposals/blob/develop/LIPS/lip-18.md)

The Lido Insurance Fund is a vault contract that serves as a simple transparent store for funds allocated for self-insurance purposes.

## Mechanics

The Insurance Fund is a simple vault that inherits OpenZeppelin's [Ownable](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v4.7.3/contracts/access/Ownable.sol) and allows the owner to transfer ether, ERC20, ERC721, ERC1155 tokens from the contract. The owner, which will the Lido DAO Agent, can transfer ownership to another entity with an exception of [zero address](https://etherscan.io/address/0x0000000000000000000000000000000000000000).

## View methods

### owner()

Returns the current `owner`.

```solidity
function owner() public view returns (address);
```


### renounceOwnership()

Reverts always.

```solidity
function renounceOwnership() public pure override;
```


## Methods

### transferERC1155()

Transfer a single ERC1155 token with the specified id in the specified amount to an entity from the contract balance. A contract recipient must implement `ERC1155TokenReceiver` in accordance to [EIP-1155](https://eips.ethereum.org/EIPS/eip-1155) in order to safely receive tokens.
- reverts if `msg.sender` is not `owner`;
- reverts if `_recipient` is zero address;
- reverts if the contract balance is insufficient;
- emits `ERC721Transferred(address indexed _token, address indexed _recipient, uint256 _tokenId, bytes _data)`.

```solidity
function transferERC1155(address _token, address _recipient, uint256 _tokenId, uint256 _amount, bytes calldata _data) external;
```

#### Parameters

| Name         | Type      | Description      |
| ------------ | --------- | ---------------- |
| `_token`     | `address` | an ERC1155 token  |
| `_recipient` | `address` | recipient entity |
| `_tokenId`   | `uint256` | token identifier |
| `_amount`    | `uint256` | transfer amount  |
| `_data`      | `bytes`   | byte sequence for `onERC1155Received` hook  |

:::info
Note: `transferERC1155` does not support multi-token batch transfers.
:::

### transferERC20()

Transfer an ERC20 token to an entity in the specified amount from the contract balance.
- reverts if `msg.sender` is not `owner`;
- reverts if `_recipient` is zero address;
- reverts if the contract balance is insufficient;
- emits `ERC20Transferred(address indexed _token, address indexed _recipient, uint256 _amount)`.

```solidity
function transferERC20(address _token, address _recipient, uint256 _amount) external;
```

#### Parameters

| Name         | Type      | Description      |
| ------------ | --------- | ---------------- |
| `_token`     | `address` | an ERC20 token   |
| `_recipient` | `address` | recipient entity |
| `_amount`    | `uint256` | transfer amount  |

### transferERC721()

Transfer a single ERC721 token with the specified id to an entity from the contract balance. A contract recipient must implement `ERC721TokenReceiver` in accordance to [EIP-721](https://eips.ethereum.org/EIPS/eip-721) in order to safely receive tokens.
- reverts if `msg.sender` is not `owner`;
- reverts if `_recipient` is zero address;
- emits `ERC721Transferred(address indexed _token, address indexed _recipient, uint256 _tokenId, bytes _data)`.

```solidity
function transferERC721(address _token, address _recipient, uint256 _tokenId, bytes memory _data) external;
```

#### Parameters

| Name         | Type      | Description      |
| ------------ | --------- | ---------------- |
| `_token`     | `address` | an ERC721 token  |
| `_recipient` | `address` | recipient entity |
| `_tokenId`   | `uint256` | token identifier |
| `_data`      | `bytes`   | byte sequence for `onERC721Received` hook  |

### transferEther()

Transfers ether to an entity from the contract balance.
- reverts if `msg.sender` is not `owner`;
- reverts if `_recipient` is zero address;
- reverts if the contract balance is insufficient;
- reverts if the actual transfer OP fails (e.g. `_recipient` is a contract with no fallback);
- emits `EtherTransferred(address indexed _recipient, uint256 _amount)`.

```solidity
function transferEther(address _recipient, uint256 _amount) external;
```

#### Parameters

| Name         | Type      | Description      |
| ------------ | --------- | ---------------- |
| `_recipient` | `address` | recipient entity |
| `_amount`    | `uint256` | transfer amount |

### transferOwnership()

Assigns `newOwner` as the `owner`.

- reverts if `msg.sender` is not `owner`;
- reverts if `newOwner` is zero address;
- emits `emit OwnershipTransferred(address indexed previousOwner, address indexed newOwner)`.

```solidity
function transferOwnership(address newOwner) public;
```

#### Parameters

| Name       | Type      | Description |
| --------   | --------  | -------- |
| `newOwner` | `address` | entity which will have access to all state-mutating operations |
