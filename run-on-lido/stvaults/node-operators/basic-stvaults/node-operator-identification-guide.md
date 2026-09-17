---
sidebar_position: 2
title: Node Operator Identification Guide
sidebar_label: Node Operator Identification
---

# Node Operator Identification Guide

This guide describes how to become an Identified Node Operator for stVaults and qualify for category-based tiers with specific Reserve Ratio & stETH minting limits.

## Why become Identified

- **stVaults are permissionless**, meaning **anyone can create and run an stVault**. However, if the stVault is created by an _unidentified_ Node Operator, it will be assigned to the _Default tier_ with a Reserve Ratio = **50%**. During the [V3 secure rollout](https://research.lido.fi/t/lido-v3-design-implementation-proposal/10665#p-22926-rollout-plan-9), stETH minting in the _Default tier_ will be restricted in the first two phases, which will be lifted later during “Phase 3: Permissionless Mode”.
- **Better economics vs. permissionless defaults.** The risk framework for V3 sets default RR and caps, and allows improved terms for identified Node Operators. The default terms are: **Unidentified = 50% RR**, **Identified ≈ 3–5% RR** (illustrative; final terms are case-by-case).
- **A clear governance path** exists to approve non-default terms and monitor performance via the **[stVaults Committee](https://research.lido.fi/t/stvaults-committee-proposal/10608)**.

---

## The category → tiers model

- **Node Operators are placed into a Category** that reflects combined operational, decentralization, and business factors (Basic identified, stVaults Professional Operator, stVaults Professional Trusted Operator).
- **Each category contains multiple tiers.** **A tier** is a specific **minting configuration** that defines the **Reserve Ratio (RR)**, **stETH Minting Limit (cap)**, and corresponding **Lido fees**. Operators receive a **tiers grid** (Tier 1…N) within their category; higher tiers raise both the allowed minting cap and the Reserve Ratio.
- Within the assigned category, **one Node Operator can hold multiple tiers** that the stVaults Committee can set or change based on the Node Operator’s requests, performance, slashing events, or market circumstances in accordance with the stVaults Risk Framework.
- Categories **Basic**, **stVaults Professional Operator**, and **DVT** can be granted to a Node Operator or DVT cluster upon request during the initial identification process. However, the **stVaults Professional Trusted Operator** category can only be awarded after three months of successful validation and proof of a significant amount of prospective funds to be acquired.

### Categories and tiers

#### Default Tier for Unidentified Node Operators (permissionless)

This is a common tier shared by all stVaults operated by Unidentified Node Operators, meaning a single stETH minting limit applies to all stVaults within this tier.
| Reserve Ratio | Tier stETH limit |
| --- | --- |
| 50% | 500,000 stETH |

#### Categories and Tiers for Identified Node Operators

<style>{`
  .tier-basic { background-color: rgba(46, 160, 67, 0.18); color: #b9f6ca; }
  .tier-professional { background-color: rgba(168, 85, 247, 0.18); color: #e9d5ff; }
  .tier-trusted { background-color: rgba(245, 158, 11, 0.18); color: #ffe0b2; }
  .tier-dvt { background-color: rgba(59, 130, 246, 0.18); color: #bbdefb; }
  .tier-unidentified { background-color: rgba(255, 255, 255, 0.06); color: #e6edf3; }
  [data-theme='light'] .tier-basic { background-color: #e8f5e9; color: #1a1a1a; }
  [data-theme='light'] .tier-professional { background-color: #f3e5f5; color: #1a1a1a; }
  [data-theme='light'] .tier-trusted { background-color: #fff3e0; color: #1a1a1a; }
  [data-theme='light'] .tier-dvt { background-color: #e3f2fd; color: #1a1a1a; }
  [data-theme='light'] .tier-unidentified { background-color: #f5f5f5; color: #1a1a1a; }
`}</style>

<table style={{ borderCollapse: "collapse", width: "100%" }}>
  <thead>
    <tr>
      <th></th>
      <th colSpan="2" className="tier-basic">Basic</th>
      <th colSpan="2" className="tier-professional">stVaults Professional Operator</th>
      <th colSpan="2" className="tier-trusted">stVaults Professional Trusted Operator</th>
      <th colSpan="2" className="tier-dvt">DVT cluster</th>
    </tr>
    <tr>
      <td>Tier Number</td>
      <td className="tier-basic">Reserve Ratio</td>
      <td className="tier-basic">Tier stETH limit</td>
      <td className="tier-professional">Reserve Ratio</td>
      <td className="tier-professional">Tier stETH limit</td>
      <td className="tier-trusted">Reserve Ratio</td>
      <td className="tier-trusted">Tier stETH limit</td>
      <td className="tier-dvt">Reserve Ratio</td>
      <td className="tier-dvt">Tier stETH limit</td>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>1</td>
      <td className="tier-basic">5%</td>
      <td className="tier-basic">47,500 stETH</td>
      <td className="tier-professional">3.50%</td>
      <td className="tier-professional">48,250 stETH</td>
      <td className="tier-trusted">2.50%</td>
      <td className="tier-trusted">48,750 stETH</td>
      <td className="tier-dvt">2%</td>
      <td className="tier-dvt">49,000 stETH</td>
    </tr>
    <tr>
      <td>2</td>
      <td className="tier-basic">6%</td>
      <td className="tier-basic">47,000 stETH</td>
      <td className="tier-professional">4%</td>
      <td className="tier-professional">48,000 stETH</td>
      <td className="tier-trusted">3%</td>
      <td className="tier-trusted">48,500 stETH</td>
      <td className="tier-dvt">2%</td>
      <td className="tier-dvt">49,000 stETH</td>
    </tr>
    <tr>
      <td>3</td>
      <td className="tier-basic">9%</td>
      <td className="tier-basic">182,000 stETH</td>
      <td className="tier-professional">6%</td>
      <td className="tier-professional">188,000 stETH</td>
      <td className="tier-trusted">4%</td>
      <td className="tier-trusted">192,000 stETH</td>
      <td className="tier-dvt">2%</td>
      <td className="tier-dvt">196,000 stETH</td>
    </tr>
    <tr>
      <td>4</td>
      <td className="tier-basic">14%</td>
      <td className="tier-basic">258,000 stETH</td>
      <td className="tier-professional">10%</td>
      <td className="tier-professional">270,000 stETH</td>
      <td className="tier-trusted">6.50%</td>
      <td className="tier-trusted">280,500 stETH</td>
      <td className="tier-dvt">3%</td>
      <td className="tier-dvt">291,000 stETH</td>
    </tr>
    <tr>
      <td>5</td>
      <td className="tier-basic">20%</td>
      <td className="tier-basic">320,000 stETH</td>
      <td className="tier-professional">14.50%</td>
      <td className="tier-professional">342,000 stETH</td>
      <td className="tier-trusted">10%</td>
      <td className="tier-trusted">360,000 stETH</td>
      <td className="tier-dvt">4%</td>
      <td className="tier-dvt">384,000 stETH</td>
    </tr>
    <tr>
      <td><b>Total</b></td>
      <td className="tier-basic"></td>
      <td className="tier-basic"><b>854,500 stETH</b></td>
      <td className="tier-professional"></td>
      <td className="tier-professional"><b>896,250 stETH</b></td>
      <td className="tier-trusted"></td>
      <td className="tier-trusted"><b>929,750 stETH</b></td>
      <td className="tier-dvt"></td>
      <td className="tier-dvt"><b>969,000 stETH</b></td>
    </tr>
  </tbody>
</table>

## Category criteria

<table style={{ borderCollapse: "collapse", width: "100%" }}>
  <thead>
    <tr>
      <th>Category</th>
      <th className="tier-unidentified">Unidentified (permissionless)</th>
      <th className="tier-basic">Basic</th>
      <th className="tier-professional">stVaults Professional Operator</th>
      <th className="tier-trusted">stVaults Professional Trusted Operator</th>
      <th className="tier-dvt">DVT cluster</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>KYB(C)</td>
      <td className="tier-unidentified">Not required</td>
      <td className="tier-basic">Required</td>
      <td className="tier-professional">Required</td>
      <td className="tier-trusted">Required</td>
      <td className="tier-dvt">Required for each independent Node Operator in the Cluster</td>
    </tr>
    <tr>
      <td>Infra requirements</td>
      <td className="tier-unidentified">-</td>
      <td className="tier-basic">Basic</td>
      <td className="tier-professional">Strong</td>
      <td className="tier-trusted">Strong</td>
      <td className="tier-dvt">DVT cluster with 4+ independent Identified Node Operators</td>
    </tr>
    <tr>
      <td>Operations Requirements</td>
      <td className="tier-unidentified">-</td>
      <td className="tier-basic">Basic</td>
      <td className="tier-professional">Strong</td>
      <td className="tier-trusted">Strong</td>
      <td className="tier-dvt">Use DKG to generate keys</td>
    </tr>
    <tr>
      <td>Business case (amount of ETH to be acquired)</td>
      <td className="tier-unidentified">-</td>
      <td className="tier-basic">-</td>
      <td className="tier-professional">Large amount of ETH</td>
      <td className="tier-trusted">Significant amount of ETH</td>
      <td className="tier-dvt">-</td>
    </tr>
    <tr>
      <td>Time constraints</td>
      <td className="tier-unidentified">-</td>
      <td className="tier-basic">-</td>
      <td className="tier-professional">-</td>
      <td className="tier-trusted">3+ months of successful validation as an stVaults Professional Operator</td>
      <td className="tier-dvt">-</td>
    </tr>
  </tbody>
</table>

## **End-to-end process to become an Identified Node Operator or DVT Cluster**

### Individual Node Operators identification and assessment

1. **Public Identification Request on Lido Research Forum**

   Post your baseline request and summary on the Lido Research Forum – it is the formal trigger for consideration to be moved from _Unidentified_ to _Identified_.

   🔗 [Lido Research Forum](https://research.lido.fi/c/node-operators/stvaults-identification/24)

   What information to provide:

   - Who you are; **request** (become Identified; apply for an advanced Category; apply for a Category change; any non-default requests).
   - **[Concise] Business case**: ETH you can acquire — scales/market size, user segments, channels, partners, timelines, fee policy.
   - **[Concise] Ops & decentralization**: client mix/versions, infra footprint, geo/jurisdiction diversity, MEV posture.
   - **Links**: site/docs/audits/certifications/insurance (if any).
   - Publish your post under the “**Node Operators > stVaults Identification**” category.

2. **KYB(C) Verification**

   Complete KYB(C) (Know Your Business / Know Your Customer) screening via SumSub. This is required for all operators applying for any Identified category.

   🔗 [SumSub KYB(C) Form](https://in.sumsub.com/websdk/p/uni_nqzEH2qmLTS1PowL)
   
   **Note:** Operators already participating in the Lido Curated Set are exempt from this SumSub step, having been onboarded and vetted through the Lido Curated Set governance process.

3. **Node Operator Questionnaires (private)**

   You are also asked to provide technical and business detailed information. This step is required only during the initial identification process and category assignment.

   3.1. To complete the identification process and obtain the **"Basic"** category, please fill out this form:

   🔗 [Basic stVaults Identification form](https://tally.so/r/3xk45o).

   What information you will be asked to fill in the form:

   - Node operator details (entity, jurisdictions, contacts).
   - Data for your card on the Node Operators Overview page.

   3.2. To obtain better stETH minting terms under the **stVaults Professional Operator** category (and **stVaults Professional Trusted Operator** later on), please also fill out this form:

   🔗 [Extended stVaults Category Application](https://tally.so/r/npjNdq).

   What information you will be asked to fill in the form:
   
   - **Business plan** (ETH sourcing, channels, audience, timing).
   - **Infra** (clients’ set-ups, locations, server types, server providers, key generation & management, etc.).
   - **Ops** (monitoring/alerting, on-call, IR runbooks, insurance, bug-bounty).

4. **Assessment & scoring**

   You are evaluated across three main areas by the stVaults Committee: **Operational Capabilities, Decentralization & Infrastructure Distribution, and Business Case.**

5. **Decision: Category and corresponding Tier Grid (RR & stETH minting limits)**

   The stVaults Committee assigns your **category** (Basic identified, stVaults Professional Operator), defines your **tiers grid**, and then pushes updates through **Easy Track**. The stVaults Committee publishes the reasoning behind its decision either in a post on the Lido Research Forum under the “Node Operators > stVaults Identification” category, or as a reply to the original post-request submitted by the Node Operator.

6. **Node Operator card creation**

   The stVaults Committee creates your Node Operator card (name/logo, links, geo/jurisdiction, infra/DVT/relays, certifications/audits/insurance/bug-bounty). Your card will be displayed on the Node Operators Overview page when you have at least one stVault with at least 32 ETH of Total Value.

   _The Node Operators Overview page will follow in a later release after stVaults Mainnet._

7. **Communication & listing**

   Your card and tiers grid are set, and you can now continue as an Identified Node Operator. Additionally, every Identified Node Operator will have a direct communication channel with the stVaults Committee representatives in a shared Telegram group. Questions and discussions can also always be raised on the Lido Research Forum.

### DVT Cluster identification and assessment

Each individual Node Operator participating in the DVT Cluster must pass the identification process [as described above](#individual-node-operators-identification-and-assessment):

1. Post an identification request on the Lido Research Forum (mandatory).
2. Complete the KYB(C) (mandatory).
3. Complete the stVaults Identification Form (mandatory).
4. Complete the extended stVaults Node Operator Category Application (required for stVaults Professional Operator category).

After that, there are the following actions required from a representative of the DVT Cluster:

1. **Public Request on Lido Research Forum**

   As a DVT Cluster, post your request and summary on the Lido Research Forum.

   🔗 [Lido Research Forum](https://research.lido.fi/c/node-operators/stvaults-identification/24)

   What information to provide:

   - **Who you are**; list of Node Operators in the Cluster; your cluster name/brand.
   - **Request** (become Identified DVT Cluster; any non-default requests).
   - **Business case**: ETH you can acquire — scales/market size, user segments, channels, partners, timelines, fee policy.
   - **DVT Technology**: Obol / SSV / or other.
   - **Links**: site/docs/audits/certifications/insurance (if any).
   - Publish your post under the “_Node Operators > stVaults Identification_” category.

2. **DVT Cluster Questionnaire (private)**

   You are also asked to provide technical and business detailed information.

   🔗 [DVT Cluster Identification form](https://tally.so/r/wAoAkW).

   What information you will be asked to fill in the form:

   - Node Operators creating the Cluster (entities, contacts).
   - How you manage your keys generating process (DKG ceremony).
   - Data for your card on the Node Operators Overview page.
   - **Business plan** (ETH sourcing, channels, audience, timing).

3. **Assessment & scoring**

   You are evaluated by the stVaults Committee.

4. **Decision: Category and corresponding Tier Grid (RR & stETH minting limits)**

   In case of a positive decision, the stVaults Committee defines your **tier grid** and submits the updates through **Easy Track**. The Committee also publishes the reasoning behind its decision by replying to the original post-request submitted by the DVT Cluster representative.

5. **Node Operator card creation**

   The stVaults Committee creates your DVT Cluster card (name/logo, links, geo/jurisdiction, etc.). Your card will be displayed on the Node Operators Overview page when you have at least one stVault with at least 32 ETH of Total Value.

   _The Node Operators Overview page will follow in a later release after stVaults Mainnet._

6. **Communication & listing**

   Your card and tiers grid are set, and you can now continue as an Identified DVT Cluster. Additionally, every Cluster will have a direct communication channel with the stVaults Committee representatives in a shared Telegram group. Questions and discussions can also always be raised on the Lido Research Forum.

---

## **How tiers map to risk profile & business case**

**1) Why categories exist.**

The [Lido V3 risk assessment framework](https://research.lido.fi/t/default-risk-assessment-framework-and-fees-parameters-for-lido-v3-stvaults/10504) aims to balance growth opportunities with protection against major risks such as correlated slashing and centralization. It does this by linking qualitative signals (like operational and decentralization metrics) with quantitative ones (like stake volumes). Together, these determine how **stETH minting limits** and **Reserve Ratios** scale with each operator’s overall risk profile. Default parameters ensure protocol safety, while categories allow well-earned flexibility.

A **Category** represents a classification of Node Operators:

- Each Category has an associated **tier grid**, which serves as a baseline configuration for Node Operators within that Category.
- When a Node Operator is assigned to a Category based on its unique performance and characteristics, it receives tiers (with defined RRs and stETH limits) according to that Category and the Node Operator’s total stETH minting limit.

**2) Why multiple tiers per category?**

Each tier is designed for a distinct business case — not a linear “risk ladder.”

- **First tiers (Tier-1..2):** **lowest RR** + **lowest stETH minting limit** → **liquidity-first** scenarios (strategy builders, looping) where liquidity matters most; stETH minting capacity **is tightly bounded**.
- **Upper tiers (Tier-3…N):** **more conservative RR** + **much higher stETH minting limit** → **volume-first** scenarios (institutions, funds, ETF/ETP) where large mints — sometimes **on demand** — matter more than high liquidity.

**3) How RR & stETH minting limit interact.**

In any stVault, stETH capacity depends on the Reserve Ratio and the Total Value, but is also constrained by limits:

- stVault stETH limit (equal to Tier stETH limit by default).
- Tier stETH limit.
- Node Operator stETH limit.
- stVaults’ global stETH limit.

![Tiers and minting parameters](/img/stvaults/tiers-and-minting-parameters.png)

## **Governance & operational safety net.**

In order to keep the stVaults risk framework flexible and to streamline the governance process around it, it is proposed that [the stVaults Committee](https://research.lido.fi/t/stvaults-committee-proposal/10608) will be responsible for the following actions:

- Set the reserve ratio for specific tiers or stVaults.
- Define the default and custom tier grids for node operators.
- Set DAO fee values for specific stVaults and tiers within a node operator’s grid.
- Bad debt compensation management between stVaults/tiers in complex cases, like mass slashing.
- Manage Lido Core redemptions, trigger validator exits for rebalancing or redemptions, and perform other actions required in exceptional cases to keep the Lido Core protocol stable and secure, in accordance with the stVaults risk assessment framework.
- Adjusting the stVaults risk framework and the scores within the framework.

**Easy Track** helps to speed up the process of changing parameters while securing the protocol, builders, and Node Operators from malicious actions by committee members, as these motions are vetoable by LDO token-holders.

LDO token-holders may at any time vote to rescind or reassign these responsibilities to another group, entity, or individual, and may vote to modify, extend, or remove them entirely.

---

## **References**

- [**Default risk assessment framework and fees parameters for Lido V3 (stVaults)**](https://research.lido.fi/t/default-risk-assessment-framework-and-fees-parameters-for-lido-v3-stvaults/10504) — tiers, RR, and caps framing.
- [**stVaults Committee Proposal**](https://research.lido.fi/t/stvaults-committee-proposal/10608/6) — scope & responsibilities for non-default asks and monitoring.
- [**Lido V3 — Design & Implementation Proposal**](https://research.lido.fi/t/lido-v3-design-implementation-proposal/10665) — overall V3 context and rollout.