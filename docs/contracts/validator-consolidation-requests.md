# ValidatorConsolidationRequests

- [Source code](https://github.com/lidofinance/core/blob/v3.0.0/contracts/0.8.25/vaults/ValidatorConsolidationRequests.sol)
- [Deployed contract](https://etherscan.io/address/0xaC4Aae7123248684C405A4b0038C1560EC7fE018)

Helper contract that builds calldata for validator consolidation requests and exposes the current consolidation fee.

## What is ValidatorConsolidationRequests?

This contract is used by the stVaults CLI to prepare consolidation requests (EIP-7251) with on-chain validation and fee calculation.

## View methods

### getConsolidationRequestsAndFeeExemptionEncodedCalls(...)

```solidity
function getConsolidationRequestsAndFeeExemptionEncodedCalls(
    bytes[] calldata _sourcePubkeys,
    bytes[] calldata _targetPubkeys,
    address _dashboard,
    uint256 _allSourceValidatorBalancesWei
) external view returns (
    bytes memory feeExemptionEncodedCall,
    bytes[] memory consolidationRequestEncodedCalls
)
```

Returns calldata for fee exemption and consolidation requests.

### getConsolidationRequestFee()

```solidity
function getConsolidationRequestFee() external view returns (uint256)
```

Returns the consolidation request fee.

## Related

- [Consolidations guide](/run-on-lido/stvaults/tech-documentation/consolidation)
- [Dashboard](/contracts/dashboard.md)
