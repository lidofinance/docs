# Embedding the Earn widget

When embedding the Lido Stake widget via an `iframe`, the Earn page is **enabled by default**. Use URL query parameters only if you need to hide the page or restrict the set of visible vaults.

## Base URL structure

You can embed either the main Earn dashboard or a direct deposit page for a specific vault.

- Main Earn page (displays all available vaults): `https://stake.lido.fi/earn`
- Specific Earn vault page (links to a specific vault's deposit screen): `https://stake.lido.fi/earn/[vault-id]/deposit`

## Configuration parameters

Control the visibility of the Earn page using the `earn` query parameter in the iframe `src` URL.

| Mode | Query parameter | Description |
| --- | --- | --- |
| Show all vaults (default) | *(no parameter)* | Earn page is fully enabled with all available vaults. |
| Show only specific vaults | <code className="earn-nowrap">?earn=vault1,vault2</code> | Shows **only** the listed vaults; all others are hidden. Available vault names: `eth`, `usd`, `ggv`, `dvv`, `strategy`. |
| Disable Earn | `?earn=disabled` | Hides the Earn page entirely. |

## Integration examples

### Disable the Earn page

This example hides the Earn page entirely, leaving only the standard staking interface.

```html
<html>
  <body>
    <iframe
      src="https://stake.lido.fi?earn=disabled"
      frameborder="0"
      width="100%"
      height="100%"
    ></iframe>
  </body>
</html>
```

### Show only specific vaults

This example limits the visible vaults to a specific subset (for example `eth` and `usd`). All other vaults are hidden.

```html
<html>
  <body>
    <iframe
      src="https://stake.lido.fi/earn?earn=eth,usd"
      frameborder="0"
      width="100%"
      height="100%"
    ></iframe>
  </body>
</html>
```

### Link to a specific vault

This example links directly to the deposit page of a specific vault (for example `eth`).

```html
<html>
  <body>
    <iframe
      src="https://stake.lido.fi/earn/eth/deposit"
      frameborder="0"
      width="100%"
      height="100%"
    ></iframe>
  </body>
</html>
```
