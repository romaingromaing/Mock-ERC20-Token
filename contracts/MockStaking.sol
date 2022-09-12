// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./interfacres/IMockToken.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MockStaking() {

    IMockToken public immutable mockToken;
    address public immutable mockTokenAddress //not sure if I'll need this yet

    mapping(address => uint256) private balances;

    constructor(address _mockTokenAddress) {
        mockTokenAddress = _mockTokenAddress;
        mockToken = IMockToken(mockTokenAddress);
    }







    function getBalance() public view returns (uint256) {
        return balances[msg.sender];
    }




}