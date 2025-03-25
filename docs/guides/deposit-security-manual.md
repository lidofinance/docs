# Deposit Security Committee manual

This instruction has been prepared for the participants of the Deposit Security Committee and describes the general points, the preparation steps to act as a guardian, and the details of the protection mechanism. The Deposit Security Committee is necessary to prevent the substitution of withdrawal credentials with frontrunning by node operators. Each member of the committee must perform several actions to ensure the security of deposits made by Lido. To participate in the validation, you will need to deploy a `lido-council-daemon` and prepare a private key for signing messages about the correctness of data or the need to stop deposits in case of attack.

## TL;DR

Before running in the mainnet all steps should be done in the Holešky testnet.

1. Prepare an EOA account for signing data with a private key on hand (not in hardware wallet). It will be a moderately sensitive hot private key. Use different accounts for testnet and mainnet.
2. Send the account address to Lido for submitting it to the smart contract.
3. Deploy and run `lido-council-daemon` with the private key from the EOA account. It would work in a dry-run mode until your address would be included in the smart contract.

## Detailed description

### The vulnerability

There is the vulnerability allowing the malicious Node Operator to intercept the user funds on deposits to the Beacon chain in the Lido protocol. The vulnerability could only be exploited by the Node Operator front-running the `Lido.depositBufferedEther` transaction with direct deposit to the DepositContract of no less than 1 ETH with the same validator public key & withdrawal credentials different from the Lido’s ones, effectively getting control over 32 ETH from Lido. To mitigate this, Lido contracts should be able to check that Node Operators’ keys hadn’t been used for malicious pre-deposits.

### The Deposit Security Committee

The Deposit Security Committee has been established to ensure the safety of deposits on the Beacon chain:

- **Monitoring and Messaging**: Monitors the history of deposits and the set of Lido keys available for deposits, signs, and disseminates messages to permit deposits.
- **Pause on Malice Detection**: Signs the "pause" message that allows anyone to halt deposits when malicious Node Operator deposits are detected.
- **Enhanced Security Measures**: Signs the message that enables the unvetting of keys from the Staking Module in cases of detected malicious activities, duplicate entries, or invalid keys by Node Operators.

To make a deposit, we propose to collect a quorum of 4/6 of the signatures of the committee members. Members of the committee can collude with node operators and steal money by signing bad data that contains malicious pre-deposits. To mitigate this we propose to allow single committee member to stop deposits and also enforce space deposits in time (e.g. no more than 150 deposits with 150 blocks in between them), to provide single honest participant an ability to stop further deposits even if the supermajority colludes. The idea was outlined on research forum post as the option [<b>d</b>](https://research.lido.fi/t/mitigations-for-deposit-front-running-vulnerability/1239#d-approving-deposit-contract-merkle-root-7).

### Committee membership

The current set of guardians is five node operators (Stakefish, Kiln, Blockscape, Staking facilities, P2P) and Lido dev team. In the future, we want to bring as many node operators as possible into the mix, so the expectation will be that while the 6 guardians start the rest of the node operators can also participate via testnet and gradually get pulled into mainnet.

### Members responsibilities

Each member must prepare an EOA account to sign the pair `(depositRoot, keysOpIndex)` with its private key. The addresses of the committee members will be added to the smart contract. Also, members has to run `DSC Daemon` that monitors the validators’ public keys in the `DepositContract` and in all Staking Modules. The daemon must have access to the committee member’s private key to be able to perform ECDSA signing.

## Preparation steps

Before running in the mainnet, all steps should be completed in the Holešky testnet.

### EOA account

It might be any EOA account under the member's control. Send the address of its account to Lido for submitting it to the smart contract. Lido will provide some ETH to make stopping transactions if needed (shouldn't ever be the case). Note, all actions, except sending the stop message, would be done off-chain.

### Onchain Data Bus Communication

For inter-service communication, an onchain data bus is utilized, based on EVM-based network and a simple smart contract. This smart contract allows for sending messages essential for the operation of the service. The current specification of these messages is outlined in [this file](https://github.com/lidofinance/lido-council-daemon/blob/main/src/abi/data-bus.abi.json). For more details on the smart contract, please refer to [the document](/contracts/data-bus).

### Run lido-council-daemon

To start the application, see the technical documentation in the project [repository](https://github.com/lidofinance/lido-council-daemon#table-of-contents).
