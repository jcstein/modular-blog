// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "forge-std/Script.sol";

import {Blog} from "src/Contract.sol";

contract ContractScript is Script {
    function setUp() public {}

    function run() public {
        vm.startBroadcast();
        new Blog("Celestia Blog");
        vm.stopBroadcast();
    }
}