# IPFS

IPFS (InterPlanetary File System) is a suite of protocols for publishing data (files, directories, websites, etc.) in a decentralised fashion.
For more info, see [What is IPFS](https://docs.ipfs.tech/concepts/what-is-ipfs/).

There is an option to use some Lido interfaces via IPFS, for example Lido Ethereum Staking Widget.

#### We use IPFS because:
- IPFS has no single point of failure. The failure of a single or even multiple nodes in the network does not affect the functioning of the entire network.
- IPFS is decentralized, which makes IPFS more resilient than traditional systems.
- IPFS uses cryptographic hashes to verify the authenticity and integrity of files, making it difficult for malicious actors to affect files.

## Address
### What is a CID
A content identifier, or CID, is a label used to point to material in IPFS. CIDs are based on the content’s cryptographic hash.
Any difference in the content will produce a different CID.
But CIDs won't match file hashes (checksums), because CID contains additional information that the hash does not.

### IPFS HTTP Gateways
An IPFS gateway is a web-based service that gets content from an IPFS network, and makes it available via HTTP protocol 
that all web browsers understand.  
A gateway address can look like this: `https://{CID}.ipfs.cf-ipfs.com`

:::note
Some browsers support IPFS natively and can access IPFS content without gateways, using canonical addressing like  
`ipfs://{CID}/{optional path to resource}`  

Also, there is the [IPFS Companion Browser Extension](https://docs.ipfs.tech/install/ipfs-companion), which enables support for IPFS in your browser. 
:::

### Where to get CID and gateway address

:::info
Each new set of changes to an application will produce a new CID, therefore each release will be available at its specific address.
This means **there won't be a gateway address that always points to the most recent release**.
A gateway you are using now may point to the most updated version, but until a new release happens.  
So, you may want to look for a new CID or gateway address from time to time.
However, you may continue to use this gateway until it stops working for a some reason.   
:::

#### Action page on GitHub
You can take this information from the latest GitHub action in which IPFS pinning happened:
1. Open the app's repo, follow the "Actions" tab.
2. On the left, in the navigation, find the workflow for IPFS releasing, for the Ethereum Staking Widget it is called "[IPFS Release](https://github.com/lidofinance/ethereum-staking-widget/actions/workflows/ci-ipfs.yml)".
3. Open the latest successful workflow and look for the "ipfs-pinning" title. There you will find a root CID and a link to an IPFS HTTP gateway.

#### IPFS.json
We have a convention to store the latest CID for an app in the `ipfs.json` file in the project's root. 

### Release frequency
Not every new release of our applications will be deployed to IPFS, only major releases or critical fixes. So we don't expect it to be often.  
This decision is made due to the numerous actions required to make an IPFS release,
and also the fact that each new release will produce a new CID and will be available at the new address, 
which is inconvenient for users willing to always use the latest version of an application.

## Hash verification
You may want to verify the authenticity and integrity of the application, deployed on IPFS.
It can be done by CID (hash) verifying. In order to do so, you will need to download the source code of the application and build it locally.   
See the detailed instructions below.

<details>
<summary>
**Hash verification steps**
</summary>
<div>
Lido Ethereum Staking Widget is taken as example here.

#### 1. Clone the repository
The repo for Ethereum Staking Widget is here: https://github.com/lidofinance/ethereum-staking-widget

#### 2. Set up the project as usual
1. Add ENV variables.
2. Remove `node_modules` directory if the project was set up earlier.
3. Install node modules using `yarn install --frozen-lockfile`.
4. Follow other instructions described in the project's README.

#### 3. Configure build-info.json
The `build-info.json` file is located in the project's root, [here is the link](https://github.com/lidofinance/ethereum-staking-widget/blob/develop/build-info.json).  
It must contain information about the version of the application, which is currently deployed to IPFS.  
You can take this information from the latest GitHub action in which IPFS pinning happened:
1. Open the app's repo, follow the "Actions" tab.
2. On the left, in the navigation, find the workflow for IPFS releasing, for the Ethereum Staking Widget it is called "[IPFS Release](https://github.com/lidofinance/ethereum-staking-widget/actions/workflows/ci-ipfs.yml)".
3. Open the latest successful workflow and look for the "prepare-for-ipfs summary" title or the JSON data which looks like this:
   ```json
   { "branch": "main", "commit": "56ab68d", "version": "0.0.1" }
   ```
4. Copy the data to your local `build-info.json`

#### 4. Build the IPFS version
Run a suitable npm script to build the IPFS version.  
In case of Ethereum Staking Widget, it is `yarn build-ipfs`.

#### 5. Create a CAR file and get its CID (hash)
For Next.js applications the build files will be in the `out` directory.  
The following command generates a CAR file from the `out` directory with build files, and it will display the IPFS hash in the console.
```
npx ipfs-car pack ./out --output ./out.car
```

#### 6. Get CID (hash) of the application deployed to IPFS 
You will need to get the hash of the latest released CAR file.  
It can be found on the Releases page of the repository under the "Assets" collapsible block.
Download the CAR file and run the following command:
```
npx ipfs-car roots ipfs_source_code.car
```
It will show CID roots found in the CAR header. The CID (hash) must be the same as in the previous step.

</div>
</details>
