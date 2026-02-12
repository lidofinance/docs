# Referral tracking

Meta Vault deposits can include additional parameters embedded directly in the onchain transaction, enabling reliable attribution and access control without relying on offchain tracking.

## Deposit parameters

Two optional fields may be provided during deposit:

- **assets**: The quantity of tokens being deposited, expressed in the token's smallest unit. For example, a deposit of 1 wstETH is represented as `1e18`.
- **referral**: A tracking code used to attribute the source of the deposit (for example partner, campaign, or distribution channel).
- **merkleProof**: A proof used to validate whitelisted deposits, ensuring that only approved addresses or allocations can participate when whitelist restrictions are enabled.

These parameters are written directly into the deposit queue contract and become part of the onchain record for the transaction.

For the exact implementation and parameter structure, see the contract source: [DepositQueue.sol](https://github.com/mellow-finance/flexible-vaults/blob/main/src/queues/DepositQueue.sol#L64).

## Recommended integration approach

For accurate attribution, it is strongly recommended to use a custom UI or integration layer that:

- Injects the correct referral code into the deposit transaction.
- Ensures parameters are consistently formatted and recorded onchain.

Because the data is embedded in the transaction itself, this method provides deterministic and verifiable attribution.

## How to integrate the referral address

You can set up referral attribution by sharing a vault link with a personalized web parameter that includes your wallet address as the referral ID.

1. Copy your wallet address. This address acts as your unique referral identifier.
2. Add it to the vault link by attaching `?referral=YOUR_WALLET_ADDRESS`.
3. Share the link. When someone opens your link and deposits through the interface, your wallet address is recorded onchain as the referral source.

Example:

```
https://app.mellow.finance/vaults/earneth?referral=0xAbC123...
```

## Limitations of URL-based referrals

Web referrals passed via URL parameters (for example `?referral={code}`) are technically possible but not fully reliable in the crypto space.

Many users interact through:

- Privacy-focused browsers
- Wallet in-app browsers
- Direct contract interactions

These flows often strip or ignore URL query parameters, leading to incomplete or incorrect attribution.
