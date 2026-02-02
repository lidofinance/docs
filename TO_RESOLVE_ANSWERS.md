# To Resolve

- Confirm the authoritative list of stVaults Easy Track factory addresses (not present in `deployed-mainnet.json` or `configs/config_mainnet.py`). Should they be documented in `docs/guides/protocol-levers.md`?
ANSWER: Let's not document them, too far from the core protocol.
- Confirm which Lido Aragon ACL permissions control protocol fee and treasury updates in V3 (current Lido roles are unassigned in `test_permissions.py`).
ANSWER: 
The role is unassigned explicitly, so role manager can assign. 
You can learn the approach here: https://github.com/lidofinance/dual-governance/blob/main/docs/permissions-transition/permissions-transition-mainnet.md 
Note: this document is a bit outdated because was prepared before the Lido V3 upgrade, though it has some solid stuff on principles and roles assignments not affected by Lido V3.
- Clarify which section in `docs/contracts/vault-hub.md` was flagged as “Outdated” in review; no specific line content was provided.
Answer: already fixed.
