# EIP712StETH

- [Source code](https://github.com/lidofinance/lido-dao/blob/master/contracts/0.8.9/EIP712StETH.sol)
- [Deployed contract](https://etherscan.io/address/0x8F73e4C2A6D852bb4ab2A45E6a9CF5715b3228B7)

`EIP712StETH` is a special helper contract for `stETH` that is required to fully support
 [ERC-2612 compliant signed approvals](https://eips.ethereum.org/EIPS/eip-2612).

## Why helper

The original [`Lido/StETH`](/contracts/lido) contract is implemented in Solidity `0.4.24` while this helper is
implemented in Solidity `0.8.9`. A newer compiler version allows accessing the current network's chain id
(via the [`block.chainid`](https://docs.soliditylang.org/en/v0.8.9/units-and-global-variables.html#block-and-transaction-properties)
globally available variable). The latter is required by [EIP-155](https://eips.ethereum.org/EIPS/eip-155) to
prevent replay attacks (i.e., an attacker captures a valid network transmission and then retransmits it on another network fork,
for example, using a valid testnet signature on mainnet later). Finally, the `EIP-155` compliance is required to secure the `ERC-2612` signed approvals.

## View methods

### domainSeparatorV4()

Returns the EIP712-compatible hashed [domain separator](https://eips.ethereum.org/EIPS/eip-712#definition-of-domainseparator)
which is valid for the `stETH` token permit signatures. The domain separator helps to prevent a signature meant for one dApp
from working in another (i.e., prevents a signature collision in a broad sense).

```sol
function domainSeparatorV4(address _stETH) returns (bytes32)
```

See also the [`eip712Domain()`](/contracts/eip712-steth#eip712domain) method that can be used to construct a domain separator
from the `StETH`-specific fields on the client's side (e.g., inside a dApp or a wallet).

### hashTypedDataV4()

Returns the hash of a fully encoded EIP712-compatible message for this domain.
The method can be used to validate the input data against the provided `v, r, s` secp256k1 components.

```sol
function hashTypedDataV4(address _stETH, bytes32 _structHash) returns (bytes32)
```

#### Parameters

| Name            | Type      | Description                            |
| --------------- | --------- | -------------------------------------- |
| `_stETH`        | `address` | Address of the deployed `stETH` token  |
| `_structHash`   | `bytes32` | Address of the deployed `stETH` token  |

See the [StETHPermit.permit()](https://github.com/lidofinance/lido-dao/blob/master/contracts/0.4.24/StETHPermit.sol#L99-L112)
implementation for a particular use case.

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

## Useful external links

- [The Magic of Digital Signatures on Ethereum](https://medium.com/mycrypto/the-magic-of-digital-signatures-on-ethereum-98fe184dc9c7)
- [ERC-2612: The Ultimate Guide to Gasless ERC-20 Approvals](https://medium.com/frak-defi/erc-2612-the-ultimate-guide-to-gasless-erc-20-approvals-2cd32ddee534)
