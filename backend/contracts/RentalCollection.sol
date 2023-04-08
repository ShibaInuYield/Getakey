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

    modifier noZeroAddress(address add) {
    require(add != address(0), "No zero address");
     _;
    }

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

    function createRentalPeriod(uint256 _startTimestamp, uint256 _endTimestamp, address _renter, bool _isPaid) external onlyOwner noZeroAddress(_renter) returns (uint256) {
        require(_startTimestamp < _endTimestamp, "Invalid rental period");

        // bytes32 walletHash = keccak256(abi.encodePacked(_renter));
        
        nftIds.increment();
        uint nftId = nftIds.current();
        
        _safeMint(msg.sender, nftId);

        bool isRented = true;

        periodIdToPeriod[nftIds.current()] = RentalPeriod(nftId, _startTimestamp , _endTimestamp , _renter, isRented, _isPaid);

        emit RentalPeriodCreated(nftId, _startTimestamp,_endTimestamp, _renter, _isPaid, isRented);
        return nftId;
    }

    function getRental(address rentalCollectionAddress) external view noZeroAddress(rentalCollectionAddress) returns (address owner,  string memory description) {
        Rental memory rental = addressToRental[rentalCollectionAddress];
        owner = rental.owner;
        description = rental.description;
    }

    function getRentalPeriod(uint _nftId) external view returns (uint256 nftId, uint256 startTimestamp, uint256 endTimestamp, address renter, bool isRented, bool isPaid) {
        
        RentalPeriod memory rentalPeriod = periodIdToPeriod[_nftId];
        require(rentalPeriod.nftId > 0,"Rental period not found");
        nftId = rentalPeriod.nftId;
        startTimestamp = rentalPeriod.startTimestamp;
        endTimestamp = rentalPeriod.endTimestamp;
        renter = rentalPeriod.renter;
        isRented = rentalPeriod.isRented;
        isPaid = rentalPeriod.isPaid;
    }

    function getAllNftRental() onlyOwner external view noZeroAddress(msg.sender) returns (RentalPeriod[] memory) {

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

    function transferNFT(address _to, uint256 _nftId) external noZeroAddress(_to) onlyOwner {
        safeTransferFrom(_msgSender(), _to, _nftId);
        require(ownerOf(_nftId) == _to, "Nft not transfered");

        emit NftTransfered(_to, _nftId, msg.sender);
    }

   function controlNFT(address _renter, uint _nftId) external noZeroAddress(_renter) returns (bool accessGranted){
        require(_isApprovedOrOwner(_renter, _nftId), "Address unknown");
        emit NftControlled(_renter,_nftId, msg.sender);
        return accessGranted = true;
    }

    receive() external payable{}
}