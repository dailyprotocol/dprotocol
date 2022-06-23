import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import chai, { expect } from "chai";
import { solidity } from "ethereum-waffle";
import { ethers, deployments, getNamedAccounts } from "hardhat";
import { DLY } from "../typechain";

chai.use(solidity);

describe("Presale", function () {
  let deployer: string;
  let deployerSigner: SignerWithAddress;
  let unnamedSigners: SignerWithAddress[];
  let user1Signer: SignerWithAddress;
  let user2Signer: SignerWithAddress;
  let dlyContract: DLY;

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

    dlyContract = await ethers.getContract("DLY");
  });

  describe("Deployment", async () => {
    it("Should set the token metadata correctly", async function () {
      expect(await dlyContract.name()).to.equal("Daily");
      expect(await dlyContract.symbol()).to.equal("DLY");
      expect(await dlyContract.decimals()).to.equal(ethers.BigNumber.from(18));
    });
  });
});
