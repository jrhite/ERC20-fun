const { expect } = require("chai");
const { BigNumber } = require("ethers");
const { ethers } = require("hardhat");

describe("TrustlessTrader", function () {
  let deployer, munchinTokenOwner, bengalTokenOwner;

  let munchinToken;
  let bengalToken;

  let trustlessTrader;

  const initialSupply = ethers.utils.parseUnits("1000", 18);

  beforeEach(async function () {
    [deployer, munchinTokenOwner, bengalTokenOwner] = await ethers.getSigners();

    const MunchinToken = await ethers.getContractFactory("MunchinToken", munchinTokenOwner);
    munchinToken = await MunchinToken.deploy(initialSupply);

    await munchinToken.deployed();
  });

  beforeEach(async function () {
    [deployer, munchinTokenOwner, bengalTokenOwner] = await ethers.getSigners();

    const BengalToken = await ethers.getContractFactory("BengalToken", bengalTokenOwner);
    bengalToken = await BengalToken.deploy(initialSupply);

    await bengalToken.deployed();
  });

  beforeEach(async function () {
    const TrustlessTrader = await ethers.getContractFactory("TrustlessTrader");
    trustlessTrader = await TrustlessTrader.deploy();

    await trustlessTrader.deployed();
  });

  it("deposits erc20 token", async function () {
    trustlessTrader = await trustlessTrader.connect(munchinTokenOwner);

    await printBalances('before deposits');

    const approveTxn = await munchinToken.approve(trustlessTrader.address, initialSupply);
    await approveTxn.wait();

    const depositTxn = await trustlessTrader.deposit(munchinToken.address, initialSupply);
    await depositTxn.wait();

    let munchinTokenOwnerBalance = await munchinToken.balanceOf(munchinTokenOwner.address);
    let trustlessTraderBalance = await munchinToken.balanceOf(trustlessTrader.address);

    await printBalances("after deposits");

    expect(munchinTokenOwnerBalance).to.equal(ethers.BigNumber.from("0"));
    expect(trustlessTraderBalance).to.equal(initialSupply);
  });

  it("withdraws erc20 token", async function () {
    trustlessTrader = await trustlessTrader.connect(munchinTokenOwner);

    await printBalances("before deposits");

    const approveTxn = await munchinToken.approve(trustlessTrader.address, initialSupply);
    await approveTxn.wait();

    const depositTxn = await trustlessTrader.deposit(munchinToken.address, initialSupply);
    await depositTxn.wait();

    await printBalances("after deposits");

    const withdrawTxn = await trustlessTrader.withdraw(munchinToken.address);
    await withdrawTxn.wait();

    let munchinTokenOwnerBalance = await munchinToken.balanceOf(munchinTokenOwner.address);
    let trustlessTraderBalance = await munchinToken.balanceOf(trustlessTrader.address);

    await printBalances("after withdrawals");

    expect(munchinTokenOwnerBalance).to.equal(initialSupply);
    expect(trustlessTraderBalance).to.equal(ethers.BigNumber.from("0"));
  });

  it("swaps with counterparty", async function () {
    trustlessTrader = await trustlessTrader.connect(munchinTokenOwner);

    await printBalances("before deposits");

    // 1. approve contract to spend MunchinToken on user's behalf
    let approveTxn = await munchinToken.approve(trustlessTrader.address, initialSupply);
    await approveTxn.wait();

    // 2. deposit MunchinToken to contract
    let depositTxn = await trustlessTrader.deposit(munchinToken.address, initialSupply);
    await depositTxn.wait();

    trustlessTrader = await trustlessTrader.connect(bengalTokenOwner);

    // 1. approve contract to spend BengalToken on user's behalf
    approveTxn = await bengalToken.approve(trustlessTrader.address, initialSupply);
    await approveTxn.wait();

    // 2. deposit BengalToken to contract
    depositTxn = await trustlessTrader.deposit(bengalToken.address, initialSupply);
    await depositTxn.wait();

    await printBalances("after deposits");

    // 3. perform trustlessTrader.tradeWith()

    trustlessTrader = await trustlessTrader.connect(munchinTokenOwner);

    const swapWithTxn = await trustlessTrader.tradeWith(bengalTokenOwner.address);
    await swapWithTxn.wait();

    await printBalances('after tradeWith()');
  });

  async function printBalances(msg) {
    munchinTokenOwnerMunchinBalance = await munchinToken.balanceOf(munchinTokenOwner.address);
    bengalTokenOwnerMunchinBalance = await munchinToken.balanceOf(bengalTokenOwner.address);
    trustlessTraderMunchinBalance = await munchinToken.balanceOf(trustlessTrader.address);

    munchinTokenOwnerBengalBalance = await bengalToken.balanceOf(munchinTokenOwner.address);
    bengalTokenOwnerBengalBalance = await bengalToken.balanceOf(bengalTokenOwner.address);
    trustlessTraderBengalBalance = await bengalToken.balanceOf(trustlessTrader.address);

    console.log(`--------------------------------------------------`);
    console.log(`MunchinToken Balances ${msg}`);
    console.log(`    munchinTokenOwner = ${ethers.utils.formatUnits(munchinTokenOwnerMunchinBalance, 18)}`);
    console.log(`    bengalTokenOwner = ${ethers.utils.formatUnits(bengalTokenOwnerMunchinBalance, 18)}`);
    console.log(`    trustlessTraderContract = ${ethers.utils.formatUnits(trustlessTraderMunchinBalance, 18)}`);

    console.log(`--------------------------------------------------`);
    console.log(`BengalToken Balances ${msg}`);
    console.log(`    munchinTokenOwner = ${ethers.utils.formatUnits(munchinTokenOwnerBengalBalance, 18)}`);
    console.log(`    bengalTokenOwner = ${ethers.utils.formatUnits(bengalTokenOwnerBengalBalance, 18)}`);
    console.log(`    trustlessTraderContract = ${ethers.utils.formatUnits(trustlessTraderBengalBalance, 18)}`);
  }
});
