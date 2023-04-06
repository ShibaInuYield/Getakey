// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "../node_modules/@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";
import "../node_modules/@openzeppelin/contracts/utils/Counters.sol";
import "hardhat/console.sol";

contract RentalCollection is ERC721, Ownable {

    struct Rental {
        uint256 id;
        address owner;
        string description;
        string image;
    }

    struct RentalPeriod {
        uint256 nftId;
        uint256 startTimestamp;
        uint256 endTimestamp;
        address renter;
        bool isRented;
        bool isPaid;      
    }
    
    mapping(address => Rental) public addressToRental;

    mapping(uint256 => RentalPeriod) public periodIdToPeriod;

    using Counters for Counters.Counter;
    Counters.Counter nftIds;

    constructor() ERC721("","") {
    }

    event RentalPeriodCreated(uint256 nftId, uint256 _startTimestamp, uint256 _endTimestamp, address _renter, bool _isPaid, bool isRented);
    event NftBurned(address owner, uint256 nftId);
    event RenterChanged(uint256 nftId, address newRenter);
    event NftTransfered(address to,uint256 nftId,address msgSender);
    event NftControlled(address renter,uint256 nftId, address msgSender); 

    function createRental(string memory name, string memory symbol, string memory _description, address _rentalCollectionAddress, uint _id, string memory _image,  address _owner) external onlyOwner {
        _name= name;
        _symbol= symbol;
         Rental memory newRental = Rental({
        id: _id,
        owner: _owner,
        description: _description,
        image: _image
        });
        addressToRental[_rentalCollectionAddress] = newRental;
    }

    function createRentalPeriod(uint256 _startTimestamp, uint256 _endTimestamp, address _renter, bool _isPaid) external onlyOwner returns (uint256) {
        require(bytes(abi.encode(_startTimestamp)).length > 0 && bytes(abi.encodePacked(_endTimestamp)).length > 0 &&
            bytes(abi.encodePacked(_renter)).length > 0 && bytes(abi.encodePacked(_isPaid)).length > 0,
            "All elements are mandatory");
        require(_startTimestamp < _endTimestamp, "Invalid rental period");
        require(_renter != address(0), "Zero address not allowed");

        // bytes32 walletHash = keccak256(abi.encodePacked(_renter));

        nftIds.increment();
        uint nftId = nftIds.current();
        
        _safeMint(_msgSender(), nftId);
        bool isRented = true;

        periodIdToPeriod[nftIds.current()] = RentalPeriod(nftId, _startTimestamp , _endTimestamp , _renter, isRented, _isPaid);

        emit RentalPeriodCreated(nftId, _startTimestamp,_endTimestamp, _renter, _isPaid, isRented);
        return nftId;
    }

    function getRental(address rentalCollectionAddress) external view returns (address owner, string memory description) {
        require(rentalCollectionAddress != address(0), "Invalid address");
        Rental memory rental = addressToRental[rentalCollectionAddress];
        owner = rental.owner;
        description = rental.description;
    }

    function getRentalPeriod(uint _nftId) external view returns (uint256 nftId, uint256 startTimestamp, uint256 endTimestamp, address renter, bool isRented, bool isPaid) {
        
        RentalPeriod memory rentalPeriod = periodIdToPeriod[_nftId];
        require(rentalPeriod.nftId > 0,"Rental period does not exist");
        nftId = rentalPeriod.nftId;
        startTimestamp = rentalPeriod.startTimestamp;
        endTimestamp = rentalPeriod.endTimestamp;
        renter = rentalPeriod.renter;
        isRented = rentalPeriod.isRented;
        isPaid = rentalPeriod.isPaid;
    }

    function getAllNftRental() onlyOwner external view returns (RentalPeriod[] memory) {
        require(msg.sender != address(0), "Address zero is forbidden");

        RentalPeriod[] memory rentalPerioArray = new RentalPeriod[](nftIds.current());

        uint256 index;
        for (uint256 i; i < nftIds.current(); i++) {           
                rentalPerioArray[index] = periodIdToPeriod[i];
                index++;
            }
        return rentalPerioArray;
    }

    function burn(address _owner, uint256 _nftId) external onlyOwner {
        require(_isApprovedOrOwner(_owner, _nftId), "Not allowed to burn");
        _burn(_nftId);
        delete periodIdToPeriod[_nftId -1];

        emit NftBurned(_owner, _nftId);
    }

    function changeRenter(uint256 _nftId, address _newRenter) external onlyOwner {
        require(_newRenter != address(0), "Invalid address");

        require(_nftId > 0, "nft id not valid");

        RentalPeriod storage rentalPeriod = periodIdToPeriod[_nftId];

        // bytes32 renter = keccak256(abi.encodePacked(_newRenter));
        require(periodIdToPeriod[_nftId].renter != _newRenter, "Rental period already belongs to this renter");
        rentalPeriod.renter = _newRenter;

        emit RenterChanged(_nftId, _newRenter);
    }

    function transferNFT(address _to, uint256 _nftId) external onlyOwner {
        require(_to != address(0), "Invalid address");
        safeTransferFrom(_msgSender(), _to, _nftId);
        require(ownerOf(_nftId) == _to, "Nft not transfered");

        emit NftTransfered(_to, _nftId, msg.sender);
    }

   function controlNFT(address _renter, uint _nftId) external returns (bool accessGranted){
        require(_renter != address(0), "Invalid address");
        require(_isApprovedOrOwner(_renter, _nftId), "Renter address unknown");
        emit NftControlled(_renter,_nftId, msg.sender);
        return accessGranted = true;
    }

    receive() external payable{}
}