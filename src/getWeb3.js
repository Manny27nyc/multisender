import Web3 from "web3";

const getAccounts = () => {
  return new Promise(function (resolve, reject) {
    (async () => {
      try {
        // Will open the MetaMask UI
        // You should disable this button while the request is pending!
        const { ethereum } = window;
        const accounts = await ethereum.request({
          method: "eth_requestAccounts",
        });
        resolve(accounts);
      } catch (error) {
        console.error(error);
        reject(error);
      }
    })();
  });
};

let _web3Config = null;
let _web3Promise = null;
let getWeb3 = () => {
  if (!_web3Promise) {
    _web3Promise = new Promise(function (resolve, reject) {
      if (null !== _web3Config) {
        resolve(_web3Config);
        return;
      }
      // Wait for loading completion to avoid race conditions with ethereum injection timing.
      window.addEventListener("load", function () {
        // Checking if ethereum has been injected by the browser (Mist/MetaMask)
        if (window.hasOwnProperty("ethereum")) {
          // Use Mist/MetaMask's provider.
          let web3 = new Web3(Web3.givenProvider);
          web3.eth.net
            .getId()
            .then((netId) => {
              let netIdName,
                trustApiName,
                explorerUrl,
                explorerAPIUrl,
                gasPriceAPIUrl,
                currencyTicker,
                currencyTickerName,
                blockchainName;
              console.log("netId", netId);
              netId = "" + netId;
              switch (netId) {
                case "1":
                  netIdName = "Mainnet";
                  trustApiName = "api";
                  explorerUrl = "https://etherscan.io";
                  explorerAPIUrl =
                    "https://api.etherscan.io/api?module=account&action=tokentx&address=%1$s&startblock=0&endblock=999999999&sort=desc&apikey=" +
                    process.env[
                      "REACT_APP_PROXY_MULTISENDER_ETHERSCAN_API_KEY"
                    ];
                  gasPriceAPIUrl =
                    "https://api.etherscan.io/api?module=gastracker&action=gasoracle&apikey=" +
                    process.env[
                      "REACT_APP_PROXY_MULTISENDER_ETHERSCAN_API_KEY"
                    ];
                  currencyTicker = "ETH";
                  currencyTickerName = "Ether";
                  blockchainName = "Ethereum";
                  console.log("This is Foundation", netId);
                  break;
                case "3":
                  netIdName = "Ropsten";
                  trustApiName = "ropsten";
                  explorerUrl = "https://ropsten.etherscan.io";
                  explorerAPIUrl =
                    "https://api-ropsten.etherscan.io/api?module=account&action=tokentx&address=%1$s&startblock=0&endblock=999999999&sort=desc&apikey=" +
                    process.env[
                      "REACT_APP_PROXY_MULTISENDER_ETHERSCAN_API_KEY"
                    ];
                  gasPriceAPIUrl =
                    "https://api.etherscan.io/api?module=gastracker&action=gasoracle&apikey=" +
                    process.env[
                      "REACT_APP_PROXY_MULTISENDER_ETHERSCAN_API_KEY"
                    ];
                  currencyTicker = "ETH";
                  currencyTickerName = "Ether";
                  blockchainName = "Ethereum";
                  console.log("This is Ropsten", netId);
                  break;
                case "4":
                  netIdName = "Rinkeby";
                  trustApiName = "rinkeby";
                  explorerUrl = "https://rinkeby.etherscan.io";
                  explorerAPIUrl =
                    "https://api-rinkeby.etherscan.io/api?module=account&action=tokentx&address=%1$s&startblock=0&endblock=999999999&sort=desc&apikey=" +
                    process.env[
                      "REACT_APP_PROXY_MULTISENDER_ETHERSCAN_API_KEY"
                    ];
                  gasPriceAPIUrl =
                    "https://api.etherscan.io/api?module=gastracker&action=gasoracle&apikey=" +
                    process.env[
                      "REACT_APP_PROXY_MULTISENDER_ETHERSCAN_API_KEY"
                    ];
                  currencyTicker = "ETH";
                  currencyTickerName = "Ether";
                  blockchainName = "Ethereum";
                  console.log("This is Rinkeby", netId);
                  break;
                case "42":
                  netIdName = "Kovan";
                  trustApiName = "kovan";
                  explorerUrl = "https://kovan.etherscan.io";
                  explorerAPIUrl =
                    "https://api-kovan.etherscan.io/api?module=account&action=tokentx&address=%1$s&startblock=0&endblock=999999999&sort=desc&apikey=" +
                    process.env[
                      "REACT_APP_PROXY_MULTISENDER_ETHERSCAN_API_KEY"
                    ];
                  gasPriceAPIUrl =
                    "https://api.etherscan.io/api?module=gastracker&action=gasoracle&apikey=" +
                    process.env[
                      "REACT_APP_PROXY_MULTISENDER_ETHERSCAN_API_KEY"
                    ];
                  currencyTicker = "ETH";
                  currencyTickerName = "Ether";
                  blockchainName = "Ethereum";
                  console.log("This is Kovan", netId);
                  break;
                case "56":
                  netIdName = "BSC";
                  trustApiName = "bsc";
                  explorerUrl = "https://bscscan.com";
                  explorerAPIUrl =
                    "https://api.bscscan.com/api?module=account&action=tokentx&address=%1$s&startblock=0&endblock=999999999&sort=desc&apikey=" +
                    process.env["REACT_APP_PROXY_MULTISENDER_BSCSCAN_API_KEY"];
                  gasPriceAPIUrl =
                    "https://api.bscscan.com/api?module=gastracker&action=gasoracle&apikey=" +
                    process.env["REACT_APP_PROXY_MULTISENDER_BSCSCAN_API_KEY"];
                  currencyTicker = "BNB";
                  currencyTickerName = "BNB";
                  blockchainName = "Binance Smart Chain";
                  console.log("This is Binance Smart Chain", netId);
                  break;
                case "97":
                  netIdName = "BSCTest";
                  trustApiName = "bsctest";
                  explorerUrl = "https://testnet.bscscan.com";
                  explorerAPIUrl =
                    "https://api-testnet.bscscan.com/api?module=account&action=tokentx&address=%1$s&startblock=0&endblock=999999999&sort=desc&apikey=" +
                    process.env["REACT_APP_PROXY_MULTISENDER_BSCSCAN_API_KEY"];
                  gasPriceAPIUrl =
                    "https://api.bscscan.com/api?module=gastracker&action=gasoracle&apikey=" +
                    process.env["REACT_APP_PROXY_MULTISENDER_BSCSCAN_API_KEY"];
                  currencyTicker = "BNB";
                  currencyTickerName = "BNB";
                  blockchainName = "Binance Smart Chain Test";
                  console.log("This is Binance Smart Chain Test", netId);
                  break;
                default:
                  netIdName = "Unknown";
                  console.log("This is an unknown network.", netId);
              }
              document.title = `${netIdName} - MultiSender dApp`;
              getAccounts()
                .then((accounts) => {
                  const firstAccount = accounts.length > 0 ? accounts[0] : null;
                  var defaultAccount =
                    web3.eth.defaultAccount || firstAccount || null;
                  if (defaultAccount === null) {
                    reject({
                      message:
                        "Please unlock your metamask and refresh the page",
                    });
                    return;
                  }
                  if (
                    web3.eth.estimateGas.__proto__ &&
                    web3.eth.estimateGas.__proto__.call
                  ) {
                    console.log(
                      "typeof web3.eth.estimateGas.__proto__.call:",
                      typeof web3.eth.estimateGas.__proto__.call
                    );
                    web3.eth.estimateGas.call =
                      web3.eth.estimateGas.__proto__.call;
                    console.log(
                      "typeof web3.eth.estimateGas.call:",
                      typeof web3.eth.estimateGas.call
                    );
                  }
                  const results = {
                    web3Instance: web3,
                    netIdName,
                    netId,
                    injectedWeb3: true,
                    defaultAccount,
                    trustApiName,
                    explorerUrl,
                    explorerAPIUrl,
                    gasPriceAPIUrl,
                    currencyTicker,
                    currencyTickerName,
                    blockchainName,
                  };
                  _web3Config = results;
                  console.log("results:", _web3Config);
                  resolve(_web3Config);
                })
                .catch((err) => {
                  reject(err);
                });
            })
            .catch((err) => {
              reject(err);
            });

          console.log("Injected web3 detected.");
        } else {
          // Fallback to localhost if no web3 injection.
          const errorMsg = `Metamask is not installed. Please go to
          https://metamask.io and return to this page after you installed it`;
          console.log("No web3 instance injected, using Local web3.");
          console.error("Metamask not found");
          reject({ message: errorMsg });
          return;
        }
      });
    });
  }
  return _web3Promise;
};

export default getWeb3;
