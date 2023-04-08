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
  await rentalCollectionFactory.createRentalCollection("LOCATION 1","LOA","Une maison d'exception","https://ipfs.io/ipfs/QmPDkfmgVztLDLj47MCxRQkdAgPKmLKeadesNubNL4VqN8");
  await rentalCollectionFactory.createRentalCollection("LOCATION_2","LOB","Une splendide maison en Corse","https://ipfs.io/ipfs/QmXR2MkVsy46kVaHYrHDWtQUypTTwLB7YDqL35dVR3NMvm");

  const deployedFactoryContract2 =await rentalCollectionFactory2.deployed();
  const rentalCollectionFactory2Address = deployedFactoryContract2.address;
  await rentalCollectionFactory2.createRentalCollection("GENESIS","GEN","ADDR","https://ipfs.io/ipfs/QmPDkfmgVztLDLj47MCxRQkdAgPKmLKeadesNubNL4VqN8");
  await rentalCollectionFactory2.createRentalCollection("LOCATION_2","L2","ADDRESSE2","https://ipfs.io/ipfs/QmPDkfmgVztLDLj47MCxRQkdAgPKmLKeadesNubNL4VqN8");

  const deployedFactoryContract3 =await rentalCollectionFactory3.deployed();
  const rentalCollectionFactory3Address = deployedFactoryContract3.address;
  await rentalCollectionFactory3.createRentalCollection("GENESIS","GEN","ADDR","https://ipfs.io/ipfs/QmPDkfmgVztLDLj47MCxRQkdAgPKmLKeadesNubNL4VqN8");
  await rentalCollectionFactory3.createRentalCollection("LOCATION_3","L3","ADDRESSE3","https://ipfs.io/QmPDkfmgVztLDLj47MCxRQkdAgPKmLKeadesNubNL4VqN8");

  //get number of created collection
  const collectionFactoryNum = await rentalCollectionFactory.collectionFactoryNum();
  // get the address of the owner of the contract
  const rentalCollectionOwner = await rentalCollectionFactory.owner();
  const rentalCollectionOwner2 = await rentalCollectionFactory2.owner();
  const rentalCollectionOwner3 = await rentalCollectionFactory3.owner();
  // get the address of the Rental contract
  const rentalCollections = await rentalCollectionFactory.getRentalCollections(rentalCollectionOwner);
  const rentalCollectionsa = await rentalCollectionFactory.getRentalCollections(rentalCollectionOwner);
  const rentalCollections2 = await rentalCollectionFactory2.getRentalCollections(rentalCollectionOwner2);
  const rentalCollections2a = await rentalCollectionFactory2.getRentalCollections(rentalCollectionOwner2);
  const rentalCollections3 = await rentalCollectionFactory3.getRentalCollections(rentalCollectionOwner3);
  const rentalCollections3a = await rentalCollectionFactory3.getRentalCollections(rentalCollectionOwner3);

  //get rentalCollection contract deployed
  const rentalCollectionAddress = rentalCollections[0];
  const rentalCollectionAddressa = rentalCollectionsa[1]
  const rentalCollectionAddress2 = rentalCollections2[0]
  const rentalCollectionAddress2a = rentalCollections2a[1]
  const rentalCollectionAddress3 = rentalCollections3[0]
  const rentalCollectionAddress3a = rentalCollections3a[1]
  // set details of the RentalCollection
  
  const rentalCollection = new ethers.Contract(rentalCollectionAddress, abi, signers[0]);
  const rentalCollectiona = new ethers.Contract(rentalCollectionAddressa, abi, signers[0]);
  const rentalCollection2 = new ethers.Contract(rentalCollectionAddress2, abi, signers[0]);
  const rentalCollection2a = new ethers.Contract(rentalCollectionAddress2a, abi, signers[0]);
  const rentalCollection3 = new ethers.Contract(rentalCollectionAddress3, abi, signers[0]);
  const rentalCollection3a = new ethers.Contract(rentalCollectionAddress3a, abi, signers[0]);

  //set info of rental period

  await rentalCollection.createRentalPeriod(1679823928,1679824001,"0x70997970C51812dc3A010C7d01b50e0d17dc79C8",false);
  await rentalCollection.createRentalPeriod(1679823928,1679824002,"0x70997970C51812dc3A010C7d01b50e0d17dc79C8",false);
  await rentalCollection.createRentalPeriod(1679823928,1679824003,"0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",false);
  await rentalCollection.createRentalPeriod(1679823928,1679824004,"0x90F79bf6EB2c4f870365E785982E1f101E93b906",true);
  await rentalCollection.createRentalPeriod(1679823928,1679824005,"0x90F79bf6EB2c4f870365E785982E1f101E93b906",true);

  //get rentals by address
  const rentals = await rentalCollection.getRentalPeriod(1);

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
    `The detail of the RentalCollection1 contract is : ${rentalCollection.address}\n`,
    `The detail of the RentalCollection1a contract is : ${rentalCollectiona.address}\n`,
    `The detail of the RentalCollection2 contract is : ${rentalCollection2.address}\n`,
    `The detail of the RentalCollection2a contract is : ${rentalCollection2a.address}\n`,
    `The detail of the RentalCollection3 contract is : ${rentalCollection3.address}\n`,
    `The detail of the RentalCollection3a contract is : ${rentalCollection3a.address}\n`,
    `The first rental period is : ${rentals}\n`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});