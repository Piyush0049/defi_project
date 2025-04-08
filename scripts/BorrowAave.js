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
  await approveErc20(wethAddress, amount, lendingPool.target, deployer);
  console.log("Depositing...");
  await lendingPool.deposit(wethAddress, amount, deployer, 0);
  console.log("Deposited!");
  let { totalDebtETH, availableBorrowsETH } = await getBorrowUserData(
    deployer,
    lendingPool
  );
  await getDaiPrice();
}

async function getDaiPrice() {
  const daiEthPriceFeed = await ethers.getContractAt(
    "AggregatorV3Interface",
    "0x773616E4d11A78F511299002da57A0a94577F1f4"
  );
  const res = await daiEthPriceFeed.latestRoundData();
  console.log("The DAI/ETH price is : ", res[1].toString());
  return res[1];
}

async function getBorrowUserData(account, lendingPool) {
  const { totalCollateralETH, totalDebtETH, availableBorrowsETH } =
    await lendingPool.getUserAccountData(account);
  console.log(`You have ${totalCollateralETH} worth of ETH deposited.`);
  console.log(`You have ${totalDebtETH} worth of ETH borrowed.`);
  console.log(`You can borrow ${availableBorrowsETH} worth of ETH.`);
  return { totalDebtETH, availableBorrowsETH };
}

async function approveErc20(
  erc20Address,
  amountToSpend,
  spenderAddress,
  account
) {
  const erc20Token = await ethers.getContractAt("IERC20", erc20Address);

  const tx = await erc20Token.approve(spenderAddress, amountToSpend);
  await tx.wait(1);
  console.log("Approved!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.log(error);
  });
