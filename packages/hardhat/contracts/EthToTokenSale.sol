//SPDX-License-Identifier: MIT

pragma solidity 0.8.26;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./dex/interfaces/IUniswapV2Router.sol";
import "./dex/interfaces/IUniswapV2Factory.sol";
//No reentrancy guard
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MedalSale is ReentrancyGuard, Ownable {
	//TODO: Update addresses
	address payable public constant platformFeeDestination =
		payable(0x818690e568492772Ae85ebD30532C9E4c3740d45);
	address payable public constant jennerTreasury =
		payable(0x857473A05370bC351c4b4488C9BBEAF765CC3725);

	IERC20 public immutable medal;
	//bytes32 public merkleRoot;

	mapping(address => uint256) public addressEthSpent;
	mapping(address => uint256) public addressBonusEarned;

	address[] public buyers;

	uint256 public constant tokensAvailable = 20_000_000 * 10**18; // 20% of the tokenSupply to be sold

	address public immutable uniswapV2Pair;
	IUniswapV2Router public constant uniswapV2Router =
		IUniswapV2Router(0x4752ba5DBc23f44D87826276BF6Fd6b1C372aD24);

	mapping(address => bool) public bonusWhitelist; // Holders of $PEOPLE, $DOG and $JENNER get a 25% bonus on their ETH Spent
	uint256 public bonusEthSpent;
	uint256 public ethRaised;

	uint256 public tokensPerEth;

	enum Status {
		NOT_STARTED,
		STARTED,
		CLOSED,
		REFUNDING
	}

	Status public saleStatus;

	uint256 public saleEndTime;

	event Bought(address buyer, uint256 amount);
	event Sold(address seller, uint256 amount);

	event Withdrawn(address buyer, uint256 amount);
	event SaleComplete(uint256 tokensPerEth);

	constructor(address _medal) Ownable(msg.sender) {
		// uniswapV2Pair = IUniswapV2Factory(uniswapV2Router.factory()).createPair(
		// 	_medal,
		// 	uniswapV2Router.WETH()
		// );
		medal = IERC20(_medal);
	}

	function buyersLength() public view returns (uint256) {
		return buyers.length;
	}

	function buyTokens() public payable nonReentrant {
		_buyTokens(msg.sender);
	}

	receive() external payable nonReentrant {
		_buyTokens(msg.sender);
	}

	///@param _endTime Duration of the sale in unix timestamp
	function openSale(uint256 _endTime) public onlyOwner {
		require(saleStatus != Status.STARTED, "Sale has already started");
		saleStatus = Status.STARTED;
		saleEndTime = _endTime;
	}

	function closeSale() public onlyOwner {
		require(saleStatus == Status.STARTED, "Sale must be active");
		saleStatus = Status.CLOSED;
		uint256 _ethRaised = address(this).balance + bonusEthSpent;
		ethRaised = address(this).balance;
		tokensPerEth = tokensAvailable / _ethRaised ; //Safe to assume we won't have more than 20M ETH raised

		emit SaleComplete(tokensPerEth);
	}

	function _buyTokens(address _buyer) public payable {
		//Checks
		require(saleStatus == Status.STARTED, "Sale is not active");
		require(block.timestamp < saleEndTime, "Sale time has ended");
		require(msg.value > 0, "No ETH sent");

		//Check if user is in the bonus whitelist
		//User effects
		if (bonusWhitelist[_buyer]) {
			uint256 _bonus = msg.value / 4;
			addressEthSpent[_buyer] += msg.value;
			addressBonusEarned[_buyer] += _bonus;
			bonusEthSpent += _bonus;
		} else {
			addressEthSpent[_buyer] += msg.value;
		}

		uint256 _buyersLength = buyers.length;
		if (_buyersLength == 0) {
			buyers.push(_buyer);
		} else {
			for (uint256 i; i < _buyersLength; ++i) {
				if (buyers[i] == _buyer) {
					break;
				} else if (i == _buyersLength - 1) {
					buyers.push(_buyer);
				}
			}
		}

		//emit Bought(_buyer, tokenAmountBought);
	}

	function claimFractions() public {
		//When sale is closed allow users to claim their fraction of the medal
		require(saleStatus == Status.CLOSED, "Sale is not complete");
		uint256 _allocation = (addressEthSpent[msg.sender] +
			addressBonusEarned[msg.sender]) *
			tokensPerEth;
		addressEthSpent[msg.sender] = 0;
		addressBonusEarned[msg.sender] = 0;
		medal.transfer(msg.sender, _allocation);
		emit Withdrawn(msg.sender, _allocation);
	}

	//TODO: To be implemented
	function _addLiquidityForMedal(
		uint256 tokenAmount,
		uint256 ethAmount
	) private {
		// approve token transfer to cover all possible scenarios
		medal.approve(address(uniswapV2Router), tokenAmount);

		// add the liquidity
		uniswapV2Router.addLiquidityETH{ value: ethAmount }(
			address(medal),
			tokenAmount,
			0, // Slippage is unavoidable
			0, // Slippage is unavoidable
			address(0), //TODO: Lock liquidity somewhere
			block.timestamp
		);
	}

	function allowRefunds() public onlyOwner {
		saleStatus = Status.REFUNDING;
	}

	function refund() public {
		require(saleStatus == Status.REFUNDING, "Refunds are not allowed");
		uint256 _ethSpent = addressEthSpent[msg.sender];
		require(_ethSpent > 0, "No ETH to refund");
		addressEthSpent[msg.sender] = 0;
		addressBonusEarned[msg.sender] = 0;
		payable(msg.sender).transfer(_ethSpent);
	}

	function addToBonusWhitelist(address _address) public onlyOwner {
		bonusWhitelist[_address] = true;
	}

	function addBatchToBonusWhitelist(
		address[] memory _addresses
	) public onlyOwner {
		for (uint256 i; i < _addresses.length; ++i) {
			bonusWhitelist[_addresses[i]] = true;
		}
	}

	function withdrawEth() public onlyOwner {
		require(saleStatus == Status.CLOSED, "Sale must be complete");
		uint256 _ethRaised = address(this).balance;
		platformFeeDestination.transfer(_ethRaised / 50); // 2% of the total ETH raised
		jennerTreasury.transfer(address(this).balance);
	}

}
