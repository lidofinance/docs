# Verifying address ownership for Lido DAO ops

Using EOA across Lido DAO ops or protocol contracts requires providing a public "proof of ownership". Main use-cases here are using address as a signer in Lido DAO ops multisigs or using EOAs for offchain tooling where specific rights might be required.

## Preparing and sharing address & signature

### In case of using externally owned account (EOA)

1. Sign the message along the lines of `@my_social_handle is looking to join X Lido DAO multisig with address 0x...` with the private key you're looking to use as signing key. One of the options is going using MyEtherWallet web UI:
   1. Connect your wallet to https://www.myetherwallet.com/wallet/access.
   2. Go to https://www.myetherwallet.com/wallet/sign (UI link is under "Message" dropdown on the left).
   3. Enter the message, click "sign" and sign the message on the wallet.
   4. The `sig` field in the result json is the signature hash.
2. Publish the message along with the signature hash on twitter or other easily accessible social media.
3. Share the link to the post as a comment at the relevant [Lido DAO forum](https://research.lido.fi) post.
4. Make sure to follow the [general rules of thumb](./multisig-signer-manual) for being a signer in Lido DAO ops multisigs.

### In case of using Safe multisig

1. In https://app.safe.global home screen of your multisig wallet hit the button "New transaction" and select "Contract interaction" in the appeared screen.
2. At the New Transaction screen toggle "Custom data" switch.
3. Fill any EOA address (for example `0x0000000000000000000000000000000000000000`) into "Enter Address or ENS Name" field.
4. Use any hex encoder (like https://www.duplichecker.com/hex-to-text.php) to encode a message that consists info about who is joining what Lido committee or multisig with which address, for example `@my_social_handle is looking to join X Lido DAO multisig with address 0x...`.
5. Paste a code generated at the previous step into "Data (Hex encoded)" field of "New Transaction" screen in the multisig interface (add "0x" in the start of a HEX code if it's missing), put "0" in the ETH value field.
6. Publish the message along with the transaction hash on twitter or other easily accessible social media.
7. Share the transaction hash in the post as a comment at the relevant [Lido DAO forum](https://research.lido.fi) post.

## Ethereum signature verification

### In case of using EOA

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

### Publishing the signature on Etherscan

1. Go to https://etherscan.io/verifiedSignatures and click "Verify Signature".
2. Enter address, plain text message (not hex version MyEtherWallet will give!) & the signature (with `0x` prefix), choose "Verify & publish" option & click "Continue".
3. After the signature is verified you'll get the link for sharing.

### In case of using Safe multisig

1. Go to the signed transaction at the [Etherscan](https://etherscan.io/).
2. Click to show more details and find "input Data" field, click on "Decode input data".
3. Copy a hex code in the "data" row and take it to any hex decoder (like [duplichecker](https://www.duplichecker.com/hex-to-text.php)).
4. Decode and verify the message (please note, that you may need to delete leading `0x` from the hex code acquired in the previous step).
