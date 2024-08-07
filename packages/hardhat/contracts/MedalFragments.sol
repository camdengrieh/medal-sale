// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/interfaces/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";

/// @custom:security-contact cam@3studio.consulting
contract Olympic1976GoldFragments is ERC20, ERC20Burnable, ERC20Permit, ERC20Votes {

    IERC721 public immutable rights;

    constructor(address _medalRights)
        ERC20("Olympic 1976 Gold Fragments", "MEDAL")
        ERC20Permit("Olympic 1976 Gold Fragments")
    {
        _mint(msg.sender, 100000000 * 10 ** decimals());
        rights = IERC721(_medalRights);
    }

    function clock() public view override returns (uint48) {
        return uint48(block.timestamp);
    }

    //burn all the tokens in supply and redeem the medal
    function redeemRights() public {
        _burn(msg.sender, totalSupply());
        rights.transferFrom(address(this), msg.sender, 1);
    }

    // solhint-disable-next-line func-name-mixedcase
    function CLOCK_MODE() public pure override returns (string memory) {
        return "mode=timestamp";
    }

    // The following functions are overrides required by Solidity.

    function _update(address from, address to, uint256 value)
        internal
        override(ERC20, ERC20Votes)
    {
        super._update(from, to, value);
    }

    function nonces(address owner)
        public
        view
        override(ERC20Permit, Nonces)
        returns (uint256)
    {
        return super.nonces(owner);
    }
}
