const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");
const { BigNumber } = ethers;
const { BN } = require('@openzeppelin/test-helpers');
const fs = require('fs');
const contractJSON = JSON.parse(fs.readFileSync("/home/fab/COURSALYRA/CryptoKey/backend/artifacts/contracts/RentalCollection.sol/RentalCollection.json"));
const abi = contractJSON.abi;

describe("Rental collection factory", function() {

  async function deployRentalCollectionFixture() {
    const weekInSeconds = 7 * 24 * 60 * 60;
    const rentalEndTime = (await time.latest()) + weekInSeconds;

    // Contracts are deployed using the first signer/account by default
    const [owner, owner2,  renter1, renter2] = await ethers.getSigners();

    const RentalCollectionFactory = await ethers.getContractFactory("RentalCollectionFactory");
    const rentalCollectionFactory = await RentalCollectionFactory.deploy();
    await rentalCollectionFactory.deployed();

    RentalCollection = await ethers.getContractFactory("RentalCollection");

    return { rentalCollectionFactory, RentalCollection, rentalEndTime, owner, owner2, renter1, renter2 };
  }

  describe("Deployment contract factory", function () {

    it("should deploy RentalCollectionCollectionFactory", async function () {

      const { rentalCollectionFactory, owner } = await loadFixture(
        deployRentalCollectionFixture
      );

      await rentalCollectionFactory.createRentalCollection("LOCATION_1", "LOC1", "Addresse du bien", {from: owner.address});
      console.log(rentalCollectionFactory.address);
      expect(rentalCollectionFactory.address).to.not.equal(ethers.constants.AddressZero);
    });

    it("should be the right owner", async function () {

      const { rentalCollectionFactory, owner } = await loadFixture(
        deployRentalCollectionFixture
      );

      await rentalCollectionFactory.createRentalCollection("LOCATION_1", "LOC1", "Addresse du bien", {from: owner.address});
      expect(await rentalCollectionFactory.owner()).to.equal(owner.address);
    });

    it("should return rental informations", async function () {

      const { rentalCollectionFactory, RentalCollection, owner } = await loadFixture(
        deployRentalCollectionFixture
      );

      const rentalCollection = await rentalCollectionFactory.createRentalCollection("LOCATION_1", "LOC1", "Addresse du bien",{from: owner.address});

      const rentalCollectionInstance = await RentalCollection.attach(rentalCollection);
      
      // const rental = await rentalCollectionInstance.getRentalPeriodsByAddress(owner.address, {from: owner.address});
    });

    // vérifier si c'est bien le owner qui a le contrat
    // expect(await lock.owner()).to.equal(owner.address);

  });
});

describe("Rental collection", function() {

  async function deployRentalCollectionFixture() {
    const weekInSeconds = 7 * 24 * 60 * 60;
    const rentalEndTime = (await time.latest()) + weekInSeconds;

    // Contracts are deployed using the first signer/account by default
    const [owner, owner2,  renter1, renter2] = await ethers.getSigners();

    const RentalCollectionFactory = await ethers.getContractFactory("RentalCollectionFactory");
    const rentalCollectionFactory = await RentalCollectionFactory.deploy();
    await rentalCollectionFactory.deployed();

    RentalCollection = await ethers.getContractFactory("RentalCollection");

    return { rentalCollectionFactory, RentalCollection, rentalEndTime, owner, owner2, renter1, renter2 };
  }

  describe("Deployment contract ", function () {

    it("should deploy RentalCollection", async function () {

      const { rentalCollectionFactory, owner } = await loadFixture(
        deployRentalCollectionFixture
      );

      // const RentalPeriod = {
      //   startTimestamp: BN(Date.now()),
      //   endTimestamp: BN(Date.now() + weekInSeconds),
      //   isPaid: true,
      //   rented: false,
      // };
      // const rentalCollection = await rentalCollectionFactory.createRentalCollection(RentalPeriod.startTimestamp, RentalPeriod.endTimestamp, owner.address, RentalPeriod.isPaid, RentalPeriod.rented);
      await rentalCollectionFactory.createRentalCollection("LOCATION_1", "LOC1", "Addresse du bien", {from: owner.address});
      const rentalCollectionAddress = await rentalCollectionFactory.rentalCollections([0]);
      const rentalCollection = new ethers.Contract(rentalCollectionAddress, abi, owner);

      expect(rentalCollection.address).to.not.equal(ethers.constants.AddressZero);
    });

    it("should be the right owner", async function () {

      const { rentalCollectionFactory, owner } = await loadFixture(
        deployRentalCollectionFixture
      );

      await rentalCollectionFactory.createRentalCollection("LOCATION_1", "LOC1", "Addresse du bien", {from: owner.address});
      const rentalCollectionAddress = await rentalCollectionFactory.rentalCollections([0]);
      const rentalCollection = new ethers.Contract(rentalCollectionAddress, abi, owner);

      expect(await rentalCollection.owner()).to.equal(owner.address);
    });
  });
});