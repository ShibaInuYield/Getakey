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
        uint256 id;
        uint256 startTimestamp;
        uint256 endTimestamp;
        address owner;
        bool rented;
        bool isPaid;
        mapping(uint256 => Renter) renters;
    }

    struct Renter {
        address renter;
        string firstName;
        string lastName;
        bool hasAccess;
    }

    uint256 public collectionNum;   

    mapping(uint256 => RentalPeriod) private rentalPeriods;
    mapping(uint256 => mapping(uint256 => Renter)) public renters;
    mapping(uint256 => Rental) public Rentals;

    RentalPeriod[] public RentalPeriods;    

        constructor() ERC721("","") {
    }

    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    function createCollection(string memory name, string memory symbol, string memory location, address owner) external onlyOwner {

         _name = name ;
        _symbol = symbol ;

        Rental storage newCollection = Rentals[collectionNum];
        newCollection.owner = owner;
        newCollection.name = name;
        newCollection.symbol = symbol;
        newCollection.location = location;
        collectionNum++;
    }
}   
