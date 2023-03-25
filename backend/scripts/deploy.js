const hre = require("hardhat");

async function main() {

  const RentalCollectionFactory = await hre.ethers.getContractFactory("RentalCollectionFactory");
  const RentalCollection = await hre.ethers.getContractFactory("RentalCollection");
  // put constructor params in deploy
  const rentalCollectionFactory = await RentalCollectionFactory.deploy();
  await rentalCollectionFactory.deployed();
  await rentalCollectionFactory.createRentalCollection("R","R","addresse");
  await rentalCollectionFactory.createRentalCollection("R1","R1","addresse1");

  const rentalCollectionAddress = await rentalCollectionFactory.rentalCollections([1]);
  const rentalCollection = await RentalCollection.attach(rentalCollectionAddress);
  const collectionNum = await rentalCollection.name();
  console.log(
    `rentalCollection has been deployed to address : ${rentalCollectionAddress}`,
    `rentalCollection has been deployed to address : ${collectionNum}`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
