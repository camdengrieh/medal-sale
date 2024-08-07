//SPDX-License-Identifier: MIT

pragma solidity 0.8.26;

import "../interfaces/IMedalSale.sol";

contract MedalSaleReader {
    
    string public constant name = "Medal Sale Reader";
    constructor() {
    }

    function getBuyers (address _medalSale) public view returns (address[] memory) {
        IMedalSale medalSale = IMedalSale(_medalSale);

        uint256 _buyersLength = medalSale.buyersLength();
        address[] memory _buyers = new address[](_buyersLength);

        for (uint256 i; i < _buyersLength; i++) {
            _buyers[i] = medalSale.buyers(i);
        }

        return _buyers;
    }

    function getAllBuyersBalances(address _medalSale) external view returns (uint256[] memory) {
        IMedalSale medalSale = IMedalSale(_medalSale);

        uint256 _buyersLength = medalSale.buyersLength();
        address[] memory _buyers = getBuyers(_medalSale);
        uint256[] memory _buyersBalances = new uint256[](_buyersLength);

        for (uint256 i; i < _buyers.length; i++) {
            _buyersBalances[i] = medalSale.addressTokenBalances(_buyers[i]);
        }
        
        return _buyersBalances;
    }
    
    function getAllBuyersContributions(address _medalSale) external view returns (uint256[] memory) {
        IMedalSale medalSale = IMedalSale(_medalSale);

        uint256 _buyersLength = medalSale.buyersLength();
        address[] memory _buyers = getBuyers(_medalSale);
        uint256[] memory _buyersContributions = new uint256[](_buyersLength);

        for (uint256 i; i < _buyers.length; i++) {
            _buyersContributions[i] = medalSale.addressEthSpent(_buyers[i]);
        }
        
        return _buyersContributions;
    }
}