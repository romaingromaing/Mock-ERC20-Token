const { assert, expect } = require("chai")
const { network, deployments, ethers } = require("hardhat")

//probably will want to test on a local ganache/hardhat fork

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
            it('Correctly sets initial supply', async () => {
                //assume setting intial supply to 69420420 in deployment script
                //might need to alter number for decimals, not sure
                const expectedInitialSupply = 69420420;
                const intialSupply = await mockToken.getInitialSupply();
                assert.equal(expectedInitialSupply, initialSupply);
            }) 
            it('mints initial supply to its own contract address', async () => {
                const initialSupply = await mockToken.getInitialSupply();
                const contractBalance = await mockToken.balanceOf(mockToken.address);
                assert.equal(initialSupply, contractBalance);
            })
            it('Correctly sets circulating supply to initial supply', async () => {
                const intialSupply = await mockToken.getInitialSupply();
                const circulatingSupply = await mockToken.getCirculatingSupply();
                assert.equal(initialSupply, circulatingSupply);
            })
        })
        describe('mint function', () => {
            it('can only be called by the contract owner', async () => {
                const badMockToken = await mockTokenContract.connect(user); //deployer is owner, user is not
                await expect(badMockToken.mint(user.address, 1000000)).to.be.revertedWith(
                    "Ownable: caller is not the owner"
                );
            })
            it('sends minted coins to the correct recipient', async () => {
                const expectedBalance = 1000000;
                const tx = await mockToken.mint(user.address, expectedBalance);
                await tx.wait(5);
                const balance = await mockToken.balanceOf(user.address);
                assert.equal(expectedBalance, balance);
            })
        })
        describe('getter functions', () => {
            describe('getMaxSupply', () => {
                it('returns the correct MAX_SUPPLY', async () => {
                    const expectedMaxSupply = 69420420420; //decimals?
                    const maxSupply = await mockToken.getMaxSupply();
                    assert.equal(expectedMaxSupply, maxSupply);
                })
            })
            describe('getInitialSupply', () => {
                it('returns the correct INITIAL_SUPPLY', async () => {
                    const expectedInitialSupply = 69420420; //decimals?
                    const initialSupply = await mockToken.getInitialSupply();
                    assert.equal(expectedInitialSupply, initialSupply);
                })
            })
            describe('getCurrentSupply', () => {
                it('returns the correct totalSupply after deployment', async () => {
                    const expectedTotalSupply = await mockToken.getInitialSupply();
                    const totalSupply = await mockToken.getCurrentSupply();
                    assert.equal(expectedTotalSupply, totalSupply);
                })
                it('returns the correct totalSupply after additional tokens are minted', async () => {
                    const initialSupply = await mockToken.getInitialSupply();
                    const newMintAmount = 69420;
                    const expectedTotalSupply = initialSupply + newMintAmount;
                    const tx = await mockToken.mint(user.address,newMintAmount);
                    await tx.wait(5);
                    const totalSupply = await mockToken.getCurrentSupply();
                    assert.equal(expectedTotalSupply, totalSupply);
                })
            })
            describe('getCirculatingSupply', () => {
                it('returns the correct circulatingSupply after deployment', async () => {
                    const expectedCirculatingSupply = 0;
                    const totalSupply = await mockToken.getCirculatingSupply();
                    assert.equal(expectedCirculatingSupply, circulatingSupply);
                })
                it('returns the correct circulatingSupply after additional tokens are minted', async () => {
                    const initialCirculatingSupply = await mockToken.getcirculatingSupply(); // should be zero if tokens minted to the token contract address (not sure what I'm doing with them yet, maybe I'll just send tot he deployer)
                    const newMintAmount = 69420;
                    const expectedCirculatingSupply = initialCirculatingSupply + newMintAmount;
                    const tx = await mockToken.mint(user.address,newMintAmount);
                    tx.wait(5);
                    const circulatingSupply = await mockToken.getCirculatingSupply();
                    assert.equal(expectedCirculatingSupply, circulatingSupply);
                })
                it('returns the correct circulatingSupply after tokens have been staked', async () => {

                })
                it('returns the correct circulatingSupply after tokens have been unstaked', async () => {
                    //I'm gonna have to add back the ImockToken interface so that the staking contract can call mint function with updateCirclatingSupply 
                })

            })
            describe('getOwner', () => {
                it('returns the correct owner', async () => {
                    const expectedOwner = deployer.address;
                    const owner = await mockToken.getOwner();
                    assert.equal(expectedOwner, owner);
                })
                it('returns correct owner after ownership transferred to staking contract', async () => {
                    const expectedOwner = mockStaking.address;
                    const tx = await mockToken.transferOwnership(mockStaking.address); //might want mockStakingContract.address, not sure
                    await tx.wait(5);
                    const owner = await mockToken.getOwner();
                    assert.equal(expectedOwner, owner);
                })
            })
            describe('getBalance', () => {
                it('returns the correct balance when balance is zero', async () => {
                    const expectedBalance = 0;
                    const userMockToken = await mockTokenContract.connect(user);
                    const balance = await userMockToken.getBalance();
                    assert.equal(expectedBalance, balance);
                })
                it('returns the correct balance when balance is nonzero', async () => {
                    const expectedBalance = 69420;
                    const tx = await mockToken.mint(user.address, expectedBalance);
                    await tx.wait(5);
                    const userMockToken = await mockTokenContract.connect(user);
                    const balance = await userMockToken.getBalance();
                    assert.equal(expectedBalance, balance);
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
            it('does nothing if user has no claimable rewards', () => {

            })
            it('correctly transfers claimable rewards to user', () => {

            })
            it('correctly updates claimable rewards to zero after dispersion', () => {

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