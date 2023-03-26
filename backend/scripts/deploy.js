const hre = require("hardhat");

async function main() {

  const RentalCollectionFactory = await hre.ethers.getContractFactory("RentalCollectionFactory");
  const RentalCollection = await hre.ethers.getContractFactory("RentalCollection");

  const rentalCollectionFactory = await RentalCollectionFactory.deploy();
  await rentalCollectionFactory.deployed();

  await rentalCollectionFactory.createRentalCollection("GENESIS","GEN","ADDR");

  // get the address of the owner of the contract
  const rentalCollectionOwner = await rentalCollectionFactory.owner();
  // get the address of the Rental contract
  const rentalCollectionAddress = await rentalCollectionFactory.rentalCollections([0]);
  // get the address of the first rentalCollection
  const rentalCollection = await RentalCollection.attach(rentalCollectionAddress);
  // get name from ERC721 contract
  const collectionName = await rentalCollection.name();
  // get infos from rentals array
  const firstRentalCollectionInstanceInfo = await rentalCollection.Rentals([0]);
  const location = firstRentalCollectionInstanceInfo.location;
  console.log(
    `rentalCollection has been deployed to address : ${rentalCollectionAddress}`,
    `rentalCollectionFactory owner is : ${rentalCollectionOwner}`,
    `rentalConnectionName is : ${collectionName}`,
    `location is : ${location}`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
