// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;
 
import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";
import "./RentalCollection.sol";
import "hardhat/console.sol";
 
contract RentalCollectionFactory is Ownable {
 
  struct Rental {
    string name;
    string symbol;
    string location;
  }

   event RentalCollectionCreated(string _rentalName,string _rentalSymbol, string _description, address _collectionAddress, uint _timestamp, string _image);

    mapping(address => address[]) public lessorToContractAddress;

    uint256 public collectionFactoryNum;

    function createRentalCollection(string memory _rentalName, string memory _rentalSymbol, string memory _description, string memory _image) external returns (address collectionAddress) {
      require(bytes(_rentalName).length > 0 && bytes(_rentalSymbol).length > 0 && bytes(_description).length > 0,"All informations are mandatory");
      
      RentalCollection rentalCollection = new RentalCollection();
      collectionFactoryNum++;
      rentalCollection.createRental(_rentalName, _rentalSymbol, _description, address(rentalCollection), collectionFactoryNum, _image, msg.sender);
      rentalCollection.transferOwnership(msg.sender);
      lessorToContractAddress[msg.sender].push(address(rentalCollection));

      emit RentalCollectionCreated(_rentalName,_rentalSymbol, _description, address(rentalCollection), block.timestamp, _image);
        return address(rentalCollection);
    }

    function getRentalCollections(address contractOwner) external view returns (address[] memory) {
        return lessorToContractAddress[contractOwner];
    }

    receive() external payable{}
}