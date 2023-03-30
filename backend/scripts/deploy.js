const fs = require('fs');
const path = require('path');
const hre = require("hardhat");

async function main() {
  const RentalCollectionFactory = await hre.ethers.getContractFactory("RentalCollectionFactory");
  const contractJSON = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../artifacts/contracts/RentalCollection.sol/RentalCollection.json')));
  const abi = contractJSON.abi;

  const signers = await hre.ethers.getSigners();

  const rentalCollectionFactory = await RentalCollectionFactory.connect(signers[0]).deploy();
  const rentalCollectionFactory2 = await RentalCollectionFactory.connect(signers[1]).deploy();
  const rentalCollectionFactory3 = await RentalCollectionFactory.connect(signers[2]).deploy();

  const deployedFactoryContract = await rentalCollectionFactory.deployed();
  const rentalCollectionFactoryAddress = deployedFactoryContract.address;
  await rentalCollectionFactory.createRentalCollection("GENESIS","GEN","ADDR");
  await rentalCollectionFactory.createRentalCollection("LOCATION_1","L1","ADDRESSE1");

  const deployedFactoryContract2 =await rentalCollectionFactory2.deployed();
  const rentalCollectionFactory2Address = deployedFactoryContract2.address;
  await rentalCollectionFactory2.createRentalCollection("GENESIS","GEN","ADDR");
  await rentalCollectionFactory2.createRentalCollection("LOCATION_2","L2","ADDRESSE2");

  const deployedFactoryContract3 =await rentalCollectionFactory3.deployed();
  const rentalCollectionFactory3Address = deployedFactoryContract3.address;
  await rentalCollectionFactory3.createRentalCollection("GENESIS","GEN","ADDR");
  await rentalCollectionFactory3.createRentalCollection("LOCATION_3","L3","ADDRESSE3");

  //get number of created collection
  const collectionFactoryNum = await rentalCollectionFactory.collectionFactoryNum();
  // get the address of the owner of the contract
  const rentalCollectionOwner = await rentalCollectionFactory.owner();
  const rentalCollectionOwner2 = await rentalCollectionFactory2.owner();
  const rentalCollectionOwner3 = await rentalCollectionFactory3.owner();
  // get the address of the Rental contract
  const rentalCollectionAddress = await rentalCollectionFactory.rentalCollections([0]);
  const rentalCollectionAddressa = await rentalCollectionFactory.rentalCollections([1]);
  const rentalCollectionAddress2 = await rentalCollectionFactory2.rentalCollections([0]);
  const rentalCollectionAddress2a = await rentalCollectionFactory2.rentalCollections([1])
  const rentalCollectionAddress3 = await rentalCollectionFactory3.rentalCollections([0]);
  const rentalCollectionAddress3a = await rentalCollectionFactory3.rentalCollections([1]);

  //get rentalCollection contract deployed
  const RentalCollection = new ethers.Contract(rentalCollectionAddress, abi, signers[0]);
  const RentalCollectiona = new ethers.Contract(rentalCollectionAddressa, abi, signers[0]);
  const RentalCollection2 = new ethers.Contract(rentalCollectionAddress2, abi, signers[0]);
  const RentalCollection2a = new ethers.Contract(rentalCollectionAddress2a, abi, signers[0]);
  const RentalCollection3 = new ethers.Contract(rentalCollectionAddress3, abi, signers[0]);
  const RentalCollection3a = new ethers.Contract(rentalCollectionAddress3a, abi, signers[0]);
  // set details of the RentalCollection
  const collectionName = await RentalCollection.Rentals([0]);
  const collectionNamea = await RentalCollectiona.Rentals([0]);
  const collectionName2 = await RentalCollection2.Rentals([0]);
  const collectionName2a = await RentalCollection2a.Rentals([0]);
  const collectionName3 = await RentalCollection3.Rentals([0]);
  const collectionName3a = await RentalCollection3a.Rentals([0]);

  //set info of rental period

  await RentalCollection.createRentalPeriod(1679823928,1679824001,"0x90F79bf6EB2c4f870365E785982E1f101E93b906",false,false);
  await RentalCollection.createRentalPeriod(1679823928,1679824002,"0x90F79bf6EB2c4f870365E785982E1f101E93b906",false,false);
  await RentalCollection.createRentalPeriod(1679823928,1679824003,"0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65",false,true);
  await RentalCollection.createRentalPeriod(1679823928,1679824004,"0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc",true,false);
  await RentalCollection.createRentalPeriod(1679823928,1679824005,"0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc",true,true);

  //get rentals by address
  const rentals = await RentalCollection.getRentalPeriodsByAddress("0x90F79bf6EB2c4f870365E785982E1f101E93b906");

  //get rentals by address
  const numberOfRentals = await rentals.length;

  //get info about rental
  const rentalInfo = await RentalCollection.getRentalPeriodById(1);

  //get info about rental
  const rentalInfoBeforeBurn = await RentalCollection.getRentalPeriodById(1);

  //burn one token
  await RentalCollection.burn(1);

  //get rentals by address
  const rentalsAfterBurn = await RentalCollection.getRentalPeriodsByAddress("0x90F79bf6EB2c4f870365E785982E1f101E93b906");

  //get rentals by address
  const numberOfRentalsAfterBurn = await rentalsAfterBurn.length;

  // get info of rentalPeriod before change renter
  const rentalPeriodInfoBeforeChangeRenter = await RentalCollection.getRentalPeriodById(3);
  const ownerOfBeforeTransfer = await RentalCollection.ownerOfToken(3);

  //transfer token to a different wallet
  await RentalCollection.transferNFT("0x90F79bf6EB2c4f870365E785982E1f101E93b906",3);
  await RentalCollection.changeRenter(3,"0x90F79bf6EB2c4f870365E785982E1f101E93b906");

  // get info of rentalPeriod after change renter
  const rentalPeriodInfoAfterChangeRenter = await RentalCollection.getRentalPeriodById(3);
  const ownerOfAfterTransfert = await RentalCollection.ownerOfToken(3);

  const AddressOwnsnft = await RentalCollection.ownsNFT("0x90F79bf6EB2c4f870365E785982E1f101E93b906",2);

  //get rentals by address
  const rentalsAfterChangeRenter = await RentalCollection.getRentalPeriodsByAddress("0x90F79bf6EB2c4f870365E785982E1f101E93b906");

  //get rentals by address
  const numberOfRentalsAfterChangerenter = await rentalsAfterChangeRenter.length;

  // update rental period
  await RentalCollection.updateRentalPeriod(3,1679823930,1679824010,true,false)

  // get info of rentalPeriod before change renter
  const rentalPeriodInfoAfterUpdate = await RentalCollection.getRentalPeriodById(3);

  console.log(
    `number of collection is : ${collectionFactoryNum}\n`,
    `The address of the rentalCollectionFactory contract is : ${rentalCollectionFactoryAddress}\n`,
    `The address of the rentalCollectionFactory2 contract is : ${rentalCollectionFactory2Address}\n`,
    `The address of the rentalCollectionFactory3 contract is : ${rentalCollectionFactory3Address}\n`,
    `rentalCollectionFactory owner is : ${rentalCollectionOwner}\n`,
    `rentalCollectionFactory2 owner is : ${rentalCollectionOwner2}\n`,
    `rentalCollectionFactory3 owner is : ${rentalCollectionOwner3}\n`,
    `The address of the rental1 contract is : ${rentalCollectionAddress}\n`,
    `The address of the rental1a contract is : ${rentalCollectionAddressa}\n`,
    `The address of the rental2 contract is : ${rentalCollectionAddress2}\n`,
    `The address of the rental2a contract is : ${rentalCollectionAddress2a}\n`,
    `The address of the rental3 contract is : ${rentalCollectionAddress3}\n`,
    `The address of the rental3a contract is : ${rentalCollectionAddress3a}\n`,
    `The detail of the RentalCollection1 contract is : ${collectionName}\n`,
    `The detail of the RentalCollection1a contract is : ${collectionNamea}\n`,
    `The detail of the RentalCollection2 contract is : ${collectionName2}\n`,
    `The detail of the RentalCollection2a contract is : ${collectionName2a}\n`,
    `The detail of the RentalCollection3 contract is : ${collectionName3}\n`,
    `The detail of the RentalCollection3a contract is : ${collectionName3a}\n`,
    `The number of rentals for this address is : ${numberOfRentals}\n`,
    `The rentals for this address are : ${rentals}\n`,
    `The rental information for id 1 is : ${rentalInfo}\n`,
    `The rental has been destroyed : ${rentalInfoBeforeBurn}\n`,
    `The rentals for this address are : ${rentalsAfterBurn}\n`,
    `The number of rentals for this address is : ${numberOfRentalsAfterBurn}\n`,
    `The rental info before change renter : ${rentalPeriodInfoBeforeChangeRenter}\n`,
    `The owner of the NFT before transfer is : ${ownerOfBeforeTransfer}\n`,
    `The rental info after change renter : ${rentalPeriodInfoAfterChangeRenter}\n`,
    `The owner of the NFT after transfer is : ${ownerOfAfterTransfert}\n`,
    `The rentals for this address are : ${rentalsAfterChangeRenter}\n`,
    `The number of rentals is : ${numberOfRentalsAfterChangerenter}\n`,
    `The rental period after update : ${rentalPeriodInfoAfterUpdate}\n`,
    `Is this addess owns the nft : ${AddressOwnsnft}\n`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
