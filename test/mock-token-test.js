const { assert, expect } = require("chai")
const { network, deployments, ethers} = require("hardhat")
const hre = require('hardhat')
require("@nomiclabs/hardhat-ethers");



//-need to do approvals
//-figure out what i need to do to get correct variable type for owner - check ownable contract - it might be because getOwner returns a function call
//-might need to set up a fixture so that the user balances etc are restarting between each test - that might be what's throwing off some of the getter functions

describe("Mock Token Unit Tests", () => {
    let mockToken, mockTokenContract, userMockToken, mockStaking, mockStakingContract, userMockStaking
    let initialSupply = 69420420;
    let initialRewardRate = 69;

    beforeEach(async () => {
        //accounts setup
        accounts = await ethers.getSigners()
        deployer = accounts[0]
        user = accounts[1] //need to bring in another private key if i do on an actual testnet. should be fine on ganache though
        
        //Token Contract deploy
        const mockTokenContractFactory = await hre.ethers.getContractFactory('MockToken');
        const mockTokenContract = await mockTokenContractFactory.deploy(initialSupply); 
        await mockTokenContract.deployed();
        mockToken = mockTokenContract.connect(deployer)
        userMockToken = mockTokenContract.connect(user)
       
        //Staking Contract deploy
        const mockStakingContractFactory = await hre.ethers.getContractFactory('MockStaking');
        const mockStakingContract = await mockStakingContractFactory.deploy(mockToken.address, initialRewardRate); //pass in constructor args as deploy params
        await mockStakingContract.deployed();
        mockStaking = mockStakingContract.connect(deployer) 
        userMockStaking = mockStakingContract.connect(user) 
        //going to need to send tokens to user and set allowance for staking contract 
    
        //SetStakingAddress
        await mockToken.setStakingAddress(mockStaking.address);
        //give the user account some tokens to work with
        mockToken.transfer(user.address,420420);
        //Token Approval
        await userMockToken.approve(mockStaking.address,69420420420); //just setting approval to maximum supply for now
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
            it('mints initial supply to the deployer', async () => {
                const initialSupply = await mockToken.getInitialSupply().toString();
                const deployerBalance = await mockToken.balanceOf(deployer.address).toString();
                assert.equal(initialSupply, deployerBalance);
            })
            it('Correctly sets circulating supply to initial supply', async () => {
                const intialSupply = await mockToken.getInitialSupply();
                const circulatingSupply = await mockToken.getCirculatingSupply();
                assert.equal(initialSupply, circulatingSupply);
            })
        })
        describe('mint function', () => {
            it('can only be called by the contract owner', async () => {
                await expect(userMockToken.mint(user.address, 1000000)).to.be.revertedWith(
                    "Ownable: caller is not the owner"
                );
            })
            it('sends minted coins to the correct recipient', async () => {
                const initialBalance = await userMockToken.getBalance();
                const mintAmount = 1000000;
                const tx = await mockToken.mint(user.address, mintAmount);
                await tx.wait(1);
                const finalBalance = await mockToken.balanceOf(user.address);
                const balanceDelta = finalBalance - initialBalance;
                assert.equal(mintAmount, balanceDelta); 
            })
        })
        describe('updateCirculatingSupply function', () => {
            it('correctly updates the circulating supply when tokens are staked/withdrawn', async () => {
                const initialCirculatingSupply = await mockToken.getCirculatingSupply();
                const stakeAmount = 420420;
                let tx = await userMockStaking.stake(stakeAmount);
                await tx.wait(1);
                const finalCirculatingSupply = await mockToken.getCirculatingSupply();
                const circulatingSupplyDelta = initialCirculatingSupply - finalCirculatingSupply;
                assert.equal(stakeAmount, circulatingSupplyDelta);
                tx = await userMockStaking.withdraw(stakeAmount);
                await tx.wait(1);
                const okSeriouslyFinalCirculatingSupply = await mockToken.getCirculatingSupply();
                assert.equal(initialCirculatingSupply.toString(), okSeriouslyFinalCirculatingSupply.toString());
            })
            it('correctly updates circulating supply when tokens are minted', async () => {
                const initialSupply = await mockToken.getInitialSupply();
                const newMintAmount = 69420;
                const expectedTotalSupply = parseInt(initialSupply) + newMintAmount; //apparently initialSupply was being returned as a string, so had to convert to Int
                const tx = await mockToken.mint(user.address,newMintAmount);
                await tx.wait(1);
                const totalSupply = await mockToken.getCurrentSupply();
                assert.equal(expectedTotalSupply, totalSupply);
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
                    const expectedTotalSupply = await mockToken.getInitialSupply().toString();
                    const totalSupply = await mockToken.getCurrentSupply().toString();
                    assert.equal(expectedTotalSupply, totalSupply);
                })
                it('returns the correct totalSupply after additional tokens are minted', async () => {
                    const initialSupply = await mockToken.getInitialSupply();
                    const newMintAmount = 69420;
                    const expectedTotalSupply = parseInt(initialSupply) + newMintAmount; //apparently initialSupply was being returned as a string, so had to convert to Int
                    const tx = await mockToken.mint(user.address,newMintAmount);
                    await tx.wait(1);
                    const totalSupply = await mockToken.getCurrentSupply();
                    assert.equal(expectedTotalSupply, totalSupply);
                })
            })
            describe('getCirculatingSupply', () => {
                it('returns the correct circulatingSupply after deployment', async () => {
                    const expectedCirculatingSupply = await mockToken.getInitialSupply().toString();
                    const circulatingSupply = await mockToken.getCirculatingSupply().toString();
                    assert.equal(expectedCirculatingSupply, circulatingSupply);
                })
                it('returns the correct circulatingSupply after additional tokens are minted', async () => {
                    const initialCirculatingSupply = await mockToken.getCirculatingSupply(); 
                    const newMintAmount = 69420;
                    const expectedCirculatingSupply = parseInt(initialCirculatingSupply) + newMintAmount;
                    const tx = await mockToken.mint(user.address,newMintAmount);
                    tx.wait(1);
                    const circulatingSupply = await mockToken.getCirculatingSupply();
                    assert.equal(expectedCirculatingSupply, circulatingSupply);
                })
                it('returns the correct circulatingSupply after tokens have been staked', async () => {
                    const initialCirculatingSupply = await mockToken.getCirculatingSupply();
                    const stakeAmount = 420420;
                    const tx = await userMockStaking.stake(stakeAmount);
                    await tx.wait(1);
                    const finalCirculatingSupply = await mockToken.getCirculatingSupply();
                    const circulatingSupplyDelta = initialCirculatingSupply - finalCirculatingSupply;
                    assert.equal(stakeAmount, circulatingSupplyDelta);
                })
                it('returns the correct circulatingSupply after tokens have been unstaked', async () => {
                    const initialCirculatingSupply = await mockToken.getCirculatingSupply();
                    const stakeAmount = 420420;
                    let tx = await userMockStaking.stake(stakeAmount);
                    await tx.wait(1);
                    const finalCirculatingSupply = await mockToken.getCirculatingSupply();
                    const circulatingSupplyDelta = initialCirculatingSupply - finalCirculatingSupply;
                    assert.equal(stakeAmount, circulatingSupplyDelta);
                    tx = await userMockStaking.withdraw(stakeAmount);
                    await tx.wait(1);
                    const okSeriouslyFinalCirculatingSupply = await mockToken.getCirculatingSupply();
                    assert.equal(initialCirculatingSupply.toString(), okSeriouslyFinalCirculatingSupply.toString());
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
                    await tx.wait(1);
                    const owner = await mockToken.getOwner();
                    assert.equal(expectedOwner, owner);
                })
            })
            describe('getBalance', () => {
                beforeEach(async () => {
                    //reset user balance to zero
                    let userBalance = userMockToken.balanceOf(user.address);
                    const tx = await userMockToken.transfer(deployer.address,userBalance);
                    await tx.wait(1);
                    userBalance = await userMockToken.balanceOf(user.address);
                    assert.equal(userBalance, 0);
                })
                it('returns the correct balance when balance is zero', async () => {
                    const expectedBalance = 0;
                    const balance = await userMockToken.getBalance();
                    assert.equal(expectedBalance, balance);
                })
                it('returns the correct balance when balance is nonzero', async () => {
                    const expectedBalance = 69420;
                    const tx = await mockToken.mint(user.address, expectedBalance);
                    await tx.wait(1);
                    const balance = await userMockToken.getBalance();
                    assert.equal(expectedBalance, balance);
                })
            })
        })
    })
    
    describe('MockStaking Contract', () => {
        beforeEach(async () => {
            const expectedOwner = mockStaking.address;
            const tx = await mockToken.transferOwnership(mockStaking.address); //might want mockStakingContract.address, not sure
            await tx.wait(1);
            const owner = await mockToken.getOwner();
            assert.equal(expectedOwner, owner);
        })
        describe('constructor', () => {
            it('sets the correct MockToken Address', async () => {
                const correctAddress = mockToken.address;
                const address = await mockStaking.mockTokenAddress();
                assert.equal(correctAddress, address);
            })
            it('sets the correct reward rate', async () => {
                const expectedRewardRate = initialRewardRate; //this was provided as a parameter during deployment
                const rewardRate = await mockStaking.rewardRate();
                assert.equal(expectedRewardRate,rewardRate); 
            })
        })
        describe('calcRewardPerToken function', () => {
            beforeEach(async () => {
                //need to stake and update rewards to get an initial reward rate
                const stakeAmount = 420420;
                const tx = await userMockStaking.stake(stakeAmount);
                await tx.wait(1);
            })
            it('returns rewardPerToken if staked amount is zero', async () => { 
                //withdraw staked tokens to get staked amount to zero
                const stakeAmount = 420420;
                const tx = await userMockStaking.withdraw(stakeAmount);
                await tx.wait(1);
               
                const totalStaked = await mockStaking.totalStaked();
                assert.equal(totalStaked.toNumber(),0);
                const expectedResult = await mockStaking.rewardPerToken();
                const result = await mockStaking.calcRewardPerToken();
                assert.equal(expectedResult.toNumber(),result.toNumber());
            })
            it('correctly adds rewards accumulated since last reward update as a proportion of the total stake pool', async () => {
                const initialRewardPerToken = await mockStaking.calcRewardPerToken(); //not using await cus I wanna try to use async to get block timestamp simultaneously
                const totalStaked = await mockStaking.getTotalStaked();
                const block = await hre.ethers.provider.getBlock("latest");
                const timestamp = block.timestamp;
                const updatedAt = await mockStaking.updatedAt();
                console.log(`updatedAt: ${updatedAt}, totalStaked: ${totalStaked}, timestamp: ${timestamp}`);
                assert.equal(0,1);
                //for some reason updatedAt and block.timestamp are the same which is why rewards is zero
                //need to figure this out
            })
        })
        describe('updateReward modifier', () => {
            //I'm going to use claimReward() to call the modifier so that it doesn't alter amount of tokens staked
            beforeEach(async () => {
                //need to stake and update rewards to get an initial reward rate
                const stakeAmount = 420420;
                const tx = await userMockStaking.stake(stakeAmount);
                await tx.wait(1);
            })
            it('successfully calls the calcRewardPerToken function', async () => {
                //we'll know calcRewardPerToken was called because rewardPerToken's value will change
                const initialRewardPerToken = await mockStaking.rewardPerToken();
                const tx = await userMockStaking.claimReward();
                await tx.wait(1);
                const finalRewardPerToken = await mockStaking.rewardPerToken();
                assert.notEqual(initialRewardPerToken, finalRewardPerToken);
            })
            it('correctly updates the updatedAt variable with current timestamp', async () => {
               const block = await hre.ethers.provider.getBlock("latest");
               const timestamp = block.timestamp; 
               console.log(`timestamp: ${timestamp}`);
                assert.equal(0,1); //placeholder so i know how many tests actually pass
            })
            it('does nothing if called by the zero address', async () => {
                //tbh idk if I can even test this, I'm not sure if this would ever even happen anyway
                assert.equal(0,1); //placeholder so i know how many tests actually pass
            })
            it('successfully updates the rewards mapping', async () => {
                assert.equal(0,1); //placeholder so i know how many tests actually pass
            })
            it('successfully updates the userRewardPerTokenPaid mapping', async () => {
                assert.equal(0,1); //placeholder so i know how many tests actually pass
            })
        })
        describe('stake function', () => {
            it('successfully calls updateReward modifier', async () => {
                assert.equal(0,1); //placeholder so i know how many tests actually pass
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
                await tx.wait(1);

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
                await tx.wait(1);
                const finalBalance = await userMockStaking.getBalance();
                const balanceDelta = finalBalance - initialBalance;
                assert.equal(balanceDelta, stakeAmount);
            })
            it('updates totalStaked variable', async () => {
                const initialTotalStaked = await mockStaking.getTotalStaked();
                const stakeAmount = 69420;
                const tx = await userMockStaking.stake(stakeAmount); 
                await tx.wait(1);
                const finalTotalStaked = await mockStaking.getTotalStaked();
                assert.equal((initialTotalStaked + stakeAmount), finalTotalStaked);
            })

        })
        describe('withdraw function', () => {
            it('successfully calls updateReward modifier', async () => {
                assert.equal(0,1); //placeholder so i know how many tests actually pass
            })
            it('reverts if amount is zero', async () => {
                const amount = 0;
                await expect(userMockStaking.withdraw(amount)).to.be.reverted;
            })
            it('reverts if amount is negative', async () => {
                const amount = -69;
                await expect(userMockStaking.withdraw(amount)).to.be.reverted;
            })
            it('updates user account in balances mapping', async () => {
                // const initialBalance = await userMockStaking.getBalance();
                // const withdrawAmount = await mockToken.balanceOf(user.address);
                // const tx = await userMockStaking.stake(stakeAmount);
                // await tx.wait(5);
                // const finalBalance = await userMockStaking.getBalance();
                // const balanceDelta = finalBalance - initialBalance;
                // assert.equal(balanceDelta, stakeAmount);

                assert.equal(0,1); //placeholder so i know how many tests actually pass
            })
            it('updates totalStaked variable', async () => {
                // const initialTotalStaked = await mockStaking.getTotalStaked();
                // const stakeAmount = 69420;
                // const tx = await userMockStaking.stake(stakeAmount); 
                // await tx.wait(5);
                // const finalTotalStaked = await mockStaking.getTotalStaked();
                // assert.equal((initialTotalStaked + stakeAmount), finalTotalStaked);

                assert.equal(0,1); //placeholder so i know how many tests actually pass
            })
            it('transfers tokens from staking address to user', async () => {
                assert.equal(0,1); //placeholder so i know how many tests actually pass
            })
        })
        describe('earned function', () => {
            it('returns the correct amount of accumulated rewards', async () => {
                assert.equal(0,1); //placeholder so i know how many tests actually pass
            })
            it('does not add further rewards if maxSupply has previosuly been reached', async () => {
                //need to make sure some tokens are staked and then probably just do a wait either of time or blocks
                //also need to wait until maxSupply is reached, then try to call again after claiming rewards to mint up to max supply
                const finalRewards = await userMockStaking.earned(user.address);
                assert.equal(finalRewards,0);
            })
            it('returns the correct amount of rewards if minting the earned rewards tokens would exceed the maximum supply', async () => {
                assert.equal(0,1); //placeholder so i know how many tests actually pass
            })
        })
        describe('claimReward function', () => {
            it('successfully calls updateReward modifier', async () => {
                assert.equal(0,1); //placeholder so i know how many tests actually pass
            })
            it('does nothing if user has no claimable rewards', async () => {
                assert.equal(0,1); //placeholder so i know how many tests actually pass
            })
            it('correctly updates claimable rewards to zero', async () => {
                assert.equal(0,1); //placeholder so i know how many tests actually pass
            })
            it('correctly mints and transfers claimable rewards to user', async () => {
                assert.equal(0,1); //placeholder so i know how many tests actually pass
            })
            it('is not vulnerable to reentrancy', async () => {
                //for this one just try to do a reentrant attack - create a whole new contract
                assert.equal(0,1); //placeholder so i know how many tests actually pass
            })
            
        })
        describe('setRewardRate function', () => {
            it('can only be called by the contract owner', async () => {
                await expect(userMockStaking.setRewardRate(69)).to.be.revertedWith(
                    "Ownable: caller is not the owner"
                );
            })
            it('does not accept zero as a value', async () => {
                await expect(mockStaking.setRewardRate(0)).to.be.reverted;
            })
            it('does not accept negative numbers', async () => {
                await expect(mockStaking.setRewardRate(-69)).to.be.reverted;
            })
            it('correctly sets the new reward rate', async () => {
                const expectedRewardRate = 7;
                const tx = await mockStaking.setRewardRate(expectedRewardRate);
                await tx.wait(1);
                const rewardRate = await mockStaking.rewardRate();
                assert.equal(expectedRewardRate, rewardRate);
            })
        })
        describe('getBalance function', () => {
            it('returns the correct balance', async () => {
                const expectedBalance =  69;
                const tx = await userMockStaking.stake(expectedBalance);
                await tx.wait(1);
                const balance = await userMockStaking.getBalance();
                assert.equal(expectedBalance, balance);
            })
        })
        describe('getTotalStakedFunction', () => {
            it('returns the correct totalStaked', async () => {
                const expectedTotalStaked = await userMockStaking.totalStaked().toString();
                const totalStaked = await userMockStaking.getTotalStaked().toString();
                assert.equal(expectedTotalStaked, totalStaked);
            })
        })
        describe('getRewards function', () => {
            it('returns the correct rewards amount', async () => {
                const expectedRewards = await mockStaking.rewards[user.address];
                const rewards = await userMockStaking.getRewards();
                assert.equal(expectedRewards, rewards);
            })
        })
        
    })
})