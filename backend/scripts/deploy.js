const hre = require("hardhat");

async function main() {

  const SimpleStorage = await hre.ethers.getContractFactory("SimpleStorage");
  // put constructor params in deploy
  const simpleStorage = await SimpleStorage.deploy();

  await simpleStorage.deployed();

  console.log(
    `SimpleStorage has been deployed to address : ${simpleStorage.address}`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
