# Verifying address ownership for Lido DAO ops

Using EOA across Lido DAO ops or protocol contracts requires providing a public "proof of ownership". Main use-cases here are using address as a signer in Lido DAO ops multisigs or using EOAs for offchain tooling where specific rights might be required.

## Preparing and sharing address & signature

1. Sign the message along the lines of `@my_social_handle is looking to join X Lido DAO multisig with address 0x...` with the private key you're looking to use as signing key. One of the options is going using MyEtherWallet web UI:
   1. Connect your wallet to https://www.myetherwallet.com/wallet/access.
   2. Go to https://www.myetherwallet.com/wallet/sign (UI link is under "Message" dropdown on the left).
   3. Enter the message, click "sign" and sign the message on the wallet.
   4. The `sig` field in the result json is the signature hash.
2. Publish the message along with the signature hash on twitter or other easily accessible social media.
3. Share the link to the post as a comment at the relevant [Lido DAO forum](https://research.lido.fi) post.
4. Make sure to follow the [general rules of thumb](./multisig-signer-manual) for being a signer in Lido DAO ops multisigs.

## Ethereum signature verification

To verify the shared signature one can use Etherscan or MyEtherWallet UIs.

### Etherscan UI

1. Go to https://etherscan.io/verifiedSignatures.
2. Click `Verify Signature` button.
3. Input address, message & signature hash data & click `Continue`.
4. See whether the signature provided is valid.

### MyEtherWallet

1. Go to https://www.myetherwallet.com/tools?tool=verify.
2. Encode the message text as hex string (use the tool like https://appdevtools.com/text-hex-converter).
3. Enter json & click `Verify`:
  ```
  {
    "address": "0x...",
    "msg": "0x...",
    "sig": "signature_hash"
  }
  ```
  Note that "msg" is hex text starting with `0x` (add `0x` before the hex encoded string if necessary).
4. See whether the signature provided is valid.
