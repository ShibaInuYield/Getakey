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
const { keccak256 } = require('ethereumjs-util');
const { solidityPack } = require('ethereumjs-abi');

describe("Rental collection factory", function() {

  async function deployRentalCollectionFixture() {

    const [owner, owner2] = await ethers.getSigners();

    const RentalCollectionFactory = await ethers.getContractFactory("RentalCollectionFactory");
    const rentalCollectionFactory = await RentalCollectionFactory.deploy();
    await rentalCollectionFactory.deployed();

    RentalCollection = await ethers.getContractFactory("RentalCollection");

    return { rentalCollectionFactory, RentalCollection, owner, owner2 };
  }

  describe("Deployment contract factory", function () {

    it("should deploy RentalCollectionCollectionFactory", async function () {

      const { rentalCollectionFactory } = await loadFixture(
        deployRentalCollectionFixture
      );

      await rentalCollectionFactory.createRentalCollection("LOCATION_1", "LOC1", "Rental address");
      expect(rentalCollectionFactory.address).to.not.equal(ethers.constants.AddressZero);
      const rentalCollections = await rentalCollectionFactory.getRentalCollections();
      expect(rentalCollections.length).to.equal(1);
    });

    it("should fail is rental collection name is empty", async function () {

      const { rentalCollectionFactory } = await loadFixture(
        deployRentalCollectionFixture
      );

      await expect(rentalCollectionFactory.createRentalCollection("", "LOC1", "Rental address"))
      .to.be.revertedWith("Rental name, symbol and location are mendatory");
    });

    it("should fail is rental collection symbol is empty", async function () {

      const { rentalCollectionFactory } = await loadFixture(
        deployRentalCollectionFixture
      );

      await expect(rentalCollectionFactory.createRentalCollection("LOCATION_1", "", "Rental address"))
      .to.be.revertedWith("Rental name, symbol and location are mendatory");
    });

    it("should fail is rental collection location is empty", async function () {

      const { rentalCollectionFactory } = await loadFixture(
        deployRentalCollectionFixture
      );

      await expect(rentalCollectionFactory.createRentalCollection("LOCATION_1", "LOC1", ""))
      .to.be.revertedWith("Rental name, symbol and location are mendatory");
    });

    it("should insert rentalCollection in rentalCollections", async function () {

      const { rentalCollectionFactory } = await loadFixture(
        deployRentalCollectionFixture
      );

      await rentalCollectionFactory.createRentalCollection("LOCATION_1", "LOC1", "Rental address");
      expect(rentalCollectionFactory.address).to.not.equal(ethers.constants.AddressZero);
      const rentalCollections = await rentalCollectionFactory.getRentalCollections();
      expect(rentalCollections.includes('0xa16E02E87b7454126E5E10d957A927A7F5B5d2be')).to.true;
    });

    it("should increment collectionFactoryNum", async function () {

      const { rentalCollectionFactory } = await loadFixture(
        deployRentalCollectionFixture
      );

      await rentalCollectionFactory.createRentalCollection("LOCATION_1", "LOC1", "Rental address");
      const collectionFactoryCount = await rentalCollectionFactory.collectionFactoryNum();
      expect(collectionFactoryCount).to.equal(1);
    });

    it("Same lessor should deploy two RentalCollectionCollectionFactories", async function () {

      const { rentalCollectionFactory } = await loadFixture(
        deployRentalCollectionFixture
      );

      await rentalCollectionFactory.createRentalCollection("LOCATION_1", "LOC1", "Rental address");
      expect(rentalCollectionFactory.address).to.not.equal(ethers.constants.AddressZero);
      await rentalCollectionFactory.createRentalCollection("LOCATION_2", "LOC2", "Rental address 2");
      expect(rentalCollectionFactory.address).to.not.equal(ethers.constants.AddressZero);
    });

    it("Different lessors should deploy one RentalCollectionCollectionFactory", async function () {

      const { rentalCollectionFactory, owner2 } = await loadFixture(
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

      const rentalCollectionAddress = rentalCollections[0];
      const rentalCollection = new ethers.Contract(rentalCollectionAddress, abi, owner);
      expect(await rentalCollection.owner()).to.equal(owner.address);

      const rentalCollectionAddress2 = rentalCollections[1];
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

      const rentalCollectionAddress = rentalCollections[0];
      const rentalCollection = new ethers.Contract(rentalCollectionAddress, abi, owner);
      expect(await rentalCollection.owner()).to.equal(owner.address);

      const rentalCollectionAddress2 = rentalCollections[1];
      const rentalCollection2 = new ethers.Contract(rentalCollectionAddress2, abi, owner);
      expect(await rentalCollection2.owner()).to.equal(owner.address);

      const rentalCollectionAddress3 = rentalCollections[2];
      const rentalCollection3 = new ethers.Contract(rentalCollectionAddress3, abi, owner2);
      expect(await rentalCollection3.owner()).to.equal(owner2.address);

      const rentalCollectionAddress4 = rentalCollections[3];
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

    const RentalPeriod = {
      rentalId: 1, 
      startTimestamp: 1680196650,
      endTimestamp: 1680196650 + weekInSeconds,
      isPaid: true
    };

    // Contracts are deployed using the first signer/account by default
    const [owner, owner2,  renter1, renter2] = await ethers.getSigners();

    const RentalCollectionFactory = await ethers.getContractFactory("RentalCollectionFactory");
    const rentalCollectionFactory = await RentalCollectionFactory.deploy();
    await rentalCollectionFactory.deployed();
    await rentalCollectionFactory.createRentalCollection("LOCATION_1", "LOC1", "Rental address");

    return { rentalCollectionFactory, RentalPeriod, owner, owner2, renter1, renter2 };
  }

  describe("Deployment contract ", function () {

    it("should deploy RentalCollection", async function () {

      const { rentalCollectionFactory, owner } = await loadFixture(
        deployRentalCollectionFixture
      );

      const rentalCollections = await rentalCollectionFactory.getRentalCollections();
      const rentalCollectionAddress = rentalCollections[0];
      const rentalCollection = new ethers.Contract(rentalCollectionAddress, abi, owner);

      expect(rentalCollection.address).to.not.equal(ethers.constants.AddressZero);
    });

    it("should be the right owner", async function () {

      const { rentalCollectionFactory, owner } = await loadFixture(
        deployRentalCollectionFixture
      );

      const rentalCollections = await rentalCollectionFactory.getRentalCollections();
      const rentalCollectionAddress = rentalCollections[0];
      const rentalCollection = new ethers.Contract(rentalCollectionAddress, abi, owner);

      expect(await rentalCollection.owner()).to.equal(owner.address);
    });

    it("should have the right rental collection name", async function () {

      const { rentalCollectionFactory, owner } = await loadFixture(
        deployRentalCollectionFixture
      );

      const rentalCollections = await rentalCollectionFactory.getRentalCollections();
      const rentalCollectionAddress = rentalCollections[0];
      const rentalCollection = new ethers.Contract(rentalCollectionAddress, abi, owner);
      const rental = await rentalCollection.getRental(1);
      expect(await rental.name).to.equal("LOCATION_1");
    });

    it("should have the right rental collection symbol", async function () {

      const { rentalCollectionFactory, owner } = await loadFixture(
        deployRentalCollectionFixture
      );

      const rentalCollections = await rentalCollectionFactory.getRentalCollections();
      const rentalCollectionAddress = rentalCollections[0];
      const rentalCollection = new ethers.Contract(rentalCollectionAddress, abi, owner);
      const rental = await rentalCollection.getRental(1);
      expect(await rental.symbol).to.equal("LOC1");
    });

    it("should have the right rental collection location", async function () {

      const { rentalCollectionFactory, owner } = await loadFixture(
        deployRentalCollectionFixture
      );

      const rentalCollections = await rentalCollectionFactory.getRentalCollections();
      const rentalCollectionAddress = rentalCollections[0];
      const rentalCollection = new ethers.Contract(rentalCollectionAddress, abi, owner);
      const rental = await rentalCollection.getRental(1);
      expect(await rental.location).to.equal("Rental address");
    });

    it("Should create a rental collection period", async function () {

      const { rentalCollectionFactory, RentalPeriod,  owner, renter1, renter2 } = await loadFixture(
        deployRentalCollectionFixture
      );

      const rentalCollections = await rentalCollectionFactory.getRentalCollections();
      const rentalCollectionAddress = rentalCollections[0];
      const rentalCollection = new ethers.Contract(rentalCollectionAddress, abi, owner);
      await rentalCollection.createRentalPeriod(RentalPeriod.rentalId, RentalPeriod.startTimestamp, RentalPeriod.endTimestamp, renter1.address, RentalPeriod.isPaid);

      const rentalPeriod = await rentalCollection.getRentalPeriod(1,renter1.address);
      expect(rentalPeriod.nftId).to.equal(1);
    });

    it("Should get the right nft id", async function () {

      const { rentalCollectionFactory, RentalPeriod,  owner, renter1 } = await loadFixture(
        deployRentalCollectionFixture
      );

      const rentalCollections = await rentalCollectionFactory.getRentalCollections();
      const rentalCollectionAddress = rentalCollections[0];
      const rentalCollection = new ethers.Contract(rentalCollectionAddress, abi, owner);
      await rentalCollection.createRentalPeriod(RentalPeriod.rentalId, RentalPeriod.startTimestamp, RentalPeriod.endTimestamp, renter1.address, RentalPeriod.isPaid);

      const rentalPeriod = await rentalCollection.getRentalPeriod(1,renter1.address);
      expect(rentalPeriod.nftId).to.equal(1);
    });

    it("Should get the correct startTimeStamp", async function () {

      const { rentalCollectionFactory, RentalPeriod, owner, renter1 } = await loadFixture(
        deployRentalCollectionFixture
      );

      const rentalCollections = await rentalCollectionFactory.getRentalCollections();
      const rentalCollectionAddress = rentalCollections[0];
      const rentalCollection = new ethers.Contract(rentalCollectionAddress, abi, owner);
      await rentalCollection.createRentalPeriod(RentalPeriod.rentalId,RentalPeriod.startTimestamp, RentalPeriod.endTimestamp, renter1.address, RentalPeriod.isPaid);

      const rentalPeriod = await rentalCollection.getRentalPeriod(1,renter1.address);
      expect(rentalPeriod.startTimestamp).to.equal(1680196650);
    });

    it("Should get the correct endTimestamp", async function () {

      const { rentalCollectionFactory, RentalPeriod,  owner, renter1 } = await loadFixture(
        deployRentalCollectionFixture
      );

      const rentalCollections = await rentalCollectionFactory.getRentalCollections();
      const rentalCollectionAddress = rentalCollections[0];
      const rentalCollection = new ethers.Contract(rentalCollectionAddress, abi, owner);
      await rentalCollection.createRentalPeriod(RentalPeriod.rentalId,RentalPeriod.startTimestamp, RentalPeriod.endTimestamp, renter1.address, RentalPeriod.isPaid);

      const rentalPeriod = await rentalCollection.getRentalPeriod(1,renter1.address);
      expect(rentalPeriod.endTimestamp).to.equal(1680801450);
    });

    it("Should get the correct address hash", async function () {

      const { rentalCollectionFactory, RentalPeriod,  owner, renter1 } = await loadFixture(
        deployRentalCollectionFixture
      );

      const rentalCollections = await rentalCollectionFactory.getRentalCollections();
      const rentalCollectionAddress = rentalCollections[0];
      const rentalCollection = new ethers.Contract(rentalCollectionAddress, abi, owner);
      await rentalCollection.createRentalPeriod(RentalPeriod.rentalId,RentalPeriod.startTimestamp, RentalPeriod.endTimestamp, renter1.address, RentalPeriod.isPaid);

      const rentalPeriod = await rentalCollection.getRentalPeriod(1,renter1.address);
      const renter = solidityPack(['address'], [renter1.address]);
      const hash = keccak256(renter);
      expect(`0x${hash.toString("hex")}`).to.equal(rentalPeriod.renter);
    });

    it("Should show if isRented", async function () {

      const { rentalCollectionFactory, RentalPeriod, owner, renter1 } = await loadFixture(
        deployRentalCollectionFixture
      );

      const rentalCollections = await rentalCollectionFactory.getRentalCollections();
      const rentalCollectionAddress = rentalCollections[0];
      const rentalCollection = new ethers.Contract(rentalCollectionAddress, abi, owner);
      await rentalCollection.createRentalPeriod(RentalPeriod.rentalId,RentalPeriod.startTimestamp, RentalPeriod.endTimestamp, renter1.address, RentalPeriod.isPaid);
      const rentalPeriod = await rentalCollection.getRentalPeriod(1,renter1.address);
      expect(rentalPeriod.isRented).to.true;
    });

    it("Should show if iSPaid", async function () {

      const { rentalCollectionFactory, RentalPeriod, owner, renter1 } = await loadFixture(
        deployRentalCollectionFixture
      );

      const rentalCollections = await rentalCollectionFactory.getRentalCollections();
      const rentalCollectionAddress = rentalCollections[0];
      const rentalCollection = new ethers.Contract(rentalCollectionAddress, abi, owner);
      await rentalCollection.createRentalPeriod(RentalPeriod.rentalId,RentalPeriod.startTimestamp, RentalPeriod.endTimestamp, renter1.address, RentalPeriod.isPaid);

      const rentalPeriod = await rentalCollection.getRentalPeriod(1,renter1.address);
      expect(rentalPeriod.isPaid).to.true;
    });

    it("Should revert if period id does not exists", async function () {

      const { rentalCollectionFactory, RentalPeriod, owner, renter1 } = await loadFixture(
        deployRentalCollectionFixture
      );

      const rentalCollections = await rentalCollectionFactory.getRentalCollections();
      const rentalCollectionAddress = rentalCollections[0];
      const rentalCollection = new ethers.Contract(rentalCollectionAddress, abi, owner);
      await rentalCollection.createRentalPeriod(RentalPeriod.rentalId,RentalPeriod.startTimestamp, RentalPeriod.endTimestamp, renter1.address, RentalPeriod.isPaid);
      await expect(rentalCollection.getRentalPeriod(1,ethers.constants.AddressZero))
      .to.be.revertedWith("Rental period does not exist");
    });

    it("should mint a new token", async function() {

      const { rentalCollectionFactory, RentalPeriod, owner, renter1 } = await loadFixture(
        deployRentalCollectionFixture
      );

      const rentalCollections = await rentalCollectionFactory.getRentalCollections();
      const rentalCollectionAddress = rentalCollections[0];
      const rentalCollection = new ethers.Contract(rentalCollectionAddress, abi, owner);
      expect(await rentalCollection.balanceOf(owner.address)).to.equal(0);
      await rentalCollection.createRentalPeriod(RentalPeriod.rentalId,RentalPeriod.startTimestamp, RentalPeriod.endTimestamp, renter1.address, RentalPeriod.isPaid);
      expect(await rentalCollection.balanceOf(owner.address)).to.equal(1);
    });

    it("Should mint a new nft for owner", async function() {

      const { rentalCollectionFactory, RentalPeriod, owner, renter1 } = await loadFixture(
        deployRentalCollectionFixture
      );

      const rentalCollections = await rentalCollectionFactory.getRentalCollections();
      const rentalCollectionAddress = rentalCollections[0];
      const rentalCollection = new ethers.Contract(rentalCollectionAddress, abi, owner);
      await rentalCollection.createRentalPeriod(RentalPeriod.rentalId,RentalPeriod.startTimestamp, RentalPeriod.endTimestamp, renter1.address, RentalPeriod.isPaid);
      const ownerofNFT = await rentalCollection.ownerOf(1);
      expect(ownerofNFT).to.equal(owner.address);
    });

    it("Should revert if startTimestamp < endTimestamp", async function() {

      const { rentalCollectionFactory, RentalPeriod, owner, renter1 } = await loadFixture(
        deployRentalCollectionFixture
      );

      const rentalCollections = await rentalCollectionFactory.getRentalCollections();
      const rentalCollectionAddress = rentalCollections[0];
      const rentalCollection = new ethers.Contract(rentalCollectionAddress, abi, owner);
      await expect(rentalCollection.createRentalPeriod(RentalPeriod.rentalId,RentalPeriod.endTimestamp,  RentalPeriod.startTimestamp , renter1.address, RentalPeriod.isPaid))
      .to.be.revertedWith("Invalid rental period");
    });

    it("Should revert if zero address", async function() {

      const { rentalCollectionFactory, RentalPeriod, owner } = await loadFixture(
        deployRentalCollectionFixture
      );

      const rentalCollections = await rentalCollectionFactory.getRentalCollections();
      const rentalCollectionAddress = rentalCollections[0];
      const rentalCollection = new ethers.Contract(rentalCollectionAddress, abi, owner);
      await expect(rentalCollection.createRentalPeriod(RentalPeriod.rentalId,RentalPeriod.startTimestamp, RentalPeriod.endTimestamp, ethers.constants.AddressZero, RentalPeriod.isPaid))
      .to.be.revertedWith("Zero address not allowed");
    });

    it("Should revert if period already exists", async function() {

      const { rentalCollectionFactory, RentalPeriod, owner, renter1, renter2 } = await loadFixture(
        deployRentalCollectionFixture
      );

      const rentalCollections = await rentalCollectionFactory.getRentalCollections();
      const rentalCollectionAddress = rentalCollections[0];
      const rentalCollection = new ethers.Contract(rentalCollectionAddress, abi, owner);
      await rentalCollection.createRentalPeriod(RentalPeriod.rentalId,RentalPeriod.startTimestamp, RentalPeriod.endTimestamp, renter1.address, RentalPeriod.isPaid)
      await expect(rentalCollection.createRentalPeriod(RentalPeriod.rentalId,RentalPeriod.startTimestamp, RentalPeriod.endTimestamp, renter2.address, RentalPeriod.isPaid))
      .to.be.revertedWith("Rental period already exists for this rental");
    });

    it("should emit RentalPeriodCreated event", async function () {
      const { rentalCollectionFactory, RentalPeriod, owner, renter1 } = await loadFixture(
        deployRentalCollectionFixture
      );

      const rentalCollections = await rentalCollectionFactory.getRentalCollections();
      const rentalCollectionAddress = rentalCollections[0];
      const rentalCollection = new ethers.Contract(rentalCollectionAddress, abi, owner);
      await expect(rentalCollection.createRentalPeriod(RentalPeriod.rentalId,RentalPeriod.startTimestamp, RentalPeriod.endTimestamp, renter1.address, RentalPeriod.isPaid))
      .to.emit(rentalCollection, "RentalPeriodCreated")
    });
  });
});