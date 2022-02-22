const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MunchinToken", function () {
  let deployer;

  let munchinToken;

  const initialSupply = ethers.utils.parseUnits("1000", 18);

  before(async function () {
    [deployer] = await ethers.getSigners();

    const MunchinToken = await ethers.getContractFactory("MunchinToken");
    munchinToken = await MunchinToken.deploy(initialSupply);

    await munchinToken.deployed();
  });

  it("should have minted initial supply to the deployer with initial allowance", async function () {
    const deployerBalance = await munchinToken.balanceOf(deployer.address);

    console.log(`deployerBalance = ${ethers.utils.formatUnits(deployerBalance, 18)}`);

    expect(deployerBalance).to.equal(initialSupply);
  });
});
