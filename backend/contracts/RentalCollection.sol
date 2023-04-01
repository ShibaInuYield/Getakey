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
    
    mapping(uint256 => Rental) public Rentals;

    mapping(uint256 => RentalPeriod[]) public rentalToPeriods;

    mapping(address => uint256[]) public ownerToRentals;

    constructor() ERC721("", "") {
    }

    using Counters for Counters.Counter;

    event RentalPeriodCreated(uint256 startTimestamp, uint256 endTimestamp, address renter, bool isPaid, bool isRented); 

    function createRental(string memory _name, string memory _symbol, string memory _location, address _rentalCollectionAddress, uint _id, address owner) external onlyOwner {
        Rental storage newCollection = Rentals[_id];
        newCollection.owner = owner;
        newCollection.rentalCollectionAddress = _rentalCollectionAddress;
        newCollection.name = _name;
        newCollection.symbol = _symbol;
        newCollection.location = _location;
        newCollection.tokenId = 1;
        ownerToRentals[owner].push(_id);
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

        rentalToPeriods[_rentalID].push(RentalPeriod(tokenId, _startTimestamp , _endTimestamp , walletHash, isRented, _isPaid));

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

    function getRentalPeriod(uint256 _rentalID, uint _nftId) external view returns (uint256 nftId, uint256 startTimestamp, uint256 endTimestamp, bytes32 renter, bool isRented, bool isPaid) {
        require(_rentalID > 0, "Rental does not exist");
        
        RentalPeriod memory rentalPeriod = rentalToPeriods[_rentalID][_nftId -1];
        nftId = rentalPeriod.nftId;
        startTimestamp = rentalPeriod.startTimestamp;
        endTimestamp = rentalPeriod.endTimestamp;
        renter = rentalPeriod.renter;
        isRented = rentalPeriod.isRented;
        isPaid = rentalPeriod.isPaid;
    }

    function getOwnerRentals(address _owner) public view returns (uint256[] memory) {
        return ownerToRentals[_owner];
    }

    function getAllTokenIds(address _owner) external view returns (uint256[] memory) {
        uint256 totalTokens = 0;

        uint256[] memory rentals = ownerToRentals[_owner];

        for (uint256 i = 0; i < rentals.length; i++) {
            totalTokens += rentalToPeriods[rentals[i]].length;
        }

        uint256[] memory tokenIds = new uint256[](totalTokens);
        uint256 index = 0;

        for (uint256 i; i < rentals.length; i++) {
            uint256 rentalId = rentals[i];
            RentalPeriod[] storage periods = rentalToPeriods[rentalId];
            for (uint256 j; j < periods.length; j++) {
                tokenIds[index] = periods[j].nftId;
                index++;
            }
        }
        return tokenIds;
    }

    function burn(uint256 rentalId,uint256 tokenId) external {
        require(_isApprovedOrOwner(_msgSender(), tokenId), "Caller is not owner nor approved");
        require(_exists(tokenId), "Token does not exist");
        _burn(tokenId);
        delete rentalToPeriods[rentalId][tokenId -1];
    }

    function changeRenter(uint256 _rentalID, uint256 _nftId, address _newRenter) external onlyOwner {
        require(_newRenter != address(0), "Invalid address");

        RentalPeriod storage rentalPeriod = rentalToPeriods[_rentalID][_nftId -1];
        require(rentalPeriod.isRented, "Rental period is not rented");

        bytes32 renter = keccak256(abi.encodePacked(_newRenter));
        require(rentalToPeriods[_rentalID][_nftId -1].renter != renter, "Rental period already belongs to this renter");
        rentalPeriod.renter = renter;
    }

    // function transferNFT(address to, uint256 tokenId) external {
    //     require(_isApprovedOrOwner(_msgSender(), tokenId), "Transfer caller is not owner nor approved");
    // transferFrom(_msgSender(), to, tokenId);
    // }

    // function controlNFT() external view {
    //  ownerOf(_tokenId)
    //  _isApprovedOrOwner(wallet, tokenId);
    // }

    receive() external payable{}

    fallback() external payable {}
}