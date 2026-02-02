# ValidatorConsolidationRequests

- [Source code](https://github.com/lidofinance/core/blob/v3.0.1/contracts/0.8.25/vaults/ValidatorConsolidationRequests.sol)
- [Deployed contract](https://etherscan.io/address/0xaC4Aae7123248684C405A4b0038C1560EC7fE018)

Helper contract that builds calldata for validator consolidation requests (EIP-7251) into stVaults and exposes the current consolidation fee.

## What is ValidatorConsolidationRequests?

This contract is used by the stVaults CLI to prepare consolidation requests with on-chain validation and fee calculation. It is designed for:

- **Batched execution** via EIP-5792
- **Integration with Vault CLI tooling**
- **Fee exemption support** to prevent consolidated balances from being counted as rewards

The contract is scoped to incoming consolidations into stVaults and is not used for Lido Core or other consolidation flows.

### Required permissions

The caller must:

1. Have their address set as withdrawal credentials for the source validators being consolidated
2. Have the `NODE_OPERATOR_FEE_EXEMPT_ROLE` role assigned in the Dashboard (for fee exemption calls)

### Why fee exemption?

Node operator fees are applied only on **rewards**, defined as "all external ether that appeared in the vault on top of the initially deposited one". Without fee exemption, consolidated validator balances would incorrectly be included in the rewards base, leading to overcharging.

By passing the sum of all source validator balances, you ensure these balances are excluded from the reward calculation.

:::warning
This is not a precise method. It does not account for future rewards that consolidated validators may earn after the call, so in some setups additional correction may be required.
:::

## Constants

| Constant                                  | Value                                        | Description                                          |
| ----------------------------------------- | -------------------------------------------- | ---------------------------------------------------- |
| `CONSOLIDATION_REQUEST_PREDEPLOY_ADDRESS` | `0x0000BBdDc7CE488642fb579F8B00f3a590007251` | EIP-7251 consolidation requests contract             |
| `PUBLIC_KEY_LENGTH`                       | 48                                           | Length of validator public key in bytes              |
| `CONSOLIDATION_REQUEST_CALLDATA_LENGTH`   | 96                                           | Length of consolidation request calldata (2 pubkeys) |
| `MINIMUM_VALIDATOR_BALANCE`               | 16 ether                                     | Minimum balance per validator for validation         |

## Immutable variables

| Variable       | Description                         |
| -------------- | ----------------------------------- |
| `LIDO_LOCATOR` | Address of the LidoLocator contract |

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

Returns encoded calldata for fee exemption and consolidation requests.

**Parameters:**

| Parameter                        | Description                                                                                                                        |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `_sourcePubkeys`                 | Array of tightly packed 48-byte public keys to consolidate **from**. Each array element can contain multiple concatenated pubkeys. |
| `_targetPubkeys`                 | Array of single 48-byte public keys to consolidate **to**. Must match length of `_sourcePubkeys`.                                  |
| `_dashboard`                     | Dashboard contract address (must be owner of the connected vault)                                                                  |
| `_allSourceValidatorBalancesWei` | Total balance (wei) of all source validators for fee exemption                                                                     |

**Returns:**

- `feeExemptionEncodedCall`: Encoded call to `addFeeExemption()` (empty if `_allSourceValidatorBalancesWei` is zero)
- `consolidationRequestEncodedCalls`: Array of encoded calls for EIP-7251 consolidation requests

**Validations performed:**

- Source and target pubkey arrays must have equal length
- Vault must be connected to VaultHub and not pending disconnect
- Dashboard must be the owner of the staking vault
- Source pubkeys must be properly formatted (multiples of 48 bytes)
- Target pubkeys must be exactly 48 bytes each
- If non-zero, `_allSourceValidatorBalancesWei` must be at least 16 ETH per consolidation request

**Recommended usage:**
Call this function via the Vault CLI using WalletConnect signing. The CLI performs pre-checks of source and target validator states, verifies withdrawal credential prefixes, calculates current validator balances, generates request calldata, and submits batched transactions via EIP-5792.

### getConsolidationRequestFee()

```solidity
function getConsolidationRequestFee() external view returns (uint256)
```

Returns the current EIP-7251 consolidation request fee. This value is used by the CLI when building the fee-exemption flow for Dashboard. Note: the fee is only valid for the current block and may change in subsequent blocks.

## Related

- [Consolidations guide](/run-on-lido/stvaults/tech-documentation/consolidation)
- [Dashboard](/contracts/dashboard)
- [NodeOperatorFee](/contracts/dashboard#node-operator-fee-accounting)
