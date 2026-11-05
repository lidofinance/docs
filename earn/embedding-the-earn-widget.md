# Embedding the Earn widget

When embedding the Lido Widget via an `iframe`, the Earn page is **enabled by default**. Use URL query parameters only if you need to hide the page, restrict the set of visible vaults, or show Earn without other products.

## Base URL structure

You can embed either the main Earn dashboard or a direct deposit page for a specific vault.

- Main Earn page (displays all available vaults): `https://stake.lido.fi/earn`
- Specific Earn vault page (links to a specific vault's deposit screen): `https://stake.lido.fi/earn/[vault-id]/deposit`

## Configuration parameters

Control the visibility of the Earn page using the `product` and `earn` query parameters in the iframe `src` URL.

| Mode | Query parameter | Description |
| --- | --- | --- |
| Show everything (default) | *(no parameter)* | All products are shown, and the Earn page displays all available vaults. |
| Show only Earn | `?product=earn` | Shows only the Earn page; all other products are hidden. |
| Show only specific vaults | <code className="earn-nowrap">?earn=vault1,vault2</code> | Shows **only** the listed vaults; all others are hidden. Available vault names: `eth`, `usd`, `ggv`, `dvv`, `strategy`. |
| Disable Earn | `?earn=disabled` | Hides the Earn page entirely. |

To control which other products (Stake, Swap) are shown alongside Earn, see [Choosing which products to show](/integrations/wallets#choosing-which-products-to-show).

## Integration examples

### Show only the Earn page

This example shows only the Earn page; all other products, including Stake, are hidden. New products added to the Lido Widget later will not appear in your integration either.

```html
<html>
  <body>
    <iframe
      src="https://stake.lido.fi/earn?product=earn"
      title="Lido Widget"
      frameborder="0"
      width="100%"
      height="100%"
    ></iframe>
  </body>
</html>
```

You can combine `product=earn` with the `earn` parameter to also restrict the set of vaults, for example `?product=earn&earn=eth,usd`.

### Disable the Earn page

This example hides the Earn page; all other products stay visible. To show only Stake, use `?product=stake` instead — see [Choosing which products to show](/integrations/wallets#choosing-which-products-to-show).

```html
<html>
  <body>
    <iframe
      src="https://stake.lido.fi?earn=disabled"
      title="Lido Widget"
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
      title="Lido Widget"
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
      title="Lido Widget"
      frameborder="0"
      width="100%"
      height="100%"
    ></iframe>
  </body>
</html>
```
