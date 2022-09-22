require("@nomiclabs/hardhat-ethers");
const hre = require('hardhat');
const { verify } = require("../utils/verify");
const {tokenAddress} = require('./deployMockToken'); //need to make sure this is the correct way to get this

const main = async () => {
    const stakingContractFactory = await hre.ethers.getContractFactory('MockStaking');
    const initialRewardRate = 69; //for constructor, not sure on the actual value right now
    const stakingContract = await stakingContractFactory.deploy(tokenAddress, initialRewardRate); //pass in constructor args as deploy params
    await stakingContract.deployed();
    console.log("Contract deployed to:", stakingContract.address);

    //explorer verification
    //   tokenContract.deployTransaction.wait(10); //Allow etherscan to register the deployment
    //   args = [tokenAddress, initialRewardRate]; //constructor args
    //   console.log("Verifying...");
    //   await verify(stakingContract.address, args);
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
