# Embedding the Earn widget

When embedding the Lido Stake widget via an `iframe`, the Earn page is disabled by default, but it can be explicitly enabled or customized using URL query parameters.

## Base URL structure

You can embed either the main Earn dashboard or a direct deposit page for a specific vault.

- Main Earn page (displays all available vaults): `https://stake.lido.fi/earn`
- Specific Earn vault page (links to a specific vault's deposit screen): `https://stake.lido.fi/earn/[vault-id]/deposit`

## Configuration parameters

Control the visibility of the Earn page using the `earn` query parameter in the iframe `src` URL.

| Mode | Query parameter | Description |
| --- | --- | --- |
| Enable full access | `?earn=enabled` | Required for iframes. Enables the Earn page with all available vaults. |
| Enable specific vaults | <code className="earn-nowrap">?earn=vault1,vault2</code> | Enables the Earn page but restricts the list to specific vaults only. |
| Disable Earn | `?earn=disabled` | Explicitly disables the Earn page (useful if using the default URL outside of an iframe context). |

:::note
If no parameter is provided in an iframe context, the Earn page will remain disabled.
:::

## Integration examples

### Enable full Earn dashboard

This example embeds the widget with the Earn page fully enabled, showing all available vaults.

```html
<html>
  <body>
    <iframe
      src="https://stake.lido.fi/earn?earn=enabled"
      frameborder="0"
      width="100%"
      height="100%"
    ></iframe>
  </body>
</html>
```

### Enable specific vaults only

This example enables the Earn page but limits the visible options to specific vaults (for example `ggv` and `dvv`).

```html
<html>
  <body>
    <iframe
      src="https://stake.lido.fi/earn?earn=ggv,dvv"
      frameborder="0"
      width="100%"
      height="100%"
    ></iframe>
  </body>
</html>
```

### Link to a specific vault

This example links directly to the deposit page of a specific vault (for example `ggv`). Include `earn=enabled` or the specific vault ID to ensure the feature is active in the iframe.

```html
<html>
  <body>
    <iframe
      src="https://stake.lido.fi/earn/ggv/deposit?earn=enabled"
      frameborder="0"
      width="100%"
      height="100%"
    ></iframe>
  </body>
</html>
```
