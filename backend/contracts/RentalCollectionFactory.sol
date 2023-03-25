// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;
 
import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";
import "./RentalCollection.sol";
 
contract RentalCollectionFactory{
 
   event RentalCollectionCreated(string _rentalName,string _rentalSymbol, address _collectionAddress, uint _timestamp,address owner);

     address[] public rentalCollections;


      constructor(){
        RentalCollection rentalCollection = new RentalCollection();
        rentalCollection.createCollection("GENESIS", "GEN_0","GENESIS",address(0));
        rentalCollections.push(address(rentalCollection));
      }

     function createRentalCollection(string memory _rentalName, string memory _rentalSymbol, string memory _location) external returns (address collectionAddress) {
      RentalCollection rentalCollection = new RentalCollection();
      rentalCollection.createCollection(_rentalName,_rentalSymbol,_location, msg.sender);
      rentalCollections.push(address(rentalCollection));

    emit RentalCollectionCreated(_rentalName,_rentalSymbol, collectionAddress, block.timestamp, msg.sender);
        return address(rentalCollection);
    }

    function getRentalCollections() external view returns (address[] memory) {
        return rentalCollections;
    }
    
}