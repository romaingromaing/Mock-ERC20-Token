//deploying both contracts in 1 file for now. Would like to get the separate files working
//the issue is related to the tokenAddress - I either need to export it in this file and import in the other
//or the issue is that it deploys and then deletes when/if the hardhat chain stops functioning - might work on an actual ganache chain idk

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
    const initialRewardRate = 69; //for constructor, not sure on the actual value right now
    const stakingContract = await stakingContractFactory.deploy(tokenAddress, initialRewardRate); //pass in constructor args as deploy params
    await stakingContract.deployed();
    console.log("Staking contract deployed to:", stakingContract.address);

    //still need to add setStakingAddress and ownership transfer to this

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
