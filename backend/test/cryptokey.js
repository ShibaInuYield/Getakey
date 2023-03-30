const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");
const { expect, expectEvent } = require("chai");
const { BigNumber } = ethers;
const { BN } = require('@openzeppelin/test-helpers');
const fs = require('fs');
const path = require('path');
const contractJSON = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../artifacts/contracts/RentalCollection.sol/RentalCollection.json')));
const abi = contractJSON.abi;

describe("Rental collection factory", function() {

  async function deployRentalCollectionFixture() {
    const weekInSeconds = 7 * 24 * 60 * 60;
    const rentalEndTime = (await time.latest()) + weekInSeconds;

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

      await rentalCollectionFactory.createRentalCollection("LOCATION_1", "LOC1", "Rental address");
      expect(rentalCollectionFactory.address).to.not.equal(ethers.constants.AddressZero);
      const rentalCollections = await rentalCollectionFactory.getRentalCollections();
      expect(rentalCollections.length).to.equal(1);
    });

    it("should insert rentalCollection in rentalCollections", async function () {

      const { rentalCollectionFactory, owner } = await loadFixture(
        deployRentalCollectionFixture
      );

      await rentalCollectionFactory.createRentalCollection("LOCATION_1", "LOC1", "Rental address");
      expect(rentalCollectionFactory.address).to.not.equal(ethers.constants.AddressZero);
      const rentalCollections = await rentalCollectionFactory.getRentalCollections();
      expect(rentalCollections.includes('0xa16E02E87b7454126E5E10d957A927A7F5B5d2be')).to.true;
    });

    it("should increment collectionFactoryNum", async function () {

      const { rentalCollectionFactory, owner } = await loadFixture(
        deployRentalCollectionFixture
      );

      await rentalCollectionFactory.createRentalCollection("LOCATION_1", "LOC1", "Rental address");
      const collectionFactoryCount = await rentalCollectionFactory.collectionFactoryNum();
      expect(collectionFactoryCount).to.equal(1);
    });

    it("Same lessor should deploy two RentalCollectionCollectionFactories", async function () {

      const { rentalCollectionFactory, owner } = await loadFixture(
        deployRentalCollectionFixture
      );

      await rentalCollectionFactory.createRentalCollection("LOCATION_1", "LOC1", "Rental address");
      expect(rentalCollectionFactory.address).to.not.equal(ethers.constants.AddressZero);
      await rentalCollectionFactory.createRentalCollection("LOCATION_2", "LOC2", "Rental address 2");
      expect(rentalCollectionFactory.address).to.not.equal(ethers.constants.AddressZero);
    });

    it("Different lessors should deploy one RentalCollectionCollectionFactory", async function () {

      const { rentalCollectionFactory, owner, owner2 } = await loadFixture(
        deployRentalCollectionFixture
      );

      await rentalCollectionFactory.createRentalCollection("LOCATION_1", "LOC1", "Rental address");
      expect(rentalCollectionFactory.address).to.not.equal(ethers.constants.AddressZero);
      await rentalCollectionFactory.connect(owner2).createRentalCollection("LOCATION_2", "LOC2", "Rental address 2");
      expect(rentalCollectionFactory.address).to.not.equal(ethers.constants.AddressZero);
      const rentalCollections = await rentalCollectionFactory.getRentalCollections();
      expect(rentalCollections.length).to.equal(2);

    });

    it("should be the right owner", async function () {

      const { rentalCollectionFactory, owner } = await loadFixture(
        deployRentalCollectionFixture
      );

      await rentalCollectionFactory.createRentalCollection("LOCATION_1", "LOC1", "Rental address");
      expect(await rentalCollectionFactory.owner()).to.equal(owner.address);
    });

    it("RentalCollectionCollectionFactories deployed by different owners should have different owner address", async function () {

      const { rentalCollectionFactory, owner, owner2 } = await loadFixture(
        deployRentalCollectionFixture
      );

      await rentalCollectionFactory.createRentalCollection("LOCATION_1", "LOC1", "Rental address");
      await rentalCollectionFactory.connect(owner2).createRentalCollection("LOCATION_2", "LOC2", "Rental address 2");
      const rentalCollections = await rentalCollectionFactory.getRentalCollections();

      const rentalCollectionAddress = await rentalCollectionFactory.rentalCollections([0]);
      const rentalCollection = new ethers.Contract(rentalCollectionAddress, abi, owner);
      expect(await rentalCollection.owner()).to.equal(owner.address);

      const rentalCollectionAddress2 = await rentalCollectionFactory.rentalCollections([1]);
      const rentalCollection2 = new ethers.Contract(rentalCollectionAddress2, abi, owner2);
      expect(await rentalCollection2.owner()).to.equal(owner2.address);
    });

    it("Many lessors should deploy many RentalCollectionCollectionFactories", async function () {

      const { rentalCollectionFactory, owner, owner2 } = await loadFixture(
        deployRentalCollectionFixture
      );

      await rentalCollectionFactory.createRentalCollection("LOCATION_1_LESSOR_1", "LOC1", "Rental address 1");
      await rentalCollectionFactory.createRentalCollection("LOCATION_2_LESSOR_1", "LOC2", "Rental address 2");
      await rentalCollectionFactory.connect(owner2).createRentalCollection("LOCATION_1_LESSOR_2", "LOC1", "Rental address 1");
      await rentalCollectionFactory.connect(owner2).createRentalCollection("LOCATION_2_LESSOR_2", "LOC2", "Rental address 2");
      const rentalCollections = await rentalCollectionFactory.getRentalCollections();

      expect(rentalCollections.length).to.equal(4);

      const rentalCollectionAddress = await rentalCollectionFactory.rentalCollections([0]);
      const rentalCollection = new ethers.Contract(rentalCollectionAddress, abi, owner);
      expect(await rentalCollection.owner()).to.equal(owner.address);

      const rentalCollectionAddress2 = await rentalCollectionFactory.rentalCollections([1]);
      const rentalCollection2 = new ethers.Contract(rentalCollectionAddress2, abi, owner);
      expect(await rentalCollection2.owner()).to.equal(owner.address);
      
      const rentalCollectionAddress3 = await rentalCollectionFactory.rentalCollections([2]);
      const rentalCollection3 = new ethers.Contract(rentalCollectionAddress3, abi, owner2);
      expect(await rentalCollection3.owner()).to.equal(owner2.address);

      const rentalCollectionAddress4 = await rentalCollectionFactory.rentalCollections([3]);
      const rentalCollection4 = new ethers.Contract(rentalCollectionAddress4, abi, owner2);
      expect(await rentalCollection4.owner()).to.equal(owner2.address);
    });

    it("should emit RentalCollectionCreated event", async function () {
      const { rentalCollectionFactory, owner } = await loadFixture(
        deployRentalCollectionFixture
      );

      const rentalCollection = await rentalCollectionFactory.createRentalCollection("LOCATION_1", "LOC1", "Rental address");
    
      await expect(rentalCollection)
        .to.emit(rentalCollectionFactory, "RentalCollectionCreated")
    });

    it("should receive Ether with fallback", async function () {
      const { rentalCollectionFactory, owner } = await loadFixture(
        deployRentalCollectionFixture
      );

    const initialBalance = await ethers.provider.getBalance(rentalCollectionFactory.address);

    await owner.sendTransaction({
      to: rentalCollectionFactory.address,
      value: ethers.utils.parseEther("1.0")
    });
    const newBalance = await ethers.provider.getBalance(rentalCollectionFactory.address);
    expect(newBalance).to.equal(initialBalance.add(ethers.utils.parseEther("1.0")));
    });

    it("should receive Ether with receive", async function () {
      const { rentalCollectionFactory, owner } = await loadFixture(
        deployRentalCollectionFixture
      );

    const initialBalance = await ethers.provider.getBalance(rentalCollectionFactory.address);

    await owner.sendTransaction({
      to: rentalCollectionFactory.address,
      value: ethers.utils.parseEther("1.0")
    });
    const newBalance = await ethers.provider.getBalance(rentalCollectionFactory.address);
    expect(newBalance).to.equal(initialBalance.add(ethers.utils.parseEther("1.0")));
    });
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
      await rentalCollectionFactory.createRentalCollection("LOCATION_1", "LOC1", "Rental address", {from: owner.address});
      const rentalCollectionAddress = await rentalCollectionFactory.rentalCollections([0]);
      const rentalCollection = new ethers.Contract(rentalCollectionAddress, abi, owner);

      expect(rentalCollection.address).to.not.equal(ethers.constants.AddressZero);
    });

    it("should be the right owner", async function () {

      const { rentalCollectionFactory, owner } = await loadFixture(
        deployRentalCollectionFixture
      );

      await rentalCollectionFactory.createRentalCollection("LOCATION_1", "LOC1", "Rental address", {from: owner.address});
      const rentalCollectionAddress = await rentalCollectionFactory.rentalCollections([0]);
      const rentalCollection = new ethers.Contract(rentalCollectionAddress, abi, owner);

      expect(await rentalCollection.owner()).to.equal(owner.address);
    });
  });
});