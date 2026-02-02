# Identifying Shadow Owners in Safe Multisig

Guide based on [**bartek.eth**](https://x.com/bkiepuszewski) X threads: [1](https://x.com/bkiepuszewski/status/1722287321997779427), [2](https://x.com/bkiepuszewski/status/1722914827113312584), [3](https://x.com/bkiepuszewski/status/1727437292309192949)

### Introduction

In Safe multisig wallets, besides the "public" owners visible in the UI, there can be "shadow" owners. These shadow owners are authorized to execute transactions but are not listed in the `getOwners()` method, making them invisible in the Safe UI. This guide will help you determine if there is suspicion of shadow owners in the multisig.

### Understanding Owner Structure

Safe maintains an [address] -> [address] mapping where each owner's address points to the next owner's address or a 'sentinel' (a dummy address indicating the end of owners list). This setup allows additional storage where owner addresses pointing to non-zero values might not be visible in the Safe UI. Owners added through this additional mechanism do not appear in the standard `getOwners()` list.

![shadow 1](/img/shadow-signers/1.png)

Pic. source: [**bartek.eth**](https://x.com/bkiepuszewski)

### Adding a Shadow Owner

Safe allows additional delegateCalls during:

- `setup()` call
- `executeTransaction()` call
- `executeTransactionFromModule()` call

Any of these calls can modify arbitrary storage slots and add a shadow owner. The transaction might call another contract that adds a new owner to the multisig.

![shadow 2](/img/shadow-signers/2.png)

Pic. source: [**bartek.eth**](https://x.com/bkiepuszewski)

Although the Safe UI will warn about unexpected delegate calls, it is not always malicious but should be viewed with suspicion.

![shadow 3](/img/shadow-signers/3.png)

Pic. source: [**bartek.eth**](https://x.com/bkiepuszewski)

### Detecting Shadow Owners

You cannot see shadow owners in the UI or directly determine their addresses. However, you can check for "dirty" storage, which might indicate the presence of shadow owners. Here's how to do it:

#### 1 **Access [Token Flow Database](https://tokenflow.live/)**

A login is required to access the database.

#### 2 **Login and Query**

- Use this query: [`https://app.tokenflow.live/studio/editor/66c451806875f9a936d548c9`](https://app.tokenflow.live/studio/editor/66c451806875f9a936d548c9). This query is to check Safe multisig on Ethereum.
- Enter the address of the Safe in the query parameter
- Click "RUN"

![shadow 4](/img/shadow-signers/4.png)

**NB**: The query might take a while to run.

#### 3 **Analyze Results**

Smart contracts use storage slots written according to a specific layout. Let's see Safe storage layout:

![shadow 5](/img/shadow-signers/5.jpg)

Pic. source: [**bartek.eth**](https://x.com/bkiepuszewski)

When you analyze the results of the query:

![shadow 6](/img/shadow-signers/6.png)

- The first two columns (`MEM_HASH`, `RAW_LOCATION`) show the "raw" storage slots as seen by the EVM .
- The `LOCATION` column is a decoded storage slot derived from the Safe smart contract storage layout.
- Look for storage locations that could not be decoded using the known storage layout. Such storage must have been set directly by an `STORE` assembly call, indicating "dirty" storage.

Example below:

    ![shadow 7](/img/shadow-signers/7.png)

    Pic. source: [**bartek.eth**](https://x.com/bkiepuszewski)

    - To check the value of such “dirty” storage you can use https://storage-slots.swiss-knife.xyz/, select “custom”, enter the multisig address and the storage slot in to the form and hit query button:

        ![shadow 8](/img/shadow-signers/8.png)

        Alternatively if you have [brownie](https://github.com/eth-brownie/brownie) installed, enter following commands in the console:

        ```sh
        brownie console
        from brownie import web3
        web3.eth.get_storage_at("{multisig address}", "{storage slot}")
        ```
        Results should look like that:

        ![shadow 9](/img/shadow-signers/9.png)

        Or if you have Foundry installed, you can use the following command:

        ```sh
        cast storage {multisig address} {storage slot}
        ```

        :::note
        💡 In Safe `0x6c9a6c4a39284e37ed1cf53d337577d14212a4870fb976a4366c693b939918d5` storage slot by default is used to store [fallback handler address](https://etherscan.io/address/0xf48f2B2d2a534e402487b3ee7C18c33Aec0Fe5e4), you can read more about it [here](https://help.safe.global/en/articles/40838-what-is-a-fallback-handler-and-how-does-it-relate-to-safe) and find this address in the [official documentation](https://docs.safe.global/advanced/smart-account-supported-networks/v1.3.0#ethereum-mainnet).
        :::

### Next Steps if a Suspicious Multisig is Found

If your analysis reveals suspicious activity within a multisig, follow these steps to ensure security:

**For New Multisigs**:

1. **Do not accept the multisig**. If the multisig shows signs of suspicious activity or dirty storage, do not proceed with using it
2. **Investigate**. Conduct a thorough investigation into the source of the multisig and those who proposed its use

**For Existing Multisigs**:

1. **Migrate to a new multisig**.
   If a currently used multisig is found to be suspicious, create a new multisig with the same set of public signers and transfer all assets to it

2. **Identify malicious actors**. Investigate and identify any individuals responsible for the malicious transactions

By following these steps, contributors can maintain security, ensuring that only authorized owners have control.
