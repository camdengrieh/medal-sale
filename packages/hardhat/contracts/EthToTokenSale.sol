//SPDX-License-Identifier: MIT
//Compatible with OpenZeppelin Contracts ^5.0.0

pragma solidity 0.8.26;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./dex/interfaces/IUniswapV2Router.sol";
import "./dex/interfaces/IUniswapV2Factory.sol";
//No reentrancy guard
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MedalSale is ReentrancyGuard, Ownable {
	address payable public constant platformFeeDestination =
		payable(0xf87Eaea53f15189385a5fb33b6Ad0c61C6047d47);
	address payable public constant medalTreasury =
		payable(0xC3Cc6d2db567aF6669beC02c8084E71B1714643a);

	IERC20 public immutable medal;

	mapping(address => uint256) public addressEthSpent;
	mapping(address => uint256) public addressBonusEarned;

	address[] public buyers;

	uint256 public constant tokensAvailable = 20_000_000 * 10 ** 18; // 20% of the tokenSupply to be sold
	uint256 public constant softCap = 400 ether; // 400 ETH

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
		DISTRIBUTION,
		REFUNDING
	}

	Status public saleStatus;

	uint256 public saleEndTime = 1724328000; // Thursday, 22 August 2024 12:00:00 GMT

	event Bought(address buyer, uint256 amount);

	event Withdrawn(address buyer, uint256 amount);
	event SaleComplete(uint256 tokensPerEth);

	constructor(address _medal) Ownable(msg.sender) {
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

	function changeEndTime(uint256 _endTime) public onlyOwner {
		require(saleStatus != Status.CLOSED, "Sale cannot be closed");
		saleEndTime = _endTime;
	}
	function openSale() public onlyOwner {
		require(saleStatus == Status.NOT_STARTED, "Sale has already started");
		saleStatus = Status.STARTED;
	}

	function closeSale() public onlyOwner {
		require(saleStatus == Status.STARTED, "Sale must be active");
		require(block.timestamp >= saleEndTime, "Sale time needs to elapse");
		saleStatus = Status.CLOSED;
		uint256 _ethRaised = address(this).balance + bonusEthSpent;
		ethRaised = address(this).balance;
		tokensPerEth = tokensAvailable / _ethRaised; //Safe to assume we won't have more than 20M ETH raised

		emit SaleComplete(tokensPerEth);
	}

	function _buyTokens(address _buyer) public payable {
		//Checks
		require(saleStatus == Status.STARTED, "Sale is not active");
		require(block.timestamp < saleEndTime, "Sale time has elapsed");
		require(msg.value > 0, "No ETH sent");

		//Check if user is in the bonus whitelist

		//User effects
		uint256 _totalContribution = msg.value;
		if (bonusWhitelist[_buyer]) {
			uint256 _bonus = msg.value / 4;
			addressEthSpent[_buyer] += msg.value;
			addressBonusEarned[_buyer] += _bonus;
			bonusEthSpent += _bonus;
			_totalContribution += _bonus;
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

		emit Bought(_buyer, _totalContribution);
	}

	function claimFractions() public {
		//When sale is closed allow users to claim their fraction of the medal
		require(saleStatus == Status.CLOSED, "Sale is not complete");
		uint256 _allocation = (addressEthSpent[msg.sender] +
			addressBonusEarned[msg.sender]) * tokensPerEth;
		addressEthSpent[msg.sender] = 0;
		addressBonusEarned[msg.sender] = 0;
		medal.transfer(msg.sender, _allocation);
		emit Withdrawn(msg.sender, _allocation);
	}

	function allowRefunds() public onlyOwner {
		require(saleStatus == Status.STARTED, "Sale must be ongoing");
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
		medalTreasury.transfer(address(this).balance);
	}
}
