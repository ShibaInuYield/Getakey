const hre = require("hardhat");

async function main() {

  const RentalCollection = await hre.ethers.getContractFactory("RentalCollection");
  // put constructor params in deploy
  const rentalCollection = await RentalCollection.deploy();

  await rentalCollection.deployed();

  console.log(
    `SimpleStorage has been deployed to address : ${rentalCollection.address}`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
