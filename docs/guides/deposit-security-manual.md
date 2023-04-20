# Deposit Security Committee manual

This instruction has been prepared for the participants of the Deposit Security Committee and describes the general points, the preparation steps to act as a guardian, and the details of the protection mechanism. The Deposit Security Committee is necessary to prevent the substitution of withdrawal credentials with frontrunning by node operators. Each member of the committee must perform several actions to ensure the security of deposits made by Lido. To participate in the validation, you will need to deploy a `lido-council-daemon` and prepare a private key for signing messages about the correctness of data or the need to stop deposits in case of attack.

## TL;DR

Before running in the mainnet all steps should be done in the Goerli testnet.

1. Prepare an EOA account for signing data with a private key on hand (not in hardware wallet). It will be a moderately sensitive hot private key. Use different accounts for testnet and mainnet.
2. Send the account address to Lido for submitting it to the smart contract. 
3. Deploy and run `lido-council-daemon` with the private key from the EOA account. It would work in a dry-run mode until your address would be included in the smart contract.  

## Detailed description

### The vulnerability

There is the vulnerability allowing the malicious Node Operator to intercept the user funds on deposits to the Beacon chain in the Lido protocol. The vulnerability could only be exploited by the Node Operator front-running the `Lido.depositBufferedEther` transaction with direct deposit to the DepositContract of no less than 1 ETH with the same validator public key & withdrawal credentials different from the Lido’s ones, effectively getting control over 32 ETH from Lido. To mitigate this, Lido contracts should be able to check that Node Operators’ keys hadn’t been used for malicious pre-deposits.

### The Deposit Security Committee

We propose to establish the Deposit Security Committee dedicated to ensuring the safety of deposits on the Beacon chain:

- monitoring the history of deposits and the set of Lido keys available for the deposit, signing and disseminating messages allowing deposits;
- signing the special message allowing anyone to pause deposits once the malicious Node Operator pre-deposits are detected.

To make a deposit, we propose to collect a quorum of 2/3 of the signatures of the committee members. Members of the committee can collude with node operators and steal money by signing bad data that contains malicious pre-deposits. To mitigate this we propose to allow single committee member to stop deposits and also enforce space deposits in time (e.g. no more than 150 deposits with 150 blocks in between them), to provide single honest participant an ability to stop further deposits even if the supermajority colludes. The idea was outlined on research forum post as the option [<b>d</b>](https://research.lido.fi/t/mitigations-for-deposit-front-running-vulnerability/1239#d-approving-deposit-contract-merkle-root-7).

### Committee membership

The first set of guardians is six node operators (Stakefish, Skillz, Chorus one, Blockscape, Staking facilities, P2P) and Lido dev team. In the future, we want to bring as many node operators as possible into the mix, so the expectation will be that while the 7 guardians start the rest of the node operators can also participate via testnet and gradually get pulled into mainnet. 

### Members responsibilities

Each member must prepare an EOA account to sign the pair `(depositRoot, keysOpIndex)` with its private key. The addresses of the committee members will be added to the smart contract. Also, member has to run `DSC Daemon`that monitors the validators’ public keys in the `DepositContract` and `NodeOperatorRegistry`. The daemon must have access to the committee member’s private key to be able to perform ECDSA signing.

The daemon constantly watches all updates in `DepositContract` and `NodeOperatorRegistry`:

- If the state is correct, it signes the current to_sign struct and emits it to an off-chain message queue.
- If the state has malicious pre-deposits, it signs the “something’s wrong” message at the current block, emits it to a message queue, and attempts to send pauseDeposits() tx.

## Preparation steps

Before running in the mainnet, all steps should be completed in the Goerli testnet.

### EOA account

It might be any EOA account under the member's control. Send the address of its account to Lido for submitting it to the smart contract. Lido will provide some ETH to make stopping transactions if needed (shouldn't ever be the case). Note, all actions, except sending the stop message, would be done off-chain.

### Run lido-council-daemon

For perform deposits validation each member should run the `lido-council-daemon` from [repository](https://github.com/lidofinance/lido-council-daemon).

The daemon monitors the keys in the deposit contract and compares them with Lido's unused keys. The result of the comparison is signed with the private key and sent to the message broker. If the daemon finds a match, it tries to stop the deposits by sending a transaction calling the `pauseDeposits` method on the `Deposit Security Module` contract.

#### Environment Variables

Several environment variables must be set for the daemon to function properly. These variables include RabbitMQ settings, wallet private key, and Keys-API configuration.

##### RabbitMQ

```env
...
PUBSUB_SERVICE=rabbitmq

RABBITMQ_URL=<rabbitmq url that supports ws>
RABBITMQ_LOGIN=<rabbitmq login>
RABBITMQ_PASSCODE=<rabbitmq password>
...
```

##### Wallet Private Key

```env
...
WALLET_PRIVATE_KEY=<wallet private key>
...
```

In production, the private key is required. If omitted, a random key will be generated, and the daemon will run in test mode. Ensure the account balance has enough ETH to send transactions. The daemon does not spend funds in regular mode, and transactions are sent only if a potential attack is detected. 1 ETH is sufficient.

##### Keys-API Configuration

```env
# Keys API
KEYS_API_PORT=3001

# chain id
# for mainnet 1
# for testnet 5
CHAIN_ID=5

RPC_URL=

# KeysAPI DB config
KEYS_API_DB_NAME=keys_service_db
KEYS_API_DB_PORT=5452
KEYS_API_DB_HOST=localhost
KEYS_API_DB_USER=test
KEYS_API_DB_PASSWORD=test

```

The Keys-API is publicly available, and more information can be found at https://github.com/lidofinance/lido-keys-api.

##### Example ENV Config File

<details>

<summary>sample.env</summary>

```
# App
PORT=3000

# Log level: debug, info, notice, warning or error
LOG_LEVEL=info

# Log format: simple or json
LOG_FORMAT=simple

# Pubsub (default: rabbitmq)
PUBSUB_SERVICE=rabbitmq

# RabbitMQ
RABBITMQ_URL=wss://rabbitmq_url
RABBITMQ_LOGIN=test
RABBITMQ_PASSCODE=test

# Private key
# Used to sign transactions and stop the protocol.
# Make sure there are enough ETH on the balance to send a transaction to stop the protocol
WALLET_PRIVATE_KEY=0x0000000000000000000000000000000000000000000000000000000000000001

KEYS_API_HOST=http://keys_api_service_api

# Keys API
KEYS_API_PORT=3001

# chain id
# for mainnet 1
# for testnet 5
CHAIN_ID=5

RPC_URL=

# KeysAPI DB config
KEYS_API_DB_NAME=keys_service_db
KEYS_API_DB_PORT=5452
KEYS_API_DB_HOST=localhost
KEYS_API_DB_USER=test
KEYS_API_DB_PASSWORD=test

```
</details>

#### Running the Application
At this point, it is most convenient to run the application with docker-compose. Below is a configuration template for running the entire application:

<details>

<summary>docker-compose.yml</summary>

```yaml=
version: '3.7'

services:
  keys_api_service_db:
    image: postgres:14-alpine
    container_name: keys_api_service_db
    restart: unless-stopped
    environment:
      - POSTGRES_DB=${KEYS_API_DB_NAME}
      - POSTGRES_USER=${KEYS_API_DB_USER}
      - POSTGRES_PASSWORD=${KEYS_API_DB_PASSWORD}
    ports:
      - '127.0.0.1:${KEYS_API_DB_PORT}:5432'
    volumes:
      - ./.volumes/pgdata-${CHAIN_ID}/:/var/lib/postgresql/data

  keys_api_service_api:
    image: lidofinance/lido-keys-api@sha256:563506329ebec7148cf80cabf5facdf1c09cc59ead9a8dfece2a38a441408ee0
    container_name: keys_api_service_api
    ports:
      - '127.0.0.1:${KEYS_API_PORT}:3001'
    environment:
      - PORT=3001
      - LOG_LEVEL=${LOG_LEVEL}
      - LOG_FORMAT=${LOG_FORMAT}
      - CHAIN_ID=${CHAIN_ID}
      - PROVIDERS_URLS=${RPC_URL}
      - VALIDATOR_REGISTRY_ENABLE=false
      - DB_NAME=${KEYS_API_DB_NAME}
      - DB_PORT=5432
      - DB_HOST=keys_api_service_db
      - DB_USER=${KEYS_API_DB_USER}
      - DB_PASSWORD=${KEYS_API_DB_PASSWORD}
    depends_on:
      - keys_api_service_db

  council_daemon:
    image: lidofinance/lido-council-daemon@sha256:4fa0c4ebf56bf3382266debfc3d7e860530d7439129f0cc0f5fbdc8f3e1779eb
    ports:
      - "127.0.0.1:${PORT}:3000" # port is used for prometheus metrics
    environment:
      - PORT=3000
      - LOG_LEVEL=${LOG_LEVEL}
      - LOG_FORMAT=${LOG_FORMAT}
      - RPC_URL=${RPC_URL}
      - WALLET_PRIVATE_KEY=${WALLET_PRIVATE_KEY}
      - KEYS_API_HOST=${KEYS_API_HOST}
      - KEYS_API_PORT=${KEYS_API_PORT}
      - PUBSUB_SERVICE=rabbitmq
      - RABBITMQ_URL=${RABBITMQ_URL}
      - RABBITMQ_LOGIN=${RABBITMQ_LOGIN}
      - RABBITMQ_PASSCODE=${RABBITMQ_PASSCODE}
    depends_on:
      - keys_api_service_api
    volumes:
      - ./.volumes/cache/:/council/cache/

```
</details>

##### Run with Docker-Compose

After updating the docker-compose file and the .env configuration file, simply enter the command:

```bash
docker-compose up -d
```

Next, we can read the log:
```bash
docker-compose logs -f
```

##### Logs

On startup, the daemon checks if the provided wallet address belongs to the list of guardians, as well as account balance. If something goes wrong you will see warnings:

```log
warn: Private key is not provided, a random address will be generated for the test run
warn: Account balance is too low {"balance":"1.0 ETH"}
warn: Your address is not in the Guardian List {"address":"0x0000000000000000000000000000000000000000"}
```

If all goes well, it will be in the logs:

```log
info: Account balance is sufficient {"balance":"1.0 ETH"}
info: Your address is in the Guardian List {"address":"0x0000000000000000000000000000000000000000"}
```

At the first startup the daemon will collect historical data:

```log
info: Historical events are fetched {"endBlock":4487322,"events":3,"startBlock":4467323}
```

If the daemon works correctly, the logs will look like this:

```log
debug: Fresh events are fetched {"startBlock":5679826,"endBlock":5679976,"events":6}
debug: Fresh events are fetched {"startBlock":5679827,"endBlock":5679977,"events":6}
debug: Fresh events are fetched {"startBlock":5679828,"endBlock":5679978,"events":7}
info: No problems found {"type":"deposit","depositRoot":"0xc2c9308fa425a64ef9cac1837412ba462b6429fce2f170184284a260b735638c","nonce":12,"blockNumber":5679978,"blockHash":"0x87762c941f653f2f70157f86deac78f19e4d1549e231a52d1191289592d1a0ab","guardianAddress":"0x3dc4cF780F2599B528F37dedB34449Fb65Ef7d4A","guardianIndex":0,"signature":{"r":"0x44fec2e6fd34e74b8f001ef0e5bbd2db6d3179925fb82cb43231e19af46f0ddd","s":"0x2ff4326af760e353803458b75279eb8f58e5735b3565ea16bcd0f773bce106a4","_vs":"0xaff4326af760e353803458b75279eb8f58e5735b3565ea16bcd0f773bce106a4","recoveryParam":1,"v":28}}
debug: Fresh events are fetched {"startBlock":5679829,"endBlock":5679979,"events":7}
```

Init contracts addresses

```log
info: Contract initial address {"address":"0x0000000000000000000000000000000000000000","contractKey":"contract:LidoAbi"}
info: Contract initial address {"address":"0x0000000000000000000000000000000000000000","contractKey":"contract:SecurityAbi"}
info: Contract initial address {"address":"0x0000000000000000000000000000000000000000","contractKey":"contract:StakingRouterAbi"}
```

If contract addresses changed

```log
info: Contract address was changed {"address":"0x0000000000000000000000000000000000000000","contractKey":"contract:LidoAbi"}
info: Contract address was changed {"address":"0x0000000000000000000000000000000000000000","contractKey":"contract:SecurityAbi"}
info: Contract address was changed {"address":"0x0000000000000000000000000000000000000000","contractKey":"contract:StakingRouterAbi"}
```

#### Prometheus Metrics

Prometheus metrics are exposed via HTTP `/metrics` endpoint.
