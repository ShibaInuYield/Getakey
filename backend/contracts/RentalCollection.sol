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
    Counters.Counter tokenIds;

    event RentalPeriodCreated(uint256 startTimestamp, uint256 endTimestamp, address renter, bool isPaid, bool isRented);
    event NftBurned(address owner, uint256 rentalId,uint256 tokenId);
    event RenterChanged(uint256 rentalID,uint256 nftId, address newRenter);
    event NftTransfered(address to,uint256 nftId,address msgSender);
    event NftControlled(address renter,uint256 tokenId, address msgSender); 

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

        tokenIds.increment();
        uint tokenId = tokenIds.current();
        
        _safeMint(_msgSender(), tokenId);
        bool isRented = true;

        rentalToPeriods[_rentalID].push(RentalPeriod(tokenId, _startTimestamp , _endTimestamp , walletHash, isRented, _isPaid));

        emit RentalPeriodCreated(_startTimestamp,_endTimestamp, _renter, _isPaid, isRented);
        return tokenId;
    }

    function getRental(uint256 _rentalID) external view returns (address owner, address rentalCollectionAddress, string memory name, string memory symbol, string memory location, uint256 tokenId) {
        require( bytes32(abi.encodePacked(Rentals[_rentalID].owner)) != "", "Rental id does not exist");
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
        require(_owner != address(0),"Address zero is forbidden");
        require(ownerToRentals[_owner].length > 0 && ownerToRentals[_owner][0] != 0,"No rental");
        return ownerToRentals[_owner];
    }

    function getAllTokenIds(address _owner) external view returns (uint256[] memory) {
        require(_owner != address(0), "Address zero is forbidden");
        require(ownerToRentals[_owner].length > 0 && ownerToRentals[_owner][0] != 0, "No rental id for this address");

        uint256 totalTokens = 0;

        uint256[] memory rentals = ownerToRentals[_owner];

        for (uint256 i = 0; i < rentals.length; i++) {
            totalTokens += rentalToPeriods[rentals[i]].length;
        }

        uint256[] memory nftIds = new uint256[](totalTokens);
        uint256 index = 0;

        for (uint256 i; i < rentals.length; i++) {
            uint256 rentalId = rentals[i];
            RentalPeriod[] storage periods = rentalToPeriods[rentalId];
            for (uint256 j; j < periods.length; j++) {
                nftIds[index] = periods[j].nftId;
                index++;
            }
        }
        return nftIds;
    }

    function burn(address _owner, uint256 _rentalId,uint256 _tokenId) external {
        require(_isApprovedOrOwner(_owner, _tokenId), "Address provided is not the owner");
        _burn(_tokenId);
        delete rentalToPeriods[_rentalId][_tokenId -1];

        emit NftBurned(_owner, _rentalId, _tokenId);
    }

    function changeRenter(uint256 _rentalID, uint256 _nftId, address _newRenter) external onlyOwner {
        require(_newRenter != address(0), "Invalid address");

        require(_rentalID > 0, "Rental does not exist");
        require(_nftId > 0 && _nftId <= rentalToPeriods[_rentalID].length, "nft id not valid");

        RentalPeriod storage rentalPeriod = rentalToPeriods[_rentalID][_nftId -1];

        bytes32 renter = keccak256(abi.encodePacked(_newRenter));
        require(rentalToPeriods[_rentalID][_nftId -1].renter != renter, "Rental period already belongs to this renter");
        rentalPeriod.renter = renter;

        emit RenterChanged(_rentalID,_nftId, _newRenter);
    }

    function transferNFT(address _to, uint256 _tokenId) external {
        require(_to != address(0), "Invalid address");
        require(_isApprovedOrOwner(_msgSender(), _tokenId), "Caller is not owner");
        safeTransferFrom(_msgSender(), _to, _tokenId);
        require(ownerOf(_tokenId) == _to, "Token not transfered");

        emit NftTransfered(_to, _tokenId, msg.sender);
    }

   function controlNFT(address _renter, uint _tokenId) external returns (bool accessGranted){
        require(_renter != address(0), "Invalid address");
        require(_isApprovedOrOwner(_renter, _tokenId), "Renter address unknown");
        emit NftControlled(_renter,_tokenId, msg.sender);
        return accessGranted = true;
    }

    //  function controlNFT(address _renter, uint _tokenId) external returns (bool accessGranted){
    //     require(_renter != address(0), "Invalid address");
    //     bool accessGranted = false;
    //     require(_isApprovedOrOwner(_renter, _tokenId), "Renter address unknown");
    //     emit NftControlled(_renter,_tokenId, msg.sender);
    //     accessGranted = true;
    //     return accessGranted;
    // }

    receive() external payable{}
}