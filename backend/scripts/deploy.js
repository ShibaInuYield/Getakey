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
  // const rentalCollectionFactoryAddress = deployedFactoryContract.address;
  const contractAddress = await rentalCollectionFactory.createRentalCollection("PREMIERE LOCATION","LOA","Une maison d'exception","https://ipfs.io/ipfs/QmPDkfmgVztLDLj47MCxRQkdAgPKmLKeadesNubNL4VqN8");
  // await rentalCollectionFactory.createRentalCollection("LOCATION_2","LOB","Une splendide maison en Corse","https://ipfs.io/ipfs/QmXR2MkVsy46kVaHYrHDWtQUypTTwLB7YDqL35dVR3NMvm");
  await contractAddress.wait();

  const rentalCollections = await rentalCollectionFactory.getRentalCollections(process.env.SIGNER);

  // //get rentalCollection contract deployed
  const rentalCollectionAddress = rentalCollections[0];

  const rentalCollectionInstance = await hre.ethers.getContractFactory("RentalCollection");
  const rentalCollection = rentalCollectionInstance.attach(rentalCollectionAddress);
  //set info of rental period
  
  await rentalCollection.createRentalPeriod(1691211601,1691830801,"0x70997970C51812dc3A010C7d01b50e0d17dc79C8",false);
  await rentalCollection.createRentalPeriod(1691848801,1692435601,"0x70997970C51812dc3A010C7d01b50e0d17dc79C8",false);
  await rentalCollection.createRentalPeriod(1692453601,1693040401,"0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",false);
  await rentalCollection.createRentalPeriod(1679823928,1679824004,"0x90F79bf6EB2c4f870365E785982E1f101E93b906",true);
  await rentalCollection.createRentalPeriod(1679823928,1679824005,"0x90F79bf6EB2c4f870365E785982E1f101E93b906",true);

  console.log(
    `The address of the rentalCollection is : ${rentalCollectionAddress}\n`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
