# EDF Operator Key Custody Policy

> 🔐 Policy for [LIP-37: Execution Delegation Framework](https://github.com/lidofinance/lido-improvement-proposals/blob/develop/LIPS/lip-37.md). Applies to operators of permissioned roles behind an EDF `DelegationContract`, initially Lido Oracle committee members and DSM guardians.

**Version:** 1.0  

**Applies to:** Operators of permissioned roles behind an EDF `DelegationContract`  

**Maintained:** On the Lido research forum; may be revised without a protocol change

The key words **MUST**, **MUST NOT**, **SHOULD**, **SHOULD NOT**, **RECOMMENDED**, and **MAY**, when they appear in uppercase, are to be interpreted as described in [RFC 2119](https://www.rfc-editor.org/rfc/rfc2119) and [RFC 8174](https://www.rfc-editor.org/rfc/rfc8174).

---

## 1. Purpose and scope

LIP-37 moves key rotation from a ~10-day governance vote to a local operator action.

That only improves security if key holders store, rotate, and revoke keys with discipline. This document defines that discipline.

It covers:

- The two key classes in the EDF model
- Custody requirements for each key class
- Rotation cadence
- Required response to suspected or confirmed compromise

---

## 2. Key classes

| Key | Role in EDF | Exposure | Custody class |
| --- | --- | --- | --- |
| **Owner key** | Controls the `DelegationContract`: `nominateDelegate()`, `revokeDelegate()`, `terminate()` | Used rarely for rotations and incidents | **Cold** — Safe multisig; hardware cold-wallet signers RECOMMENDED |
| **Delegate key** | Hot signing key stored in and used by the off-chain daemon | Online continuously; assumed compromisable | **Hot** — machine-resident, minimized blast radius, rotated routinely |

The two classes have opposite design goals:

- The **owner key** is the security boundary of the whole model. It must be nearly impossible to steal, even at the cost of being slow to use.
- The **delegate key** is expected to be exposed by its nature. The policy goal is not to make it unstealable, but to keep it worthless quickly through narrow permissions, short lifetime, and instant revocation.

---

## 3. Owner key custody

The owner address is fixed at deployment and cannot be changed on-chain. Replacing it means deploying a new `DelegationContract` and passing a governance vote to reassign the seat.

Treat the owner setup as a long-lived commitment and get it right before deployment.

1. **The owner MUST be a Safe multisig.**  
    
    A bare EOA owner is not acceptable for Oracle or DSM seats.
    
2. **The owner MUST be dedicated to its assigned activity.**  
    
    The multisig MUST be responsible only for the single activity it was assigned to perform: key delegation management. It MUST NOT be used for any other purpose.
    
3. **The multisig MUST be at least 2-of-3.**
    
    A higher threshold or more signers is acceptable.
    
4. **Every signer SHOULD be a hardware cold wallet.**  
    
    Hardware cold wallets, such as Ledger or Trezor, are RECOMMENDED for all signers.
    
5. **Multisig signer set changes MUST be executed promptly.**  
    
    Every signer set change SHOULD be paired with a hot key rotation.
    
    - **Departure or role change.** No later than the person’s last day of access. Removing the signer MUST NOT delay revocation of their other access.
    - **Lost or stolen signer device, or exposed seed backup.** Within **24 hours** of the loss being reported. If the affected signer together with any other doubtful signer would meet the threshold, treat it as a §6.2 event.
    - **Suspected compromise of the signer’s computer, or coercion.** Within **24 hours**.
    - **Routine device replacement, or a signer who cannot be reached out of hours.** Within **5 business days**.
    

---

## 4. Delegate hot-key custody

1. **Use one key per seat and environment.**  
    
    A delegate key MUST be unique to a single `DelegationContract` and a single environment. It MUST NOT be reused across mainnet/testnet, across Oracle and Council daemons, or for anything besides its seat’s duties.
    
2. **Harden the host.**  
    
    The daemon host SHOULD be dedicated to the role, with:
    
    - Access limited to named engineers
    - Audited access channels
    - No shared SSH accounts
    - Current OS and daemon versions
    - No unrelated internet-facing services
3. **Keep only minimal balance.**  
    
    The delegate address MUST hold only working gas funds. A low-balance alert SHOULD be configured.
    
4. **Delegate keys MUST be dedicated to their assigned activity.**  
    
    Each hot key MUST be responsible only for the single activity it was assigned to perform (day-to-day protocol operation). It MUST NOT be used for any other purpose.


---

## 5. Rotation policy

EDF makes rotation seamless: `nominateDelegate(newKey)` keeps the old key effective until the new one activates after the cooldown.

This section applies to delegate rotations after the EDF migration is complete. During the initial migration, the existing hot EOA is configured as the initial delegate and is effective immediately; the governance action reassigning the seat from that EOA to its `DelegationContract` is the migration cutover.

A `DelegationContract` authorizes exactly one effective delegate at a time. Before `activeFrom`, the current delegate remains effective. Starting at `activeFrom`, the nominated delegate becomes effective automatically and the previous EOA loses its authority through that `DelegationContract`, although the EOA itself continues to exist.

1. **Routine cadence**  
    
    The delegate key MUST be rotated at least every **1 year**. Quarterly rotation is RECOMMENDED.
    
2. **Event-driven rotation**  
    
    Independent of cadence, the delegate key MUST be rotated when:
    
    - An engineer with access to the daemon host or secrets store leaves the organization or changes role
    - The daemon host is migrated or rebuilt from an untrusted image
    - Any dependency or infrastructure incident could have exposed the key
    - The key’s age or custody history is unknown
    
    If exposure is suspected rather than merely possible, this becomes revocation, not rotation.
    
3. **Announce rotations**  
    
    Routine rotations MUST be announced on the Lido research forum at least **1 day** before `nominateDelegate()` is executed and in the operators’ coordination channel before execution. This lets monitoring parties distinguish a planned `DelegateNominated` from a hostile one.
    
4. **Planned rotation procedure**
    1. Generate the new key.
    2. Publish the pre-nomination announcement on the research forum.
    3. Add the replacement key to the daemon as its staged secondary member key. Keep the current delegate configured and operating.
    4. On behalf of the owner, execute `nominateDelegate(newKey)` on your `DelegationContract`. The old key remains effective during the cooldown.
    5. Watch for your own `DelegateNominated` event and verify that the delegate and `activeFrom` returned by `getPendingDelegate()` match the intended rotation.
    6. Fund the replacement address from the current delegate address with half of its balance.
    7. During the cooldown, the daemon MUST continue using the current delegate.
    8. After activation:
        - Verify `getDelegate() == newKey`.
        - Confirm that the daemon selected the new key.
        - Confirm a successful report or message in the following applicable frame.
    9. Only after successful verification:
        - Remove the previous key from the daemon configuration and secrets store.
        - Move the previous EOA’s remaining balance to the new delegate address.
5. **Owner rotation**  
    
    Multisig signer keys follow §3.5. Replacing the multisig itself requires a new `DelegationContract` deployment and a governance vote.
    

---

## 6. Incident response

Speed is the point of EDF. The contract lets operators drop a key in one transaction; this section defines when they must.

### 6.1 Suspected or confirmed delegate hot-key compromise

Triggers include:

- Signatures or transactions you did not originate
- Host intrusion indicators
- Secrets-store breach
- Malware on the daemon host
- Accidental key disclosure, such as pasting in chat, committing to a repo, or capturing in logs

Response:

1. **Revoke first, investigate second.** 
    
    The owner MUST call `revokeDelegate()` immediately upon suspicion.
    
    Revocation takes effect immediately: it clears both the current delegate and any pending one, and signature verification through the contract fails closed from that moment on. If a rotation is in flight, revocation cancels it — the staged replacement must be nominated again once the seat is safe to restore.
    
2. **Notify security and operators.**  
    
    Notify the holders’ Telegram chat as soon as the revocation transaction is sent. Include:
    
    - Seat
    - Revoked key
    - Known facts
    - As much evidence as you can collect
3. **Re-key on clean infrastructure.**  
    
    Generate a replacement per §4 on a host you trust, rebuilt or verified clean, and call `nominateDelegate(newKey)`. The seat resumes after the cooldown.
    
4. **Publish a post-incident report.**  
    
    Publish a summary to the research forum, or to the holders’ Telegram chat if disclosure is sensitive. Include:
    
    - Timeline
    - Root cause
    - Exposure window
    - Custody changes made

### 6.2 Suspected owner cold-key / multisig compromise

Triggers include:

- Unexpected changes to the multisig participants
- Unexpected multisig activity
- A compromised signer device combined with any doubt about the rest of the quorum

Response:

1. **If the owner itself can no longer be trusted:**  
    
    The owner MUST call `terminate()`.
    
    Termination is irreversible. It disables `execute()`, fails all signature verification closed, and clears the delegate. A dead seat is strictly better than a stolen one.
    
2. **Notify immediately.**  
    
    Notify the holders’ Telegram chat immediately. Governance will need to reassign the seat to a freshly deployed `DelegationContract` with a new owner multisig, so early notice shortens downtime.
    

---

## 7. Monitoring

Alongside Lido’s protocol-wide monitoring, each operator SHOULD independently monitor their own contract.

### Recommended alerts

- **`DelegateNominated`, `DelegateRevoked`, and `Terminated` events** on the operator’s `DelegationContract`
    - SHOULD alert a human 24/7
    - An unexpected `DelegateNominated` is the primary owner-compromise signal
    - The owner MUST react to an unexpected nomination before the cooldown elapses
- **Delegate address activity** outside the daemon’s expected pattern
    - Unexpected `execute()` targets, including EOA destinations
    - Unexpected non-zero `msg.value` forwarded through `execute()`
    - Transactions from the delegate EOA itself

### Emergency contact

Each operator MUST provide a fast contact channel for emergencies, where a human can be reached at any time, and MUST keep it current.
