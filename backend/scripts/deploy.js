const fs = require('fs');
const path = require('path');
const hre = require("hardhat");

async function main() {
  const RentalCollectionFactory = await hre.ethers.getContractFactory("RentalCollectionFactory");
  const contractJSON = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../artifacts/contracts/RentalCollection.sol/RentalCollection.json')));
  const abi = contractJSON.abi;

  // const signers = await hre.ethers.getSigners();
  const rentalCollectionFactory = await RentalCollectionFactory.deploy();
  const deployedFactoryContract = await rentalCollectionFactory.deployed();
  const rentalCollectionFactoryAddress = deployedFactoryContract.address;

  const contractAddress = await rentalCollectionFactory.createRentalCollection("PREMIERE LOCATION","LOA","Location ***","https://ipfs.io/ipfs/QmPDkfmgVztLDLj47MCxRQkdAgPKmLKeadesNubNL4VqN8");
  await contractAddress.wait();

  const rentalCollections = await rentalCollectionFactory.getRentalCollections(process.env.SIGNER);

  // //get rentalCollection contract deployed
  const rentalCollectionAddress = rentalCollections[0];

  const rentalCollectionInstance = await hre.ethers.getContractFactory("RentalCollection");
  const rentalCollection = rentalCollectionInstance.attach(rentalCollectionAddress);

  //set info of rental period
  await rentalCollection.createRentalPeriod(1680357600,1680944400,"0x600257fCE7885017745D4153E138B0d00a98033e",true);
  await rentalCollection.createRentalPeriod(1680962400,1681549200,"0x600257fCE7885017745D4153E138B0d00a98033e",true);
  await rentalCollection.createRentalPeriod(1681567200,1682154000,"0x21f19da3B864078f2Aa655C8af1A34505f82040B",false);
  await rentalCollection.createRentalPeriod(1682172000,1682758800,"0x21f19da3B864078f2Aa655C8af1A34505f82040B",true);

  console.log(
    `The address of the rentalCollection is : ${rentalCollectionFactoryAddress}\n`,
    `rentalCollectionFactory owner is : ${process.env.SIGNER}\n`,
    `The address of the rental contract is : ${rentalCollectionAddress}\n`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
