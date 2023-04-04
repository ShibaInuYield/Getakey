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
const ether = require("@openzeppelin/test-helpers/src/ether");

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

      const { rentalCollectionFactory, owner } = await loadFixture(
        deployRentalCollectionFixture
      );

      await rentalCollectionFactory.createRentalCollection("LOCATION_1", "LOC1", "Rental address");
      expect(rentalCollectionFactory.address).to.not.equal(ethers.constants.AddressZero);
      const rentalCollections = await rentalCollectionFactory.getRentalCollections(owner.address);
      expect(rentalCollections.length).to.equal(1);
    });

    it("should fail if rental collection name is empty", async function () {

      const { rentalCollectionFactory } = await loadFixture(
        deployRentalCollectionFixture
      );

      await expect(rentalCollectionFactory.createRentalCollection("", "LOC1", "Rental address"))
      .to.be.revertedWith("Rental name, symbol and location are mendatory");
    });

    it("should fail if rental collection symbol is empty", async function () {

      const { rentalCollectionFactory } = await loadFixture(
        deployRentalCollectionFixture
      );

      await expect(rentalCollectionFactory.createRentalCollection("LOCATION_1", "", "Rental address"))
      .to.be.revertedWith("Rental name, symbol and location are mendatory");
    });

    it("should fail if rental collection location is empty", async function () {

      const { rentalCollectionFactory } = await loadFixture(
        deployRentalCollectionFixture
      );

      await expect(rentalCollectionFactory.createRentalCollection("LOCATION_1", "LOC1", ""))
      .to.be.revertedWith("Rental name, symbol and location are mendatory");
    });

    it("should fail if name already exists", async function () {

      const { rentalCollectionFactory } = await loadFixture(
        deployRentalCollectionFixture
      );

      await rentalCollectionFactory.createRentalCollection("LOCATION_1", "LOC1", "Rental address");
      await expect(rentalCollectionFactory.createRentalCollection("LOCATION_1", "LOC1", "Rental address"))
      .to.be.revertedWith("Rental name already exists");
    });

    it("should insert rentalCollection in rentalCollections", async function () {

      const { rentalCollectionFactory, owner } = await loadFixture(
        deployRentalCollectionFixture
      );

      await rentalCollectionFactory.createRentalCollection("LOCATION_1", "LOC1", "Rental address");
      expect(rentalCollectionFactory.address).to.not.equal(ethers.constants.AddressZero);
      const rentalCollections = await rentalCollectionFactory.getRentalCollections(owner.address);
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

      const { rentalCollectionFactory,owner, owner2 } = await loadFixture(
        deployRentalCollectionFixture
      );

      await rentalCollectionFactory.createRentalCollection("LOCATION_1", "LOC1", "Rental address");
      expect(rentalCollectionFactory.address).to.not.equal(ethers.constants.AddressZero);
      await rentalCollectionFactory.connect(owner2).createRentalCollection("LOCATION_2", "LOC2", "Rental address 2");
      expect(rentalCollectionFactory.address).to.not.equal(ethers.constants.AddressZero);
      const rentalCollections = await rentalCollectionFactory.getRentalCollections(owner.address);
      expect(rentalCollections.length).to.equal(1);
      const rentalCollections2 = await rentalCollectionFactory.getRentalCollections(owner2.address);
      expect(rentalCollections2.length).to.equal(1);

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
      const rentalCollections = await rentalCollectionFactory.getRentalCollections(owner.address);
      const rentalCollections2 = await rentalCollectionFactory.getRentalCollections(owner2.address);

      const rentalCollectionAddress = rentalCollections[0];
      const rentalCollection = new ethers.Contract(rentalCollectionAddress, abi, owner);
      expect(await rentalCollection.owner()).to.equal(owner.address);

      const rentalCollectionAddress2 = rentalCollections2[0];
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
      const rentalCollections = await rentalCollectionFactory.getRentalCollections(owner.address);
      const rentalCollections2 = await rentalCollectionFactory.getRentalCollections(owner2.address);

      expect(rentalCollections.length).to.equal(2);
      expect(rentalCollections2.length).to.equal(2);

      const rentalCollectionAddress = rentalCollections[0];
      const rentalCollection = new ethers.Contract(rentalCollectionAddress, abi, owner);
      expect(await rentalCollection.owner()).to.equal(owner.address);

      const rentalCollectionAddress2 = rentalCollections[1];
      const rentalCollection2 = new ethers.Contract(rentalCollectionAddress2, abi, owner);
      expect(await rentalCollection2.owner()).to.equal(owner.address);

      const rentalCollectionAddress3 = rentalCollections2[0];
      const rentalCollection3 = new ethers.Contract(rentalCollectionAddress3, abi, owner2);
      expect(await rentalCollection3.owner()).to.equal(owner2.address);

      const rentalCollectionAddress4 = rentalCollections2[1];
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
      startTimestamp2: 1680200000,
      endTimestamp2: 1680200000 + weekInSeconds,
      isPaid: true,
      nftId: 1
    };


    // Contracts are deployed using the first signer/account by default
    const [owner, owner2,  renter1, renter2] = await ethers.getSigners();

    const RentalCollectionFactory = await ethers.getContractFactory("RentalCollectionFactory");
    const rentalCollectionFactory = await RentalCollectionFactory.deploy();
    await rentalCollectionFactory.deployed();
    await rentalCollectionFactory.connect(owner).createRentalCollection("LOCATION_1", "LOC1", "Rental address");
    await rentalCollectionFactory.connect(owner).createRentalCollection("LOCATION_2", "LOC2", "Rental address2");

    const rentalCollections = await rentalCollectionFactory.getRentalCollections(owner.address);
    const rentalCollectionAddress = rentalCollections[0];
    const rentalCollection = new ethers.Contract(rentalCollectionAddress, abi, owner);

    return { rentalCollectionFactory, RentalPeriod, owner, owner2, renter1, renter2, rentalCollectionAddress, rentalCollection };
  }

  describe("Deployment contract ", function () {

    it("should deploy RentalCollection", async function () {

      const { rentalCollectionAddress, owner } = await loadFixture(
        deployRentalCollectionFixture
      );

      const rentalCollection = new ethers.Contract(rentalCollectionAddress, abi, owner);
      expect(rentalCollection.address).to.not.equal(ethers.constants.AddressZero);
    });

    it("should be the right owner", async function () {

      const { rentalCollectionAddress, owner } = await loadFixture(
        deployRentalCollectionFixture
      );

      const rentalCollection = new ethers.Contract(rentalCollectionAddress, abi, owner);

      expect(await rentalCollection.owner()).to.equal(owner.address);
    });

    it("should have the right rental collection name", async function () {

      const { rentalCollection } = await loadFixture(
        deployRentalCollectionFixture
      );

      const rental = await rentalCollection.getRental(1);
      expect(await rental.name).to.equal("LOCATION_1");
    });

    it("should have the right rental collection symbol", async function () {

      const { rentalCollection } = await loadFixture(
        deployRentalCollectionFixture
      );

      const rental = await rentalCollection.getRental(1);
      expect(await rental.symbol).to.equal("LOC1");
    });

    it("should have the right rental collection location", async function () {

      const { rentalCollection } = await loadFixture(
        deployRentalCollectionFixture
      );

      const rental = await rentalCollection.getRental(1);
      expect(await rental.location).to.equal("Rental address");
    });

    it("should revert if not an existing rental id", async function () {

      const { rentalCollection } = await loadFixture(
        deployRentalCollectionFixture
      );

      await expect(rentalCollection.getRental(2))
      .to.be.revertedWith("Rental id does not exist");
    });

    it("Should create a rental collection period", async function () {

      const { rentalCollection, RentalPeriod, renter1 } = await loadFixture(
        deployRentalCollectionFixture
      );

      await rentalCollection.createRentalPeriod(RentalPeriod.rentalId, RentalPeriod.startTimestamp, RentalPeriod.endTimestamp, renter1.address, RentalPeriod.isPaid);

      const rentalPeriod = await rentalCollection.getRentalPeriod(RentalPeriod.rentalId,RentalPeriod.nftId);
      expect(rentalPeriod.nftId).to.equal(1);
    });

    it("Should get the right nft id", async function () {

      const { rentalCollection, RentalPeriod, renter1 } = await loadFixture(
        deployRentalCollectionFixture
      );

      await rentalCollection.createRentalPeriod(RentalPeriod.rentalId, RentalPeriod.startTimestamp, RentalPeriod.endTimestamp, renter1.address, RentalPeriod.isPaid);

      const rentalPeriod = await rentalCollection.getRentalPeriod(RentalPeriod.rentalId,RentalPeriod.nftId);
      expect(rentalPeriod.nftId).to.equal(1);
    });

    it("Should get the correct startTimeStamp", async function () {

      const { rentalCollection, RentalPeriod, renter1 } = await loadFixture(
        deployRentalCollectionFixture
      );

      await rentalCollection.createRentalPeriod(RentalPeriod.rentalId,RentalPeriod.startTimestamp, RentalPeriod.endTimestamp, renter1.address, RentalPeriod.isPaid);

      const rentalPeriod = await rentalCollection.getRentalPeriod(RentalPeriod.rentalId,RentalPeriod.nftId);
      expect(rentalPeriod.startTimestamp).to.equal(1680196650);
    });

    it("Should get the correct endTimestamp", async function () {

      const { rentalCollection, RentalPeriod, renter1 } = await loadFixture(
        deployRentalCollectionFixture
      );

      await rentalCollection.createRentalPeriod(RentalPeriod.rentalId,RentalPeriod.startTimestamp, RentalPeriod.endTimestamp, renter1.address, RentalPeriod.isPaid);

      const rentalPeriod = await rentalCollection.getRentalPeriod(RentalPeriod.rentalId,RentalPeriod.nftId);
      expect(rentalPeriod.endTimestamp).to.equal(1680801450);
    });

    it("Should get the correct address hash", async function () {

      const { rentalCollection, RentalPeriod, renter1 } = await loadFixture(
        deployRentalCollectionFixture
      );

      await rentalCollection.createRentalPeriod(RentalPeriod.rentalId,RentalPeriod.startTimestamp, RentalPeriod.endTimestamp, renter1.address, RentalPeriod.isPaid);

      const rentalPeriod = await rentalCollection.getRentalPeriod(RentalPeriod.rentalId,RentalPeriod.nftId);
      const renter = solidityPack(['address'], [renter1.address]);
      const hash = keccak256(renter);
      expect(`0x${hash.toString("hex")}`).to.equal(rentalPeriod.renter);
    });

    it("Should show if isRented", async function () {

      const { rentalCollection, RentalPeriod, renter1 } = await loadFixture(
        deployRentalCollectionFixture
      );

      await rentalCollection.createRentalPeriod(RentalPeriod.rentalId,RentalPeriod.startTimestamp, RentalPeriod.endTimestamp, renter1.address, RentalPeriod.isPaid);
      const rentalPeriod = await rentalCollection.getRentalPeriod(RentalPeriod.rentalId,RentalPeriod.nftId);
      expect(rentalPeriod.isRented).to.true;
    });

    it("Should show if iSPaid", async function () {

      const { rentalCollection, RentalPeriod, renter1 } = await loadFixture(
        deployRentalCollectionFixture
      );

      await rentalCollection.createRentalPeriod(RentalPeriod.rentalId,RentalPeriod.startTimestamp, RentalPeriod.endTimestamp, renter1.address, RentalPeriod.isPaid);

      const rentalPeriod = await rentalCollection.getRentalPeriod(RentalPeriod.rentalId,RentalPeriod.nftId);
      expect(rentalPeriod.isPaid).to.true;
    });

    it("Should revert if rental does not exist", async function () {

      const { rentalCollection, RentalPeriod, renter1 } = await loadFixture(
        deployRentalCollectionFixture
      );

      await rentalCollection.createRentalPeriod(RentalPeriod.rentalId,RentalPeriod.startTimestamp, RentalPeriod.endTimestamp, renter1.address, RentalPeriod.isPaid);
      await expect(rentalCollection.getRentalPeriod(0,RentalPeriod.nftId))
      .to.be.revertedWith("Rental does not exist");
    });

    it("Should get the rentals for an address", async function () {

      const { rentalCollection, owner } = await loadFixture(
        deployRentalCollectionFixture
      );

      const ownerRentals = await rentalCollection.getOwnerRentals();
      expect(ownerRentals[0]).to.equal(1);
    });

    it("should mint a new nft", async function() {

      const { rentalCollection, RentalPeriod, owner, renter1 } = await loadFixture(
        deployRentalCollectionFixture
      );

      expect(await rentalCollection.balanceOf(owner.address)).to.equal(0);
      await rentalCollection.createRentalPeriod(RentalPeriod.rentalId,RentalPeriod.startTimestamp, RentalPeriod.endTimestamp, renter1.address, RentalPeriod.isPaid);
      expect(await rentalCollection.balanceOf(owner.address)).to.equal(1);
    });

    it("Should mint a new nft for owner", async function() {

      const { rentalCollection, RentalPeriod, owner, renter1 } = await loadFixture(
        deployRentalCollectionFixture
      );

      await rentalCollection.createRentalPeriod(RentalPeriod.rentalId,RentalPeriod.startTimestamp, RentalPeriod.endTimestamp, renter1.address, RentalPeriod.isPaid);
      const ownerofNFT = await rentalCollection.ownerOf(1);
      expect(ownerofNFT).to.equal(owner.address);
    });

    it("Should revert if startTimestamp < endTimestamp", async function() {

      const { rentalCollection, RentalPeriod, renter1 } = await loadFixture(
        deployRentalCollectionFixture
      );

      await expect(rentalCollection.createRentalPeriod(RentalPeriod.rentalId,RentalPeriod.endTimestamp,  RentalPeriod.startTimestamp , renter1.address, RentalPeriod.isPaid))
      .to.be.revertedWith("Invalid rental period");
    });

    it("Should revert if zero address", async function() {

      const { rentalCollection, RentalPeriod } = await loadFixture(
        deployRentalCollectionFixture
      );

      await expect(rentalCollection.createRentalPeriod(RentalPeriod.rentalId,RentalPeriod.startTimestamp, RentalPeriod.endTimestamp, ethers.constants.AddressZero, RentalPeriod.isPaid))
      .to.be.revertedWith("Zero address not allowed");
    });

    it("should emit RentalPeriodCreated event", async function () {
      const { rentalCollection, RentalPeriod, renter1 } = await loadFixture(
        deployRentalCollectionFixture
      );

      await expect(rentalCollection.createRentalPeriod(RentalPeriod.rentalId,RentalPeriod.startTimestamp, RentalPeriod.endTimestamp, renter1.address, RentalPeriod.isPaid))
      .to.emit(rentalCollection, "RentalPeriodCreated")
    });

    it("Should return rental periods corresponding to an address", async function() {

      const { rentalCollectionFactory, RentalPeriod, owner } = await loadFixture(
        deployRentalCollectionFixture
      );

      const rentalCollections = await rentalCollectionFactory.getRentalCollections(owner.address);
      const rentalCollectionAddress = rentalCollections[0];
      const rentalCollection = new ethers.Contract(rentalCollectionAddress, abi, owner);
      await rentalCollection.createRentalPeriod(RentalPeriod.rentalId,RentalPeriod.startTimestamp, RentalPeriod.endTimestamp, owner.address, RentalPeriod.isPaid);
      const rentalPeriod = await rentalCollection.getRentalPeriod(RentalPeriod.rentalId,RentalPeriod.nftId);
      expect(rentalPeriod.nftId).to.equal(1);
    });

    it("Should create two rental periods for two rentals", async function() {

      const { rentalCollectionFactory, RentalPeriod, owner, renter1, renter2 } = await loadFixture(
        deployRentalCollectionFixture
      );

      const rentalCollections = await rentalCollectionFactory.getRentalCollections(owner.address);
      const rentalCollectionAddress = rentalCollections[0];
      const rentalCollectionAddress2 = rentalCollections[1];
      const rentalCollection = new ethers.Contract(rentalCollectionAddress, abi, owner);
      const rentalCollection2 = new ethers.Contract(rentalCollectionAddress2, abi, owner);
      await rentalCollection.createRentalPeriod(RentalPeriod.rentalId,RentalPeriod.startTimestamp, RentalPeriod.endTimestamp, renter1.address, RentalPeriod.isPaid);
      await rentalCollection.createRentalPeriod(RentalPeriod.rentalId,RentalPeriod.startTimestamp2, RentalPeriod.endTimestamp2, renter2.address, RentalPeriod.isPaid);
      await rentalCollection2.createRentalPeriod(RentalPeriod.rentalId,RentalPeriod.startTimestamp, RentalPeriod.endTimestamp, renter1.address, RentalPeriod.isPaid);
      await rentalCollection2.createRentalPeriod(RentalPeriod.rentalId,RentalPeriod.startTimestamp2, RentalPeriod.endTimestamp2, renter2.address, RentalPeriod.isPaid);
      const rentalPeriod = await rentalCollection.getRentalPeriod(RentalPeriod.rentalId,RentalPeriod.nftId);
      const rentalPeriod2 = await rentalCollection.getRentalPeriod(RentalPeriod.rentalId,2);
      const rentalPeriodCol2 = await rentalCollection2.getRentalPeriod(RentalPeriod.rentalId,RentalPeriod.nftId);
      const rentalPeriodCol2a = await rentalCollection2.getRentalPeriod(RentalPeriod.rentalId,2);
      expect(rentalPeriod.nftId).to.equal(1);
      expect(rentalPeriod2.nftId).to.equal(2);
      expect(rentalPeriodCol2.nftId).to.equal(1);
      expect(rentalPeriodCol2a.nftId).to.equal(2);
    });

    it("Should get all the rental periods from owner", async function() {

      const { rentalCollection, RentalPeriod, owner, renter1 } = await loadFixture(
        deployRentalCollectionFixture
      );

      await rentalCollection.createRentalPeriod(RentalPeriod.rentalId,RentalPeriod.startTimestamp, RentalPeriod.endTimestamp, renter1.address, RentalPeriod.isPaid);
      await rentalCollection.createRentalPeriod(RentalPeriod.rentalId,RentalPeriod.startTimestamp2, RentalPeriod.endTimestamp2, renter1.address, RentalPeriod.isPaid);
      nftOfOwner = await rentalCollection.getAllNftIds(owner.address);
      expect(nftOfOwner[0]).to.equal(1);
      expect(nftOfOwner[1]).to.equal(2);
    });

    it("Should burn a nft", async function() {

      const { rentalCollection, RentalPeriod, owner, renter1 } = await loadFixture(
        deployRentalCollectionFixture
      );

      await rentalCollection.createRentalPeriod(RentalPeriod.rentalId,RentalPeriod.startTimestamp, RentalPeriod.endTimestamp, renter1.address, RentalPeriod.isPaid);
      await rentalCollection.createRentalPeriod(RentalPeriod.rentalId,RentalPeriod.startTimestamp2, RentalPeriod.endTimestamp2, renter1.address, RentalPeriod.isPaid);

      let nftOfOwner = await rentalCollection.getAllNftIds(owner.address);
      expect(nftOfOwner[1]).is.equal(2); 
      await rentalCollection.burn(owner.address, RentalPeriod.rentalId,2);
      nftOfOwner = await rentalCollection.getAllNftIds(owner.address);
      expect(nftOfOwner[1]).is.equal(0); 
    });

    it("should emit NftBurned event", async function () {
      const { rentalCollection, RentalPeriod, owner, renter1 } = await loadFixture(
        deployRentalCollectionFixture
      );

      await rentalCollection.createRentalPeriod(RentalPeriod.rentalId,RentalPeriod.startTimestamp, RentalPeriod.endTimestamp, renter1.address, RentalPeriod.isPaid);

      await expect(rentalCollection.burn(owner.address, RentalPeriod.rentalId,RentalPeriod.nftId))
      .to.emit(rentalCollection, "NftBurned")
    });

    it("Should revert when address is not the owner", async function() {

      const { rentalCollection, RentalPeriod, owner, renter1 } = await loadFixture(
        deployRentalCollectionFixture
      );

      await rentalCollection.createRentalPeriod(RentalPeriod.rentalId,RentalPeriod.startTimestamp, RentalPeriod.endTimestamp, renter1.address, RentalPeriod.isPaid);
      await rentalCollection.createRentalPeriod(RentalPeriod.rentalId,RentalPeriod.startTimestamp2, RentalPeriod.endTimestamp2, renter1.address, RentalPeriod.isPaid);

      let nftOfOwner = await rentalCollection.getAllNftIds(owner.address);
      expect(nftOfOwner[1]).is.equal(2); 
      await expect(rentalCollection.burn(renter1.address, RentalPeriod.rentalId,2))
      .to.be.revertedWith("Address provided is not the owner");
    });

    it("Should revert when address is not the owner", async function() {

      const { rentalCollection, RentalPeriod, owner, renter1 } = await loadFixture(
        deployRentalCollectionFixture
      );

      await rentalCollection.createRentalPeriod(RentalPeriod.rentalId,RentalPeriod.startTimestamp, RentalPeriod.endTimestamp, renter1.address, RentalPeriod.isPaid);
      await rentalCollection.createRentalPeriod(RentalPeriod.rentalId,RentalPeriod.startTimestamp2, RentalPeriod.endTimestamp2, renter1.address, RentalPeriod.isPaid);

      let nftOfOwner = await rentalCollection.getAllNftIds(owner.address);
      expect(nftOfOwner[1]).is.equal(2); 
      await expect(rentalCollection.burn(owner.address, RentalPeriod.rentalId,3))
      .to.be.revertedWith("ERC721: invalid token ID");
    });

    it("Should revert when get all nft if zero address", async function () {

      const { rentalCollection } = await loadFixture(
        deployRentalCollectionFixture
      );

      await expect(rentalCollection.getAllNftIds(ethers.constants.AddressZero))
      .to.be.revertedWith("Address zero is forbidden");
    });

    it("Should revert when gat all nft if owner has no rental", async function () {

      const { rentalCollection, renter1 } = await loadFixture(
        deployRentalCollectionFixture
      );

      await expect(rentalCollection.getAllNftIds(renter1.address))
      .to.be.revertedWith("No rental id for this address");
    });

    it("Could change renter", async function() {

      const { rentalCollection, RentalPeriod, renter1, renter2 } = await loadFixture(
        deployRentalCollectionFixture
      );

      await rentalCollection.createRentalPeriod(RentalPeriod.rentalId,RentalPeriod.startTimestamp, RentalPeriod.endTimestamp, renter2.address, RentalPeriod.isPaid);
      
      await rentalCollection.changeRenter(RentalPeriod.rentalId,RentalPeriod.nftId, renter1.address);
      const rentalPeriod = await rentalCollection.getRentalPeriod(RentalPeriod.rentalId,RentalPeriod.nftId);
      const renter = solidityPack(['address'], [renter1.address]);
      const hash = keccak256(renter);
      expect(`0x${hash.toString("hex")}`).to.equal(rentalPeriod.renter);
    });

    it("Could change renter", async function() {

      const { rentalCollection, RentalPeriod, renter1, renter2 } = await loadFixture(
        deployRentalCollectionFixture
      );

      await rentalCollection.createRentalPeriod(RentalPeriod.rentalId,RentalPeriod.startTimestamp, RentalPeriod.endTimestamp, renter2.address, RentalPeriod.isPaid);
      
      expect(await rentalCollection.changeRenter(RentalPeriod.rentalId,RentalPeriod.nftId, renter1.address))
      .to.emit(rentalCollection, "RenterChanged");
    });
 
    it("Should revert if address zero", async function() {

      const { rentalCollection, RentalPeriod, renter2 } = await loadFixture(
        deployRentalCollectionFixture
      );

      await rentalCollection.createRentalPeriod(RentalPeriod.rentalId,RentalPeriod.startTimestamp, RentalPeriod.endTimestamp, renter2.address, RentalPeriod.isPaid);
      
      await expect(rentalCollection.changeRenter(RentalPeriod.rentalId,RentalPeriod.nftId, ethers.constants.AddressZero))
      .to.be.revertedWith("Invalid address");
    });

    it("Should revert if the same renter", async function() {

      const { rentalCollection, RentalPeriod, renter2 } = await loadFixture(
        deployRentalCollectionFixture
      );

      await rentalCollection.createRentalPeriod(RentalPeriod.rentalId,RentalPeriod.startTimestamp, RentalPeriod.endTimestamp, renter2.address, RentalPeriod.isPaid);
      
      await expect(rentalCollection.changeRenter(RentalPeriod.rentalId,RentalPeriod.nftId, renter2.address))
      .to.be.revertedWith("Rental period already belongs to this renter");
    });

    it("Should revert if nft id is not good", async function() {

      const { rentalCollection, RentalPeriod, renter1, renter2 } = await loadFixture(
        deployRentalCollectionFixture
      );

      await rentalCollection.createRentalPeriod(RentalPeriod.rentalId,RentalPeriod.startTimestamp, RentalPeriod.endTimestamp, renter2.address, RentalPeriod.isPaid);
      
      await expect(rentalCollection.changeRenter(RentalPeriod.rentalId,2, renter1.address))
      .to.be.revertedWith("nft id not valid");
    });

    it("Should revert if nft id is not good", async function() {

      const { rentalCollection, RentalPeriod, renter1, renter2 } = await loadFixture(
        deployRentalCollectionFixture
      );

      await rentalCollection.createRentalPeriod(RentalPeriod.rentalId,RentalPeriod.startTimestamp, RentalPeriod.endTimestamp, renter2.address, RentalPeriod.isPaid);
      
      await expect(rentalCollection.changeRenter(RentalPeriod.rentalId,2, renter1.address))
      .to.be.revertedWith("nft id not valid");
    });

    it("should transfert an nft", async function() {

      const { rentalCollection, RentalPeriod, renter1, renter2 } = await loadFixture(
        deployRentalCollectionFixture
      );

      await rentalCollection.createRentalPeriod(RentalPeriod.rentalId,RentalPeriod.startTimestamp, RentalPeriod.endTimestamp, renter2.address, RentalPeriod.isPaid);
      
      await rentalCollection.transferNFT(renter1.address, RentalPeriod.nftId);
      await rentalCollection.changeRenter(RentalPeriod.rentalId,RentalPeriod.nftId, renter1.address);
      const rentalPeriod = await rentalCollection.getRentalPeriod( RentalPeriod.rentalId,RentalPeriod.nftId);
      const renter = solidityPack(['address'], [renter1.address]);
      const hash = keccak256(renter);
      expect(`0x${hash.toString("hex")}`).to.equal(rentalPeriod.renter);
    });

    it("Should emit nft transfered", async function() {

      const { rentalCollection, RentalPeriod,owner, renter1 } = await loadFixture(
        deployRentalCollectionFixture
      );

      await rentalCollection.createRentalPeriod(RentalPeriod.rentalId,RentalPeriod.startTimestamp, RentalPeriod.endTimestamp, renter1.address, RentalPeriod.isPaid);
      
      expect(await rentalCollection.transferNFT(renter1.address, RentalPeriod.nftId))
      .to.emit(rentalCollection, "NftTransfered");
    });

    it("Should revert if address zero", async function() {

      const { rentalCollection, RentalPeriod, renter2 } = await loadFixture(
        deployRentalCollectionFixture
      );

      await rentalCollection.createRentalPeriod(RentalPeriod.rentalId,RentalPeriod.startTimestamp, RentalPeriod.endTimestamp, renter2.address, RentalPeriod.isPaid);
      
      await expect(rentalCollection.transferNFT(ethers.constants.AddressZero , RentalPeriod.nftId))
      .to.be.revertedWith("Invalid address");
    });

    it("Should revert if not owner of nft", async function() {

      const { rentalCollection, RentalPeriod, renter1, renter2 } = await loadFixture(
        deployRentalCollectionFixture
      );

      await rentalCollection.createRentalPeriod(RentalPeriod.rentalId,RentalPeriod.startTimestamp, RentalPeriod.endTimestamp, renter2.address, RentalPeriod.isPaid);
      
      await expect(rentalCollection.connect(renter2).transferNFT(renter1.address, RentalPeriod.nftId))
      .to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Should control access", async function() {

      const { rentalCollection, RentalPeriod,owner, renter1 } = await loadFixture(
        deployRentalCollectionFixture
      );

      await rentalCollection.createRentalPeriod(RentalPeriod.rentalId,RentalPeriod.startTimestamp, RentalPeriod.endTimestamp, renter1.address, RentalPeriod.isPaid);
      
      await rentalCollection.transferNFT(renter1.address, RentalPeriod.nftId);
      expect(await rentalCollection.controlNFT(renter1.address, RentalPeriod.nftId))
      .to.emit(rentalCollection, "NftControlled");
    });

    it("should revert if not good renter", async function() {

      const { rentalCollection, RentalPeriod, renter1, renter2 } = await loadFixture(
        deployRentalCollectionFixture
      );

      await rentalCollection.createRentalPeriod(RentalPeriod.rentalId,RentalPeriod.startTimestamp, RentalPeriod.endTimestamp, renter1.address, RentalPeriod.isPaid);
      
      await rentalCollection.transferNFT(renter2.address, RentalPeriod.nftId);
      await rentalCollection.changeRenter(RentalPeriod.rentalId,RentalPeriod.nftId, renter2.address);
      await expect(rentalCollection.controlNFT(renter1.address, RentalPeriod.nftId))
      .to.be.revertedWith("Renter address unknown");
    });

    it("Should revert if address zero", async function() {

      const { rentalCollection, RentalPeriod, renter2 } = await loadFixture(
        deployRentalCollectionFixture
      );

      await rentalCollection.createRentalPeriod(RentalPeriod.rentalId,RentalPeriod.startTimestamp, RentalPeriod.endTimestamp, renter2.address, RentalPeriod.isPaid);
      
      await expect(rentalCollection.controlNFT(ethers.constants.AddressZero, RentalPeriod.nftId))
      .to.be.revertedWith("Invalid address");
    });

    it("Should fail if not nft owner after transfert", async function() {

      const { rentalCollection, RentalPeriod, renter1, renter2 } = await loadFixture(
        deployRentalCollectionFixture
      );

      await rentalCollection.createRentalPeriod(RentalPeriod.rentalId,RentalPeriod.startTimestamp, RentalPeriod.endTimestamp, renter2.address, RentalPeriod.isPaid);
      
      await expect(rentalCollection.controlNFT(renter1.address, RentalPeriod.nftId))
      .to.be.revertedWith("Renter address unknown");
    });
  });
});