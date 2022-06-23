import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import chai, { expect } from "chai";
import { solidity } from "ethereum-waffle";
import { ethers, deployments, getNamedAccounts } from "hardhat";
import { ERC20PresetMinterPauser, DLY, Presale } from "../typechain";

chai.use(solidity);

describe("Presale", function () {
  let deployer: string;
  let deployerSigner: SignerWithAddress;
  let unnamedSigners: SignerWithAddress[];
  let user1Signer: SignerWithAddress;
  let user2Signer: SignerWithAddress;
  let dlycopContract: ERC20PresetMinterPauser;
  let dlyContract: DLY;
  let presaleContract: Presale;
  const amountDlycopMintedToUsers = ethers.utils.parseEther("100000000");

  before(async () => {
    // Get the accounts
    const accounts = await getNamedAccounts();
    deployer = accounts["deployer"];
    // Get the signers
    deployerSigner = await ethers.getNamedSigner("deployer");
    unnamedSigners = await ethers.getUnnamedSigners();
    user1Signer = unnamedSigners[0];
    user2Signer = unnamedSigners[1];
  });

  beforeEach(async () => {
    // Make sure every test is started from a clean deployment fixture
    await deployments.fixture();

    dlycopContract = await ethers.getContract("DLYCOP");
    dlyContract = await ethers.getContract("DLY");
    presaleContract = await ethers.getContract("Presale");

    await dlycopContract.mint(user1Signer.address, amountDlycopMintedToUsers);
    await dlycopContract.mint(user2Signer.address, amountDlycopMintedToUsers);
  });

  describe("Deployment", async () => {
    it("Should set the token contracts of DLYCOP and DLY correctly", async function () {
      expect(await presaleContract.dlycop()).to.equal(dlycopContract.address);
      expect(await presaleContract.dly()).to.equal(dlyContract.address);
    });
  });
});
