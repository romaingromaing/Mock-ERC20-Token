// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./interfaces/IMockToken.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MockStaking is Ownable {
    //Token vars

    IMockToken public immutable mockToken; //IMockToken interface also includes all ERC20 events/functions
    address public immutable mockTokenAddress; 
    
    uint256 public immutable maxSupply;

    //staking rewards to be paid per second
    uint256 public rewardRate;
    // Sum of (rewardRate * time elapsed * 1e18 / totalStaked) - each individual token's claim of accumulated rewards
    uint256 public rewardPerToken;
    // User address => rewardPerToken
    mapping(address => uint256) public userRewardPerTokenPaid; //keeps track of what amount rewardPerToken has already been accounted for per individual user account - think of it as a previous checkpoint/last update for rewardPerToken. Then the difference can be taken to view unaccounted for rewards that have accumualated
    // User address => rewards to be claimed
    mapping(address => uint256) public rewards; 
    //Total amount of tokens staked
    uint256 public totalStaked;
    // Timestamp of last reward update
    uint256 public updatedAt;

    //depositor address => staked amount
    mapping(address => uint256) private balances;

    constructor(address _mockTokenAddress, uint256 initialRewardRate) {
        mockTokenAddress = _mockTokenAddress;
        mockToken = IMockToken(mockTokenAddress);
        rewardRate = initialRewardRate;
        maxSupply = mockToken.getMaxSupply();
    }

    // Update staking reward each time certain functions are called
    modifier updateReward(address _account) {
        rewardPerToken = calcRewardPerToken();
        updatedAt = block.timestamp;
        rewards[_account] = earned(_account); 
        /*since earned() adds rewards based on the difference between 
        rewardPerToken and userRewardPerTokenPaid, set them equal to each other
        to make that difference zero - meaning those rewards have been accounted for*/
        userRewardPerTokenPaid[_account] = rewardPerToken;

        _;
    }

    //stake tokens, update rewards, remove staked tokens from circulating supply
    function stake(uint _amount) external updateReward(msg.sender) {
        require(_amount > 0, "Amount must be greater than zero");
        require(mockToken.allowance(msg.sender,address(this)) >= _amount, "Token approval must be greater than desired stake amount");
        mockToken.transferFrom(msg.sender, address(this), _amount);
        balances[msg.sender] += _amount;
        totalStaked += _amount; 
        mockToken.updateCirculatingSupply();
    }

    //withdraw tokens, update rewards, add tokens back to circulating supply
    function withdraw(uint _amount) external updateReward(msg.sender) {
        require(_amount > 0, "Amount must be greater than zero");
        balances[msg.sender] -= _amount;
        totalStaked -= _amount;
        mockToken.transfer(msg.sender, _amount); 
        mockToken.updateCirculatingSupply();
    }

    //calculate and return updated accumulated reward amount per token staked
    function calcRewardPerToken() public view returns (uint256) {
        if (totalStaked == 0) {
            return rewardPerToken;
        }
        // add rewards accumulated since last reward update per token staked
        return rewardPerToken + (rewardRate * (block.timestamp - updatedAt) * 1e18) / totalStaked;
    }


    /*returns claimable accumulated rewards per user account
     * 
     * Reward accrual is based on the difference between rewardPerToken,
     * which is freshly calculated by calcRewardPerToken(), and userRewardPerTokenPaid,
     * which is updated in the updateReward modifier each time it's called to represent
     * that accumulated rewards have already been accounted for. 
     * 
     * So (calcRewardPerToken() - userRewardPerTokenPaid) represents the proportion of
     * accumualted rewards that have NOT been accounted for within the user's account */
    function earned(address _account) public view returns (uint256) {
        //mechanism to stop reward accrual if maxSupply is reached
        if(mockToken.totalSupply() <  maxSupply) {
            uint256 earnedRewards = ((balances[_account] *
                    (calcRewardPerToken() - userRewardPerTokenPaid[_account])) / 1e18);
            if(mockToken.totalSupply() + earnedRewards > maxSupply) { //if this reward accrual bunch would run over max supply
                return (rewards[_account] + (maxSupply-mockToken.totalSupply())); //add only up to max supply, but  do not surpass
            } else {
                return earnedRewards + rewards[_account];
            }
        } else { //if max supply is already reached, do not accrue rewards
            return rewards[_account];
        }
    }

    //update rewards and then claim accumulated reward tokens
    function claimReward() external updateReward(msg.sender) {
        uint256 reward = rewards[msg.sender];
        if (reward > 0) {
            rewards[msg.sender] = 0; //before mint to prevent reentrancy
            mockToken.mint(msg.sender, reward);
        }
    }

    //Contract owner can change the reward rate
    function setRewardRate(uint256 newRewardRate) public onlyOwner {
        require(newRewardRate > 0, "New reward rate must be greater than zero");
        rewardRate = newRewardRate;
    }




    //////////////////////
    // Getter Funcitons //
    //////////////////////

    function getBalance() public view returns (uint256) {
        return balances[msg.sender];
    }

    function getTotalStaked() public view returns(uint256) {
        return totalStaked;
    }
    
    function getRewards() public view returns (uint256) {
        return rewards[msg.sender];
    }
}