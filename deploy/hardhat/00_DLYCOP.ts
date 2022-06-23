import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import {
  abi,
  bytecode,
} from "@openzeppelin/contracts/build/contracts/ERC20PresetMinterPauser.json";

const contractName = "DLYCOP";
const version = "v1";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  await deploy(contractName, {
    from: deployer,
    log: true,
    contract: { abi, bytecode },
    args: ["Daily COP", "DLYCOP"],
  });
};

export default func;
func.tags = [contractName, version];
func.id = contractName + version;
