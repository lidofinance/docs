# Aragon Vote: Checking the EVM Script

We've published a short Replit from the script parts we're using for preparing the votes: [EVMVoteScriptParser#main.py](https://replit.com/@VictorSuzdalev/EVMVoteScriptParser#main.py)

## Checking the EVM script

1. Start Replit.![](https://user-images.githubusercontent.com/4445523/149335803-4b7c71e2-12a1-4c48-973c-c064ffa4d0a7.jpeg)

    1. Open the [Replit script](https://replit.com/@VictorSuzdalev/EVMVoteScriptParser#main.py)
    2. Click the big green `RUN` button at the top.
    3. The script will start installing dependencies — this takes a couple of minutes.
2. Get the EVM script from the vote.![](https://user-images.githubusercontent.com/4445523/149335811-1332324b-b1ba-4e4a-af2e-9c79c347ff43.jpeg)

    1. Open voting contract on etherscan [0x2e59A20f205bB85a89C53f1936454680651E618e#readProxyContract](https://etherscan.io/address/0x2e59A20f205bB85a89C53f1936454680651E618e#readProxyContract) (can check the voting contract address in [Deployed contracts](/deployed-contracts/#dao-contracts)).
    2. Check the `getVote` method (sixth in the list): enter the vote in question, push `query`.
    3. Copy the `script` text (long string starting with 0x).
3. Check the script

    1. Get back to Replit, wait for the setup to pass.
    2. The Replit will ask for the EVM script — paste the text from Etherscan and push `enter` to see the actions in the script.

![](https://user-images.githubusercontent.com/4445523/149335822-1bdc0c66-18f0-43c3-b2cf-124f3706ae36.png)
![](https://user-images.githubusercontent.com/4445523/149335833-3701273a-cb7a-4076-91c7-93cde4d2db4c.png)

That's it! 💪🎉🏝

## How to check the Replit itself

- One can compare the parsing results for already passed votes with descriptions on the Voting UI ([vote #172](https://vote.lido.fi/vote/172) may be a cool example)
- The Replit code is available under the `Show files` button on the left; it's heavily based on the scripts & tooling from the [scripts](https://github.com/lidofinance/scripts) repo
