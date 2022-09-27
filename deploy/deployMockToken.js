require("@nomiclabs/hardhat-ethers");
const hre = require('hardhat');
const { verify } = require("../utils/verify");

const main = async () => {
    const tokenContractFactory = await hre.ethers.getContractFactory('MockToken');
    
    const initialSupply = 69420420;
    const tokenContract = await tokenContractFactory.deploy(initialSupply); //pass in constructor args as deploy params
    await tokenContract.deployed();
    console.log("Token contract deployed to:", tokenContract.address);

    tokenAddress = tokenContract.address; // to be imported by staking deployment script for constructor args
    //explorer verification
    //   tokenContract.deployTransaction.wait(10); //Allow etherscan to register the deployment
    //   args = [initialSupply]; //constructor args
    //   console.log("Verifying...");
    //   await verify(tokenContract.address, args);
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    const stakingContractFactory = await hre.ethers.getContractFactory('MockStaking');
    const initialRewardRate = 69; 
    const stakingContract = await stakingContractFactory.deploy(tokenAddress, initialRewardRate); //pass in constructor args as deploy params
    await stakingContract.deployed();
    console.log("Staking contract deployed to:", stakingContract.address);

    let accounts = await ethers.getSigners();
    let deployer = accounts[0];
    let mockToken = tokenContract.connect(deployer);
    //SetStakingAddress
    await mockToken.setStakingAddress(stakingContract.address);
    //transfer ownership of the token to the staking address
    const tx = await mockToken.transferOwnership(stakingContract.address); 
    tx.wait(1);

    //explorer verification
    //   tokenContract.deployTransaction.wait(10); //Allow etherscan to register the deployment
    //   args = [initialSupply]; //constructor args
    //   console.log("Verifying...");
    //   await verify(tokenContract.address, args);
}

const runMain = async () => {
    try {
      await main();
      process.exit(0);
    } catch (error) {
      console.log(error);
      process.exit(1);
    }
  };
  
  runMain();
