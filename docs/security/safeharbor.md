# Safe Harbor

## Program overview

Safe Harbor enhances the security of Lido protocol user funds and Lido DAO treasury assets by allowing Whitehats to intervene (under strict rules) during active exploits only to save affected funds with the obligation to return all rescued assets to a pre-designated recovery address controlled by the protocol. To motivate Whitehats to act during critical situations, there is a bounty system that rewards rescuers with a percentage of the recovered assets, up to a predefined cap, for successful interventions.

Safe Harbor was adopted by Lido DAO in the Snapshot proposal - [Adopt The SEAL Safe Harbor Agreement](https://snapshot.box/#/s:lido-snapshot.eth/proposal/0x0188ab77d59b11ce589d88c350093faffdb07b3a9c9ba4d8af12755d4b2178c0).

## Rationale

Lido DAO is committed to enhancing its security and protecting user funds during critical moments. While security audits and other preventive measures are crucial, the unpredictable nature of active exploits requires a swift, decisive response mechanism to minimize potential damage.

Benefits of adopting the Safe Harbor Agreement include:

- **Agile Defense Against Exploits:** Whitehats are authorized to intervene as soon as an active exploit is detected, enabling them to respond faster than traditional methods. Immediate action minimizes the window for malicious actors, reduces damages, and accelerates the recovery of assets during critical moments.
- **Clarified Rescue Process:** The agreement ensures that every step, from intervention to fund recovery, is predetermined and streamlined. Whitehats know exactly where to send recovered funds, preventing chaotic negotiations or rushed decisions during an exploit. This clarity ensures efficient, decisive action when it matters most.
- **Clear Financial Boundaries:** The predefined bounty system, with a cap matching Lido DAO [existing bug bounty](https://immunefi.com/bug-bounty/lido/information/), ensures that Whitehats are incentivized fairly without creating conflicting priorities between exploit intervention and standard vulnerability disclosure. By setting expectations upfront, it eliminates post-exploit negotiations, ensuring funds are returned promptly without attempts to change the reward amount, keeping the process fair and transparent.
- **Aligning with Industry Best Practices:** By adopting the Safe Harbor Agreement, Lido DAO aligns with leading security practices across the industry, reinforcing its commitment to staying at the forefront of protocol security.

Adoption of the agreement complements audits and the ongoing Immunefi Lido bug bounty by providing an additional layer of security, ensuring that the protocol is better prepared to respond to active threats.

## Adoption Details

On-chain Safe Harbor Agreement Contract can be found at [0xe19f54e8322214839a87408f084aa14ebefe9e87](https://etherscan.io/address/0xe19f54e8322214839a87408f084aa14ebefe9e87).

**Bounty Terms,** predetermined rewards for successful Whitehats that recover protocol funds (for more information, review the [Safe Harbor](https://frameworks.securityalliance.org/safe-harbor/scope-terms)):

- **Percentage**: 10.0% of the recovered amount
- **Bounty Cap (USD)**: $2,000,000 (*the maximum bounty amount for a single Whitehat)*
- **Aggregate Cap (USD)**: $2,000,000 (*the maximum total bounty payout across all Whitehats for a single incident; bounties will be distributed pro rata)*
- **Retainable**: False (*Whitehats are required to return all recovered funds to the protocol, which will then pay out the bounty after verification).*
    The compensation for Whitehats will be distributed via a dedicated Lido DAO governance vote, once the vulnerability is resolved and malicious actions are stopped.
    It’s recommended to issue such payout using Insurance Fund assets.
- **Identity**: Anonymous (*by default, Whitehats are allowed to remain anonymous and are not required to provide any information about themselves to the protocol, except in cases where we reasonably expect that a Whitehat might be in breach of the Diligence Requirements, see the Diligence Requirements section below).*
- **Diligence Requirements:**
    As a condition to eligibility for any bounty under the Safe Harbor program, a Whitehat represents, warrants, and covenants that they:

    - are at least 18 or the age of majority in their jurisdiction (whichever is higher) and have full legal capacity;
    - are not (i) a citizen or resident of, located, incorporated, or otherwise established in any jurisdiction that is the subject of comprehensive sanctions or an embargo administered or enforced by the United States, United Kingdom, European Union, or United Nations, or (ii) a person that is, or that is owned or controlled by, or acting on behalf of, any person that is the subject of any sanctions administered or enforced by any of those authorities;
    - are not (and for the prior 12 months have not been) an employee, contractor, or service provider of any Lido Labs or Lido Ecosystem or any other person or entity that directly or indirectly develops, maintains, or operates the Lido protocol or Lido Smart Contract Systems, nor an immediate family member of such a person, and are not acting on behalf of or sharing any Bounty with any such person in connection with any Exploit or Eligible Funds Rescue, and are not acting on their behalf or receiving any advice from the said persons;
    - The Whitehat further acknowledges that the Lido Labs, acting solely in its diligence-support capacity, may require additional information (including information relating to their identity and jurisdiction) and may provide Lido DAO with all information gathered as a result of this diligence check and an assessment of whether making such payment would violate, or would present an undue risk of violating, any applicable law or regulation (including sanctions, anti–money laundering, or anti–terrorist–financing laws). Lido Labs will not make any payment determinations, which remain exclusively within the authority of Lido DAO.

    These representations, warranties, and acknowledgements are continuing and are conditions precedent to eligibility for any bounty.

**Relationship with Lido’s Bug Bounty Program**

Safe Harbor is distinct from [Lido’s existing Bug Bounty program on Immunefi](https://immunefi.com/bug-bounty/lido/information/):

- Bug bounty: for responsible disclosure of vulnerabilities before an active exploit, following Immunefi rules.
- Safe Harbor: for live, active exploits where immediate intervention is needed and normal disclosure is too slow.

Safe Harbor and the Bug Bounty program are mutually exclusive from a rewards perspective. A Whitehat rewarded via the Bug Bounty program cannot receive a reward for the same exploit under Safe Harbor, even if Safe Harbor’s legal protections apply.

**Contact Details** (*designated security contact for the protocol, whom Whitehats will contact following a Safe Harbor recovery*):

Security Team, [safeharbor@lido.fi](mailto:safeharbor@lido.fi)

**Chains & Asset Recovery Addresses** (*addresses controlled by the protocol that recovered protocol funds will be returned to by the Whitehat*):

Aragon Voting, [0x2e59A20f205bB85a89C53f1936454680651E618e](https://docs.lido.fi/deployed-contracts/#dao-contracts)

Aragon Voting was chosen because it provides a predictable, resilient, and timely decision-making framework for both routine operations and potential emergency scenarios. Its use enables Lido DAO to respond quickly, avoiding the extended governance delays that can arise under Dual Governance. By directing all recovered assets to the Aragon Voting contract, those assets remain fully under the control of the Lido DAO. Any subsequent action — such as redistribution, user compensation, or other follow-up steps — will therefore require explicit approval through Lido DAO governance. If a Whitehat needs to return ETH to the Recovery Address, the ETH must first be wrapped into wETH. As the initiative evolves, the implementation of a separate AssetRecoveryVault, similar to the InsuranceFund, may be considered.

**Accounts**

Chain: eip155:1 (*Ethereum Mainnet*)

Initial list of all on-chain assets owned by the protocol protected under Safe Harbor can be found in an [associated Snapshot proposal](https://snapshot.box/#/s:lido-snapshot.eth/proposal/0x0188ab77d59b11ce589d88c350093faffdb07b3a9c9ba4d8af12755d4b2178c0).

As the protocol evolves, new contracts will be reviewed and added to the Safe Harbor Agreement scope, ensuring continued protection for all new contracts and functionalities.

An up-to-date list of contracts under a scope of program can be found in a [Safe Harbor Agreement Contract](https://etherscan.io/address/0xe19f54e8322214839a87408f084aa14ebefe9e87).

ChildContractScope: all (*all contracts, whether created by Address before or after calling `adoptSafeHarbor`, are in scope for Eligible Funds Rescues and will automatically fall under Safe Harbor protections and will not require a separate vote*)

## Important Disclaimers

- The [Safe Harbor Agreement](https://bafybeigvd7z4iemq7vrdcczgyu2afm7egxwrggftiplydc3vdrdmgccwvu.ipfs.w3s.link/The_SEAL_Whitehat_Safe_Harbor_Agremeent_V1_01.pdf) is a legal framework published by the Security Alliance (SEAL). Lido DAO adopted the standard SEAL Agreement without modifying its core legal language and to configure only protocol-specific parameters such as bounty terms, scope, and diligence requirements.
- Safe Harbor does not provide immunity from criminal liability, regulatory enforcement, or third-party claims. It is a civil contract that sets out the rights and obligations of the parties.
- The Agreement may not be enforceable in all jurisdictions, and Whitehats remain responsible for compliance with all applicable laws.
- Whitehats remain responsible for their own tax obligations and for ensuring that their use of Lido protocol and participation in Safe Harbor does not violate any obligations owed to employers or other third parties.
