# Guide to Dual Governance

[The Dual Governance interface](https://dg.lido.fi/) provides stETH holders with tools to monitor the governance state, escrow tokens for Veto Signaling, manage them during Veto Signaling and withdraw after a Rage Quit.

For more information about Dual Governance [visit the blog](https://blog.lido.fi/dual-governance-101-explainer/) or check [the specification](https://github.com/lidofinance/dual-governance/blob/3e0f1ae5740ef8410e928f6cc106e3a5f45a5a75/docs/specification.md).

## Understanding Governance State

1. Visit [https://dg.lido.fi](https://dg.lido.fi/)
2. Ongoing proposals and their status are listed on the right side of the block. To learn more about the proposals, scroll down and click for more details.
![](/img/dg-guide/state_00.png)
    
3. The current governance state is displayed on the left side of the block.
    
    **Normal state**: A proposal can be submitted to Dual Governance. After the default 3-day timelock, the proposal becomes executable.
    
    ![](/img/dg-guide/state_01.png)
    
    *The background turns yellow when 30% of the first threshold (Veto Signalling, 1% of total stETH supply) is reached, though the governance state remains Normal.*
    
    ![](/img/dg-guide/state_02.png)
    
    **Veto Signalling**: Governance motions are blocked for 5 to 45 days, depending on the amount of opposing tokens. Submission of new proposals remains active during this period. To find out details and join the ongoing discussion, click on the **Public Report** link.
    
    ![](/img/dg-guide/state_03.png)
    
    **Rage Quit:** Governance motions are blocked until tokens in the escrow exit the protocol. Submission of new proposals remains active during this period. 
    
    ![](/img/dg-guide/state_04.png)
    
    **Deactivation**: A brief period indicating Veto Signalling is about to end, after which non-cancelled proposals will be available for execution in the next state. Proposal submission is blocked during Deactivation.
    
    ![](/img/dg-guide/state_05.png)
    
    **Cooldown:** Transitional state after Veto Signalling or Rage Quit when pending proposals can be executed even if the opposition is higher than 1% of the total stETH supply.
    
    ![](/img/dg-guide/state_06.png)

4. Check the progress bar to see how much stETH has been added to the escrow and how much remains before the threshold is reached and the governance state changes:
    
    ![](/img/dg-guide/state_07.png)
    

## How to signal your opposition

**Step 1: Connect your wallet**

1. Go to Dual Governance page [https://dg.lido.fi](https://dg.lido.fi/)
2. Click `Connect wallet` button in the upper right corner or under the proposal listing block
    
    ![](/img/dg-guide/veto_01.png)
    

**Step 2a: Select the amount of stETH**

1. Click `Go to Veto Support` button
    
    ![](/img/dg-guide/veto_02.png)
    
2. Select the amount of stETH tokens you want to add to the escrow for signaling your opposition to LDO governance decisions
    
    ![](/img/dg-guide/veto_03.png)
    
    To select **wstETH**, click the second tab and select the amount to deposit. Inside the Dual Governance, deposited wstETH will be converted **to stETH at a 1:1 ratio**.
    
    ![](/img/dg-guide/veto_04.png)
    
3. Press `Unlock tokens and support Veto`
4. To check your tokens in Dual Governance, click the double shield icon in the upper right corner:
    
    ![](/img/dg-guide/veto_05.png)
    

**Step 2b: Select the withdrawal NFT**

If you have already requested a withdrawal [in the Lido staking widget](https://stake.lido.fi/), you can use your withdrawal NFT to support Veto Signalling. This helps delay proposal execution until your ETH has exited the protocol.

1. Click `Go to Veto Support` button
2. Select the third tab **Withdrawal NFT**
3. Select the NFT you want to use to support Veto Signalling by its ID
    
    ![](/img/dg-guide/veto_06.png)
    

## How to manage tokens within the Dual Governance

Unless Rage Quit is triggered, you can deposit and revoke tokens from the Veto Signalling escrow at any time (subject to a minimum 5-hour timelock). Once Rage Quit is activated, all (w)stETH tokens in the escrow are automatically queued for exit.

**Step 1: Switch to Manage tokens tab**

![](/img/dg-guide/veto_07.png)

**Step 2: Revoke tokens from the escrow**

1. Choose the amount of tokens you want to revoke from the Veto Signalling contract
    
    ![](/img/dg-guide/veto_08.png)
    
    or select withdrawal NFT ID
    
    ![](/img/dg-guide/veto_09.png)
    
2. Sign the transaction

**Note** that if your NFT finalizes during Veto Signaling, you must first **revoke the NFT** from the Veto Signalling escrow, then **claim your ETH** [in the Lido staking widget](https://stake.lido.fi/). 

## How to withdraw tokens after the Rage Quit

If Rage Quit is activated, all tokens deposited in the Veto Signalling escrow will be queued for exit. (w)stETH tokens **cannot be revoked from the escrow,** nor can the exit process be stopped **until the Rage Quit is finished** and the tokens are withdrawn.

After the Rage Quit batch of tokens is finalized, they are processed as follows:

    - (w)stETH tokens are claimed **automatically**;
    - withdrawal NFTs **must be claimed manually**.

Once claimed, all ETH remains in contract where LDO governance has no control over it. However, it is subject to an additional timelock of **60-180 days** before ETH becomes available for final withdrawal.

The current status of your tokens and remaining timelock are indicated on the **Manage tokens** tab.

![](/img/dg-guide/rq_00.png)

**Step 1: Switch to the Manage tokens tab**

![](/img/dg-guide/rq_01.png)

 **Step 2a: Claim your withdrawal NFT**

Once your NFT is finalized, you can immediately claim it. There is **a 60-day window** after the Rage Quit is finalized to claim NFT before execution is unblocked.

1. Click `Claim` button next to the NFT
    
    ![](/img/dg-guide/rq_02.png)
    
2. Select the NFT by its ID
    
    ![](/img/dg-guide/rq_03.png)
    
3. After claiming, your ETH will be locked for 60-180 days before becoming available for withdrawal. The remaining time will be indicated on the **Manage tokens** tab
    
    ![](/img/dg-guide/rq_04.png)
    

**Step 2b: Claim a withdrawal NFT you don’t own by its ID.**

If you don't currently have access to the wallet that owns the withdrawal NFT (for example, if you're managing operations from a different address), you can claim a withdrawal NFT using its ID.

Note that **claiming the NFT does not transfer ownership**. It locks the corresponding ETH in the Dual Governance. **Only the NFT owner** will be able to withdraw the tokens once the lock period ends.

1. Go to the **Claim Non-Owned NFT** section
    
    ![](/img/dg-guide/rq_05.png)
    
2. Enter the NFT ID and click `Claim`
    
    ![](/img/dg-guide/rq_06.png)
    
3. The NFT owner will see the updated status in the UI when they connect their wallet
    
    ![](/img/dg-guide/rq_07.png)
    

**Step 3: Withdraw your ETH when available**

1. Visit the **Manage tokens** tab
2. After the 60-180 days timelock expires, click the `Withdraw` button for available tokens
    
    ![](/img/dg-guide/rq_08.png)
    
3. Withdraw ETH. It will be deposited into your wallet.

---

For more context on how Dual Governance works, when to use it, and the rationale behind timelock mechanics, check out:

- [LIP 28 Dual Governance proposal](https://github.com/lidofinance/lido-improvement-proposals/blob/develop/LIPS/lip-28.md)
- [Dual Governance 101 blog article](https://blog.lido.fi/dual-governance-101-explainer/)

**Need help?** If you are having issues navigating the UI, reach out [on Discord](https://discord.com/invite/lido) or [Telegram](https://t.me/lidofinance).
