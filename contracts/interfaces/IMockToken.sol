// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

interface IMockToken.sol {
    
    function mint(address to, uint256 amount) public {}

    //////////////////////
    // Getter Funcitons //
    //////////////////////

    function getMaxSupply() view returns (uint256) {}

    function getInitialSupply() public view returns (uint256) {}

    function getCurrentSupply() public view returns (uint256) {}

    function getCirculatingSupply() public view returns (uint256) {}

    function getOwner() public view returns (address) {} 
    
    function getBalance() public view returns (uint256) {}
}