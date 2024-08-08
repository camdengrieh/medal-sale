import { expect } from "chai";
import { ethers } from "hardhat";
import { MedalSale, Olympic1976GoldFragments, Olympic1976GoldRights } from "../typechain-types";
import { parseEther } from "ethers";

describe("MedalSale", function () {
  // We define a fixture to reuse the same setup in every test.

  let medalSale: MedalSale;
  let mockERC20: Olympic1976GoldFragments;
  before(async () => {
    const mockERC20Factory = await ethers.getContractFactory("Olympic1976GoldFragments");
    const MockRights = await ethers.getContractFactory("Olympic1976GoldRights");
    const medalSaleFactory = await ethers.getContractFactory("MedalSale");
    const mockMedalRights = (await MockRights.deploy()) as Olympic1976GoldRights;
    mockERC20 = (await mockERC20Factory.deploy(await mockMedalRights.getAddress())) as Olympic1976GoldFragments;
    await mockERC20.waitForDeployment();
    const tokenAddress = await mockERC20.getAddress();
    console.log("MockERC20 deployed to:", tokenAddress);

    medalSale = (await medalSaleFactory.deploy(tokenAddress)) as MedalSale;
    await medalSale.waitForDeployment();

    mockERC20.transfer(await medalSale.getAddress(), ethers.parseEther("20000000"));
  });

  describe("Deployment with refunding", function () {
    it("Should have set the correct token address", async function () {
      expect(await medalSale.medal()).to.equal(await mockERC20.getAddress());
    });

    it("Should prevent non-owner from setting a new end time", async function () {
      const [, buyer1] = await ethers.getSigners();

      await expect(medalSale.connect(buyer1).openSale()).to.be.revertedWithCustomError(
        medalSale,
        "OwnableUnauthorizedAccount",
      );
    });

    it("Should not be able to buy tokens before sale has started", async function () {
      const [, buyer1] = await ethers.getSigners();
      await expect(medalSale.connect(buyer1).buyTokens({ value: ethers.parseEther("1") })).to.be.revertedWith(
        "Sale is not active",
      );
    });

    it("Should allow setting a new end time and start sale", async function () {
      const [owner] = await ethers.getSigners();
      const _endTime = 1724328000;

      await medalSale.connect(owner).openSale();
      expect(await medalSale.saleEndTime()).to.equal(_endTime);
    });

    it("Should not be able to start the sale again", async function () {
      await expect(medalSale.openSale()).to.be.revertedWith("Sale has already started");
    });

    it("Should be able to buy tokens after sale has started", async function () {
      const [, buyer1] = await ethers.getSigners();

      await medalSale.connect(buyer1).buyTokens({ value: ethers.parseEther("1") });
      expect(await medalSale.addressEthSpent(await buyer1.getAddress())).to.equal(ethers.parseEther("1"));
    });

    it("Should allow owner to whitelist multiple addresses for bonus", async function () {
      const [owner, buyer1, buyer2, buyer3, buyer4] = await ethers.getSigners();

      await medalSale.connect(owner).addBatchToBonusWhitelist([buyer1.address, buyer2.address, buyer3.address]);
      //Wait for the transaction to be mined
      expect(await medalSale.bonusWhitelist(buyer1.address)).to.equal(true);
      expect(await medalSale.bonusWhitelist(buyer2.address)).to.equal(true);
      expect(await medalSale.bonusWhitelist(buyer3.address)).to.equal(true);
      expect(await medalSale.bonusWhitelist(buyer4.address)).to.equal(false);
    });

    it("Should be able to buy tokens after sale has started and receive a bonus if whitelisted", async function () {
      const [, buyer1, buyer2, buyer3, buyer4] = await ethers.getSigners();

      await medalSale.connect(buyer1).buyTokens({ value: ethers.parseEther("1") });
      await medalSale.connect(buyer2).buyTokens({ value: ethers.parseEther("10") });
      await medalSale.connect(buyer3).buyTokens({ value: ethers.parseEther("23") });
      await medalSale.connect(buyer4).buyTokens({ value: ethers.parseEther("100") });

      expect(await medalSale.addressEthSpent(buyer1.address)).to.equal(ethers.parseEther("2"));
      expect(await medalSale.addressBonusEarned(buyer1.address)).to.equal(ethers.parseEther("0.25"));

      expect(await medalSale.addressEthSpent(buyer2.address)).to.equal(ethers.parseEther("10"));
      expect(await medalSale.addressBonusEarned(buyer2.address)).to.equal(ethers.parseEther("2.5"));

      expect(await medalSale.addressEthSpent(buyer3.address)).to.equal(ethers.parseEther("23"));
      expect(await medalSale.addressBonusEarned(buyer3.address)).to.equal(ethers.parseEther("5.75"));

      expect(await medalSale.addressEthSpent(buyer4.address)).to.equal(ethers.parseEther("100"));
      expect(await medalSale.addressBonusEarned(buyer4.address)).to.equal(ethers.parseEther("0"));

      expect(await medalSale.bonusEthSpent()).to.equal(parseEther("8.5"));
    });

    it("Should only allow owner to refund the sale before its closed", async function () {
      const [owner, buyer] = await ethers.getSigners();

      await expect(medalSale.connect(buyer).allowRefunds()).to.be.revertedWithCustomError(
        medalSale,
        "OwnableUnauthorizedAccount",
      );
      enum MedalSaleStatus {
        NOT_STARTED,
        STARTED,
        CLOSED,
        DISTRIBUTION,
        REFUNDING,
      }

      await medalSale.connect(owner).allowRefunds();

      await expect(medalSale.connect(owner).allowRefunds()).to.be.revertedWith("Sale must be ongoing");
      expect(await medalSale.saleStatus()).to.equal(MedalSaleStatus.REFUNDING);
    });

    // /// Last unit tests
    it("Should not be able to buy tokens after sale is in refund status", async function () {
      const [, buyer1] = await ethers.getSigners();

      await expect(medalSale.connect(buyer1).buyTokens({ value: ethers.parseEther("1") })).to.be.revertedWith(
        "Sale is not active",
      );
    });

    it("Should allow users to claim their refund", async function () {
      const [, buyer1, buyer2, buyer3, buyer4, buyer5] = await ethers.getSigners();
      const buyer1Spent = await medalSale.addressEthSpent(buyer1.address);
      const buyer1BalanceBefore = await ethers.provider.getBalance(buyer1.address);

      const buyer2Spent = await medalSale.addressEthSpent(buyer2.address);
      const buyer2BalanceBefore = await ethers.provider.getBalance(buyer2.address);

      const buyer3Spent = await medalSale.addressEthSpent(buyer3.address);
      const buyer3BalanceBefore = await ethers.provider.getBalance(buyer3.address);

      const buyer4Spent = await medalSale.addressEthSpent(buyer4.address);
      const buyer4BalanceBefore = await ethers.provider.getBalance(buyer4.address);

      await medalSale.connect(buyer1).refund();
      expect(await ethers.provider.getBalance(buyer1.address)).to.be.approximately(
        buyer1BalanceBefore + buyer1Spent,
        parseEther("0.1"),
      );
      expect(await medalSale.addressEthSpent(buyer1.address)).to.equal(0);

      await medalSale.connect(buyer2).refund();
      expect(await ethers.provider.getBalance(buyer2.address)).to.approximately(
        buyer2BalanceBefore + buyer2Spent,
        parseEther("0.1"),
      );
      expect(await medalSale.addressEthSpent(buyer2.address)).to.equal(0);

      await medalSale.connect(buyer3).refund();
      expect(await ethers.provider.getBalance(buyer3.address)).to.approximately(
        buyer3BalanceBefore + buyer3Spent,
        parseEther("0.1"),
      );
      expect(await medalSale.addressEthSpent(buyer3.address)).to.equal(0);

      await medalSale.connect(buyer4).refund();
      expect(await ethers.provider.getBalance(buyer4.address)).to.approximately(
        buyer4BalanceBefore + buyer4Spent,
        parseEther("0.1"),
      );
      expect(await medalSale.addressEthSpent(buyer4.address)).to.equal(0);

      await expect(medalSale.connect(buyer5).refund()).to.be.revertedWith("No ETH to refund");

      await expect(medalSale.connect(buyer1).claimFractions()).to.be.revertedWith("Sale is not complete");

      const presaleEthBalance = await ethers.provider.getBalance(await medalSale.getAddress());
      expect(presaleEthBalance).to.be.equal(parseEther("0"));
    });

    it("Allow reset of the presale", async function () {
      const [owner, buyer] = await ethers.getSigners();

      await expect(medalSale.connect(buyer).resetSale()).to.be.revertedWithCustomError(
        medalSale,
        "OwnableUnauthorizedAccount",
      );

      await medalSale.connect(owner).resetSale();
    });
  });
});
