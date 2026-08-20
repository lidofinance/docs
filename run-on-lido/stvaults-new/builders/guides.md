---
sidebar_position: 2
unlisted: true

---

# Building guides

## by Basic stVaults

### Basic isolated staking setup

🔗 [Economy, Architecture, and Building Guide](./basic-stvaults/basic-isolated-staking-setup.md)  

#### Product characteristics
| Parameter | Value |
| -- | -- |
| Number of stakers | 1 (Isolated staking setup) |
| stETH minting capability | yes, on demand |

#### Building blocks
| Building block | Solution | Implementation | 
| -- | -- | -- |
| Basis | stVault | Out-of-the-box |
| User Interface | stVault Web UI | Out-of-the-box |

### Mass staking product with utilizing stETH to fulfil redemptions

🔗 [Economy, Architecture, and Building Guide](./basic-stvaults/etf-etp-product.md)  

#### Product characteristics
| Parameter | Value |
| -- | -- |
| Number of stakers | Multiple |
| stETH minting capability | yes, to cover redemptions |

#### Building blocks
| Building block | Solution | Implementation | 
| -- | -- | -- |
| Basis | stVault | Out-of-the-box |
| Pooling Wrapper | Custom | Custom |
| User Interface | Custom | Custom |


## by stVaults + DeFi Wrapper

### Private or Public staking vault without additional yield strategy

🔗 [Economy, Architecture, and Building Guide](./stvaults-defi-wrapper/without-yield-strategy.md)  

#### Product characteristics
| Parameter | Value |
| -- | -- |
| Number of stakers | Single / Multiple |
| stETH minting capability | no |

#### Building blocks
| Building block | Solution | Implementation | 
| -- | -- | -- |
| Basis | stVault | Out-of-the-box |
| Pooling Wrapper | stVaults DeFi Wrapper | Out-of-the-box |
| User Interface | DeFi Wrapper Embeddable Widget / Custom | Out-of-the-box / Custom |

### Private or Public staking vault with EarnETH

🔗 [Economy, Architecture, and Building Guide](./stvaults-defi-wrapper/with-earneth.md)  

#### Product characteristics
| Parameter | Value |
| -- | -- |
| Number of stakers | Single / Multiple |
| Additional DeFi yield | Lido EarnETH  |

#### Building blocks
| Building block | Solution | Implementation | 
| -- | -- | -- |
| Basis | stVault | Out-of-the-box |
| Pooling Wrapper | stVaults DeFi Wrapper | Out-of-the-box |
| DeFi Strategy | Connector to EarnETH | Out-of-the-box |
| User Interface | DeFi Wrapper Embeddable Widget / Custom | Out-of-the-box / Custom |

### Private or Public staking vault with Custom strategy

🔗 [Economy, Architecture, and Building Guide](./stvaults-defi-wrapper/with-custom-strategy.md)  

#### Product characteristics
| Parameter | Value |
| -- | -- |
| Number of stakers | Single / Multiple |
| Additional DeFi yield | Custom |

#### Building blocks
| Building block | Solution | Implementation | 
| -- | -- | -- |
| Basis | stVault | Out-of-the-box |
| Pooling Wrapper | stVaults DeFi Wrapper | Out-of-the-box |
| DeFi Strategy | Connector to custom strategy | Custom |
| User Interface | DeFi Wrapper Embeddable Widget / Custom | Out-of-the-box / Custom |

