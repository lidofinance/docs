# EIP712StETH

- [Source code](https://github.com/lidofinance/lido-dao/blob/master/contracts/0.8.9/EIP712StETH.sol)
- [Deployed contract](https://etherscan.io/address/0x8F73e4C2A6D852bb4ab2A45E6a9CF5715b3228B7)

`EIP712StETH` serves as a dedicated helper contract for `stETH`, crucial for complete support of [ERC-2612 compliant signed approvals](https://eips.ethereum.org/EIPS/eip-2612).

## Why This Helper Is Needed

The original [`Lido/StETH`](/contracts/lido) contract is implemented in Solidity `0.4.24`, while this helper is implemented in Solidity `0.8.9`. The newer compiler version enables access to the current network's chain id via the globally available variable [`block.chainid`](https://docs.soliditylang.org/en/v0.8.9/units-and-global-variables.html#block-and-transaction-properties). The chain id is mandatory for signature inclusion as per [EIP-155](https://eips.ethereum.org/EIPS/eip-155) to prevent replay attacks, wherein an attacker intercepts a valid network transmission and then rebroadcasts it on another network fork. Consequently, `EIP-155` compliance is critical for securing [`ERC-2612`](https://eips.ethereum.org/EIPS/eip-2612) signed approvals.

## View Methods

### domainSeparatorV4()

This method returns the `EIP712`-compatible hashed [domain separator](https://eips.ethereum.org/EIPS/eip-712#definition-of-domainseparator), which is valid for `stETH` token permit signatures. The domain separator is essential in preventing a signature intended for one dApp from functioning in another (thereby averting a signature collision in a broader sense).

```sol
function domainSeparatorV4(address _stETH) returns (bytes32)
```

Also, consider the [`eip712Domain()`](/contracts/eip712-steth#eip712domain) method that can construct a domain separator from `StETH`-specific fields on the client's side, such as within a dApp or a wallet. For instance, Metamask relies on [`eth_signTypedData_v4`](https://docs.metamask.io/wallet/how-to/sign-data/#use-eth_signtypeddata_v4), which requires a non-hashed domain separator being provided.

### hashTypedDataV4()

This method returns the hash of a fully encoded `EIP712`-compatible message for this domain. The method can validate the input data against the provided `v, r, s` secp256k1 components.

```sol
function hashTypedDataV4(address _stETH, bytes32 _structHash) returns (bytes32)
```

#### Parameters

| Name         | Type      | Description                           |
| ------------ | --------- | ------------------------------------- |
| `_stETH`     | `address` | Address of the deployed `stETH` token |
| `_structHash`| `bytes32` | Hash of the data structure            |

For a specific use case, see the [StETHPermit.permit()](https://github.com/lidofinance/lido-dao/blob/master/contracts/0.4.24/StETHPermit.sol#L99-L112) implementation.

### eip712Domain()

This method returns the fields and values necessary to construct a domain separator on the client's side. The method resembles the one proposed in [ERC-5267](https://eips.ethereum.org/EIPS/eip-5267), with the only difference being that it doesn't return unused fields.

```sol
function eip712Domain(address _stETH) returns (
    string memory name,
    string memory version,
    uint256 chainId,
    address verifyingContract
)
```

#### Parameters

| Name     | Type      | Description                           |
| -------- | --------- | ------------------------------------- |
| `_stETH` | `address` | Address of the deployed `stETH` token |

#### Returns

| Name              | Type       | Description                   |
| ----------------- | ---------- | ----------------------------- |
| `name`            | `string`   | Name of the token            |
| `version`         | `string`   | Version of the token         |
| `chainId`         | `uint256`  | Chain identifier             |
| `verifyingContract`| `address` | Address of the token contract |

:::note
Provided the correct `_stETH` [deployed](/deployed-contracts) address, it returns:

- ("Liquid staked Ether 2.0", "2", 1, 0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84) for Mainnet.
- ("Liquid staked Ether 2.0", "2", 5, 0x1643E812aE58766192Cf7D2Cf9567dF2C37e9B7F) for Görli.
:::

This method facilitates domain separator construction on the client's side, such as in a wallet or widget:

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

## Useful External Links

- [The Magic of Digital Signatures on Ethereum](https://medium.com/mycrypto/the-magic-of-digital-signatures-on-ethereum-98fe184dc9c7)
- [ERC-2612: The Ultimate Guide to Gasless ERC-20 Approvals](https://medium.com/frak-defi/erc-2612-the-ultimate-guide-to-gasless-erc-20-approvals-2cd32ddee534)
- [Metamask sign-data](https://docs.metamask.io/wallet/how-to/sign-data/#use-eth_signtypeddata_v4)
