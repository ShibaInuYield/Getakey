// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;
 
import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";
import "./RentalCollection.sol";
 
contract RentalCollectionFactory is Ownable {
 
   event RentalCollectionCreated(string _rentalName,string _rentalSymbol, address _collectionAddress, uint _timestamp);

    address[] private rentalCollections;

    uint256 public collectionFactoryNum;

    function createRentalCollection(string memory _rentalName, string memory _rentalSymbol, string memory _location) external returns (address collectionAddress) {
      require(bytes(_rentalName).length > 0 && bytes(_rentalSymbol).length > 0 && bytes(_location).length > 0,"Rental name, symbol and location are mendatory");
      
      RentalCollection rentalCollection = new RentalCollection();
      rentalCollection.createRental(_rentalName,_rentalSymbol,_location);
      rentalCollection.transferOwnership(msg.sender);
      rentalCollections.push(address(rentalCollection));
      collectionFactoryNum++;

      emit RentalCollectionCreated(_rentalName,_rentalSymbol, collectionAddress, block.timestamp);
        return address(rentalCollection);
    }

    function getRentalCollections() onlyOwner external view returns (address[] memory) {
        return rentalCollections;
    }

    receive() external payable{}
}