const { getNamedAccounts, ethers } = require("hardhat");
const { getWeth, amount } = require("./GetWeth");

let ILendingPool;

async function getLendingPool() {
  const ILendingPoolAddressesProvider = await ethers.getContractAt(
    "ILendingPoolAddressesProvider",
    "0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5"
  );
  const address = await ILendingPoolAddressesProvider.getLendingPool();
  ILendingPool = await ethers.getContractAt("ILendingPool", address);
  return ILendingPool;
}

async function main() {
  await getWeth();
  const { deployer } = await getNamedAccounts();
  const lendingPool = await getLendingPool();
  console.log("Lending Pool address: ", lendingPool.target);
  const wethAddress = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";
  approveErc20(wethAddress, amount, lendingPool.target, deployer)
}

async function approveErc20(
  erc20Address,
  amountToSpend,
  spenderAddress,
  account
) {
  const erc20Token = await ethers.getContractAt(
    "IERC20",
    erc20Address
  );

  const tx = await erc20Token.approve(spenderAddress, amountToSpend);
  await tx.wait(1);
  console.log("Approved!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.log(error);
  });
