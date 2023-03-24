// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;
 
// importing the ERC-721 contract to deploy for a rental
import "./RentalCollection.sol";
 
/** 
  * @notice Give the ability to deploy a contract to manage ERC-721 tokens for an rental. S/O @Snow
  * @dev    If the contract is already deployed for an _rentalAddress, it will revert.
  */
contract RentalCollectionFactory{
 
    event RentalCollectionCreated(string _rentalAddress, address _collectionAddress, uint _timestamp);
 
    /**
      * @notice Deploy the ERC-721 Collection contract of the artist caller to be able to create rentals later
      *
      * @return collectionAddress the address of the created collection contract
      */
    function createRentalCollection(string memory _rentalAddress, string memory _rentalSymbol) external returns (address collectionAddress) {
        // Import the bytecode of the contract to deploy
        bytes memory collectionBytecode = type(RentalCollection).creationCode;
				// Make a random salt based on the artist name
        bytes32 salt = keccak256(abi.encodePacked(_rentalAddress));
 
        assembly {
            collectionAddress := create2(0, add(collectionBytecode, 0x20), mload(collectionBytecode), salt)
            if iszero(extcodesize(collectionAddress)) {
                // revert if something gone wrong (collectionAddress doesn't contain an address)
                revert(0, 0)
            }
        }
        // Initialize the collection contract with the artist settings
        RentalCollection(collectionAddress).init(_rentalAddress, _rentalSymbol);
 
        emit RentalCollectionCreated(_rentalAddress, collectionAddress, block.timestamp);
    }
}