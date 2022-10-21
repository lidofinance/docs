# How to Bridge Tokens through Jumpgate

Jumpgates are a class of contracts that faciliate cross-chain token transfers under DAO operations. Each jumpgate is set up to work with a particular token and a pre-defined recipient. Below is the procedure of transferring tokens using a jumpgate.

[**Watch video tutorial**](https://youtu.be/IqphF28aTUU)

### 1. Verify Jumpgate
In this step we will be making sure that the jumpgate is correctly configured. You will only need to do this once because jumpgates are non-upgradeable contracts.

Go to [Etherscan](https://etherscan.io/)  and open the Jumpgate page. Click the "Contract" tab, the green check mark confirms that the source code is verified. Check the parameters:
- `arbiterFee` is always 0;
- `bridge` is the address of the bridge. If the Jumpgate is using Wormhole bridge, you can check the address against the [Wormhole docs](https://book.wormhole.com/reference/contracts.html); 
- `nonce` is always 0;
- `owner` is the Aragon Agent, verify this against [Lido docs](https://docs.lido.fi/deployed-contracts/#dao-contracts);
- `recipient` is the address of the recipient in hexadecimal form. For Solana recipient, use [Base 58 decoder](https://appdevtools.com/base58-encoder-decoder) to decode this hexadecimal sequence to the Solana address format. 
- `recipientChain` is the target chain identifier. If the Jumpgate is using Wormhole bridge, you can check the id against the [Wormhole docs](https://book.wormhole.com/reference/contracts.html); 
- `renounceOwnership` should yield an error;
- `token` is the address of the token being transfered, e.g. LDO. Check the LDO address against [Lido docs](https://docs.lido.fi/deployed-contracts/#dao-contracts).

![](/img/jumpgates/read-contract.png)

### 2. Bridge Tokens
Now we can send tokens through the bridge. Note that the jumpgate does not how the tokens end up on the contract and it will always bridge all of them at once.

Open "Write contract" tab and connect your wallet by clicking the "Connect to Web3" button. We will now expand `bridgeTokens` function and click "Write". Remember that this function is permissionless and you can initiate the transfer from any account as long as you have enough ether for gas.

![](/img/jumpgates/write-contract.png)

### 3. Claim tokens

Claiming process may be different depending on the bridge. In this guide, we will be using Portal Bridget (formerly Wormhole) website to claim tokens on Solana.

- To go [Portal Bridge website](https://www.portalbridge.com/#/redeem) Redeem page and connect your Ethereum wallet. Select "Token" in "Type" dropdown and "Ethereum" in "Source Chain". Paste the hash of the `bridgeTokens` transaction and click "Recover" button. Keep in mind Portal Bridge may take 10-20 minutes to process the bridge transaction, so "Recover" may not be available at once.

![](/img/jumpgates/recover.png)

- "Recover" will redirect you to "Tokens" tab, where you will be able to confirm the recipient address. Connect your Solana wallet, click "Redeem". You will be prompted to sign a few transactions. Once those are confirmed, you will be able to see the tokens on the recipient.

![](/img/jumpgates/redeem.png)