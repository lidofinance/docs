# DataBus

- [Source Code](https://github.com/lidofinance/data-bus/blob/main/contracts/DataBus.sol)

:::info
The contract is posted at `0x37De961D6bb5865867aDd416be07189D2Dd960e6` and is available in [the test environment](/deployed-contracts/holesky#data-bus) and [the production environment](/deployed-contracts/#data-bus)
:::

## What is Data Bus?

It's a blockchain-based communication channel designed for efficient message exchange between different services using a smart contract on Ethereum.

## Why use Data Bus?

Data Bus facilitates the sending of arbitrary events with various data payloads. It offers a minimalistic design, low gas consumption, and requires no active maintenance or support.

## How to use Data Bus?

This contract uses a special event called an "abstract event," which is highly customizable and can carry a variety of data types under different event identifiers. It allows for the use of a unified mechanism to handle multiple event types, enhancing flexibility and efficiency in blockchain communication.

### Abstract Event Design

The contract defines an event with the following structure:

```solidity
event Message(
    bytes32 indexed eventId,
    address indexed sender,
    bytes data
) anonymous;
```

The `anonymous` attribute means the event does not use the standard event signature topic, allowing for more flexible and efficient event handling. For further details on anonymous events, refer to the [Solidity documentation](https://docs.soliditylang.org/en/latest/abi-spec.html#events).

### Emitting Events

To emit an event, calculate the hash of your event signature (e.g., `keccak256(bytes('SomeEvent(address,bytes)'))`), which becomes the `eventId`. This identifier, along with the data, is used in the function:

```solidity
function sendMessage(bytes32 _eventId, bytes calldata _data)
```

This function logs the event on the blockchain, allowing for any user-defined event to be emitted using the `Message` event template.
