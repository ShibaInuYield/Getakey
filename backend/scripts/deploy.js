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

  const contractAddress = await rentalCollectionFactory.createRentalCollection("PREMIERE LOCATION","LOA","Une maison d'exception","https://ipfs.io/ipfs/QmPDkfmgVztLDLj47MCxRQkdAgPKmLKeadesNubNL4VqN8");
  await contractAddress.wait();


  
  const rentalCollections = await rentalCollectionFactory.getRentalCollections(process.env.SIGNER);

  // //get rentalCollection contract deployed
  const rentalCollectionAddress = rentalCollections[0];

  const rentalCollectionInstance = await hre.ethers.getContractFactory("RentalCollection");
  const rentalCollection = rentalCollectionInstance.attach(rentalCollectionAddress);

  //set info of rental period
  await rentalCollection.createRentalPeriod(1680357600,1680944400,"0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",true);
  await rentalCollection.createRentalPeriod(1680962400,1681549200,"0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",true);
  await rentalCollection.createRentalPeriod(1681567200,1682154000,"0x90F79bf6EB2c4f870365E785982E1f101E93b906",false);
  await rentalCollection.createRentalPeriod(1682172000,1682758800,"0x90F79bf6EB2c4f870365E785982E1f101E93b906",true);
  await rentalCollection.createRentalPeriod(1682776800,1683363600,"0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65",true);

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
