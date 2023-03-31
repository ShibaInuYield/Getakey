// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "../node_modules/@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";
import "../node_modules/@openzeppelin/contracts/utils/Counters.sol";
import "hardhat/console.sol";

contract RentalCollection is ERC721, Ownable {

    struct Rental {
        address owner;
        address rentalCollectionAddress;
        string name;
        string symbol;
        string location;
        Counters.Counter tokenIds;
        uint256 tokenId;
    }

    struct RentalPeriod {
        uint256 nftId;
        uint256 startTimestamp;
        uint256 endTimestamp;
        bytes32 renter;
        bool isRented;
        bool isPaid;      
    }
    
    // Pour un identifiant on a une location
    mapping(uint256 => Rental) public Rentals;

    // location => loueur => période de location
    // Pour un lieu on a un loueur et une période de réservation
    mapping(uint256 => mapping(address => RentalPeriod)) public rentalPeriods;

    // location => periode => période de location
    mapping(uint256 => mapping(uint => RentalPeriod)) public rentalPeriodByIds;
    
    constructor() ERC721("", "") {

    }

    using Counters for Counters.Counter;

    event RentalPeriodCreated(uint256 startTimestamp, uint256 endTimestamp, address renter, bool isPaid, bool isRented); 

    function createRental(string memory _name, string memory _symbol, string memory _location, address _rentalCollectionAddress, uint _id) external onlyOwner {
        Rental storage newCollection = Rentals[_id];
        newCollection.owner = msg.sender;
        newCollection.rentalCollectionAddress = _rentalCollectionAddress;
        newCollection.name = _name;
        newCollection.symbol = _symbol;
        newCollection.location = _location;
    }

    function createRentalPeriod(uint256 _rentalID, uint256 _startTimestamp, uint256 _endTimestamp, address _renter, bool _isPaid) external onlyOwner returns (uint256) {
        require(bytes(abi.encode(_rentalID)).length > 0 && bytes(abi.encode(_startTimestamp)).length > 0 && bytes(abi.encodePacked(_endTimestamp)).length > 0 &&
            bytes(abi.encodePacked(_renter)).length > 0 && bytes(abi.encodePacked(_isPaid)).length > 0,
            "All elements are mandatory");

        require(_startTimestamp < _endTimestamp, "Invalid rental period");
        require(_renter != address(0), "Zero address not allowed");

        bytes32 walletHash = keccak256(abi.encodePacked(_renter));
        Rental storage rental = Rentals[_rentalID];
        rental.tokenIds.increment();
        uint tokenId = rental.tokenIds.current();
        _safeMint(_msgSender(), tokenId);
        bool isRented = true;

        for (uint i = 0; i <= rental.tokenIds.current(); i++) {
            RentalPeriod memory existingRentalPeriod = rentalPeriodByIds[_rentalID][i];
                if ((_startTimestamp >= existingRentalPeriod.startTimestamp && _startTimestamp <= existingRentalPeriod.endTimestamp)
                || (_endTimestamp >= existingRentalPeriod.startTimestamp && _endTimestamp <= existingRentalPeriod.endTimestamp))
                {
                    revert("Rental period already exists for this rental");
                }
        }

        rentalPeriods[_rentalID][_renter] = RentalPeriod(tokenId, _startTimestamp , _endTimestamp , walletHash, isRented, _isPaid);
        rentalPeriodByIds[_rentalID][tokenId] = RentalPeriod(tokenId, _startTimestamp , _endTimestamp , walletHash, isRented, _isPaid);
        emit RentalPeriodCreated(_startTimestamp,_endTimestamp, _renter, _isPaid, isRented);
        return tokenId;
    }

    function getRental(uint256 _rentalID) external view returns (address owner, address rentalCollectionAddress, string memory name, string memory symbol, string memory location, uint256 tokenId) {
        Rental memory rental = Rentals[_rentalID];
        owner = rental.owner;
        rentalCollectionAddress = rental.rentalCollectionAddress;
        name = rental.name;
        symbol = rental.symbol;
        location = rental.location;
        tokenId = rental.tokenId;
    }

    function getRentalPeriod(uint256 _rentalID, address _renter) external view returns (uint256 nftId, uint256 startTimestamp, uint256 endTimestamp, bytes32 renter, bool isRented, bool isPaid) {
        RentalPeriod memory rentalPeriod = rentalPeriods[_rentalID][_renter];
        require(rentalPeriod.startTimestamp > 0, "Rental period does not exist");

        nftId = rentalPeriod.nftId;
        startTimestamp = rentalPeriod.startTimestamp;
        endTimestamp = rentalPeriod.endTimestamp;
        renter = rentalPeriod.renter;
        isRented = rentalPeriod.isRented;
        isPaid = rentalPeriod.isPaid;
    }

    // function getRentalPeriodsByAddress(address _renter) external view returns (RentalPeriod[] memory) {
    //     uint256 totalRentals = _tokenIds.current() +1;
    //     RentalPeriod[] memory rentalPeriodsByAddress = new RentalPeriod[](totalRentals);
    //     bytes32 walletHash = keccak256(abi.encodePacked(_renter));
    //     uint256 count = 0;
        
    //     for (uint256 i = 0; i < totalRentals; i++) {
    //         if (rentalPeriods[(i)].renter == walletHash) {
    //             rentalPeriodsByAddress[count] = rentalPeriods[i];
    //             count++;
    //         }
    //     }
        
    //     // resize the rentalPeriodsByAddress array to remove any empty elements
    //     if (count < totalRentals) {
    //         RentalPeriod[] memory resizedRentalPeriodsByAddress = new RentalPeriod[](count);
    //         for (uint256 j = 0; j < count; j++) {
    //             resizedRentalPeriodsByAddress[j] = rentalPeriodsByAddress[j];
    //         }
    //         rentalPeriodsByAddress = resizedRentalPeriodsByAddress;
    //     }
    //     return rentalPeriodsByAddress;
    // }

    // function burn(uint256 tokenId) external {
    //     require(_isApprovedOrOwner(_msgSender(), tokenId), "Caller is not owner nor approved");
    //     require(_exists(tokenId), "Token does not exist");
    //     _burn(tokenId);
    //     removeRental(tokenId);
    // }

    // function removeRental(uint256 rentalId) private {
    //     require(rentalPeriods[rentalId].id == rentalId, "Rental does not exist");
    // delete rentalPeriods[rentalId];
    // }

    // function changeRenter(uint256 rentalPeriodId, address renter) external {
    //     require(rentalPeriods[rentalPeriodId].id == rentalPeriodId, "Rental does not exist");
    //     RentalPeriod memory rentalPeriod = rentalPeriods[rentalPeriodId];
    //     bytes32 newRenter = keccak256(abi.encodePacked(renter));
    //     require(rentalPeriods[rentalPeriodId].renter != newRenter, "Rental period already belongs to this renter");
    //     rentalPeriod.renter = newRenter;

    //     rentalPeriods[rentalPeriodId] = rentalPeriod;
    // }

    // function updateRentalPeriod(uint256 rentalPeriodId, uint256 startTimestamp, uint256 endTimestamp, bool isRented, bool isPaid) external {
    //     require(rentalPeriods[rentalPeriodId].id == rentalPeriodId, "Rental does not exist");
    //     RentalPeriod memory rentalPeriod = rentalPeriods[rentalPeriodId];

    //     rentalPeriod.startTimestamp = startTimestamp;
    //     rentalPeriod.endTimestamp = endTimestamp;
    //     rentalPeriod.isRented = isRented;
    //     rentalPeriod.isPaid = isPaid;

    //     rentalPeriods[rentalPeriodId] = rentalPeriod;
    // }

    // function ownerOfToken(uint256 _tokenId) external view returns(address){
    //     return ownerOf(_tokenId);
    // }

    // function transferNFT(address to, uint256 tokenId) external {
    //     require(_isApprovedOrOwner(_msgSender(), tokenId), "Transfer caller is not owner nor approved");
    // transferFrom(_msgSender(), to, tokenId);
    // }

    // function ownsNFT(address wallet, uint256 tokenId) external view returns (bool) {
    //     return _isApprovedOrOwner(wallet, tokenId);
    // }

    // function transferOwnership(address newOwner) public override onlyOwner {
    //         require(newOwner != address(0), "Ownable: new owner is the zero address");
    //         _transferOwnership(newOwner);
    // }

    receive() external payable{}

    fallback() external payable {}
}