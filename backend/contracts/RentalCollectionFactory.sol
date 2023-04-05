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

   event RentalCollectionCreated(string _rentalName,string _rentalSymbol, address _collectionAddress, uint _timestamp);

    mapping(address => address[]) public lessorToContractAddress;
    mapping(string => Rental) rentalNames;

    uint256 public collectionFactoryNum;

    modifier rentalNameDoesNotExist(string memory _rentalName) {
    require(bytes32(abi.encodePacked(rentalNames[_rentalName].name)) == "", "Rental name already exists");
    _;
    }

    function createRentalCollection(string memory _rentalName, string memory _rentalSymbol, string memory _location) external rentalNameDoesNotExist(_rentalName) returns (address collectionAddress) {
      require(bytes(_rentalName).length > 0 && bytes(_rentalSymbol).length > 0 && bytes(_location).length > 0,"Rental name, symbol and location are mendatory");
      
      RentalCollection rentalCollection = new RentalCollection();
      collectionFactoryNum++;
      rentalCollection.createRental(_rentalName, _rentalSymbol, _location, collectionAddress, collectionFactoryNum,msg.sender);
      rentalCollection.transferOwnership(msg.sender);
      lessorToContractAddress[msg.sender].push(address(rentalCollection));
      rentalNames[_rentalName] = Rental({ name: _rentalName, symbol: _rentalSymbol, location: _location });

      emit RentalCollectionCreated(_rentalName,_rentalSymbol, address(rentalCollection), block.timestamp);
        return address(rentalCollection);
    }

    function getRentalCollections(address contractOwner) external view returns (address[] memory) {
        return lessorToContractAddress[contractOwner];
    }

    receive() external payable{}
}