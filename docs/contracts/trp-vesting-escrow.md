# TRP VestingEscrow

- [Source Code](https://github.com/lidofinance/lido-vesting-escrow/tree/main/contracts)
- Deployed Contracts (mainnet)
  - [VestingEscrowFactory](https://etherscan.io/address/0xDA1DF6442aFD2EC36aBEa91029794B9b2156ADD0)
  - [VestingEscrowProto](https://etherscan.io/address/0x484FD04c598A095360DF89bF85AB34c37127AA39)
  - [VotingAdapter](https://etherscan.io/address/0xCFda8aB0AE5F4Fa33506F9C51650B890E4871Cc1)
- Deployed Contracts (goerli+prater)
  - [VestingEscrowFactory](https://goerli.etherscan.io/address/0x8D20FD1Ac547e035BF01089cFb92459054F82Ff7)
  - [VestingEscrowProto](https://goerli.etherscan.io/address/0x7915be0b4BF48b46E594988AcE5553bc0eF7F2E3)
  - [VotingAdapter](https://goerli.etherscan.io/address/0x4d5C16778B7632e7B0C24fF102072247b9cf34c2)
- [Detailed contracts spec](https://hackmd.io/@lido/rkKpFX8So)

[Token Reward Program (TRP)](https://research.lido.fi/t/lidodao-token-rewards-plan-trp/3364) escrow contracts allow transparent on-chain distribution and vesting of the token rewards for the Lido DAO contributors.

## VestingEscrowFactory

### Public variables

- `voting_adapter: address` - address of the VotingAdapter used in the vestings
- `owner: address` - factory and vestings owner
- `manager: address` - vestings manager

### View methods

#### target()

Returns immutable `TARGET`

```vyper
@external
@view
def target() -> uint256
```

#### token()

Returns immutable `TOKEN`

```vyper
@external
@view
def token() -> uint256
```

### Methods

#### deploy_vesting_contract()

:::note
Before calling `deploy_vesting_contract()` caller need to have enough tokens on the balance and call `approve(vestingFactoryAddress, fundAmount)` on the token contract
:::

Deploy and fund a new instance of the `VestingEscrow` for the given `recipient`. Set all params for the deployed escrow.
Returns address of the deployed escrow

```vyper
@external
def deploy_vesting_contract(
    amount: uint256,
    recipient: address,
    vesting_duration: uint256,
    vesting_start: uint256 = block.timestamp,
    cliff_length: uint256 = 0,
    is_fully_revokable: bool = False
) -> address
```

##### Parameters

| Name                 | Type                        | Description                                                |
|----------------------|-----------------------------|------------------------------------------------------------|
| `amount`             | `uint256`                   | Amount of the tokens to be controlled by vesting           |
| `recipient`          | `address`                   | Recipient of the vested funds                              |
| `vesting_duration`   | `uint256`                   | Vesting duration in seconds                                |
| `vesting_start`      | `uint256`                   | Vesting start time in seconds (unix time in sec)           |
| `cliff_length`       | `uint256`                   | Cliff duration in seconds                                  |
| `is_fully_revokable` | `bool`                      | Flag that enables `revoke_all` method                      |

:::note
Reverts if any of the following is true:

- `vesting_duration <= 0`.
- `cliff_length >= vesting_duration`
- token transfer from caller to factory fails
- approve of the tokens to the actual vesting fails
:::

#### recover_erc20()

Collect ERC20 tokens from the contract to the `owner`.

```vyper
@external
def recover_erc20(
    token: address,
    amount: uint256
)
```

##### Parameters

| Name           | Type                        | Description                                                |
|----------------|-----------------------------|------------------------------------------------------------|
| `token`        | `address`                   | Address of ERC20 token to recover                          |
| `amount`       | `uint256`                   | Amount of the tokens to recover                            |

:::note
Reverts if:

- tokens transfer to `owner` fails
:::

#### recover_ether()

Collect all ether from the contract to the `owner`.

```vyper
@external
def recover_ether()
```

:::note
Reverts if:

- Ether transfer to `owner` fails
:::

#### update_voting_adapter()

Set `self.voting_adapter` to `voting_adapter`.

```vyper
@external
def update_voting_adapter(
    voting_adapter: address
)
```

##### Parameters

| Name             | Type                        | Description                                                |
|------------------|-----------------------------|------------------------------------------------------------|
| `voting_adapter` | `address`                   | New voting adapter                                         |

:::note
Reverts if:

- called by anyone except `VestingEscrowFactory` owner
:::

#### change_owner()

Set `self.owner` to `owner`.

```vyper
@external
def change_owner(
    owner: address
)
```

##### Parameters

| Name             | Type                        | Description                                                |
|------------------|-----------------------------|------------------------------------------------------------|
| `owner`          | `address`                   | New `owner` address                                          |

:::note
Reverts if:

- called by anyone except `VestingEscrowFactory` owner
- arg `owner` is empty address
:::

#### change_manager()

Set `self.manager` to `manager`.

```vyper
@external
def change_manager(
    manager: address
)
```

##### Parameters

| Name             | Type                        | Description                                                |
|------------------|-----------------------------|------------------------------------------------------------|
| `manager`        | `address`                   | New `manager` address                                        |

:::note
Reverts if:

- called by anyone except `VestingEscrowFactory` owner
:::

## VestingEscrow

### Public variables

- `recipient: address` - address that can claim tokens from escrow
- `token: ERC20` - address of the vested token
- `start_time: uint256` - vesting start time (UTC time in UNIX seconds)
- `end_time: uint256` - vesting end time (UTC time in UNIX seconds)
- `cliff_length: uint256` - cliff length in seconds
- `factory: IVestingEscrowFactory` - address of the parent factory
- `total_locked: uint256` - total amount of the tokens to be vested (does not change after claims)
- `is_fully_revokable: bool` - flag showing if the escrow is fully revocable or not
- `total_claimed: uint256` - total amount of the claimed tokens
- `disabled_at: uint256` - effective vesting end time (UTC time in UNIX seconds). Can differ from end_time in case of the revoke_xxx methods call
- `initialized: bool` - flag indicating that escrow was initialized
- `is_fully_revoked: bool` - flag indicating that escrow was fully revoked and there are no more tokens

### View methods

#### unclaimed()

Returns the current amount of the tokens available for the claim.

```vyper
@external
@view
def unclaimed() -> uint256
```

#### locked()

Returns the current amount of the tokens locked.

```vyper
@external
@view
def locked() -> uint256
```

### Methods

#### claim()

Claim tokens to the `beneficiary` address. If the requested amount is larger than `unclaimed`, then the `unclaimed` amount will be claimed.

Returns actual amount of the tokens claimed.

```vyper
@external
def claim(
    beneficiary: address = msg.sender,
    amount: uint256 = max_value(uint256)
)
```

##### Parameters

| Name           | Type                        | Description                                                |
|----------------|-----------------------------|------------------------------------------------------------|
| `beneficiary`  | `address`                   | Address to claim tokens to                                 |
| `amount`       | `uint256`                   | Amount of the tokens to claim                              |

:::note
Reverts if:

- called by anyone except vesting `recipient`
- tokens transfer to `beneficiary` fails
:::

#### revoke_unvested()

Disable further flow of tokens and revoke the unvested part to the owner.

```vyper
@external
def revoke_unvested()
```

:::note
Reverts if:

- called by anyone except `VestingEscrowFactory` owner or manager
- tokens transfer to `VestingEscrowFactory.owner()` fails
:::

#### revoke_all()

Disable further flow of tokens and revoke all tokens to the owner.

```vyper
@external
def revoke_all()
```

:::note
Reverts if:

- `is_fully_revocable` param of the `VestingEscrow` is not True
- called by anyone except `VestingEscrowFactory` owner
- tokens transfer to `VestingEscrowFactory.owner` fails
:::

#### recover_erc20()

Collect ERC20 tokens from the contract to the `recipient`.

```vyper
@external
def recover_erc20(
    token: address,
    amount: uint256
)
```

##### Parameters

| Name           | Type                        | Description                                                |
|----------------|-----------------------------|------------------------------------------------------------|
| `token`        | `address`                   | Address of ERC20 token to recover                          |
| `amount`       | `uint256`                   | Amount of the tokens to recover                            |

:::note
Reverts if:

- tokens transfer to `recipient` fails
:::

#### recover_ether()

Collect all ether from the contract to the `recipient`.

```vyper
@external
def recover_ether()
```

:::note
Reverts if:

- Ether transfer to `recipient` fails
:::

#### aragon_vote()

Participate in the Aragon vote using all available tokens on the contract's balance. Uses `delegateCall` to `VotingAdapter`. `VotingAdapter` address is fetched from `self.factory`.

```vyper
@external
def aragon_vote(
    abi_encoded_params: Bytes[1000]
)
```

##### Parameters

| Name                 | Type                        | Description                                                                                                      |
|----------------------|-----------------------------|------------------------------------------------------------------------------------------------------------------|
| `abi_encoded_params` | `Bytes[1000]`               | ABI encoded params for the `vote` method call. can be compiled using `VotingAdapter.encode_aragon_vote_calldata` |

:::note
Reverts if:

- called by anyone except vesting `recipient`
:::

#### snapshot_set_delegate()

Delegate Snapshot voting power of all available tokens on the contract's balance to `delegate`. Uses `delegateCall` to `VotingAdapter`. `VotingAdapter` address is fetched from `self.factory`.

```vyper
@external
def snapshot_set_delegate(
    abi_encoded_params: Bytes[1000]
)
```

##### Parameters

| Name                 | Type                        | Description                                                                                                                |
|----------------------|-----------------------------|----------------------------------------------------------------------------------------------------------------------------|
| `abi_encoded_params` | `Bytes[1000]`               | ABI encoded params for the `delegate` method call. can be compiled using `VotingAdapter.encode_snapshot_set_delegate_calldata` |

:::note
Reverts if:

- called by anyone except vesting `recipient`
:::

#### delegate()

:::note
Stub at the moment of writing
:::

Delegate voting power of all available tokens on the contract's balance to `delegate`. Uses `delegateCall` to VotingAdapter. `VotingAdapter` address is fetched from `self.factory`.

```vyper
@external
def delegate(
    abi_encoded_params: Bytes[1000]
)
```

##### Parameters

| Name                 | Type                        | Description                                                                                                   |
|----------------------|-----------------------------|---------------------------------------------------------------------------------------------------------------|
| `abi_encoded_params` | `Bytes[1000]`               | ABI encoded params for the `vote` method call. can be compiled using `VotingAdapter.encode_delegate_calldata` |

:::note
Reverts if:

- called by anyone except vesting `recipient`
:::

## VotingAdapter

### Public variables

- `owner: address` - votingAdapter owner

### View methods

#### encode_aragon_vote_calldata()

Returns abi encoded params for the `aragon_vote` call.

```vyper
@external
@view
def encode_aragon_vote_calldata(
    voteId: uint256,
    supports: bool
) -> Bytes[1000]
```

##### Parameters

| Name           | Type                        | Description                                                |
|----------------|-----------------------------|------------------------------------------------------------|
| `voteId`       | `uint256`                   | Aragon vote id                                             |
| `amount`       | `bool`                      | Supports flag. `True` - for, `False` - against             |

#### encode_snapshot_set_delegate_calldata()

Returns abi encoded params for the `snapshot_set_delegate` call.

```vyper
@external
@view
def encode_snapshot_set_delegate_calldata(
    delegate: address
) -> Bytes[1000]
```

##### Parameters

| Name           | Type                        | Description                                                |
|----------------|-----------------------------|------------------------------------------------------------|
| `delegate`     | `address`                   | Address to delegate snapshot voting power to               |

#### encode_delegate_calldata()

Returns abi encoded params for the `delegate` call.

```vyper
@external
@view
def encode_delegate_calldata(
    delegate: address
) -> Bytes[1000]
```

##### Parameters

| Name           | Type                        | Description                                                |
|----------------|-----------------------------|------------------------------------------------------------|
| `delegate`     | `address`                   | Address to delegate voting power to                        |

### Methods

#### aragon_vote()

Participate in the Aragon vote using all available tokens on the contract's balance. It makes sense only for delegateCalls, so the caller's balance will be used. Uses `VOTING_CONTRACT_ADDR` as the voting contract address.

```vyper
@external
def aragon_vote(
    abi_encoded_params: Bytes[1000]
)
```

##### Parameters

| Name                 | Type                        | Description                                                                                                      |
|----------------------|-----------------------------|------------------------------------------------------------------------------------------------------------------|
| `abi_encoded_params` | `Bytes[1000]`               | ABI encoded params for the `vote` method call. can be compiled using `VotingAdapter.encode_aragon_vote_calldata` |

:::note
Reverts if:

- called by anyone except vesting `recipient`
:::

#### snapshot_set_delegate()

Delegate Snapshot voting power of all available tokens. Makes sense only for delegateCalls so that the balance of the caller will be used. Uses `SNAPSHOT_DELEGATE_CONTRACT_ADDR` as the voting contract address.

```vyper
@external
def snapshot_set_delegate(
    abi_encoded_params: Bytes[1000]
)
```

##### Parameters

| Name                 | Type                        | Description                                                                                                                |
|----------------------|-----------------------------|----------------------------------------------------------------------------------------------------------------------------|
| `abi_encoded_params` | `Bytes[1000]`               | ABI encoded params for the `delegate` method call. can be compiled using `VotingAdapter.encode_snapshot_set_delegate_calldata` |

:::note
Reverts if:

- called by anyone except vesting `recipient`
:::

#### delegate()

:::note
Stub at the moment of writing
:::

Stub for the future implementation of the Voting with Delegation.

```vyper
@external
def delegate(
    abi_encoded_params: Bytes[1000]
)
```

##### Parameters

| Name                 | Type                        | Description                                                                                                   |
|----------------------|-----------------------------|---------------------------------------------------------------------------------------------------------------|
| `abi_encoded_params` | `Bytes[1000]`               | ABI encoded params for the `vote` method call. can be compiled using `VotingAdapter.encode_delegate_calldata` |

:::note
Always reverts
:::

#### recover_erc20()

Collect ERC20 tokens from the contract to the `owner`.

```vyper
@external
def recover_erc20(
    token: address,
    amount: uint256
)
```

##### Parameters

| Name           | Type                        | Description                                                |
|----------------|-----------------------------|------------------------------------------------------------|
| `token`        | `address`                   | Address of ERC20 token to recover                          |
| `amount`       | `uint256`                   | Amount of the tokens to recover                            |

:::note
Reverts if:

- tokens transfer to `owner` fails
:::

#### recover_ether()

Collect all ether from the contract to the `owner`.

```vyper
@external
def recover_ether()
```

:::note
Reverts if:

- Ether transfer to `owner` fails
:::

#### change_owner()

Set `self.owner` to `owner`

```vyper
@external
def change_owner(
    owner: address
)
```

##### Parameters

| Name           | Type                        | Description                                                |
|----------------|-----------------------------|------------------------------------------------------------|
| `owner`        | `address`                   | New `owner` address                                        |

:::note
Reverts if:

- called by anyone except `VotingAdapter` owner
- arg `owner` is empty address
:::
