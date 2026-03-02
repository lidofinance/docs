# Architecture

From Core Vaults to Meta Vaults

## Mellow Core Vaults

### Abstract

Meta Vaults are built on top of the Core Vaults architecture and inherit its fundamental design principles, execution model, and security guarantees. Rather than introducing a separate vault system, Meta Vaults utilizes the existing Core Vault framework to enable aggregation and orchestration of multiple strategies under a single vault abstraction.

This means that all core mechanics, including liquidity handling, accounting, permissioning, and execution constraints, follow the same proven architectural patterns, while Meta Vault specific logic focuses on coordinating allocations across multiple onchain destinations.

### Vaults Architecture

Core Vaults are built around a modular architecture that orchestrates interactions across both DeFi protocols and centralized exchanges. It enables trustless execution of complex, institutional grade strategies while maintaining full composability and transparency.

No matter how diverse or sophisticated the underlying strategies become, the vault framework remains stable and predictable - providing a unified, programmable setup for managing assets, risks, and logic.

The result is infrastructure that supports scalable, curated access to onchain yield - secure, standardized, and ready for real users.

#### Core Vaults Features & Functionality

- Deposits & Withdrawals for the Liquidity Providers
- Valuation Oracle
- Strategy performance analytics for Liquidity Providers
- Fee management
- Vault management tools & Curation UI
- Reward distribution engine
- Receipt token distribution infrastructure
- Smart contract safeguards
- Granular role based control
- Access to external apps and protocols

#### Vault system architecture overview

![Vault system architecture overview](/img/earn/vault-system.jpg)

### Deposit Queue

Manages user deposits through a time buffered queuing system. This delay helps prevent front running and price manipulation by ensuring deposits are not executed based on stale or externally influenced oracle price data.

The deposit queue is also responsible for issuing receipt tokens.

#### Technical details

Deposit flow:

1. Step 1: User Deposits
   - A user submits a deposit request via `deposit(assets, referral, merkleProof)`.
   - Deposits are validated via optional Merkle whitelist logic (using `merkleProof`) or onchain mapping (if `hasWhitelist` flag is set).
   - If a previous request exists, it must be claimed or canceled before creating a new one.
   - The deposited amount and timestamp is stored in the `DepositQueue` contract.
2. Step 2: Oracle Report
   - Oracle report is propagated via the `handleReport(priceD18, timestamp)` method.
   - The queue validates the report:
     - It must be called by the `Vault`.
     - Provided `timestamp` must be in the past (usually `request.timestamp - depositInterval`).
     - `priceD18` must be non zero.
   - The queue handles deposit requests that are pending for at least `depositInterval` seconds (the interval is specified in the oracle's security parameters).
   - The contract stores a `(timestamp, reducedByDepositFeePriceD18)` pair in the `prices` array. This value is used to convert accumulated assets into shares based on the user's request timestamp. The `reducedByDepositFeePriceD18` is derived by applying the deposit fee to the actual reported `priceD18`.
   - The corresponding shares are allocated but not yet minted.
   - Emits the `ReportHandled` event.
3. Step 3: User Claims
   - A user calls `claim(account)` (or `claimShares(account)` in the `Vault`) to mint and receive previously allocated shares.
   - The number of shares is computed as:

     ```solidity
     uint256 shares = (request.assets * reducedByDepositFeePriceD18) / 1e18;
     ```

   - Shares are minted to the user via `mintAllocatedShares`.

#### Assumptions & Properties

1. Single Active Request

   Each user may have at most one unprocessed deposit request. New deposits are blocked until the previous request is claimed. If the pending request is already claimable, the claim will be automatically processed during the next deposit.

2. Delayed Execution

   Deposit processing requires an Oracle report submitted after a configured `depositInterval`.

3. Lazy Claiming

   Deposits are converted into shares during oracle processing, but users must call the claim function (in `ShareModule`, `ShareManager` or in each `DepositQueue` separately) to receive them. However, even without explicitly claiming, the user's full share balance - including all claimable shares across all deposit queues - is accurately reflected in `shareManager.sharesOf(user)`.

4. Whitelist Enforcement

   Deposits may require Merkle proof for depositor whitelisting.

### Redeem Queue

Serving as the counterpart to the Deposit Queue, it manages withdrawal requests.

Redemptions are processed in two phases:

1. Oracle pricing - reports are processed in batches, with each batch assigned a specific conversion price derived from its corresponding Oracle report.
2. Liquidity settlement - Vault liquidity is pulled asynchronously, allowing the curator to finalize withdrawals and perform asset swaps before processing user redemption requests.

This separation allows asynchronous liquidity management, gas efficiency, and protection against griefing. Unlike deposit requests, withdrawal requests in the Redeem Queue cannot be canceled to prevent yield griefing.

#### Technical details

Redeem flow:

1. Step 1: User redeems
   - User submits `redeem` request, vault shares are immediately burned.
   - The vault curator monitors and manages liquidity across connected Subvaults, pulling funds and swapping assets as needed to fulfill redemption requests.
2. Step 2: Oracle report
   - Valid and non suspicious `Oracle` report arrives.
   - The vault curator invokes `handleBatches(n)` on the `RedeemQueue`.
   - This triggers the movement of required assets from the vault (and associated subvaults) to process redemption requests.
3. Step 3: User claims
   - Users call `claim(receiver, timestamps)` to withdraw assets.

#### Assumptions & Properties

1. Non Cancellable Requests

   Prevents griefing where a user requests redemption, causing curator to pull liquidity, then cancels.

2. Time sensitive request handling

   Oracle reports can only process a redemption request if at least `redeemInterval` seconds have passed since the request was submitted - i.e., `report.timestamp` must be greater than or equal to `request.timestamp + redeemInterval`.

3. Asynchronous Fulfillment

   Liquidity can be managed independently of oracle report submission.

### Signature Deposit and Redeem Queues

Signature Queues allow deposits and redemptions to be processed instantly, bypassing the standard time buffered flow. That happens when a trusted consensus group issues offchain signed approvals.

Key Features:

- Instant execution without waiting for Oracle price reports
- Nonce based signature protection to prevent replay attacks
- EIP 712 and EIP 1271 compatible signed orders
- Oracle price validation enforced onchain
- Stateless and removable (does not accumulate shares or process claims)
- Fee bypass: No Deposit Fee or Redeem Fee is charged for actions via this queue

#### Technical details

Signature Queue flow:

1. Step 1: Offchain signing
   - Offchain consensus actors (operators, curators, admins) generate signed `Order` messages.
2. Step 2: Onchain execution
   - A user submits this order to the `SignatureQueue` contract for execution.
   - The queue:
     - Verifies the order signature
     - Validates nonce, queue address, asset match, deadline, and caller
     - Computes the implied asset and share price and checks it against the vault's oracle
   - If all checks pass, the order is executed atomically.

#### Assumptions & Properties

- Only trusted offchain actors (consensus group) are authorized to sign orders.
- Price quotes must be valid and non suspicious.
- Users cannot reuse old signatures due to nonce tracking.
- Orders must be executed before `deadline`.

### Vault

The Vault contract serves as the central entry point into the Core Vault system. It is configured by four internal modules:

- BaseModule: Implements different auxiliary interfaces such as `onERC721Received`, `getStorageAt` and `receive` callback
- ACLModule: Role based access control for system components
- ShareModule: Management of shares, fees, deposit and redeem queues lifecycle, `Oracle` report handling
- VaultModule: Subvaults management, pushing and pulling of assets in subvaults

### Subvault

The Subvault contract is a vault component designed to manage delegated asset strategies, acting as a controlled execution unit within a system. Like the Vault contract, it is configured by modules:

- BaseModule: Implements different auxiliary interfaces such as `onERC721Received`, `getStorageAt` and `receive` callback.
- SubvaultModule: Represents an isolated child vault within a modular vault system, responsible for securely holding and releasing assets upon authenticated requests.
- VerifierModule: is an abstract extension of the Base Module designed to provide standardized access to a Verifier contract.
- CallModule: Enables arbitrary low-level calls to external contracts (used by curator of the vault), and verification through a verifier module.

### Verifier

Each Subvault is paired with a Verifier contract, which validates function calls and ensures only pre approved actions from valid actors are permitted across vault connected modules.

While each Subvault is expected to have its own dedicated Verifier contract, it is still possible for the same Verifier to be shared across multiple Subvaults.

#### Technical details

Verifier allows multiple types of verification:

- ONCHAIN_COMPACT: Checks `CompactCall` (who | where | selector) hash against internal admin controlled set
- MERKLE_COMPACT: Verifies Merkle proof of `CompactCall` (who | where | selector) hash
- MERKLE_EXTENDED: Verifies Merkle proof of `ExtendedCall` (who | where | value | callData) hash
- CUSTOM_VERIFIER: Delegates full verification to an external verifier

Two admin owned parameters are saved in the state of the Verifier contract:

- `compactCallHashes` that defines all allowed calls for ONCHAIN_COMPACT verification type
- `compactCalls` is an optional mapping for reverse lookup of call metadata by hash
- `merkleRoot` that defines all allowed calls for MERKLE_COMPACT, MERKLE_EXTENDED and CUSTOM_VERIFIER

### Oracle

The Oracle contract handles secure and configurable price reporting for supported assets. Closely integrated with the `ShareModule`, it provides price validation, deviation monitoring, and time restricted report submissions.

It enforces strict guarantees around report timing and trust minimization using role permissions and deviation thresholds. This oracle ensures consistent pricing across all queue, share, and limit related calculations.

Key considerations:

- Only authorized roles can submit price updates
- Suspicious reports require explicit approval before acceptance
- Price validation is performed locally without relying on external oracle feeds
- Manipulation is prevented through absolute and relative deviation limits

#### Technical details

Oracle Configurable Security Parameters:

- Absolute Deviation: Hard limits on price delta in price units
- Relative Deviation: Tolerance as a percentage (e.g., 5% = 0.05e18)
- Timeout: Minimum time between valid reports (ignored if the previous report is suspicious)
- depositInterval: Minimum age required for a deposit to be processed
- redeemInterval: Same, but for redemptions

Reporting flow:

1. Step 1: Report is submitted:
   - Each asset is checked for support
   - The previous report state is evaluated:
     - If `timeout` has not passed, and the report is not suspicious -> revert `TooEarly`
   - Price is compared against previous:
     - `maxAbsolute` -> revert `InvalidPrice`
     - `maxRelative` -> flagged `isSuspicious`
   - If the report is valid and non suspicious (deviation < suspicious && deviation < max), it is immediately accepted
   - If the report is suspicious it will be accepted only after validation from the Admin (ACCEPT_REPORT_ROLE holder)
2. Step 2: Accepted report propagation:
   - Triggers `vault.handleReport(...)`, processing deposit requests and pending redeem requests
   - Emits `ReportsSubmitted`

Validation Logic:

Reports are validated by:

- Calculating absolute deviation (`maxAbsolute`)
- Calculating relative deviation (`maxRelative`)
- Comparing against `max` and `suspicious` thresholds

A report is:

- Rejected if either deviation exceeds max
- Accepted but marked as suspicious if above the suspicious threshold, flagging the report
- Accepted as normal if within all limits

Used by:

- `SignatureDepositQueue`, `SignatureRedeemQueue`, `DepositQueue` and `RedeemQueue` contracts
- Vault's limit accounting (`RiskManager`)

### Share Manager

The Share Manager is an upgradeable contract responsible for managing vault share issuance, allocation, whitelisting, permissions, and lockups within a modular vault system.

Key responsibilities include:

- Tracking total and active share supply
- Managing global and targeted account lockups
- Verifying whitelist status and transfer permissions
- Enforcing mint, burn, and transfer pauses
- Handling share allocation and claims through queues
- Whitelisting for implementing KYC and compliance features

#### Technical details

Share Manager relies on a compact bitmask (`flags`) for enabling and disabling features and supports configurable per account permissions. Controlled via `ShareManagerFlagLibrary`:

- `hasMintPause`
- `hasBurnPause`
- `hasTransferPause`
- `hasWhitelist`
- `hasTransferWhitelist`
- `globalLockup`
- `targetedLockup`

Lockups are enforced in `updateChecks`.

Share Manager operates under the control of defined roles:

- `SET_FLAGS_ROLE`: Allows changing global flags (e.g., mint pause, whitelist enforcement).
- `SET_ACCOUNT_INFO_ROLE`: Grants permission to set per account configuration.
- `SET_WHITELIST_MERKLE_ROOT_ROLE`: Grants permission to set new whitelist merkle root.

### Fee Manager

The Fee Manager oversees the calculation and management of multiple fee types within the vault system. Currently, it supports four fee acquiring methods:

- Deposit Fee: Charged on asset deposits
- Redeem Fee: Applied on share redemptions
- Performance Fee: Based on decreases in share price (assets x price = shares)
- Protocol Fee: Time based fee accrued per vault

All fees are paid in vault shares rather than the underlying assets.

Admin can update recipient and fee parameters.

#### Technical details

Fee Manager will require identifying the base asset of the vault. `setBaseAsset`: Called once per vault to register its performance reference token.

`updateState(asset, price)`: Vaults call this to refresh timestamp and minimum price.

Performance and Protocol fees are activated by a fresh Oracle report on the base asset.

#### Fee Calculation Logic:

- Deposit fee - applied linearly and calculated as `shares * depositFeeD6 / 1e6`, deducted during the oracle report handling process.
- Redeem fee - applied linearly and calculated as `shares * redeemFeeD6 / 1e6`, deducted when shares are requested for redemption.
- Performance fee - due to the use of a non standard pricing mechanism (`price = shares / assets`), delegation yield will result in a lower reported price by the oracle; if `priceD18` falls below `minPriceD18`, the fee is charged as `(minPriceD18 - priceD18) * performanceFeeD6 * totalShares / 1e24` to capture the implied yield.
- Protocol fee - a continuously accruing time based fee calculated as `totalShares * protocolFee * (block.timestamp - timestamps[vault]) / (365 * 24 * 3600 * 1e6)`, proportional to both share supply and elapsed time since the last timestamp update.

### Risk Manager

The Risk Manager contract defines and enforces asset deposit limits across the Vault and its associated Subvaults. It maintains internal accounting of balances, limits, and approved assets for each subvault.

This module is responsible for:

- Setting and enforcing share limits (practically representing approximate deposit limits) at both vault and subvault levels
- Permitting or restricting specific assets to be pulled into the Subvaults
- Tracking pending balances for Deposits that are not yet finalized
- Validating limits using Oracle price reports

#### Technical details

- Vault Limit: Global cap across all assets managed by the vault (in shares).
- Subvault Limit: Individual cap per subvault, enforced independently (in shares).
- Allowed Assets: Only explicitly allowlisted assets are permitted for push and pull operations in a given subvault.
- Pending Assets: Temporarily tracked assets, e.g., during deposit queueing
- Shares Conversion: All balances are internally tracked in shares, calculated using latest report in the `Oracle` contract.

All vault and subvault level limits are treated as approximate and computed using the most recent Oracle report available at the time of the state update (on Subvault pull or push event or Deposit or Redeem operations).

If actual balances deviate significantly from the stored `balance` values due to oracle drift, delayed execution, or protocol side changes, a trusted actor can apply corrections to mitigate the difference:

- `modifyVaultBalance` for the Vault, or
- `modifySubvaultBalance` for individual Subvaults.

Since the system is expected to hold only correlated assets, such manual adjustments are assumed to be rare under normal operating conditions.

### Access Control

Granular Access Control (MellowACL) is a lightweight yet extensible layer built on an OpenZeppelin contract. It adds automatic tracking and enumeration of active roles to enhance governance transparency and enable dynamic role management.

Responsibilities include:

- Granting and revoking access control roles to addresses
- Maintaining a dedicated set of all active (assigned) roles
- Providing enumerable functions for external auditing of granted roles
- Emitting events when roles are assigned or fully revoked

### Supported protocols and integrations

Core Vaults architecture supports integration with a wide range of apps, including both DeFi protocols and centralized exchanges. Most of the protocol integrations can work out of the box. Below is a brief example of potential connections to subvaults.

#### Major protocols:

- Aave (leverage & supply side LPing)
- Gearbox (leverage & supply side LPing)
- Curve, Uniswap (DEX liquidity provisioning)
- Cowswap (limit orders)
- Symbiotic, EigenLayer (provide liquidity for restaking rewards)
- Pendle (splitting and selling future yield or holding for boosted returns)
- Morpho (leverage & supply side LPing)
- Euler (leverage & supply side LPing)
- Fluid (leverage & supply side LPing)
- Hyperliquid

#### CEXes via custodial off exchange solutions (Copper and Ceffu)

- Deribit
- ByBit
- Binance
- Most of tier 1 and 2 CEXes

## Case Study

Prerequisites:

The flow occurs within a Core Vault under the following conditions:

1. Two subvaults representing different yield sources: a delta neutral trading strategy and restaking
2. Liquidity is evenly allocated 50% 50% between the subvaults
3. 1% management fee and 15% performance fee
4. Annual Percentage Rate (APR) of 10%

Initial Action:

A Liquidity Provider (LP) deposits 1,000,000 USDC into the Mellow Core Vault.

Process Flow:

1. Deposits are processed and transferred into the vault after passing through the time buffered Deposit Queue.
2. The LP receives receipt tokens representing the 1,000,000 USDC position.
3. The LP can use these receipt tokens as collateral in various DeFi protocols to generate additional yield, such as leverage looping on Gearbox.
4. Liquidity is allocated from the Vault to the Subvaults according to the limit based rules.
5. 50% of unallocated funds are pulled into a Subvault 1 by a Curator.
6. 50% of unallocated funds are pulled into a Subvault 2 by a Curator.
7. The Curator allocates funds from Subvault 1 to the delta neutral strategy through integrated centralized exchanges.
8. Funds from Subvault 2 are allocated to the restaking strategy via Symbiotic.
9. After 12 months, the LP requests a full withdrawal.
10. Throughout the holding period, Protocol and Performance Fees are automatically accrued with each Oracle update, resulting in a management fee of 10,000 USDC and a performance fee of 15,000 USDC - both paid in vault receipt tokens.
11. The withdrawal request is queued and detected onchain.
12. At the end of the withdrawal interval, the Curator transfers 1,075,000 USDC (principal plus accrued yield) from the Subvaults back to the Core Vault Contract.
13. The LP redeems the full amount directly from the Redeem Queue.

Process Flow for Curator Allocation:

![Process flow for curator allocation](/img/earn/process-flow-scheme.jpg)

1. Curator asks Admin to add 2 subvaults with correct verifier configs:
   - First one allowing liquidity transfer into a Copper or Ceffu account
   - Second one allowing deposits, withdrawals, withdrawal claims and reward claims & swaps from Symbiotic
2. Curator pushes unallocated funds: `Vault.pushAssets(USDC, 500000)`.
3. Allocates assets in Subvault 1 (Delta Neutral strategy on ByBit via Copper ClearLoop).
   - In UI, Curator clicks New Call -> sets target to Copper Subvault -> selects USDC asset and Bybit ClearLoop as destination.
   - Generate `VerificationPayload` via Mellow API.
   - Executes call:

     ```solidity
     subvault1.call(
       asset,                          // address of the asset (USDC) to be sent to the Copper account
       0,                              // eth value
       abi.encodeCall(
         IERC20.transfer,               // transfer call encoding
         (copperAccountAddress, 5e11)  // (recipient, amount)
       ),
       verificationPayload             // extra data for Verifer contract
     )
     ```

   - Inside Bybit UI, strategy is realized by the Curator, with settlements occurring every few hours in the Copper Clearloop.
4. Allocate to Subvault 2 (Symbiotic Restaking).
   - Pushes unallocated funds to the second subvault: `vault.pushAssets(subvault2, asset, 5e11)`.
   - Clicks New Call -> target = Restaking Subvault -> calls `deposit(subvault, 5e11)`.
   - Gets the verification result and `VerificationPayload` from the Mellow API for this call.
   - Executes call:

     ```solidity
     subvault2.call(
       symbioticVault,            // address of the symbiotic vault
       0,                         // eth value
       abi.encodeCall(
         ISymbioticVault.deposit, // deposit call encoding
         (subvault, 5e11)         // (onBehalfOf, amount)
       ),
       verificationPayload        // extra data for Verifer contract
     )
     ```

5. Curator regularly claims rewards from Symbiotic Restaking and swaps them into assets before depositing them using `subvault2.call`.
6. Curator monitors Performance & Exit upon user request by repeating New Call steps to withdraw according to net returns.
