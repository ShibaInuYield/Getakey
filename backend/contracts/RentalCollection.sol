// SPDX-License-Identifier: MIT

pragma solidity ^0.8.18;

import "../node_modules/@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";
import "../node_modules/@openzeppelin/contracts/utils/Counters.sol";

contract RentalCollection is ERC721, Ownable {

struct Rental {
        uint256 start;
        address tenant;
        bool active;
    }

    Rental[] public rentals;

    constructor() ERC721("","") {}

    function init(string calldata name_, string calldata symbol_) public {
        _name = name_ ;
        _symbol = symbol_ ;
}
}