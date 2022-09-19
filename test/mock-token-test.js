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
        userMockStaking = await mockStakingContract.connect(user) 
        //going to need to send tokens to user and set allowance for staking contract 
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
            it('sets the correct MockToken Address', async () => {
                const correctAddress = mockToken.address;
                const address = await mockStaking.mockTokenAddress(); //this SHOULD let me access the public variable since solidity should assign a getter function for any public var
                assert.equal(correctAddress, Address);
            })
            it('instantiates mockToken with ERC20 functionality', async () => {
                //just show u can use erc20 functions on this object
            })
            it('sets the correct reward rate', async () => {

            })
        })
        describe('calcRewardPerToken function', () => {
            it('returns rewardPerToken if staked amount is zero', async () => {

            })
            it('correctly adds rewards accumulated since last reward update as a proportion of the total stake pool', async () => {

            })
        })
        describe('updateReward modifier', () => {
            it('successfully calls the calcRewardPerToken function', async () => {

            })
            it('correctly updates the updatedAt variable with current timestamp', async () => {

            })
            it('does nothing if called by the zero address', async () => {
                //tbh idk if I can even test this, I'm not sure if this would ever even happen anyway
            })
            it('successfully updates the rewards mapping', async () => {

            })
            it('successfully updates the userRewardPerTokenPaid mapping', async () => {

            })
        })
        describe('stake function', () => {
            it('successfully calls updateReward modifier', async () => {

            })
            it('reverts if amount is zero', async () => {
                const amount = 0;
                await expect(userMockStaking.stake(amount)).to.be.revertedWith(
                    "Amount must be greater than zero"
                );
            })
            it('reverts if amount is negative', async () => {
                const amount = -69;
                await expect(userMockStaking.stake(user.address, amount)).to.be.revertedWith(
                    "Amount must be greater than zero"
                );
            })
            it('transfers tokens from user to staking contract', async () => {
                const initialUserBalance = await mockToken.balanceOf(user.address);
                const initialStakingContractBalance = await mockToken.balanceOf(mockStaking.address);
                
                const tx = await userMockStaking.stake(userInitialBalance);
                await tx.wait(5);

                const finalUserBalance = await mockToken.balanceOf(user.address);
                const finalStakingContractBalance = await mockToken.balanceOf(mockStaking.address);

                const userBalanceDelta = initialUserBalance-finalUserBalance;
                const stakingContractBalanceDelta = finalStakingContractBalance-initialStakingContractBalance;
                assert.equal(userBalanceDelta ,stakingContractBalanceDelta);
            })
            it('updates user account in balances mapping', async () => {
                const initialBalance = await userMockStaking.getBalance();
                const stakeAmount = await mockToken.balanceOf(user.address);
                const tx = await userMockStaking.stake(stakeAmount);
                await tx.wait(5);
                const finalBalance = await userMockStaking.getBalance();
                const balanceDelta = finalBalance - initialBalance;
                assert.equal(balanceDelta, stakeAmount);
            })
            it('updates totalStaked variable', async () => {
                const initialTotalStaked = await mockStaking.getTotalStaked();
                const stakeAmount = 69420;
                const tx = await userMockStaking.stake(stakeAmount); 
                await tx.wait(5);
                const finalTotalStaked = await mockStaking.getTotalStaked();
                assert.equal((initialTotalStaked + stakeAmount), finalTotalStaked);
            })

        })
        describe('withdraw function', () => {
            it('successfully calls updateReward modifier', async () => {
                
            })
            it('reverts if amount is zero', async () => {
                const amount = 0;
                await expect(userMockStaking.withdraw(amount)).to.be.revertedWith(
                    "Amount must be greater than zero"
                );
            })
            it('reverts if amount is negative', async () => {
                const amount = -69;
                await expect(userMockStaking.withdraw(user.address, amount)).to.be.revertedWith(
                    "Amount must be greater than zero"
                );
            })
            iit('updates user account in balances mapping', async () => {
                // const initialBalance = await userMockStaking.getBalance();
                // const withdrawAmount = await mockToken.balanceOf(user.address);
                // const tx = await userMockStaking.stake(stakeAmount);
                // await tx.wait(5);
                // const finalBalance = await userMockStaking.getBalance();
                // const balanceDelta = finalBalance - initialBalance;
                // assert.equal(balanceDelta, stakeAmount);
            })
            it('updates totalStaked variable', async () => {
                // const initialTotalStaked = await mockStaking.getTotalStaked();
                // const stakeAmount = 69420;
                // const tx = await userMockStaking.stake(stakeAmount); 
                // await tx.wait(5);
                // const finalTotalStaked = await mockStaking.getTotalStaked();
                // assert.equal((initialTotalStaked + stakeAmount), finalTotalStaked);
            })
            it('transfers tokens from staking address to user', async () => {

            })
        })
        describe('earned function', () => {
            it('returns the correct amount of accumulated rewards', async () => {

            })
        })
        describe('claimReward function', () => {
            it('successfully calls updateReward modifier', async () => {
                
            })
            it('does nothing if user has no claimable rewards', async () => {

            })
            it('correctly updates claimable rewards to zero', async () => {

            })
            it('correctly mints and transfers claimable rewards to user', async () => {

            })
            it('is not vulnerable to reentrancy', async () => {
                //for this one just try to do a reentrant attack - create a whole new contract
            })
            
        })
        describe('setRewardRate function', () => {
            it('can only be called by the contract owner', async () => {
                await expect(userMockStaking.setRewardRate(69)).to.be.revertedWith(
                    "Ownable: caller is not the owner"
                );
            })
            it('does not accept zero as a value', async () => {
                await expect(mockStaking.setRewardRate(0)).to.be.revertedWith(
                    "New reward rate must be greater than zero"
                );
            })
            it('does not accept negative numbers', async () => {
                await expect(mockStaking.setRewardRate(-69)).to.be.revertedWith(
                    "New reward rate must be greater than zero"
                );
            })
            it('correctly sets the new reward rate', async () => {
                const expectedRewardRate = 7;
                const tx = await mockStaking.setRewardRate(expectedRewardRate);
                await tx.wait(5);
                const rewardRate = await mockStaking.rewardRate();
                assert.equal(expectedRewardRate, rewardRate);
            })
        })
        describe('getBalance function', () => {
            it('returns the correct balance', async () => {
                const expectedBalance =  69;
                const tx = await userMockStaking.stake(expectedBalance);
                await tx.wait(5);
                const balance = await userMockStaking.getBalance();
                assert.equal(expectedBalance, balance);
            })
        })
        describe('getTotalStakedFunction', () => {
            it('returns the correct totalStaked', async () => {
                const expectedTotalStaked = await userMockStaking.totalStaked();
                const totalStaked = await userMockStaking.getTotalStaked();
                assert.equal(expectedTotalStaked, totalStaked);
            })
        })
        
    })
})