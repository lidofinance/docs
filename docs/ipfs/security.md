# Security

## TODO: rewrite

The UI itself is built with non-secret environment variables. This is because IPFS content is accessible to anyone who downloads it from IPFS or takes artifacts from release descriptions. Therefore, public RPC nodes are used for RPC requests, explicitly communicated to the user in the UI, allowing them to specify necessary RPC nodes on the settings page. The data is stored in LocalStorage and used for subsequent visits to the same IPFS gateway.

Important:
Settings on the UI use LocalStorage, which is shared across users in some IPFS gateways.

When using an IPFS gateway and referencing an IPFS hash or IPNS name by the path (e.g., `{GATEWAY}/ipfs/{HASH}`) rather than the subdomain (e.g., `{HASH}.{GATEWAY}`), other sites accessed from the same IPFS gateway can view and change your settings.

To avoid this possibility, you can use the subdomain format of IPFS gateway URLs, which are contained in the release along with the path format.

UI changes
Because IPFS gateways will not default to serving /index.html as is expected by many single page applications, the Lido Interface uses a "hash" based router.
