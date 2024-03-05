# Hash verification
You may want to verify the authenticity and integrity of the application, deployed on IPFS.
It can be done by CID (hash) verifying. In order to do so, you will need to download the source code of the application and build it locally.   
See the detailed instructions below.

## Steps

Lido Ethereum Staking Widget is taken as example here.

#### 1. Clone the repository
The repo for Ethereum Staking Widget is here: https://github.com/lidofinance/ethereum-staking-widget

#### 2. Git checkout a commit, matching the IPFS version
You need to `git checkout` the specific commit, matching the release of an app you want to verify.
This way, you can be sure that the app will not include any other changes, which affect the CID.  
There are several ways to do it.

##### Method 1 – using git tags
Each released version has its own git tag, we can use it for git checkout.
1. Open the app in your browser and check the right side of its footer.
There will be a version number, which is actually a link to a Releases page on GitHub.
2. Run `git fetch --all --tags --prune` to fetch all tags.
3. Run `git checkout tags/<version>`, where `<version>` is the version from step 1. 

##### Method 2 – searching on the GitHub Release Page
1. Open the Releases page of the project's repository on GitHub. For Ethereum Staking Widget it is [here](https://github.com/lidofinance/ethereum-staking-widget/releases).
2. Search manually for the latest release, where IPFS pinning happened.
3. Look for the commit hash near the release information
4. Run `git checkout <hash>`, where `<hash>` is the commit hash from the previous step

Or you can simply open the Releases page of the project's repository
and manually find the latest release, where IPFS pinning happened. There will be information 

#### 3. Set up the project as usual
1. Add ENV variables.
2. Remove `node_modules` directory if the project was set up earlier.
3. Install node modules using `yarn install --frozen-lockfile`.
4. Follow other instructions described in the project's README.

#### 4. Configure build-info.json
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

#### 5. Build the IPFS version
Run a suitable npm script to build the IPFS version.  
In case of Ethereum Staking Widget, it is `yarn build-ipfs`.

#### 6. Create a CAR file and get its CID (hash)
For Next.js applications the build files will be in the `out` directory.  
The following command generates a CAR file from the `out` directory with build files, and it will display the IPFS hash in the console.
```
npx ipfs-car pack ./out --output ./out.car
```

#### 7. Get CID (hash) of the application deployed to IPFS 
You will need to get the hash of the latest released CAR file.  
It can be found on the Releases page of the repository under the "Assets" collapsible block.
Download the CAR file and run the following command:
```
npx ipfs-car roots ipfs_source_code.car
```
It will show CID roots found in the CAR header. The CID (hash) must be the same as in the previous step.

