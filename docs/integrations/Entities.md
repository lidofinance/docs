"""
Lido
"""

# Entities

- ['LidoStopped'](#lidostopped)
- ['LidoResumed'](#lidoresumed)
- ['LidoTransfer'](#lidotransfer)
- ['LidoApproval'](#lidoapproval)
- ['LidoFee'](#lidofee)
- ['LidoFeeDistribution'](#lidofeedistribution)
- ['LidoWithdrawalCredential'](#lidowithdrawalcredential)
- ['LidoSubmissoin'](#lidosubmission)
- ['LidoUnbuffered'](#lidounbuffered)
- ['LidoWithdrawal'](#lidowithdrawal)
- ['Holder'](#holder)
- ['ELRewardsVaultSet'](#elrewardsvaultset)
- ['ELRewardsWithdrawalLimitSet'](#elrewardswithdrawallimitSet)
- ['ProtocolContactsSet'](#protocolcontactsset)
- ['StakingLimitRemove'](#stakinglimitfemove)
- ['StakingLimitSet'](#stakinglimitset)
- ['StakingResume'](#stakingresume)
- ['StakingPause'](#stakingpause)
- ['SharesTransfer'](#sharestransfer)
- ['SharesBurn'](#sharesburn)
- ['OracleCompleted'](#oraclecompleted)
- ['TotalReward'](#totalreward)
- ['OracleMember'](#oraclemember)
- ['OracleQuorumChange'](#oraclequorumchange)
- ['OracleVersion'](#oracleversion)
- ['AllowedBeaconBalanceRelativeDecrease'](#allowedbeaconbalancerelativedecrease)
- ['AllowedBeaconBalanceAnnualRelativeIncrease'](#allowedbeaconbalanceannualrelativeincrease)
- ['OracleExpectedEpoch'](#oracleexpectedepoch)
- ['BeaconReport'](#beaconreport)
- ['BeaconSpec'](#beaconspec)
- ['BeaconReportReceiver'](#beaconreportreceiver)
- ['NodeOperatorSigningKey'](#nodeoperatorsigningkey)
- ['NodeOperator'](#nodeoperator)
- ['NodeOperatorTotalKeysTrim'](#nodeoperatortotalkeystrim)
- ['handleKeysOpIndexChange'](#handlekeysopindexchange)
- ['Voting'](#voting)
- ['Vote'](#vote)
- ['VotingObjection'](#votingobjection)
- ['ChangedSupportRequired'](#changedcupportrequired)
- ['ChangedMinQuorum'](#changedminquorum)
- ['ChangedVoteTime'](#changedvotetime)
- ['ChangedObjectionPhaseTime'](#changedobjectionphasetime)
- ['Motion'](#motion)
- ['EasyTrackConfig'](#easytrackconfig)
- ['Role'](#role)
- ['EVMScriptFactory'](#evmscriptfactory)
- ['Objection'](#objection)
- ['DepositsPause'](#depositspause)
- ['DepositsUnpause'](#depositsunpause)
- ['Guardian'](#guardian)
- ['GuardianQuorumChange'](#guardianquorumchange)
- ['MaxDepositsChange'](#maxdepositschange)
- ['MinDepositBlockDistanceChange'](#mindepositblockdistancechange)
- ['NodeOperatorsRegistryChange'](#nodeoperatorsregistrychange)
- ['OwnerChange'](#ownerchange)
- ['PauseIntentValidityPeriodBlocksChange'](#pauseintentvalidityperiodblockschange)

# LidoStopped

Description: Unsure?

| Field     | Type    | Description |
| --------- | ------- | ----------- |
| id        | ID!     |             |
| block     | BigInt! |             |
| blockTime | BigInt! |             |

# LidoResumed

Description: Unsure?

| Field     | Type    | Description |
| --------- | ------- | ----------- |
| id        | ID!     |             |
| block     | BigInt! |             |
| blockTime | BigInt! |             |

# LidoTransfer

Description: Unsure?

| Field                 | Type     | Description |
| --------------------- | -------- | ----------- |
| id                    | ID!      |             |
| from                  | Bytes!   |             |
| to                    | Bytes!   |             |
| value                 | BigInt!  |             |
| shares                | BigInt   |             |
| sharesBeforeDecrease  | BigInt   |             |
| sharesAfterDecrease   | BigInt   |             |
| sharesBeforeIncrease  | BigInt   |             |
| sharesAfterIncrease   | BigInt   |             |
| mintWithoutSubmission | Boolean! |             |
| totalPooledEther      | BigInt!  |             |
| totalShares           | BigInt!  |             |
| balanceAfterDecrease  | BigInt   |             |
| balanceAfterIncrease  | BigInt   |             |
| block                 | BigInt!  |             |
| blockTime: BigInt!    |          |
| transactionHash       | Bytes!   |             |
| transactionIndex      | BigInt!  |             |
| logIndexv BigInt!     |          |
| transactionLogIndex   | BigInt!  |             |

type LidoApproval @entity(immutable: true) {
id: ID!

owner: Bytes!
spender: Bytes!
value: BigInt!
}

type LidoFee @entity(immutable: true) {
id: ID!

feeBasisPoints: Int!
}

type LidoFeeDistribution @entity(immutable: true) {
id: ID!

treasuryFeeBasisPoints: Int!
insuranceFeeBasisPoints: Int!
operatorsFeeBasisPoints: Int!
}

type LidoWithdrawalCredential @entity(immutable: true) {
id: Bytes!

withdrawalCredentials: Bytes!

block: BigInt!
blockTime: BigInt!
}

type LidoSubmission @entity(immutable: true) {
id: ID!

sender: Bytes!
amount: BigInt!
referral: Bytes!

shares: BigInt!
sharesBefore: BigInt!
sharesAfter: BigInt!

totalPooledEtherBefore: BigInt!
totalPooledEtherAfter: BigInt!
totalSharesBefore: BigInt!
totalSharesAfter: BigInt!

balanceAfter: BigInt!

block: BigInt!
blockTime: BigInt!
transactionHash: Bytes!
transactionIndex: BigInt!
logIndex: BigInt!
transactionLogIndex: BigInt!
}

type LidoUnbuffered @entity(immutable: true) {
id: ID!

amount: BigInt!
}

type LidoWithdrawal @entity(immutable: true) {
id: ID!

sender: Bytes!
tokenAmount: BigInt!
sentFromBuffer: BigInt!
pubkeyHash: Bytes!
etherAmount: BigInt!
}

type NodeOperatorFees @entity(immutable: true) {
id: ID!
totalReward: TotalReward!

address: Bytes!
fee: BigInt!
}

type NodeOperatorsShares @entity(immutable: true) {
id: ID!
totalReward: TotalReward!

address: Bytes!
shares: BigInt!
}

type Totals @entity {
id: ID!

totalPooledEther: BigInt!
totalShares: BigInt!
}

type Stats @entity {
id: ID!

uniqueHolders: BigInt
uniqueAnytimeHolders: BigInt
}

type Shares @entity {
id: Bytes!

shares: BigInt!
}

type Holder @entity(immutable: true) {
id: Bytes!

address: Bytes!
}

type CurrentFees @entity {
id: ID!

feeBasisPoints: BigInt
treasuryFeeBasisPoints: BigInt
insuranceFeeBasisPoints: BigInt
operatorsFeeBasisPoints: BigInt
}

type ELRewardsVaultSet @entity(immutable: true) {
id: ID!

executionLayerRewardsVault: Bytes!
}

type ELRewardsWithdrawalLimitSet @entity(immutable: true) {
id: ID!

limitPoints: BigInt!
}

type ProtocolContactsSet @entity(immutable: true) {
id: ID!

insuranceFund: Bytes!
oracle: Bytes!
treasury: Bytes!
}

type StakingLimitRemove @entity(immutable: true) {
id: ID!
}

type StakingLimitSet @entity(immutable: true) {
id: ID!

maxStakeLimit: BigInt!
stakeLimitIncreasePerBlock: BigInt!
}

type StakingResume @entity(immutable: true) {
id: ID!
}

type StakingPause @entity(immutable: true) {
id: ID!
}

type SharesTransfer @entity(immutable: true) {
id: ID!

from: Bytes!
sharesValue: BigInt!
to: Bytes!
}

type SharesBurn @entity(immutable: true) {
id: ID!

account: Bytes!
postRebaseTokenAmount: BigInt!
preRebaseTokenAmount: BigInt!
sharesAmount: BigInt!
}

"""
LidoOracle
"""
type OracleCompleted @entity(immutable: true) {
id: ID!

epochId: BigInt!
beaconBalance: BigInt!
beaconValidators: BigInt!

block: BigInt!
blockTime: BigInt!
transactionHash: Bytes!
}

"""
Main entity for daily rewards
"""
type TotalReward @entity {
id: Bytes!

"Total user rewards"
totalRewards: BigInt!
"Total user rewards + fees"
totalRewardsWithFees: BigInt!

"Fees received via validator MEV"
mevFee: BigInt

"Fee basis points eg fractions of total fees"
feeBasis: BigInt!
treasuryFeeBasisPoints: BigInt!
insuranceFeeBasisPoints: BigInt!
operatorsFeeBasisPoints: BigInt!

"Fees and leftover dust after rounding"
totalFee: BigInt!
nodeOperatorFees: [NodeOperatorFees!] @derivedFrom(field: "totalReward")
insuranceFee: BigInt
operatorsFee: BigInt!
treasuryFee: BigInt
dust: BigInt

"Total shares that were minted for distribution"
shares2mint: BigInt!

"Shares distributed to each destination"
sharesToTreasury: BigInt!
sharesToInsuranceFund: BigInt!
sharesToOperators: BigInt!
nodeOperatorsShares: [NodeOperatorsShares!] @derivedFrom(field: "totalReward")
dustSharesToTreasury: BigInt!

"State of the pool before and after rewards"
totalPooledEtherBefore: BigInt!
totalPooledEtherAfter: BigInt!
totalSharesBefore: BigInt!
totalSharesAfter: BigInt!

"Data for easy APR calculations"
postTotalPooledEther: BigInt
preTotalPooledEther: BigInt
timeElapsed: BigInt
totalShares: BigInt

"Raw APR from validator balances"
aprRaw: BigDecimal!
"Time-compensated APR eg account for a missed day of rewards between reports"
aprBeforeFees: BigDecimal
"User APR after fees and time correction"
apr: BigDecimal!

block: BigInt!
blockTime: BigInt!
transactionIndex: BigInt!
logIndex: BigInt!
transactionLogIndex: BigInt!
}

type OracleMember @entity {
id: Bytes!

member: Bytes!
removed: Boolean!
}

type OracleQuorumChange @entity(immutable: true) {
id: ID!

quorum: BigInt!
}

type OracleVersion @entity(immutable: true) {
id: ID!

version: BigInt!

block: BigInt!
blockTime: BigInt!
}

type AllowedBeaconBalanceRelativeDecrease @entity(immutable: true) {
id: ID!

value: BigInt!
}

type AllowedBeaconBalanceAnnualRelativeIncrease @entity(immutable: true) {
id: ID!

value: BigInt!
}

type OracleExpectedEpoch @entity(immutable: true) {
id: ID!

epochId: BigInt!
}

type BeaconReport @entity(immutable: true) {
id: ID!

epochId: BigInt!
beaconBalance: BigInt!
beaconValidators: BigInt!
caller: Bytes!
}

type BeaconSpec @entity(immutable: true) {
id: ID!

epochsPerFrame: BigInt!
slotsPerEpoch: BigInt!
secondsPerSlot: BigInt!
genesisTime: BigInt!
}

type BeaconReportReceiver @entity(immutable: true) {
id: ID!

callback: Bytes!
}

"""
NodeOperatorsRegistry
"""
type NodeOperatorSigningKey @entity {
id: Bytes!

operatorId: BigInt!
pubkey: Bytes!
removed: Boolean!

operator: NodeOperator!
}

type NodeOperator @entity {
id: ID!

name: String!
rewardAddress: Bytes!
stakingLimit: BigInt!
active: Boolean!
totalStoppedValidators: BigInt
}

type NodeOperatorTotalKeysTrim @entity(immutable: true) {
id: ID!

operatorId: BigInt!
totalKeysTrimmed: BigInt!

operator: NodeOperator!

block: BigInt!
blockTime: BigInt!
}

type handleKeysOpIndexChange @entity {
id: ID!

index: BigInt!

block: BigInt!
blockTime: BigInt!
}

"""
Voting
"""
type Voting @entity {
id: ID!

index: Int!
creator: Bytes!
metadata: String!
executed: Boolean!

votes: [Vote!]! @derivedFrom(field: "voting")
objections: [VotingObjection!]! @derivedFrom(field: "voting")
}

type Vote @entity(immutable: true) {
id: ID!

voting: Voting!
voter: Bytes!
supports: Boolean!
stake: BigInt!
}

type VotingObjection @entity(immutable: true) {
id: ID!

voting: Voting!
voter: Bytes!
stake: BigInt!
}

type ChangedSupportRequired @entity(immutable: true) {
id: ID!

supportRequiredPct: BigInt!
}

type ChangedMinQuorum @entity(immutable: true) {
id: ID!

minAcceptQuorumPct: BigInt!
}

type ChangedVoteTime @entity(immutable: true) {
id: ID!

voteTime: BigInt!
}

type ChangedObjectionPhaseTime @entity(immutable: true) {
id: ID!

objectionPhaseTime: BigInt!
}

"""
Easytrack
"""
type Motion @entity {
id: ID!

creator: Bytes!
evmScriptFactory: Bytes!
duration: BigInt
startDate: BigInt!
snapshotBlock: BigInt!
objectionsAmount: BigInt!
objectionsAmountPct: BigInt!
objectionsThreshold: BigInt
evmScriptHash: Bytes!
evmScriptCalldata: Bytes!
status: String!
enacted_at: BigInt
canceled_at: BigInt
rejected_at: BigInt
}

type EasyTrackConfig @entity {
id: ID!

evmScriptExecutor: Bytes
motionDuration: BigInt
motionsCountLimit: BigInt
objectionsThreshold: BigInt
isPaused: Boolean
}

type Role @entity {
id: ID!

role: Bytes!
address: Bytes!
creator: Bytes!
isActive: Boolean!
}

type EVMScriptFactory @entity {
id: ID!

address: Bytes!
permissions: Bytes!
isActive: Boolean!
}

type Objection @entity(immutable: true) {
id: ID!

motionId: BigInt!
objector: Bytes!
weight: BigInt!

block: BigInt!
blockTime: BigInt!
}

"""
DepositSecurityModule
"""
type DepositSecurityModuleSettings @entity {
id: ID!

paused: Boolean
guardianQuorum: BigInt
maxDeposits: BigInt
minDepositBlockDistance: BigInt
nodeOperatorsRegistry: Bytes
owner: Bytes
pauseIntentValidityPeriodBlocks: BigInt
}

type DepositsPause @entity(immutable: true) {
id: ID!

guardian: Guardian!

block: BigInt!
blockTime: BigInt!
transactionHash: Bytes!
}

type DepositsUnpause @entity(immutable: true) {
id: ID!

block: BigInt!
blockTime: BigInt!
transactionHash: Bytes!
}

type Guardian @entity {
id: ID!

address: Bytes!
removed: Boolean!

block: BigInt!
blockTime: BigInt!
transactionHash: Bytes!
}

type GuardianQuorumChange @entity(immutable: true) {
id: ID!

guardianQuorum: BigInt!

block: BigInt!
blockTime: BigInt!
transactionHash: Bytes!
}

type MaxDepositsChange @entity(immutable: true) {
id: ID!

maxDeposits: BigInt!

block: BigInt!
blockTime: BigInt!
transactionHash: Bytes!
}

type MinDepositBlockDistanceChange @entity(immutable: true) {
id: ID!

minDepositBlockDistance: BigInt!

block: BigInt!
blockTime: BigInt!
transactionHash: Bytes!
}

type NodeOperatorsRegistryChange @entity(immutable: true) {
id: ID!

nodeOperatorsRegistry: Bytes!

block: BigInt!
blockTime: BigInt!
transactionHash: Bytes!
}

type OwnerChange @entity(immutable: true) {
id: ID!

owner: Bytes!

block: BigInt!
blockTime: BigInt!
transactionHash: Bytes!
}

type PauseIntentValidityPeriodBlocksChange @entity(immutable: true) {
id: ID!

pauseIntentValidityPeriodBlocks: BigInt!

block: BigInt!
blockTime: BigInt!
transactionHash: Bytes!
}
