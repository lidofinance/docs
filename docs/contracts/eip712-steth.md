# EIP712StETH

- [Source code](https://github.com/lidofinance/lido-dao/blob/master/contracts/0.8.9/EIP712StETH.sol)
- [Deployed contract](https://etherscan.io/address/0x8F73e4C2A6D852bb4ab2A45E6a9CF5715b3228B7)

EIP712StETH is a special helper contract for `stETH` that enables support
for [ERC-2612 compliant signed approvals](https://eips.ethereum.org/EIPS/eip-2612).

The contract is responsible for the permit signatures preparation.

## View methods

### domainSeparatorV4()

Returns the domain separator to build a EIP712-compatible signature for the stETH token.

```sol
function domainSeparatorV4(address _stETH) returns (bytes32)
```

### hashTypedDataV4()

Returns the hash of a fully encoded EIP712-compatible message for this domain.

```sol
function hashTypedDataV4(address _stETH, bytes32 _structHash) returns (bytes32)
```

#### Parameters

| Name            | Type      | Description                            |
| --------------- | --------- | -------------------------------------- |
| `_stETH`        | `address` | Address of the deployed `stETH` token  |
| `_structHash`   | `bytes32` | Address of the deployed `stETH` token  |

### eip712Domain()

Returns the fields and values required to build a domain separator on the client's side.

The method is akin the proposed one in [ERC-5267](https://eips.ethereum.org/EIPS/eip-5267) with a difference of not returning the unused fields at all.

```sol
function eip712Domain(address _stETH) returns (
    string memory name,
    string memory version,
    uint256 chainId,
    address verifyingContract
)
```

#### Parameters

| Name       | Type      | Description                            |
| ---------- | --------- | -------------------------------------- |
| `_stETH`   | `address` | Address of the deployed `stETH` token  |

#### Returns

| Name              | Type       | Description                   |
| ----------------- | ---------- | ----------------------------- |
| `name`            | `string`   | name of the token             |
| `version`         | `string`   | version of the token          |
| `chainId`         | `uint256`  | chain identifier              |
| `verifyContract`  | `address`  | address of the token contract |

:::note
If the proper `_stETH` [deployed](/deployed-contracts) address passed then returns:

- ("Liquid staked Ether 2.0", "2", 1, 0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84) for Mainnet.
- ("Liquid staked Ether 2.0", "2", 5, 0x1643E812aE58766192Cf7D2Cf9567dF2C37e9B7F) for Görli.
:::

The method is supposed to be used on the client's (e.g. wallet or widget) side facilitating a domain separator construction:

```js
function makeDomainSeparator(name, version, chainId, verifyingContract) {
  return web3.utils.keccak256(
    web3.eth.abi.encodeParameters(
      ['bytes32', 'bytes32', 'bytes32', 'uint256', 'address'],
      [
        web3.utils.keccak256('EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)'),
        web3.utils.keccak256(name),
        web3.utils.keccak256(version),
        chainId,
        verifyingContract,
      ]
    )
  )
}
```
