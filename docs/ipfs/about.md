# About IPFS

IPFS (InterPlanetary File System) is a suite of protocols for publishing data (files, directories, websites, etc.) in a decentralised fashion.
For more info, see [What is IPFS](https://docs.ipfs.tech/concepts/what-is-ipfs/).

There is an option to use some Lido interfaces via IPFS, for example [Lido Ethereum Staking Widget](https://github.com/lidofinance/ethereum-staking-widget).

#### IPFS is used for Lido apps because:
- IPFS has no single point of failure. The failure of a single or even multiple nodes in the network does not affect the functioning of the entire network.
- IPFS is decentralized, which makes IPFS more resilient than traditional systems.
- IPFS uses cryptographic hashes to verify the authenticity and integrity of files, making it difficult for malicious actors to affect files.

## Address
### What is a CID
A content identifier, or CID, is a label used to point to material in IPFS. CIDs are based on the content’s cryptographic hash.
Any difference in the content will produce a different CID.
Note that CIDs won't match file hashes (checksums), because CID contains additional information that the hash does not (i.e., the codec of the data).

### IPFS HTTP Gateways
An IPFS gateway is a web-based service that gets content from an IPFS network, and makes it available via HTTP protocol 
that all web browsers understand. A gateway address can look like this: `https://{CID}.ipfs.cf-ipfs.com`

### Where to get CID and gateway address

:::info
Each new set of changes to a Lido app will produce a new CID, therefore each release will be available at its specific address.
This means that for a Lido app, **there won't be a gateway address that always points to the most recent release**.
The gateway you are currently using may point to the most updated version, but it will remain so until a new release to IPFS occurs.
After opening a Lido app, it will automatically check if the app's version is the latest one. If not, the user will be notified and asked to use the latest version.
:::

#### Releases page on GitHub
The latest release information is available on GitHub under the Releases page of the app repository.
For Ethereum Staking Widget it is [here](https://github.com/lidofinance/ethereum-staking-widget/releases).  
Using the page, one can find the information about the latest release, including the IPFS pinning artifacts
(note, that not every release is pinned to IPFS, see [Release frequency](#release-frequency)).

#### Action page on GitHub
You can take this information from the latest GitHub action in which IPFS pinning happened:
1. Open the app's repo, follow the "Actions" tab.
2. On the left side, in the navigation bar, find the workflow for IPFS releases; for the Ethereum Staking Widget it is called "[IPFS Release](https://github.com/lidofinance/ethereum-staking-widget/actions/workflows/ci-ipfs.yml)".
3. Open the latest successful workflow and look for the "ipfs-pinning" title. There you will find a root CID and a link to an IPFS HTTP gateway.

#### IPFS.json
There is a convention to store the latest CID for an app in the `IPFS.json` file in the project's root.

:::info
This solution might be not the final one, serves for development purposes, and is a subject to change in the future.
The future plans are to replace the latest CID registry with the one living on-chain and be updated via the Lido DAO governance.  
:::

### Release frequency
Not every new release of Lido applications will be deployed to IPFS; only major releases or critical fixes will be deployed.
So the deployment cadence shouldn't be too frequent.  
This approach is preferred due to the numerous actions required to make an IPFS release,
and also the fact that each new release of a Lido app will produce a new CID and will be available at the new address, 
which is inconvenient for users willing to always use the latest version of an application.

## Further reading
- [Release Flow](release-flow.md)
- [Security](security.md)
- [Hash Verification](hash-verification.md)
- [IPFS applications list](apps-list.md)

