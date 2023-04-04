require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();
require("@nomiclabs/hardhat-etherscan");

// const GOERLI_RPC_URL = process.env.GOERLI_RPC_URL || "";
// const MUMBAI_RPC_URL = process.env.MUMBAI_RPC_URL || "";
// const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL || "";
// const PRIVATE_KEY = process.env.PRIVATE_KEY || "";
// const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "";

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
    },
    // goerli: {
    //   url: GOERLI_RPC_URL,
    //   accounts: [`0x${PRIVATE_KEY}`],
    //   chainId: 5 
    // },
    // mumbai: {
    //   url: MUMBAI_RPC_URL,
    //   accounts: [`0x${PRIVATE_KEY}`],
    //   chainId: 80001
    // },
    // sepolia: {
    //   url: SEPOLIA_RPC_URL,
    //   accounts: [`${PRIVATE_KEY}`]
    // },
    sepolia: {
      url: `https://sepolia.infura.io/v3/${process.env.INFURA_ID}`,
      accounts: [process.env.PRIVATE_KEY || ""],
    }
  },
  // etherscan: {
  //   apikey: ETHERSCAN_API_KEY
  // },
  solidity: {
    version: "0.8.18",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  mocha: {
    timeout: 40000
  }
}
