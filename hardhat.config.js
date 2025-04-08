// require("@nomiclabs/hardhat-waffle");
require("hardhat-deploy");
require("solidity-coverage");
require("hardhat-gas-reporter");
require("hardhat-contract-sizer");
require("@nomicfoundation/hardhat-chai-matchers");
require("@nomicfoundation/hardhat-verify");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
if (!process.env.RPC_URL || !process.env.PRIVATE_KEY) {
  console.log(process.env.RPC_URL, process.env.PRIVATE_KEY);
  console.error("Missing environment variables. Check your .env file.");
  process.exit(1);
}

module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    sepolia: {
      url: process.env.RPC_URL,
      accounts: [process.env.PRIVATE_KEY],
      chainId: 11155111,
    },
    hardhat: {
      chainId: 31337,
      forking : {
        url : process.env.MAINNET_RPC_URL
      }
    }
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
  sourcify: {
    enabled: true,
  },
  namedAccounts: {
    deployer: {
      default: 0,
    },
  },
  gasReporter: {
    enabled: true,
    outputFile: "output.txt",
    currency: "USD",
    gasPriceApi: `https://api.etherscan.io/api?module=proxy&action=eth_gasPrice&apikey=${process.env.ETHERSCAN_API_KEY}`,
    coinmarketcap: process.env.COINMARKETCAP_API_KEY,
    noColors: false,
  },
  mocha: {
    timeout: 50000000, // 500 seconds max for running tests
  },
  solidity: {
    compilers: [
      {
        version: "0.8.0",
      },
      {
        version: "0.8.18", // Your main contract version
      },
      {
        version: "0.4.19", // To support IWeth.sol
      },
      {
        version: "0.6.12", // To support IWeth.sol
      },
      {
        version: "0.8.3", // To support IWeth.sol
      },
    ],
  }
};
