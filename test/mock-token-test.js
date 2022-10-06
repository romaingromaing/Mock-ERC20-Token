const { assert, expect } = require("chai")
const { network, deployments, ethers} = require("hardhat")
const hre = require('hardhat')
require("@nomiclabs/hardhat-ethers");


describe("Mock Token Unit Tests", () => {
    let mockToken, userMockToken, mockStaking, userMockStaking
    let initialSupply = 69420420;
    let initialRewardRate = 69;

    beforeEach(async () => {
        //accounts setup
        accounts = await ethers.getSigners()
        deployer = accounts[0]
        user = accounts[1] 
        
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
    
        //SetStakingAddress
        await mockToken.setStakingAddress(mockStaking.address);
        //give the user account some tokens to work with
        mockToken.transfer(user.address,420420);
        //Token Approval
        await userMockToken.approve(mockStaking.address,69420420420); //setting approval to maximum supply
    })
    describe('MockToken Contract', () => {
        describe('Constructor', () => {
            it('Correctly sets initial supply', async () => {
                //assume setting intial supply to 69420420 in deployment script
                const expectedInitialSupply = 69420420;
                const initialSupply = await mockToken.getInitialSupply();
                assert.equal(expectedInitialSupply, initialSupply);
            }) 
            it('mints initial supply to the deployer', async () => {
                const initialSupply = await mockToken.getInitialSupply().toString();
                const deployerBalance = await mockToken.balanceOf(deployer.address).toString();
                assert.equal(initialSupply, deployerBalance);
            })
            it('Correctly sets circulating supply to initial supply', async () => {
                const initialSupply = (await mockToken.getInitialSupply()).toNumber();
                const circulatingSupply = (await mockToken.getCirculatingSupply()).toNumber();
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
                const initialCirculatingSupply = (await mockToken.getCirculatingSupply()).toString();
                const stakeAmount = 420420;
                let tx = await userMockStaking.stake(stakeAmount);
                await tx.wait(1);
                const finalCirculatingSupply = await mockToken.getCirculatingSupply();
                const circulatingSupplyDelta = initialCirculatingSupply - finalCirculatingSupply;
                assert.equal(stakeAmount, circulatingSupplyDelta);
                tx = await userMockStaking.withdraw(stakeAmount);
                await tx.wait(1);
                const okSeriouslyFinalCirculatingSupply = (await mockToken.getCirculatingSupply()).toString();
                assert.equal(initialCirculatingSupply, okSeriouslyFinalCirculatingSupply);
            })
            it('correctly updates circulating supply when tokens are minted', async () => {
                const initialSupply = await mockToken.getInitialSupply();
                const newMintAmount = 69420;
                const expectedTotalSupply = parseInt(initialSupply) + newMintAmount; 
                const tx = await mockToken.mint(user.address,newMintAmount);
                await tx.wait(1);
                const totalSupply = await mockToken.getCurrentSupply();
                assert.equal(expectedTotalSupply, totalSupply);
            })
        })
        describe('getter functions', () => {
            describe('getMaxSupply', () => {
                it('returns the correct MAX_SUPPLY', async () => {
                    const expectedMaxSupply = 69420420420; 
                    const maxSupply = await mockToken.getMaxSupply();
                    assert.equal(expectedMaxSupply, maxSupply);
                })
            })
            describe('getInitialSupply', () => {
                it('returns the correct INITIAL_SUPPLY', async () => {
                    const expectedInitialSupply = 69420420; 
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
                    const expectedTotalSupply = parseInt(initialSupply) + newMintAmount; 
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
                    const initialCirculatingSupply = (await mockToken.getCirculatingSupply()).toString();
                    const stakeAmount = 420420;
                    let tx = await userMockStaking.stake(stakeAmount);
                    await tx.wait(1);
                    const finalCirculatingSupply = await mockToken.getCirculatingSupply();
                    const circulatingSupplyDelta = initialCirculatingSupply - finalCirculatingSupply;
                    assert.equal(stakeAmount, circulatingSupplyDelta);
                    tx = await userMockStaking.withdraw(stakeAmount);
                    await tx.wait(1);
                    const okSeriouslyFinalCirculatingSupply = (await mockToken.getCirculatingSupply()).toString();
                    assert.equal(initialCirculatingSupply, okSeriouslyFinalCirculatingSupply);
                })
            })
            describe('getStakedSupply', () => {
                it('returns the correct staked supply', async () => {
                    const expectedInitialStakedSupply = 0;
                    const initialStakedSupply = await userMockToken.getStakedSupply();
                    assert.equal(expectedInitialStakedSupply, initialStakedSupply);

                    //stake some tokens
                    const stakeAmount = 420420;
                    let tx = await userMockStaking.stake(stakeAmount);
                    await tx.wait(1);

                    const expectedFinalStakedSupply = stakeAmount;
                    const finalStakedSupply = await userMockToken.getStakedSupply();
                    assert.equal(expectedFinalStakedSupply, finalStakedSupply);
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
                    const tx = await mockToken.transferOwnership(mockStaking.address); 
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
            const tx = await mockToken.transferOwnership(mockStaking.address); 
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
                const expectedResult = (await mockStaking.rewardPerToken()).toNumber();
                const result = (await mockStaking.calcRewardPerToken()).toNumber();
                assert.equal(expectedResult, result);
            })
            it('correctly adds rewards accumulated since last reward update as a proportion of the total stake pool', async () => {
                const initialRewardPerToken = await mockStaking.calcRewardPerToken();
                const totalStaked = await mockStaking.getTotalStaked();
                const updatedAt = await mockStaking.updatedAt();
                await network.provider.send("evm_mine"); //wait for time to pass so rewards can accumulate
                const block = await hre.ethers.provider.getBlock("latest");
                const timestamp = block.timestamp;
                const rewardRate = await mockStaking.rewardRate();
                const finalRewardPerToken = (await mockStaking.calcRewardPerToken()).toNumber()
                const expectedRewardPerToken = parseInt(initialRewardPerToken + (rewardRate * (timestamp - updatedAt) * (10**18)) / totalStaked);
                assert.equal(expectedRewardPerToken, finalRewardPerToken);
            })
        })
        describe('updateReward modifier', () => {
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
                const initialUpdatedAt = await userMockStaking.updatedAt();
                const block = await hre.ethers.provider.getBlock("latest");
                const timestamp = block.timestamp; 
                const finalUpdatedAt = await userMockStaking.updatedAt();
                assert.notEqual(initialUpdatedAt, finalUpdatedAt);
                assert.equal(timestamp, finalUpdatedAt);
            })
            it('successfully updates the rewards mapping', async () => {
                const initialReward = await userMockStaking.getRewards();
                const tx = await userMockStaking.withdraw(420420); //this will call the modifier
                await tx.wait(1);
                const tx2 = await userMockStaking.stake(420420); //this will call it again - making sure some time has passed for rewards to accumulate
                await tx2.wait(1);
                const finalReward = await userMockStaking.getRewards();
                assert.notEqual(initialReward,finalReward); 
            })
            it('successfully updates the userRewardPerTokenPaid mapping', async () => {
                const initialRewardPerTokenPaid = await userMockStaking.userRewardPerTokenPaid(user.address);
                const tx = await userMockStaking.withdraw(420420); //this will call the modifier
                await tx.wait(1);
                const tx2 = await userMockStaking.stake(420420); //this will call it again - making sure some time has passed for rewards to accumulate
                await tx2.wait(1);
                const finalRewardPerTokenPaid = await userMockStaking.userRewardPerTokenPaid(user.address);
                assert.notEqual(initialRewardPerTokenPaid,finalRewardPerTokenPaid); 
            })
        })
        describe('stake function', () => {
            it('successfully calls updateReward modifier', async () => {
                const initialRewards = await userMockStaking.rewards(user.address);
                await network.provider.send("evm_mine"); //wait for time to pass so rewards can accumulate
                const stakeAmount = 420420;
                const tx = await userMockStaking.stake(stakeAmount);
                await tx.wait(1);
                const finalRewards = await userMockStaking.rewards(user.address);
                assert.notEqual(initialRewards,finalRewards); 
            })
            it('reverts if amount is zero', async () => {
                const amount = 0;
                await expect(userMockStaking.stake(amount)).to.be.reverted;
            })
            it('reverts if amount is negative', async () => {
                const amount = -69;
                await expect(userMockStaking.stake(user.address, amount)).to.be.reverted;
            })
            it('transfers tokens from user to staking contract', async () => {
                const initialUserBalance = await mockToken.balanceOf(user.address);
                const initialStakingContractBalance = await mockToken.balanceOf(mockStaking.address);
                
                const tx = await userMockStaking.stake(initialUserBalance);
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
                const initialTotalStaked = parseInt(await mockStaking.getTotalStaked());
                const stakeAmount = 69420;
                const tx = await userMockStaking.stake(stakeAmount); 
                await tx.wait(1);
                const finalTotalStaked = (await mockStaking.getTotalStaked()).toNumber();
                assert.equal((initialTotalStaked + stakeAmount), finalTotalStaked);
            })

        })
        describe('withdraw function', () => {
            beforeEach(async () => {
                const stakeAmount = 420420;
                const tx = await userMockStaking.stake(stakeAmount);
                await tx.wait(1);
            })
            it('successfully calls updateReward modifier', async () => {
                const initialRewards = await userMockStaking.rewards(user.address);
                await network.provider.send("evm_mine"); //wait for time to pass so rewards can accumulate
                const withdrawAmount = 420420;
                const tx = await userMockStaking.withdraw(withdrawAmount);
                await tx.wait(1);
                const finalRewards = await userMockStaking.rewards(user.address);
                assert.notEqual(initialRewards,finalRewards);
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
                const initialBalance = await userMockStaking.getBalance();
                const withdrawAmount = 69420
                const tx = await userMockStaking.withdraw(withdrawAmount);
                await tx.wait(1);
                const finalBalance = await userMockStaking.getBalance();
                const balanceDelta =  initialBalance - finalBalance;
                assert.equal(balanceDelta, withdrawAmount);
            })
            it('updates totalStaked variable', async () => {
                const initialTotalStaked = await userMockStaking.getTotalStaked();
                const withdrawAmount = 69420;
                const tx = await userMockStaking.withdraw(withdrawAmount); 
                await tx.wait(1);
                const finalTotalStaked = await userMockStaking.getTotalStaked();
                const totalStakedDelta = finalTotalStaked - initialTotalStaked;
                assert.equal(-totalStakedDelta, withdrawAmount);
            })
            it('transfers tokens from staking address to user', async () => {
                const initialStakedAmount = await userMockStaking.getBalance();
                const initialUserWalletBalance = await userMockToken.getBalance();
                const withdrawAmount = 69420;
                const tx = await userMockStaking.withdraw(withdrawAmount);
                await tx.wait(1);
                const finalStakedAmount = await userMockStaking.getBalance();
                const finalUserWalletBalance = await userMockToken.getBalance();
                const stakedAmountDelta = finalStakedAmount - initialStakedAmount;
                const userWalletBalanceDelta = finalUserWalletBalance - initialUserWalletBalance;
                assert.equal(-stakedAmountDelta, userWalletBalanceDelta);
                assert.notEqual(userWalletBalanceDelta, 0)
            })
        })
        describe('earned function', () => {
            it('returns the correct amount of accumulated rewards', async () => {
                const initialRewards = (await userMockStaking.earned(user.address)).toNumber();
                
                //stake some tokens to begin acccumulating rewards
                const stakeAmount = 420420;
                const tx = await userMockStaking.stake(stakeAmount);
                await tx.wait(1);

                //wait for time to pass so rewards can accumulate
                await network.provider.send("evm_mine"); 
                await tx.wait(1);

                const expectedRewards = parseInt(
                    (await userMockStaking.getBalance()) * (
                        (await userMockStaking.calcRewardPerToken()) - 
                        (await userMockStaking.userRewardPerTokenPaid(user.address))
                    ) / (10**18)
                );
                const rewards = await userMockStaking.earned(user.address);

                assert.notEqual(initialRewards, expectedRewards);
                assert.equal(expectedRewards, rewards);
            })
            it('does not add further rewards if maxSupply has previously been reached', async () => {
                //deploy a new set of contracts where maxSupply is initial supply
                const maxSupply = await mockToken.getMaxSupply();
                ///Token Contract deploy
                const mockTokenContractFactory = await hre.ethers.getContractFactory('MockToken');
                const maxTokenContract = await mockTokenContractFactory.deploy(maxSupply); 
                await maxTokenContract.deployed();
                maxToken = maxTokenContract.connect(deployer);
                userMaxToken = maxTokenContract.connect(user);
            
                //Staking Contract deploy
                const mockStakingContractFactory = await hre.ethers.getContractFactory('MockStaking');
                const maxStakingContract = await mockStakingContractFactory.deploy(maxToken.address, initialRewardRate); //pass in constructor args as deploy params
                await maxStakingContract.deployed();
                maxStaking = maxStakingContract.connect(deployer); 
                userMaxStaking = maxStakingContract.connect(user); 
                            
                //SetStakingAddress
                await maxToken.setStakingAddress(maxStaking.address);
                //give the user account some tokens to work with
                maxToken.transfer(user.address,420420);
                //Token Approval
                await userMaxToken.approve(maxStaking.address,69420420420); 

                //get initial rewards
                const expectedRewards = (await userMaxStaking.earned(user.address)).toNumber();

                //stake some tokens to begin acccumulating rewards
                const stakeAmount = 420420;
                const tx = await userMaxStaking.stake(stakeAmount);
                await tx.wait(1);

                //wait for time to pass so rewards can accumulate
                await network.provider.send("evm_mine"); 
                await tx.wait(1);

                //get final rewards - should be zero since no rewards can be disbursed for this contract
                const rewards = (await userMaxStaking.earned(user.address)).toNumber();

                assert.equal(expectedRewards, rewards);
            })
            it('returns the correct amount of rewards if minting the earned rewards tokens would exceed the maximum supply', async () => {
                //deploy a new set of contracts where maxSupply - 1 is initial supply
                const maxSupply = await mockToken.getMaxSupply();
                const initialSupply = maxSupply - 1;
                ///Token Contract deploy
                const mockTokenContractFactory = await hre.ethers.getContractFactory('MockToken');
                const maxTokenContract = await mockTokenContractFactory.deploy(initialSupply); 
                await maxTokenContract.deployed();
                maxToken = maxTokenContract.connect(deployer);
                userMaxToken = maxTokenContract.connect(user);
            
                //Staking Contract deploy
                const mockStakingContractFactory = await hre.ethers.getContractFactory('MockStaking');
                const maxStakingContract = await mockStakingContractFactory.deploy(maxToken.address, initialRewardRate); //pass in constructor args as deploy params
                await maxStakingContract.deployed();
                maxStaking = maxStakingContract.connect(deployer); 
                userMaxStaking = maxStakingContract.connect(user); 
                            
                //SetStakingAddress
                await maxToken.setStakingAddress(maxStaking.address);
                //give the user account some tokens to work with
                maxToken.transfer(user.address,420420);
                //Token Approval
                await userMaxToken.approve(maxStaking.address,69420420420); 

                //get initial rewards
                const expectedRewards = (await userMaxStaking.earned(user.address)).toNumber();

                //stake some tokens to begin acccumulating rewards
                const stakeAmount = 420420;
                const tx = await userMaxStaking.stake(stakeAmount);
                await tx.wait(1);

                //wait for time to pass so rewards can accumulate
                await network.provider.send("evm_mine"); 
                await tx.wait(1);

                //get final rewards - should be 1 since only 1 token can be minted before reaching max supply
                const rewards = (await userMaxStaking.earned(user.address)).toNumber();

                assert.notEqual(expectedRewards, rewards);
                assert.equal(rewards, 1)
            })
        })
        describe('claimReward function', () => {
            beforeEach(async () => {
                const stakeAmount = 420420;
                const tx = await userMockStaking.stake(stakeAmount);
                await tx.wait(1);
            })
            it('successfully calls updateReward modifier', async () => {
                const initialRewards = await userMockStaking.rewards(user.address);
                await network.provider.send("evm_mine"); //wait for time to pass so rewards can accumulate
                const tx = await userMockStaking.claimReward();
                await tx.wait(1);
                const finalRewards = await userMockStaking.rewards(user.address);
                assert.notEqual(initialRewards,finalRewards); 
            })
            it('does nothing if user has no claimable rewards', async () => {
                //unstake and claim rewards to be sure intialRewards are zero and not accumulating
                let tx = await userMockStaking.withdraw(await userMockStaking.getBalance());
                await tx.wait(1);
                tx = await userMockStaking.claimReward();
                await tx.wait(1);

                /* since rewards is zero, claimReward should not mint new tokens,
                 supply should remain the same, and the user should not receive new tokens */
                const initialRewards = await userMockStaking.rewards(user.address);
                assert.equal(initialRewards, 0);
                const initialUserBalance = (await userMockToken.getBalance()).toNumber();

                const initialTotalSupply = (await userMockToken.getCurrentSupply()).toNumber();
                tx = await userMockStaking.claimReward();
                await tx.wait(1);

                const finalUserBalance = (await userMockToken.getBalance()).toNumber();
                assert.equal(initialUserBalance, finalUserBalance);

                const finalTotalSupply = (await userMockToken.getCurrentSupply()).toNumber();
                assert.equal(initialTotalSupply, finalTotalSupply);
            })
            it('correctly updates claimable rewards to zero', async () => {
                await network.provider.send("evm_mine"); //wait for time to pass so rewards can accumulate
                (await userMockStaking.withdraw(420420)).wait(1); //to update rewards to show that initial isn't zero - could also have used rewards + calcRewardPerToken but this is easier and has no other affect on test outcome
                const initialRewards = (await userMockStaking.rewards(user.address)).toNumber();
                assert.notEqual(initialRewards, 0);

                const tx = await userMockStaking.claimReward();
                await tx.wait(1);

                const finalRewards = (await userMockStaking.rewards(user.address)).toNumber();
                assert.equal(finalRewards, 0);
            })
            it('correctly mints and transfers claimable rewards to user', async () => {
                 const initialUserBalance = (await userMockToken.getBalance()).toNumber();
 
                 tx = await userMockStaking.claimReward();
                 await tx.wait(1);
 
                 const finalUserBalance = (await userMockToken.getBalance()).toNumber();
                 assert.notEqual(initialUserBalance, finalUserBalance);
            })
            it('is not vulnerable to reentrancy', async () => {              
                //deploy reentrant attacker contract
                const reentrantContractFactory = await hre.ethers.getContractFactory('Reentrant');
                const reentrantContract = await reentrantContractFactory.deploy(mockStaking.address, mockToken.address); 
                await reentrantContract.deployed();
                const reentrant = reentrantContract.connect(user);

                //withdraw user staked tokens to supply to attacker contract
                const amount = 420420;
                let tx = await userMockStaking.withdraw(amount);
                await tx.wait(1);

                // Supply attacker contract with tokens and ETH for gas
                await userMockToken.transfer(reentrant.address, amount);
                await user.sendTransaction({to: reentrant.address, value: ethers.utils.parseEther('1.0')});
                
                //approve spend and stake tokens from reentrant contract
                tx = await reentrant.approve();
                await tx.wait(1);
                tx = await reentrant.stake(amount);
                await tx.wait(1);

                //wait for time to pass so rewards can accumulate
                await network.provider.send("evm_mine"); 
                await tx.wait(1);

                //withdraw tokens to update rewards (not strictly necessary but to show for the scope of this test before claiming that there are rewards to be claimed)
                tx = await reentrant.withdraw(amount);
                await tx.wait(1);
                
                //show that there are rewards to be withdrawn - claimReward will execute the code within the if statement
                const reentrantRewards = parseInt(await reentrant.getRewards());
                assert.notEqual(reentrantRewards, 0);

                /*claim rewards - the final token balance of the reentrant contract should only be
                the amount unstaked + the calculated rewards. if the contract cant be attacked via reentrancy
                it should continue to mint and allow tokens to be withdrawn until max supply is reached */
                tx = await reentrant.attack();
                await tx.wait(1);

                const expectedReentrantTokenBalance = amount + reentrantRewards;
                const reentrantTokenBalance = (await userMockToken.balanceOf(reentrant.address)).toNumber();
                assert.equal(expectedReentrantTokenBalance, reentrantTokenBalance);
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
                const expectedRewards = await mockStaking.rewards(user.address);
                const rewards = await userMockStaking.getRewards();
                assert.equal(expectedRewards.toNumber(), rewards.toNumber());
            })
        })
        
    })
})