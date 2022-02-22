const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("NativeETHTransfer", function () {
  let deployer, happyUser;

  const value = ethers.utils.parseEther("10");

  let nativeETHTransfer;
  
  before(async function () {
    [deployer, happyUser] = await ethers.getSigners();

    const NativeETHTransfer = await ethers.getContractFactory("NativeETHTransfer");
    nativeETHTransfer = await NativeETHTransfer.deploy({ value });

    await nativeETHTransfer.deployed();
  });

  it("Should deploy with contract and fund it", async function () {
    const contractBalance = await ethers.provider.getBalance(nativeETHTransfer.address);

    console.log(`contractBalance = ${ethers.utils.formatEther(contractBalance)}`);

    expect(contractBalance).to.equal(value);
  });

  it("Happy user can get ETH by calling NativeETHTransfer.showMeTheMoney()", async function () {
    let userBalance = await ethers.provider.getBalance(happyUser.address);

    console.log(`User balance before: userBalance =  ${ethers.utils.formatEther(userBalance)}`);

    nativeETHTransfer = await nativeETHTransfer.connect(happyUser);

    const showMeTheMoneyTxn = await nativeETHTransfer.showMeTheMoney();
    await showMeTheMoneyTxn.wait();

    userBalance = await ethers.provider.getBalance(happyUser.address);

    console.log(`User balance after: userBalance =  ${ethers.utils.formatEther(userBalance)}`);
  });
});
