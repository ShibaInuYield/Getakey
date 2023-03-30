// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "../node_modules/@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";
import "../node_modules/@openzeppelin/contracts/utils/Counters.sol";
import "hardhat/console.sol";

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
        bytes32 renter;
        bool isRented;
        bool isPaid;
    }

    mapping(uint256 => RentalPeriod) private rentalPeriods;
    mapping(uint256 => Rental) public Rentals;

    uint256 public tokenId;

    constructor() ERC721("", "") {

    _safeMint(0x0000000000000000000000000000000000000001,0);
    rentalPeriods[0] = RentalPeriod(0,0,1,keccak256(abi.encodePacked(0x0000000000000000000000000000000000000001)),false,false);

    }

    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    event RentalPeriodCreated(uint256 startTimestamp, uint256 endTimestamp, address renter, bool isPaid, bool isRented);

    function transferOwnership(address newOwner) public override onlyOwner {
            require(newOwner != address(0), "Ownable: new owner is the zero address");
            _transferOwnership(newOwner);
    }

    function createRental(string memory name, string memory symbol, string memory location) external onlyOwner {
        Rental storage newCollection = Rentals[0];
        newCollection.owner = msg.sender;
        newCollection.name = name;
        newCollection.symbol = symbol;
        newCollection.location = location;
    }

    function createRentalPeriod(uint256 _startTimestamp, uint256 _endTimestamp, address _renter, bool _isPaid) external onlyOwner returns (uint256) {
        require(_startTimestamp < _endTimestamp, "Invalid rental period");
        require(_renter != address(0), "Zero address not allowed");
        
        bytes32 walletHash = keccak256(abi.encodePacked(_renter));
        _tokenIds.increment();
        tokenId = _tokenIds.current();
        _safeMint(_msgSender(), tokenId);
        bool isRented = true;
        rentalPeriods[tokenId] = RentalPeriod(tokenId, _startTimestamp , _endTimestamp , walletHash, _isPaid, isRented );
    
        emit RentalPeriodCreated(_startTimestamp,_endTimestamp, _renter, _isPaid, isRented);
        return tokenId;
    }

    function getRentalPeriodById(uint256 rentalPeriodId) external view returns (RentalPeriod memory) {
        require(_exists(rentalPeriodId), "Rental period does not exist");
        return rentalPeriods[rentalPeriodId];
    }

    function getRentalPeriodsByAddress(address _renter) external view returns (RentalPeriod[] memory) {
        uint256 totalRentals = _tokenIds.current() +1;
        RentalPeriod[] memory rentalPeriodsByAddress = new RentalPeriod[](totalRentals);
        bytes32 walletHash = keccak256(abi.encodePacked(_renter));
        uint256 count = 0;
        
        for (uint256 i = 0; i < totalRentals; i++) {
            if (rentalPeriods[(i)].renter == walletHash) {
                rentalPeriodsByAddress[count] = rentalPeriods[i];
                count++;
            }
        }
        
        // resize the rentalPeriodsByAddress array to remove any empty elements
        if (count < totalRentals) {
            RentalPeriod[] memory resizedRentalPeriodsByAddress = new RentalPeriod[](count);
            for (uint256 j = 0; j < count; j++) {
                resizedRentalPeriodsByAddress[j] = rentalPeriodsByAddress[j];
            }
            rentalPeriodsByAddress = resizedRentalPeriodsByAddress;
        }
        return rentalPeriodsByAddress;
    }

    function burn(uint256 tokenId) external {
        require(_isApprovedOrOwner(_msgSender(), tokenId), "Caller is not owner nor approved");
        require(_exists(tokenId), "Token does not exist");
        _burn(tokenId);
        removeRental(tokenId);
    }

    function removeRental(uint256 rentalId) private {
        require(rentalPeriods[rentalId].id == rentalId, "Rental does not exist");
    delete rentalPeriods[rentalId];
    }

    function changeRenter(uint256 rentalPeriodId, address renter) external {
        require(rentalPeriods[rentalPeriodId].id == rentalPeriodId, "Rental does not exist");
        RentalPeriod memory rentalPeriod = rentalPeriods[rentalPeriodId];
        bytes32 newRenter = keccak256(abi.encodePacked(renter));
        require(rentalPeriods[rentalPeriodId].renter != newRenter, "Rental period already belongs to this renter");
        rentalPeriod.renter = newRenter;

        rentalPeriods[rentalPeriodId] = rentalPeriod;
    }

    function updateRentalPeriod(uint256 rentalPeriodId, uint256 startTimestamp, uint256 endTimestamp, bool isRented, bool isPaid) external {
        require(rentalPeriods[rentalPeriodId].id == rentalPeriodId, "Rental does not exist");
        RentalPeriod memory rentalPeriod = rentalPeriods[rentalPeriodId];

        rentalPeriod.startTimestamp = startTimestamp;
        rentalPeriod.endTimestamp = endTimestamp;
        rentalPeriod.isRented = isRented;
        rentalPeriod.isPaid = isPaid;

        rentalPeriods[rentalPeriodId] = rentalPeriod;
    }

    function ownerOfToken(uint256 _tokenId) external view returns(address){
        return ownerOf(_tokenId);
    }

    function transferNFT(address to, uint256 tokenId) external {
        require(_isApprovedOrOwner(_msgSender(), tokenId), "Transfer caller is not owner nor approved");
    transferFrom(_msgSender(), to, tokenId);
    }

    function ownsNFT(address wallet, uint256 tokenId) external view returns (bool) {
        return _isApprovedOrOwner(wallet, tokenId);
    }

    receive() external payable{}

    fallback() external payable {}
}