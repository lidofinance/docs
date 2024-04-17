# DAO voting with Etherscan

This how to vote on Lido DAO Aragon with Etherscan UI

## Video guide

<div style={{position:'relative',width:'100%',paddingBottom:'62.5%',height:0}}>
   <iframe style={{position:'absolute',top:0,left:0,width:'100%',height:'100%'}} src="https://www.youtube.com/embed/5YTJgudYHs8" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
</div>

## Preparation

Get the address of the Lido DAO `Aragon Voting` contract from [Deployed Contracts](/deployed-contracts/#dao-contracts) page. It should be: [0x2e59A20f205bB85a89C53f1936454680651E618e].

Get the vote id, either from [voting ui]:

![](/img/etherscan-voting/voting_ui.png)

or from [Etherscan]:

![](/img/etherscan-voting/etherscan_vote_address.png)

1. Open "[Contract/Read as Proxy]" tab
2. Get the total number of the votes from `votesLength` method (number 21 on [Etherscan page])

![](/img/etherscan-voting/votes-length.png)

3. If you're looking to vote on the last vote, take `votesLength - 1` as an id. If the `votesLength` is `89`, last vote would have the id `88`
4. You can check the vote data with `getVote` method (number 6 on [Etherscan page])

![](/img/etherscan-voting/get-vote.png)

[0x2e59a20f205bb85a89c53f1936454680651e618e]: https://etherscan.io/address/0x2e59A20f205bB85a89C53f1936454680651E618e
[voting ui]: https://vote.lido.fi
[etherscan]: https://etherscan.io/address/0x2e59A20f205bB85a89C53f1936454680651E618e#readProxyContract
[contract/read as proxy]: https://etherscan.io/address/0x2e59A20f205bB85a89C53f1936454680651E618e#readProxyContract
[etherscan page]: https://etherscan.io/address/0x2e59A20f205bB85a89C53f1936454680651E618e#readProxyContract

## Voting

1. Open "[Contract / Write as Proxy](https://etherscan.io/address/0x2e59A20f205bB85a89C53f1936454680651E618e#writeProxyContract)" tab on Etherscan
2. Connect Etherscan UI to Web3 with either MetaMask or WalletConnect

![](/img/etherscan-voting/connect-wallet.png)

3. Use method `vote` (number 6 on the [Etherscan Page](https://etherscan.io/address/0x2e59A20f205bB85a89C53f1936454680651E618e#writeProxyContract))

![](/img/etherscan-voting/vote-1.png)

- `_voteId` is the vote id from the point 2.
- `_supports` is the flag of whether you're voting for (type `true`) or against (type `false`) the vote
- `_executesIfDecided` is the flag to enact the vote if it could be executed right away in the tx sending the vote, `true` or `false`; from the experience of the previous votes, you may leave that as `false`

4. Fill in the parameters `_voteId`, `_supports` & `_executesIsDecided` and send the transaction

![](/img/etherscan-voting/vote-2.png)

5. Sign the transaction

![](/img/etherscan-voting/sign-transaction.png)

That's it! 🎉
