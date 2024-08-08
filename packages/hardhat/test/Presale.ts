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

  describe("Deployment without refunding", function () {
    // it("Should have created the LP Pair Address", async function () {
    //   expect(await medalSale.uniswapV2Pair()).to.not.equal("0x0000000000000000000000000000000000000000");
    // });

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

    it("Should only allow owner to close the sale and after time elaspsed", async function () {
      const [owner, buyer, , , , buyer5] = await ethers.getSigners();

      await expect(medalSale.connect(buyer).closeSale()).to.be.revertedWithCustomError(
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

      await expect(medalSale.connect(owner).closeSale()).to.be.revertedWith("Sale time needs to elapse");
      await medalSale.changeEndTime(0);
      await expect(medalSale.connect(buyer5).buyTokens({ value: ethers.parseEther("2") })).to.be.revertedWith(
        "Sale time has elapsed",
      );
      await expect(medalSale.connect(owner).closeSale()).to.be.revertedWith("Auction reserve not reached");
      await medalSale.changeEndTime(1724328000);
      await medalSale.connect(buyer5).buyTokens({ value: ethers.parseEther("277") });
      await medalSale.changeEndTime(0);

      await medalSale.closeSale();
      expect(await medalSale.saleStatus()).to.equal(MedalSaleStatus.CLOSED);
    });

    // /// Last unit tests
    it("Should not be able to buy tokens after sale has ended", async function () {
      const [, buyer1] = await ethers.getSigners();

      await expect(medalSale.connect(buyer1).buyTokens({ value: ethers.parseEther("1") })).to.be.revertedWith(
        "Sale is not active",
      );
    });

    it("Should allow users to claim their tokens", async function () {
      const [, buyer1, buyer2, buyer3, buyer4, buyer5] = await ethers.getSigners();

      const totalEthSpent = await medalSale.ethRaised();
      const totalBonusEarned = await medalSale.bonusEthSpent();
      const tokensAvailable = await medalSale.tokensAvailable();

      const buyer1Spent = await medalSale.addressEthSpent(buyer1.address);
      const buyer1Bonus = await medalSale.addressBonusEarned(buyer1.address);

      const buyer2Spent = await medalSale.addressEthSpent(buyer2.address);
      const buyer2Bonus = await medalSale.addressBonusEarned(buyer2.address);

      const buyer3Spent = await medalSale.addressEthSpent(buyer3.address);
      const buyer3Bonus = await medalSale.addressBonusEarned(buyer3.address);

      const buyer4Spent = await medalSale.addressEthSpent(buyer4.address);
      const buyer4Bonus = await medalSale.addressBonusEarned(buyer4.address);

      const buyer5Spent = await medalSale.addressEthSpent(buyer5.address);
      const buyer5Bonus = await medalSale.addressBonusEarned(buyer5.address);

      const buyer1Tokens = (buyer1Spent + buyer1Bonus) * (tokensAvailable / (totalEthSpent + totalBonusEarned));
      const buyer2Tokens = (buyer2Spent + buyer2Bonus) * (tokensAvailable / (totalEthSpent + totalBonusEarned));
      const buyer3Tokens = (buyer3Spent + buyer3Bonus) * (tokensAvailable / (totalEthSpent + totalBonusEarned));
      const buyer4Tokens = (buyer4Spent + buyer4Bonus) * (tokensAvailable / (totalEthSpent + totalBonusEarned));
      const buyer5Tokens = (buyer5Spent + buyer5Bonus) * (tokensAvailable / (totalEthSpent + totalBonusEarned));

      await medalSale.connect(buyer1).claimFractions();
      expect(await mockERC20.balanceOf(buyer1.address)).to.equal(buyer1Tokens);
      expect(await medalSale.addressEthSpent(buyer1.address)).to.equal(0);

      await medalSale.connect(buyer2).claimFractions();
      expect(await mockERC20.balanceOf(buyer2.address)).to.equal(buyer2Tokens);
      expect(await medalSale.addressEthSpent(buyer2.address)).to.equal(0);

      await medalSale.connect(buyer3).claimFractions();
      expect(await mockERC20.balanceOf(buyer3.address)).to.equal(buyer3Tokens);
      expect(await medalSale.addressEthSpent(buyer3.address)).to.equal(0);

      await medalSale.connect(buyer4).claimFractions();
      expect(await mockERC20.balanceOf(buyer4.address)).to.equal(buyer4Tokens);
      expect(await medalSale.addressEthSpent(buyer4.address)).to.equal(0);

      await medalSale.connect(buyer5).claimFractions();
      expect(await mockERC20.balanceOf(buyer5.address)).to.equal(buyer5Tokens);
      expect(await medalSale.addressEthSpent(buyer5.address)).to.equal(0);

      await expect(medalSale.connect(buyer1).claimFractions()).to.be.revertedWith("No tokens to claim");

      const presaleTokenBalance = await mockERC20.balanceOf(await medalSale.getAddress());
      expect(presaleTokenBalance).to.be.lt(parseEther("10000"));
    });

    it("Should only allow owner to withdraw ETH after the sale is closed and distribute", async function () {
      const [owner, buyer] = await ethers.getSigners();

      const platformFeeDestination = "0xf87Eaea53f15189385a5fb33b6Ad0c61C6047d47";
      const jennerTreasury = "0xC3Cc6d2db567aF6669beC02c8084E71B1714643a";

      await expect(medalSale.connect(buyer).withdrawEth()).to.be.revertedWithCustomError(
        medalSale,
        "OwnableUnauthorizedAccount",
      );

      const presaleContractBalance = await ethers.provider.getBalance(await medalSale.getAddress());
      const platformFee = presaleContractBalance / 5n;

      await medalSale.connect(owner).withdrawEth();
      expect(await medalSale.addressEthSpent(owner.address)).to.equal(0);

      expect(await ethers.provider.getBalance(platformFeeDestination)).to.be.equal(platformFee);
      expect(await ethers.provider.getBalance(jennerTreasury)).to.be.equal(presaleContractBalance - platformFee);
    });
  });
});
