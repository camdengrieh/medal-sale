//SPDX-License-Identifier: MIT

pragma solidity 0.8.26;
interface IMedalSale {
    function addressEthSpent(address) external view returns (uint256);
    function addressTokenBalances(address) external view returns (uint256);

    function ethRaised() external view returns (uint256);
    function requiredEth() external view returns (uint256);
    function individualEthCap() external view returns (uint256);
    
    function tokenAddress() external view returns (address);
    function uniswapV2Pair() external view returns (address);

    function protocolFeeDestination() external view returns (address);

    function tokensSold() external view returns (uint256);
    function tokensAvailable() external view returns (uint256);
    function tokensPerEth() external view returns (uint256);

    function buyers(uint256) external view returns (address);
    function buyersLength() external view returns (uint256);
}
