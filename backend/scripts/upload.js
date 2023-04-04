const fs = require('fs');
const path = require('path');
const hre = require("hardhat");
require('dotenv').config();

async function main() {
  const RentalCollectionFactory = await hre.ethers.getContractFactory("RentalCollectionFactory");
  const contractJSON = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../artifacts/contracts/RentalCollection.sol/RentalCollection.json')));
  const abi = contractJSON.abi;

const key = process.env.PINATA_KEY;
const secret = process.env.PINATA_SECRET;
const pinataSDK = require('@pinata/sdk');
const pinata = new pinataSDK(key, secret);
const readableStreamForFile = fs.createReadStream(path.resolve(__dirname,'image.png'));

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

  // //get number of created collection
  const collectionFactoryNum = await rentalCollectionFactory.collectionFactoryNum();
  // // get the address of the owner of the contract
  const rentalCollectionOwner = await rentalCollectionFactory.owner();
  const rentalCollectionOwner2 = await rentalCollectionFactory2.owner();
  const rentalCollectionOwner3 = await rentalCollectionFactory3.owner();
  // // get the address of the Rental contract
  const rentalCollectionAddress = await rentalCollectionFactory.getRentalCollections(rentalCollectionOwner);
  const rentalCollectionAddressa = await rentalCollectionFactory.getRentalCollections(rentalCollectionOwner);
  const rentalCollectionAddress2 = await rentalCollectionFactory2.getRentalCollections(rentalCollectionOwner2);
  const rentalCollectionAddress2a = await rentalCollectionFactory2.getRentalCollections(rentalCollectionOwner2);
  const rentalCollectionAddress3 = await rentalCollectionFactory3.getRentalCollections(rentalCollectionOwner3);
  const rentalCollectionAddress3a = await rentalCollectionFactory3.getRentalCollections(rentalCollectionOwner3);

  // //get rentalCollection contract deployed
  const RentalCollection = new ethers.Contract(rentalCollectionAddress[0], abi, signers[0]);
  const RentalCollectiona = new ethers.Contract(rentalCollectionAddressa[1], abi, signers[0]);
  const RentalCollection2 = new ethers.Contract(rentalCollectionAddress2[0], abi, signers[0]);
  const RentalCollection2a = new ethers.Contract(rentalCollectionAddress2a[1], abi, signers[0]);
  const RentalCollection3 = new ethers.Contract(rentalCollectionAddress3[0], abi, signers[0]);
  const RentalCollection3a = new ethers.Contract(rentalCollectionAddress3a[1], abi, signers[0]);
  // // set details of the RentalCollection
  const collectionName = await RentalCollection.getRental(1);
  const collectionNamea = await RentalCollectiona.getRental(2);
  const collectionName2 = await RentalCollection2.getRental(1);
  const collectionName2a = await RentalCollection2a.getRental(2);
  const collectionName3 = await RentalCollection3.getRental(1);
  const collectionName3a = await RentalCollection3a.getRental(2);

  // //set info of rental period

  await RentalCollection.createRentalPeriod(1,1679823928,1679824001,"0x90F79bf6EB2c4f870365E785982E1f101E93b906",false);
  await RentalCollection.createRentalPeriod(1,1679823928,1679824002,"0x90F79bf6EB2c4f870365E785982E1f101E93b906",false);
  await RentalCollection.createRentalPeriod(1,1679823928,1679824003,"0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65",false);
  await RentalCollection.createRentalPeriod(1,1679823928,1679824004,"0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc",true);
  await RentalCollection.createRentalPeriod(1,1679823928,1679824005,"0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc",true);

  // //get rental by address
  const rental = await RentalCollection.getRentalPeriod(1,1);
console.log(rental);

  const options = {
    pinataMetadata: {
        name: "CryptokeyNFT",
    },
    pinataOptions: {
        cidVersion: 0
    }
    };

    pinata.pinFileToIPFS(readableStreamForFile, options).then((result) => {
        const body = {
            description: "A numeric key for your holiday", 
            image: `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`,
            name: `Cryptokey ${Number(rental.nftId)}`, 
            attributes: [
                {
                    "trait_type": "Rental Id", 
                    "value": Number(rental.rentalId)
                },
                {
                    "trait_type": "nft Id", 
                    "value": Number(rental.nftId)
                },
                {
                    "trait_type": "Start timestamp", 
                    "value": Number(rental.startTimestamp)
                },
                {
                    "trait_type": "End timestamp", 
                    "value": Number(rental.endTimestamp)
                },
                {
                    "trait_type": "hashWallet", 
                    "value": rental.renter
                }
            ]
        };

        pinata.pinJSONToIPFS(body, options).then((json) => {
            console.log(json);
        }).catch((err) => {
            console.log(err);
        });
     
    }).catch((err) => {
        console.log(err);
    });

  // //get rentals by address
  const numberOfRentals = await rental.length;

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
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
