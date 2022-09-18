// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";


/* 
 * if some of the ERC20 functionality doesnt work for the token, use the 
 * actual contract instead of the interface - I'm not sure if the interface
 * will handle inheritance properly with the compiler.
*/

/*
 * I also want to set it to stop issuing new tokens once the max supply is reached,
 * not when a certain time period has passed
*/

/* 
 * I defintiely want to write some unit tests for this, get 100% coverage
 * Will be good practice both for unit testing and for showing I truly 
 * understand the contract
*/

/* TO DO:
 * - include a mechanism to actually mint tokens to distribute lls
 * - include maximum token supply
 * - decide on and include emission rate - this is the rewardRate - setRewardRate(uint256 rate) onlyOwner
 * - make sure my comments and understanding of all variables (especially the mappings) are correct
 * - add getter functions where necessary/useful
 * - finish tests - need deploy scripts too
 * - clean up code and comments
*/
contract MockStaking {
    //Token vars
    IERC20 public immutable mockToken; //IERC20 instead of IMockToken so I can have access to basic erc20 functions, I dont need any specifically mocktoken functions
    address public immutable mockTokenAddress; //not sure if I'll need this yet
    //staking rewards to be paid per second
    uint256 public rewardRate;
    // Sum of (rewardRate * time elapsed * 1e18 / totalStaked) - account's personal claim of accumulated rewards
    uint256 public rewardPerToken;
    // User address => rewardPerToken
    mapping(address => uint256) public userRewardPerTokenPaid;
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
        mockToken = IERC20(mockTokenAddress);
        rewardRate = initialRewardRate;
    }

    // Update staking reward each time certain functions are called
    modifier updateReward(address _account) {
        rewardPerToken = calcRewardPerToken();
        updatedAt = block.timestamp;
        if (_account != address(0)) {
            rewards[_account] = earned(_account);
            userRewardPerTokenPaid[_account] = rewardPerToken;
        }
        _;
    }

    function stake(uint _amount) external updateReward(msg.sender) {
        require(_amount > 0, "Amount must be greater than zero");
        require(mockToken.allowance(msg.sender,address(this)) >= _amount, "Token approval must be greater than desired stake amount");
        mockToken.transferFrom(msg.sender, address(this), _amount);
        balances[msg.sender] += _amount;
        totalStaked += _amount; 
    }

    function withdraw(uint _amount) external updateReward(msg.sender) {
        require(_amount > 0, "Amount must be greater than zero");
        balances[msg.sender] -= _amount;
        totalStaked -= _amount;
        mockToken.transfer(msg.sender, _amount);
    }

    function calcRewardPerToken() public view returns (uint256) {
        if (totalStaked == 0) {
            return rewardPerToken;
        }
        // add rewards accumulated since last reward update as proportion of total stake pool
        return rewardPerToken + (rewardRate * (block.timestamp - updatedAt) * 1e18) / totalStaked;
    }

    //need to update with my vars (some of which need to still be created)
    function earned(address _account) public view returns (uint256) {
        return
            ((balances[_account] *
                (calcRewardPerToken() - userRewardPerTokenPaid[_account])) / 1e18) +
            rewards[_account];
    }

    // this should be correct, needs comment.
    function getReward() external updateReward(msg.sender) {
        uint reward = rewards[msg.sender];
        if (reward > 0) {
            rewards[msg.sender] = 0;
            mockToken.transfer(msg.sender, reward);
        }
    }


    function setRewardRate(uint256 newRewardRate) public onlyOwner {
        rewardRate = newRewardRate;
    }




    //////////////////////
    // Getter Funcitons //
    //////////////////////

    function getBalance() public view returns (uint256) {
        return balances[msg.sender];
    }
}