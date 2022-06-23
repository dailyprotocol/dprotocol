import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers } from "hardhat";

const contractName = "Presale";
const version = "v1";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;
  let { deployer, dlycop } = await getNamedAccounts();
  const dly = await ethers.getContract("DLY");

  if (hre.network.tags["local"]) {
    const dlycopContract = await ethers.getContract("DLYCOP");
    dlycop = dlycopContract.address;
  }

  await deploy(contractName, {
    from: deployer,
    log: true,
    contract: "Presale",
    args: [dlycop, dly.address],
  });

  // Give minter role to presale contract so DLY can be minted depending on the deposited and claimed tokens
  const presaleContract = await ethers.getContract(contractName);
  const grantMinterRoleToPresaleContractTx = await dly.grantRole(await dly.MINTER_ROLE(), presaleContract.address);
  console.log("Transfer Minter Role to Presale contract", grantMinterRoleToPresaleContractTx.hash);
  await grantMinterRoleToPresaleContractTx.wait(2);
  // Renounce deployer's minter and admin role
  const renounceMinterRole = await dly.renounceRole(await dly.MINTER_ROLE(), deployer);
  console.log("Renounce deployer's Minter Role", renounceMinterRole.hash);
  await renounceMinterRole.wait(2);
  const renounceAdminRole = await dly.renounceRole(await dly.DEFAULT_ADMIN_ROLE(), deployer);
  console.log("Renounce deployer's Admin Role", renounceAdminRole.hash);
  await renounceAdminRole.wait(2);

};

export default func;
func.tags = [contractName, version];
func.id = contractName + version;
