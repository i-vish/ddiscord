const { expect } = require("chai");
const { ethers } = require("hardhat");

const tokens = (n) => ethers.utils.parseUtils(n.toString(), "ether");

describe("DDiscord", function () {
  let ddiscord, deployer, user;
  const NAME = "DDiscord";
  const SYMBOL = "DDIS";
  beforeEach(async () => {
    [deployer, user] = await ethers.getSigners();
    const Dapp = await ethers.getContractFactory("DDiscord");
    ddiscord = await Dapp.deploy(NAME, SYMBOL);
  });
  describe("Deployment", function () {
    it("Sets the Name", async () => {
      let result = await ddiscord.name();
      expect(result).to.equal(NAME);
    });

    it("Sets the Symbol", async () => {
      let result = await ddiscord.symbol();
      expect(result).to.equal(SYMBOL);
    });

    it("Sets the Owner", async () => {
      let result = await ddiscord.owner();
      expect(result).to.equal(deployer.address);
    });
  });
});
