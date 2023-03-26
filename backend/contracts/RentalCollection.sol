// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "../node_modules/@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";
import "../node_modules/@openzeppelin/contracts/utils/Counters.sol";

contract RentalCollection is ERC721, Ownable {

    struct Rental {
        address owner;
        string name;
        string symbol;
        string location;
    }

    struct RentalPeriod {
        uint256 startTimestamp;
        uint256 endTimestamp;
        address owner;
        bool rented;
        bool isPaid;
    }

    struct Renter {
        address renter;
        string firstName;
        string lastName;
    }

    mapping(uint256 => RentalPeriod) public rentalPeriods;
    mapping(address => uint256[]) private rentalPeriodsByAddress;
    mapping(uint256 => Rental) public Rentals;

    constructor() ERC721("", "") {

    _mint(0x0000000000000000000000000000000000000001,0);
    rentalPeriods[0] = RentalPeriod(0,1,0x0000000000000000000000000000000000000001,false,false);
    rentalPeriodsByAddress[0x0000000000000000000000000000000000000001].push(0);

    }

    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    function createRental(string memory name, string memory symbol, string memory location, address owner) external onlyOwner {
        Rental storage newCollection = Rentals[0];
        newCollection.owner = owner;
        newCollection.name = name;
        newCollection.symbol = symbol;
        newCollection.location = location;
    }

    function createRentalPeriod(uint256 startTimestamp, uint256 endTimestamp, address owner, bool isPaid, bool rented) external returns (uint256) {
        require(startTimestamp < endTimestamp, "Invalid rental period");

        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();
        _mint(owner, newTokenId);
        rentalPeriods[newTokenId] = RentalPeriod(startTimestamp , endTimestamp , owner, rented , isPaid);
        rentalPeriodsByAddress[owner].push(newTokenId);
    
        return newTokenId;
    }

    function getRentalPeriodById(uint256 rentalPeriodId) external view returns (RentalPeriod memory) {
        require(_exists(rentalPeriodId), "Rental period does not exist");
        return rentalPeriods[rentalPeriodId];
    }

    function getRentalPeriodsByRenter(address renter) external view returns (RentalPeriod[] memory) {
        uint256[] memory rentalPeriodIds = rentalPeriodsByAddress[renter];
        uint256 rentalPeriodCount = rentalPeriodIds.length;
        RentalPeriod[] memory rentalPeriodsByRenter = new RentalPeriod[](rentalPeriodCount);
        for (uint256 i = 0; i < rentalPeriodCount; i++) {
            uint256 rentalPeriodId = rentalPeriodIds[i];
            rentalPeriodsByRenter[i] = rentalPeriods[rentalPeriodId];
        }
        return rentalPeriodsByRenter;
    }   
}