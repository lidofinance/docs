---
sidebar_position: 4
---

# 🤖 Set up MEV-Boost

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## Lido requirements

### Relays

Use only relays from the [vetted relay list](https://operatorportal.lido.fi/public/relay-maintenance-committee/mev-boost-relays). On Mainnet:

- Use at least some relays tagged "must use some".
- Relays tagged "may use" are also allowed.
- Never use a relay that is not on the list.

The same list is published on-chain in the MEV-Boost relay allowed list contract on [Mainnet](https://etherscan.io/address/0xF95f069F9AD107938F6ba802a3da87892298610E) and [Hoodi](https://hoodi.etherscan.io/address/0x279d3A456212a1294DaEd0faEE98675a52E8A4Bf). The relay lists in the examples on this page are for illustration only, so check them against the vetted list before using them.

### Builder boost factor

Lido requires local and builder payloads to have equal weight, which means a builder boost factor of 100%. The required setting for each client is in the [APMs Allowed List](https://github.com/lidofinance/documents-and-policies/blob/main/APMs%20Allowed%20List.md), which Node Operators follow under the Lido on Ethereum [Standard Node Operator Protocol on Block Proposals](https://github.com/lidofinance/documents-and-policies/blob/main/Lido%20on%20Ethereum%20Standard%20Node%20Operator%20Protocol%20%E2%80%93%20Block%20Proposals.md). Several clients default to a different value, so check the setting for yours.

<Tabs>
  <TabItem value="teku" label="Teku">

On the beacon node, set `--builder-bid-compare-factor=100`. The default is `90`, so you need to change it.

See the [Teku documentation](https://docs.teku.consensys.com/reference/cli#builder-bid-compare-factor).

  </TabItem>
  <TabItem value="prysm" label="Prysm">

On the beacon node, set `--local-block-value-boost=0`. The default is `10`, so you need to change it.

See the [Prysm documentation](https://prysm.offchainlabs.com/docs/validators/mev-boost/).

  </TabItem>
  <TabItem value="lighthouse" label="Lighthouse">

On the validator client, `--builder-boost-factor` defaults to `100`, so no change is needed.

See the [Lighthouse documentation](https://lighthouse-book.sigmaprime.io/help_vc.html).

  </TabItem>
  <TabItem value="nimbus" label="Nimbus">

The setting that applies depends on where your validator keys are.

- **Keys in the beacon node:** set `--local-block-value-boost=0`. The default is `10`, so you need to change it.
- **Keys in a separate validator client:** `--builder-boost-factor` defaults to `100`, so no change is needed.

See the [Nimbus documentation](https://nimbus.guide/options.html).

  </TabItem>
  <TabItem value="lodestar" label="Lodestar">

On the validator client, set `--builder.selection maxprofit`, which is equivalent to a boost factor of `100`. The default selection is equivalent to `90`, so you need to change it.

See the [Lodestar documentation](https://chainsafe.github.io/lodestar/run/validator-management/vc-configuration/#configure-your-builder-selection-andor-builder-boost-factor).

  </TabItem>
</Tabs>

For clients not listed here, such as Grandine, Vero, Vouch, or Charon, see the [APMs Allowed List](https://github.com/lidofinance/documents-and-policies/blob/main/APMs%20Allowed%20List.md).

### Minimum bid

MEV-Boost and some consensus clients let you set a minimum bid, below which your node builds the block locally. If you set one, keep it within the [community min-bid guidance](https://research.lido.fi/t/lido-node-operator-mev-boost-min-bid-guidance/3347). The current upper limit is in the [APMs Allowed List](https://github.com/lidofinance/documents-and-policies/blob/main/APMs%20Allowed%20List.md).

## Dappnode

To install or modify MEV Boost in your Dappnode setup, head to the [**Stakers tab**](http://my.dappnode/stakers/ethereum) and choose relays that meet the [relay requirements](#relays).

![Dappnode Stakers tab](/img/csm-guide/mev-1.png)

## EthPillar

If you selected `3. Lido CSM Staking Node` via the Terminal UI (TUI) and followed the setup flow, the MEV Boost service should automatically be included in your systemd stack with the following 6 MEV relays selected (for Mainnet). 

```
    -relay https://0xa15b52576bcbf1072f4a011c0f99f9fb6c66f3e1ff321f11f461d15e31b1cb359caa092c71bbded0bae5b5ea401aab7e@aestus.live \
    -relay https://0xa7ab7a996c8584251c8f925da3170bdfd6ebc75d50f5ddc4050a6fdc77f2a3b5fce2cc750d0865e05d7228af97d69561@agnostic-relay.net \
    -relay https://0x8b5d2e73e2a3a55c6c87b8b6eb92e0149a125c852751db1422fa951e42a09b82c142c3ea98d0d9930b056a3bc9896b8f@bloxroute.max-profit.blxrbdn.com \
    -relay https://0xb0b07cd0abef743db4260b0ed50619cf6ad4d82064cb4fbec9d3ec530f7c5e6793d9f286c4e082c0244ffb9f2658fe88@bloxroute.regulated.blxrbdn.com \
    -relay https://0xac6e77dfe25ecd6110b8e780608cce0dab71fdd5ebea22a16c0205200f2f8e2e3ad3b71d3499c54ad14d6c21b41a37ae@boost-relay.flashbots.net \
    -relay https://0xa1559ace749633b997cb3fdacffb890aeebdb0f5a3b6aaa7eeeaf1a38af0a8fe88b9e4b1f61f236d2e64d95733327a62@relay.ultrasound.money
```

:::warning
This default list includes `bloxroute.max-profit`, which is no longer on the vetted list. Remove it by editing the MEV-Boost configuration as described below, and check the remaining relays against the [relay requirements](#relays).
:::

### Adding MEV Boost Separately
Run `ethpillar` on your terminal to activate the TUI.

Select `5. MEV-Boost` >> `5. Edit configuration`.

Add MEV Relays using the -relay flag and ending with a " \" for each line, choosing relays that meet the [relay requirements](#relays).

**Mainnet Example:**

```
[Unit]
Description=MEV-Boost Service for MAINNET
Wants=network-online.target
After=network-online.target
Documentation=https://www.coincashew.com

[Service]
User=mevboost
Group=mevboost
Type=simple
Restart=always
RestartSec=5
ExecStart=/usr/local/bin/mev-boost \
    -mainnet \
    -relay-check \
    -relay https://0xa15b52576bcbf1072f4a011c0f99f9fb6c66f3e1ff321f11f461d15e31b1cb359caa092c71bbded0bae5b5ea401aab7e@aestus.live \
    -relay https://0xa7ab7a996c8584251c8f925da3170bdfd6ebc75d50f5ddc4050a6fdc77f2a3b5fce2cc750d0865e05d7228af97d69561@agnostic-relay.net \
    -relay https://0xb0b07cd0abef743db4260b0ed50619cf6ad4d82064cb4fbec9d3ec530f7c5e6793d9f286c4e082c0244ffb9f2658fe88@bloxroute.regulated.blxrbdn.com \
    -relay https://0xac6e77dfe25ecd6110b8e780608cce0dab71fdd5ebea22a16c0205200f2f8e2e3ad3b71d3499c54ad14d6c21b41a37ae@boost-relay.flashbots.net \
    -relay https://0xa1559ace749633b997cb3fdacffb890aeebdb0f5a3b6aaa7eeeaf1a38af0a8fe88b9e4b1f61f236d2e64d95733327a62@relay.ultrasound.money

[Install]
WantedBy=multi-user.target
```




## Stereum
Whether through manual or 1-click setup, the Stereum launcher installs MEV Boost by default. Follow these steps if you want to change your relays or install MEV Boost, choosing relays that meet the [relay requirements](#relays).

1. If you have MEV Boost installed but you want to change the relays, open MEV Boost in Stereum by clicking on the logo at the top as shown in the image below.

![Stereum MEV Boost 1](/img/csm-guide/mev-2.png)

2. If you don't have MEV Boost installed, open the Edit Node page as shown above, then open the setup and look search for the Flashbots MEV Boost service in the services bar at the right. Check the installation path, the relays and confirm the changes to install it.

![Stereum MEV Boost 2](/img/csm-guide/mev-3.png)
 
## Sedge
If you followed the steps on our Sedge section, Sedge installs MEV Boost with the relays it reads from the on-chain relay allowed list for your network, so the list stays current.

### Adding MEV Boost Separately
To add the service alone, you can run `sedge generate mev-boost --relay-urls=` followed by the relay URLs separated by commas, choosing relays that meet the [relay requirements](#relays).

**Mainnet Example:**

```
sedge generate mev-boost --relay-urls=https://0xa15b52576bcbf1072f4a011c0f99f9fb6c66f3e1ff321f11f461d15e31b1cb359caa092c71bbded0bae5b5ea401aab7e@aestus.live,https://0xa7ab7a996c8584251c8f925da3170bdfd6ebc75d50f5ddc4050a6fdc77f2a3b5fce2cc750d0865e05d7228af97d69561@agnostic-relay.net,https://0xb0b07cd0abef743db4260b0ed50619cf6ad4d82064cb4fbec9d3ec530f7c5e6793d9f286c4e082c0244ffb9f2658fe88@bloxroute.regulated.blxrbdn.com,https://0xac6e77dfe25ecd6110b8e780608cce0dab71fdd5ebea22a16c0205200f2f8e2e3ad3b71d3499c54ad14d6c21b41a37ae@boost-relay.flashbots.net,https://0xa1559ace749633b997cb3fdacffb890aeebdb0f5a3b6aaa7eeeaf1a38af0a8fe88b9e4b1f61f236d2e64d95733327a62@relay.ultrasound.money
```

## Eth Docker
If you selected the **Lido Compatible Node >> CSM Node option** and followed the Terminal UI setup flow, the MEV Boost service should automatically be included in your docker compose stack with the Aestus, Titan, Flashbots, and Ultrasound relays selected.
![MEV relays selected by Eth Docker](/img/csm-guide/eth-docker-mev-relays.png)

### Adding MEV Boost separately
Edit the `.env` file.
```
sudo nano ~/eth-docker/.env 
```
1. Ensure that `:mev-boost.yml` is added to the `COMPOSE_FILE=` line (the very first uncommented line).
![COMPOSE_FILE line with mev-boost.yml](/img/csm-guide/eth-docker-compose-file.png)

2. Add MEV Relays to the `MEV_RELAYS=` line, use commas without spaces to delimit multiple relay endpoints. Choose relays that meet the [relay requirements](#relays).

**Mainnet Example:**

```
MEV_RELAYS=https://0xb0b07cd0abef743db4260b0ed50619cf6ad4d82064cb4fbec9d3ec530f7c5e6793d9f286c4e082c0244ffb9f2658fe88@bloxroute.regulated.blxrbdn.com,https://0xa7ab7a996c8584251c8f925da3170bdfd6ebc75d50f5ddc4050a6fdc77f2a3b5fce2cc750d0865e05d7228af97d69561@agnostic-relay.net,https://0xac6e77dfe25ecd6110b8e780608cce0dab71fdd5ebea22a16c0205200f2f8e2e3ad3b71d3499c54ad14d6c21b41a37ae@boost-relay.flashbots.net,https://0xa15b52576bcbf1072f4a011c0f99f9fb6c66f3e1ff321f11f461d15e31b1cb359caa092c71bbded0bae5b5ea401aab7e@aestus.live,https://0xa1559ace749633b997cb3fdacffb890aeebdb0f5a3b6aaa7eeeaf1a38af0a8fe88b9e4b1f61f236d2e64d95733327a62@relay.ultrasound.money
```

## Systemd

The node setup itself is covered under [Systemd](/run-on-lido/csm/node-setup/advanced/systemd). Choose relays that meet the [relay requirements](#relays).

## Ethereum on ARM

The MEV Boost setup steps are covered under [Ethereum on ARM](/run-on-lido/csm/node-setup/advanced/ethereum-on-arm). Choose relays that meet the [relay requirements](#relays).
