//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

import "hardhat/console.sol";

contract NativeETHTransfer {
    address payable public someAddress;

    constructor() payable {
        payable(address(this)).transfer(msg.value);
    }

    function showMeTheMoney() public {
        payable(msg.sender).transfer(address(this).balance);
    }
}
