const fs = require('fs');
const path = require('path');
const hre = require("hardhat");

async function main() {
  const RentalCollectionFactory = await hre.ethers.getContractFactory("RentalCollectionFactory");
  const contractJSON = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../artifacts/contracts/RentalCollection.sol/RentalCollection.json')));
  const abi = contractJSON.abi;

  const signers = await hre.ethers.getSigners();

  const [owner, owner2] = await ethers.getSigners();

  const rentalCollectionFactory = await RentalCollectionFactory.connect(owner).deploy();

  const deployedFactoryContract = await rentalCollectionFactory.deployed();
  const rentalCollectionFactoryAddress = deployedFactoryContract.address;

  await rentalCollectionFactory.createRentalCollection("LOCATION 1","LOA","Une maison d'exception","https://ipfs.io/ipfs/QmPDkfmgVztLDLj47MCxRQkdAgPKmLKeadesNubNL4VqN8");
  await rentalCollectionFactory.connect(owner2).createRentalCollection("LOCATION_2","LOC","Une splendide maison","https://ipfs.io/ipfs/QmXR2MkVsy46kVaHYrHDWtQUypTTwLB7YDqL35dVR3NMvm");

  //get number of created collection
  const collectionFactoryNum = await rentalCollectionFactory.collectionFactoryNum();

  // get the address of the Rental contracts
  const rentalCollectionsOwner = await rentalCollectionFactory.getRentalCollections(owner.address);

  const rentalCollectionsOwner2 = await rentalCollectionFactory.getRentalCollections(owner2.address);

  //get rentalCollection contract deployed
  const rentalCollectionOwner1Address = rentalCollectionsOwner[0];
  const rentalCollectionOwner2Address = rentalCollectionsOwner2[0];

  console.log(rentalCollectionOwner2Address)

  // set details of the RentalCollection
  const rentalCollection = new ethers.Contract(rentalCollectionOwner1Address, abi, signers[0]);
  const rentalCollection2 = new ethers.Contract(rentalCollectionOwner2Address, abi, signers[1]);

  //set info of rental period
  await rentalCollection.createRentalPeriod(1680357600,1680944400,"0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",true);
  await rentalCollection.createRentalPeriod(1680962400,1681549200,"0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",true);
  await rentalCollection.createRentalPeriod(1681567200,1682154000,"0x90F79bf6EB2c4f870365E785982E1f101E93b906",false);
  await rentalCollection.createRentalPeriod(1682172000,1682758800,"0x90F79bf6EB2c4f870365E785982E1f101E93b906",true);
  await rentalCollection.createRentalPeriod(1682776800,1683363600,"0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65",true);

  await rentalCollection2.connect(owner2).createRentalPeriod(1680357600,1680944400,"0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",true);
  await rentalCollection2.connect(owner2).createRentalPeriod(1680962400,1681549200,"0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",true);
  await rentalCollection2.connect(owner2).createRentalPeriod(1681567200,1682154000,"0x90F79bf6EB2c4f870365E785982E1f101E93b906",false);

  console.log(
    `number of collection is : ${collectionFactoryNum}\n`,
    `The address of the rentalCollection contract is : ${rentalCollectionFactoryAddress}\n`,
    `rentalCollectionFactory owner is : ${rentalCollectionsOwner[0]}\n`,
    `The address of the first contract of rental is : ${rentalCollectionOwner1Address}\n`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});