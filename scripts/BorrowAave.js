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
  console.log("Script getting started...");
  await getWeth();

  const { deployer } = await getNamedAccounts();
  const lendingPool = await getLendingPool();
  console.log("Lending Pool address: ", lendingPool.target);

  const wethAddress = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";

  // Approve lending pool to take WETH
  await approveErc20(wethAddress, amount, lendingPool.target, deployer);
  console.log("Depositing...");
  await lendingPool.deposit(wethAddress, amount, deployer, 0);
  console.log("Deposited!");

  // Check user account data
  let { totalDebtETH, availableBorrowsETH } = await getBorrowUserData(
    deployer,
    lendingPool
  );

  const daiPrice = await getDaiPrice(); // price in ETH
  const daiPriceInETH = BigInt(daiPrice.toString());
  const borrowableEth = BigInt(availableBorrowsETH.toString());

  // Borrow 95% of available ETH worth of DAI
  const amountDaiToBorrow = (borrowableEth * 95n) / (100n * daiPriceInETH);
  const amountDaiToBorrowWei = amountDaiToBorrow * 10n ** 18n;

  console.log("The DAI available to be borrowed (wei): ", amountDaiToBorrowWei.toString());

  // Check for minimum borrow requirement
  if (amountDaiToBorrowWei < ethers.parseUnits("1", 18)) {
    console.log("Amount too small to borrow. Try depositing more WETH.");
    return;
  }

  // Borrow DAI
  await borrowDai(
    "0x6B175474E89094C44Da98b954EedeAC495271d0F", // DAI address
    ILendingPool,
    deployer,
    amountDaiToBorrowWei
  );

  await getBorrowUserData(deployer, lendingPool);
}

async function borrowDai(daiAddress, ILendingPool, account, amount) {
  console.log("Borrowing amount (wei):", amount.toString());
  const tx = await ILendingPool.borrow(daiAddress, amount, 1, 0, account); // interestRateMode = 1 (stable)
  await tx.wait(1);
  console.log("You have borrowed DAI!");
}

async function getDaiPrice() {
  const daiEthPriceFeed = await ethers.getContractAt(
    "AggregatorV3Interface",
    "0x773616E4d11A78F511299002da57A0a94577F1f4"
  );
  const res = await daiEthPriceFeed.latestRoundData();
  console.log("The DAI/ETH price is : ", res[1].toString());
  return res[1]; // returns price as BigNumber
}

async function getBorrowUserData(account, lendingPool) {
  const { totalCollateralETH, totalDebtETH, availableBorrowsETH } =
    await lendingPool.getUserAccountData(account);
  console.log(`You have ${totalCollateralETH} worth of ETH deposited.`);
  console.log(`You have ${totalDebtETH} worth of ETH borrowed.`);
  console.log(`You can borrow ${availableBorrowsETH} worth of ETH.`);
  return { totalDebtETH, availableBorrowsETH };
}

async function approveErc20(erc20Address, amountToSpend, spenderAddress, account) {
  const erc20Token = await ethers.getContractAt("IERC20", erc20Address);
  const tx = await erc20Token.approve(spenderAddress, amountToSpend);
  await tx.wait(1);
  console.log("Approved!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
