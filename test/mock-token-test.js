const { assert, expect } = require("chai")
const { network, deployments, ethers } = require("hardhat")
const { iconTypes } = require("web3uikit")

describe("Mock Token Unit Tests", () => {
    let mockToken, mockTokenContract, mockStaking, mockStakingContract

    beforeEach(async () => {
        accounts = await ethers.getSigners() // could also do with getNamedAccounts
        deployer = accounts[0]
        user = accounts[1]
        await deployments.fixture(["all"])
        mockTokenContract = await ethers.getContract("MockToken")
        mockToken = mockTokenContract.connect(deployer)
        mockStakingContract = await ethers.getContract("MockStaking")
        mockStaking = await mockStakingContract.connect(deployer)   
    })
    describe('MockToken Contract', () => {
        describe('Constructor', () => {
            it('Correctly sets initial supply', () => {
    
            }) 
            it('mints initial supply to its own contract address', () => {
    
            })
            it('Correctly sets circulating supply to initial supply', () => {
    
            })
        })
        describe('mint function', () => {
            it('can only be called by the contract owner', () => {

            })
        })
        describe('getter functions', () => {
            describe('getMaxSupply', () => {
                it('returns the correct MAX_SUPPLY', () => {

                })
            })
            describe('getInitialSupply', () => {
                it('returns the correct INITIAL_SUPPLY', () => {

                })
            })
            describe('getCurrentSupply', () => {
                it('returns the correct totalSupply', () => {

                })
            })
            describe('getCirculatingSupply', () => {
                it('returns the correct circulatingSupply', () => {

                })
            })
            describe('getOwner', () => {
                it('returns the correct owner', () => {

                })
                it('returns correct owner after ownership transferred to staking contract', () => {

                })
            })
            describe('getBalance', () => {
                it('returns the correct balance', () => {

                })
            })
        })
    })
    
    describe('MockStaking Contract', () => {
        describe('constructor', () => {
            it('sets the correct MockToken Address', () => {

            })
            it('instantiates mockToken with ERC20 functionality', () => {
                //just show u can use erc20 functions on this object
            })
            it('sets the correct reward rate', () => {

            })
        })
        describe('calcRewardPerToken function', () => {
            
        })
        describe('updateReward modifier', () => {

        })
        describe('stake function', () => {
            it('successfully calls updateReward modifier', () => {

            })
        })
        describe('withdraw function', () => {
            it('successfully calls updateReward modifier', () => {
                
            })
        })
        describe('earned function', () => {

        })
        describe('getReward function', () => {
            it('successfully calls updateReward modifier', () => {
                
            })
        })
        describe('setRewardRate function', () => {
            it('can only be called by the contract owner', () => {

            })
            it('correctly sets the new reward rate', () => {

            })
        })
        describe('getBalance function', () => {
            it('returns the correct balance', () => {

            })
        })
        
    })
})