const { expect } = require("chai");
const { ethers } = require("hardhat");

const tokens = (n) => ethers.utils.parseUnits(n.toString(), "ether");

describe("DDiscord", function () {
  let ddiscord, deployer, user;
  const NAME = "DDiscord";
  const SYMBOL = "DDIS";
  const CHANNEL_NAME = "general";

  beforeEach(async () => {
    // Setup Accounts
    [deployer, user] = await ethers.getSigners();

    // Deploy Contract
    const Dapp = await ethers.getContractFactory("DDiscord");
    ddiscord = await Dapp.deploy(NAME, SYMBOL);

    // Create Channel
    const transaction = await ddiscord
      .connect(deployer)
      .createChannel(CHANNEL_NAME, tokens(1));

    await transaction.wait();
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

  describe("Creating Channels", () => {
    it("Return Total Channels", async () => {
      const result = await ddiscord.totalChannels();
      expect(result).to.be.equal(1);
    });

    it("Return channel Attributes", async () => {
      const channel = await ddiscord.getChannel(1);
      expect(channel.id).to.be.equal(1);
      expect(channel.name).to.be.equal(CHANNEL_NAME);
      expect(channel.cost).to.be.equal(tokens(1));
    });

    describe("Creating Channels - User", () => {
      it("errors if sender is not owner", async () => {
        // Setup Accounts
        [deployer, user] = await ethers.getSigners();

        // Deploy Contract
        const Dapp = await ethers.getContractFactory("DDiscord");
        ddiscord = await Dapp.deploy(NAME, SYMBOL);

        // Create Channel
        await expect(
          ddiscord.connect(user).createChannel("user", tokens(1))
        ).to.be.revertedWith("Not Owner");
      });
    });
  });

  describe("Joining Channels", () => {
    const ID = 1;
    const AMOUNT = tokens(1);

    beforeEach(async () => {
      const transaction = await ddiscord
        .connect(user)
        .mint(ID, { value: AMOUNT });
      await transaction.wait();
    });

    it("Joins the user", async () => {
      const result = await ddiscord.hasJoined(ID, user.address);
      expect(result).to.be.equal(true);
    });

    it("Increases total supply", async () => {
      const result = await ddiscord.totalSupply();
      expect(result).to.be.equal(ID);
    });

    it("Updates the contract balance", async () => {
      const result = await ethers.provider.getBalance(ddiscord.address);
      expect(result).to.be.equal(AMOUNT);
    });
  });

  describe("Withdrawing", () => {
    const ID = 1;
    const AMOUNT = tokens(10);
    let balanceBefore;

    beforeEach(async () => {
      balanceBefore = await ethers.provider.getBalance(deployer.address);

      let transaction = await ddiscord
        .connect(user)
        .mint(ID, { value: AMOUNT });
      await transaction.wait();

      transaction = await ddiscord.connect(deployer).withdraw();
      await transaction.wait();
    });

    it("Updates the owner balance", async () => {
      const balanceAfter = await ethers.provider.getBalance(deployer.address);
      expect(balanceAfter).to.be.greaterThan(balanceBefore);
    });

    it("Updates the contract balance", async () => {
      const result = await ethers.provider.getBalance(ddiscord.address);
      expect(result).to.equal(0);
    });
  });
});
