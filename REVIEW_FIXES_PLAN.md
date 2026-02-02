# Review Fixes Plan for PR #781 (Add stVaults contract docs)

## Inputs
- Review comments collected from PR #781 (inline review comments and review bodies).
- Source of truth for role assignments: `tests/regression/test_permissions.py` in `lidofinance/scripts` (downloaded from master).

## Approach
1. Map each review comment to the exact doc section and required change.
2. Update contract reference pages first (API correctness and technical accuracy).
3. Rebuild governance/roles docs using the permissions test as the authoritative map of role holders.
4. Normalize internal links and address formatting across all touched docs.
5. Do a final cross-check against deployed-contracts lists for addresses and against core contract ABIs for method/struct names.

## Action Items (by file)

### Link consistency (.md extension)
- `docs/contracts/staking-vault.md`: update Related -> VaultHub link to `/contracts/vault-hub.md`.
- `docs/contracts/dashboard.md`: update Related -> VaultHub link to `/contracts/vault-hub.md`.
- `docs/contracts/lazy-oracle.md`: update Related -> VaultHub link to `/contracts/vault-hub.md`.
- `docs/contracts/operator-grid.md`: update Related -> VaultHub link to `/contracts/vault-hub.md`.
- `docs/contracts/predeposit-guarantee.md`: update Related -> VaultHub link to `/contracts/vault-hub.md`.
- `docs/contracts/staking-vault-factory.md`: update Related -> VaultHub link to `/contracts/vault-hub.md`.

### AccountingOracle docs (eth_call mention)
- `docs/contracts/accounting-oracle.md`: remove references to `eth_call` for view methods; describe calls as standard view RPCs.
- `docs/guides/oracle-spec/accounting-oracle.md`: same cleanup of `eth_call` wording.

### Burner deployed address
- `docs/contracts/burner.md`: replace deployed address with mainnet proxy from `docs/deployed-contracts/index.md` (`0xE76c52750019b80B43E36DF30bf4060EB73F573a`). Optionally add impl link if needed for parity.

### Accounting contract doc accuracy
- `docs/contracts/accounting.md`:
  - Reorder the step list to match actual execution order (sanity checks -> CL state update -> bad debt -> shares to burn -> withdrawal queue finalization -> fee distribution -> rebase observers -> TokenRebased event).
  - Fix diagram method names (use correct method names like `VaultHub.decreaseInternalizedBadDebt()` / `StakingRouter.reportRewardsMinted()` or make them descriptive text to avoid API confusion).
  - Add missing `PreReportState` struct definition.
  - Add constructor section if missing.

### Dashboard contract doc completeness
- `docs/contracts/dashboard.md`:
  - Remove methods that do not exist; align method list with actual ABI.
  - Add missing methods from `NodeOperatorFee` and `Permissions` mixins.
  - Document `receive()` as a shortcut to `fund()`.
  - Mention ETH recovery capability in the recovery section.
  - Adjust “abnormally high fee threshold” wording to: fee can only be disbursed by the admin when threshold is exceeded.
  - Keep Related links consistent (`/contracts/vault-hub.md`).

### LazyOracle content scope
- `docs/contracts/lazy-oracle.md`:
  - Add a concise explanation of why it is “lazy” (root-only reporting with on-demand proofs vs full per-round data).
  - Remove or relocate “report freshness” section (freshness enforced by VaultHub, not LazyOracle).
  - Document public constants: `MAX_QUARANTINE_PERIOD`, `MAX_REWARD_RATIO`, `MAX_LIDO_FEE_RATE_PER_SECOND`.

### OperatorGrid data structures & behavior
- `docs/contracts/operator-grid.md`:
  - Fix `Group` struct fields to: `operator`, `shareLimit`, `liabilityShares`, `tierIds`.
  - Fix `Tier` struct fields to include the full fee + ratio set (`reserveRatioBP`, `forcedRebalanceThresholdBP`, `infraFeeBP`, `liquidityFeeBP`, `reservationFeeBP`).
  - Note that either party can initiate tier change.

### PredepositGuarantee structures
- `docs/contracts/predeposit-guarantee.md`:
  - Update intro summary per suggested wording about mitigating frontrunning via guarantees + withdrawal credentials proofs.
  - Add struct/enum definitions: `ValidatorStatus`, `ValidatorStage`, `ValidatorWitness`, `NodeOperatorBalance`.

### StakingVault beacon + factory
- `docs/contracts/staking-vault-beacon.md`: add note that DAO can upgrade implementation if vault not ossified.
- `docs/contracts/staking-vault-factory.md`:
  - Explain two deployment flows (two deployment methods).
  - Mention the factory acts as temporary admin during deploy.
  - Clarify `isDeployedBy` returns true for current or previous factories in the chain.

### StakingVault details
- `docs/contracts/staking-vault.md`:
  - Update `ossify()` description: cannot reconnect to VaultHub after ossification.
  - Document `receive()` as ETH funding shortcut.

### VaultHub correctness
- `docs/contracts/vault-hub.md`:
  - Explicitly state VaultHub is the escrow holder (not Dashboard).
  - Update any outdated sections flagged in review comment.
  - Add missing “pause intent” explanation (who/why/what pauses affect).

### Validator consolidation requests
- `docs/contracts/validator-consolidation-requests.md`:
  - Clarify this is only for incoming consolidations to stVaults, not Lido core or other flows.
  - Explain fee calculation is required for Dashboard’s fee exemption mechanism.

### Protocol levers (major rework)
- `docs/guides/protocol-levers.md`:
  - Rebuild role tables from `test_permissions.py` so holders match on-chain expectations (e.g., `MANAGE_CONSENSUS_VERSION_ROLE` is unassigned; VaultHub roles map to `VAULTS_ADAPTER`, GateSeal, etc.).
  - Align GateSeal and Easy Track roles with the permissions test (avoid implying roles are held by entities not in the test).
  - Audit each lever’s mutator list against actual ABI; correct inaccurate claims.
  - Ensure all contract links use consistent `/contracts/*.md` format.

### stETH superuser functions (major rework)
- `docs/token-guides/steth-superuser-functions.md`:
  - Re-derive all role holders from `test_permissions.py` (source of truth).
  - Add “Role registry / owner contract” column where missing.
  - Explain how to verify roles on-chain: use ACL read methods + note Aragon cannot enumerate all role holders; for “not granted to any contract,” state only off-chain event indexing can confirm.
  - Normalize contract links vs etherscan links (use consistent style for all rows).
  - Fix GateSeal table to use etherscan links and consistent formatting.
  - Apply specific review fixes: Burner role row, “on Lido” phrasing, consistency of link types.

### File removal confirmation
- `docs/guides/verify-lido-v2-upgrade-manual.md`: confirm already deleted in current branch (no action if absent).

## Validation / Cross-checks
- Compare each updated role table against `test_permissions.py` outputs (roles + holders).
- Cross-check all deployed addresses with `docs/deployed-contracts/index.md` (mainnet) before finalizing.
- Spot-check method lists against contract ABIs in `lidofinance/core` version referenced in each doc.

