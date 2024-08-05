// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Olympic1976GoldRights is ERC721, Ownable {

	//Where the legal contract metadata is stored on IPFS
	string internal _baseUriString; //Set after the legal contract metadata is created and pointing to this contract address

	//Points to and verifies the ERC20 token that represents the fractionalized ownership of the 1976 Olympic Gold Medal
	address fractionalizedToken; //Set after the legal contract metadata is created and pointing to this contract address

	constructor() ERC721("Olympic 1976 Gold Rights", "GOLD") Ownable(msg.sender) {
		_mint(msg.sender, 1); //There will only be 1 token.
	}

	function setBaseUri(string memory _newBaseUri) external onlyOwner {
		_baseUriString = _newBaseUri;
	}

	function _baseURI() internal view override returns (string memory) {
		return _baseUriString;
	}
	
	function fractionalizedTokenAddress(address _fractionalizedToken) external onlyOwner {
		fractionalizedToken = _fractionalizedToken;
	}
	
}
