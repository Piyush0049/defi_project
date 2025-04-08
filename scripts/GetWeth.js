const { getNamedAccounts, ethers } = require("hardhat");


const amount = ethers.parseEther("0.001");

async function getWeth() {
  console.log("Script getting started...");
  const { deployer } = await getNamedAccounts();
  const iweth = await ethers.getContractAt(
    "IWeth",
    "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"
  );
  const txn = await iweth.deposit({ value: amount });
  await txn.wait(1);
  const balance = await iweth.balanceOf(deployer);
  console.log(`Got ${balance.toString()} WETH`);
}

module.exports = { getWeth, amount };
