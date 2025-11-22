// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/// @title MockToken - Simple ERC20 for testing GreenFiCore staking
contract MockToken is ERC20 {
    constructor() ERC20("Mock GreenFi Token", "MGFT") {
        // Mint initial supply to the deployer for testing
        _mint(msg.sender, 1_000_000 ether);
    }
}
