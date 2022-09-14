// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

interface IMockToken {
    
    function mint(address to, uint256 amount) external;

    //////////////////////
    // Getter Funcitons //
    //////////////////////

    function getMaxSupply() external view returns (uint256);

    function getInitialSupply() external view returns (uint256);

    function getCurrentSupply() external view returns (uint256);

    function getCirculatingSupply() external view returns (uint256);

    function getOwner() external view returns (address);
    
    function getBalance() external view returns (uint256);

    function getAllowance(address owner, address spender) external view returns (uint256);
}