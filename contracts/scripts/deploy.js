const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying contracts with:", deployer.address);
  let stakingTokenAddress = process.env.STAKING_TOKEN_ADDRESS;
  const aprBps = Number(process.env.INITIAL_APR_BPS || 1000); // 10%
  const minStake = hre.ethers.parseEther(process.env.MIN_STAKE || "10");
  const lockPeriod = Number(process.env.LOCK_PERIOD || 0); // seconds

  // If no staking token address is provided, deploy a local MockToken for testing
  if (!stakingTokenAddress) {
    const MockToken = await hre.ethers.getContractFactory("MockToken");
    const mock = await MockToken.deploy();
    await mock.waitForDeployment();
    stakingTokenAddress = await mock.getAddress();
    console.log("MockToken deployed to:", stakingTokenAddress);
  }

  const GreenFiCore = await hre.ethers.getContractFactory("GreenFiCore");
  const core = await GreenFiCore.deploy(stakingTokenAddress, aprBps, minStake, lockPeriod);

  await core.waitForDeployment();

  console.log("GreenFiCore deployed to:", await core.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
