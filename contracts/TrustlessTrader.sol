//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

import "hardhat/console.sol";

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract TrustlessTrader {
  struct ERC20TokenBalance {
    address tokenAddr;
    uint balance;
  }

  mapping (address => ERC20TokenBalance) public balances;

  function deposit(address _token, uint _amount) public {
    // who is msg.sender?

    IERC20 token = IERC20(_token);

    // 1. transferFrom(): transfer user's ERC20 token balance from user to contract
    require(token.transferFrom(msg.sender, address(this), _amount), "deposit(): transferFrom() failed");

    // 2. approve this contract to use ERC20 tokens
    // inside the token.approve() function, who is msg.sender?
    // require(token.approve(address(this), _amount), "deposit(): approve() failed");

    balances[msg.sender] = ERC20TokenBalance(_token, _amount);
  }

  function withdraw(address _token) public {
    IERC20 token = IERC20(_token);

    ERC20TokenBalance memory userBalance = balances[msg.sender];

    require(userBalance.tokenAddr == _token && userBalance.balance > 0, "withdraw(): user has 0 token balance");

    require(token.transfer(msg.sender, userBalance.balance), "withdraw(): transferFrom failed");

    balances[msg.sender] = ERC20TokenBalance(_token, 0);
  }

  function tradeWith(address counterParty) public {
    ERC20TokenBalance memory msgSenderBalance = balances[msg.sender];
    ERC20TokenBalance memory counterPartyBalance = balances[counterParty];

    require(msgSenderBalance.balance > 0, "tradeWith(): msg.sender has insufficient balance");
    require(counterPartyBalance.balance > 0, "tradeWith(): counterPartyBalance has insufficient balance");

    require(msgSenderBalance.balance == counterPartyBalance.balance, "msg.sender and counterParty do not have equal balances");

    uint amount = msgSenderBalance.balance;

    IERC20 token1 = IERC20(msgSenderBalance.tokenAddr);
    IERC20 token2 = IERC20(counterPartyBalance.tokenAddr);

    require(token1.transfer(counterParty, amount), "transfer of token1 failed");
    require(token2.transfer(msg.sender, amount), "transfer of token2 failed");

    balances[msg.sender] = ERC20TokenBalance(msgSenderBalance.tokenAddr, 0);
    balances[msg.sender] = ERC20TokenBalance(msgSenderBalance.tokenAddr, 0);
  }
}
