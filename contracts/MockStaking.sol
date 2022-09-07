// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

interface IMockToken.sol {
    function mint(address to, uint256 amount) public;
}

contract MockStaking() {

    mapping(address => uint256) private balances;









    function getBalance() public view returns (uint256) {
        return balances[msg.sender];
    }




}