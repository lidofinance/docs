# EIP712StETH

- [Source code](https://github.com/lidofinance/lido-dao/blob/develop/contracts/0.8.9/EIP712StETH.sol)
- [Deployed contract](https://etherscan.io/address/0x8F73e4C2A6D852bb4ab2A45E6a9CF5715b3228B7)

EIP712StETH is a special helper contract for `stETH` that enables support
for [ERC-2612 compliant signed approvals](https://eips.ethereum.org/EIPS/eip-2612).

The contract is responsible for permit signatures checking and enforcing.
