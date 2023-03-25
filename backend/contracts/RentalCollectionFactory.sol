// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "../node_modules/@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";
import "./RentalCollection.sol";

contract RentalCollectionFactory is Ownable {

    event RentalCollectionCreated(string _rentalName,string _rentalSymbol, address _collectionAddress, uint _timestamp);

    address[] public rentalCollections;

    constructor() {
        RentalCollection rentalCollection = new RentalCollection();
        rentalCollection.init("GENESIS", "GEN_0");
        rentalCollections.push(address(rentalCollection));
    }

    function createRentalCollection(string calldata _rentalName, string calldata _rentalSymbol) external returns (address collectionAddress) {
        RentalCollection rentalCollection = new RentalCollection();
        rentalCollection.init(_rentalName, _rentalSymbol);
        rentalCollections.push(address(rentalCollection));

        emit RentalCollectionCreated(_rentalName,_rentalSymbol, collectionAddress, block.timestamp);

        return address(rentalCollection);
    }

    function getRentalCollections() external view returns (address[] memory) {
        return rentalCollections;
    }
}