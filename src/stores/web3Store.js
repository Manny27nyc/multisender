import { action, observable, decorate } from "mobx";
import getWeb3 from "../getWeb3";
import { sprintf } from "sprintf-js";

class Web3Store {
  web3 = {};
  defaultAccount = "";
  currencyTicker = "";
  currencyTickerName = "";
  blockchainName = "";
  maxBlockGas = 8000000;
  isEIP1559 = false;
  loading = true;
  errors = [];
  userTokens = [];
  explorerUrl = "";
  explorerAPIUrl = "";
  gasPriceAPIUrl = "";
  startedUrl = window.location.hash;

  constructor(rootStore) {
    this.userTokensInitialized = false;
  }

  setExplorerUrl(url) {
    this.explorerUrl = url;
  }

  setExplorerAPIUrl(url) {
    this.explorerAPIUrl = url;
  }

  setStartedUrl(url) {
    this.startedUrl = url;
  }

  async getWeb3Promise() {
    return getWeb3()
      .then(async (web3Config) => {
        if ("" !== this.explorerUrl) {
          return this;
        }
        const {
          web3Instance,
          defaultAccount,
          netId,
          netIdName,
          explorerUrl,
          explorerAPIUrl,
          gasPriceAPIUrl,
          currencyTicker,
          currencyTickerName,
          blockchainName,
        } = web3Config;
        console.log("web3Config:", web3Config);
        this.defaultAccount = defaultAccount;
        this.web3 = web3Instance;
        this.netId = netId;
        this.netIdName = netIdName;
        this.currencyTicker = currencyTicker;
        this.currencyTickerName = currencyTickerName;
        this.blockchainName = blockchainName;
        this.gasPriceAPIUrl = gasPriceAPIUrl;
        this.setExplorerUrl(explorerUrl);
        this.setExplorerAPIUrl(explorerAPIUrl);
        await this.getUserTokens(web3Config);
        const block = await this.web3.eth.getBlock("latest");
        this.isEIP1559 = "undefined" !== typeof block.baseFeePerGas;
        this.maxBlockGas = block.gasLimit.asUintN();
        console.log("web3 loaded");
        return this;
      })
      .catch((e) => {
        console.error(e, "web3 not loaded");
        this.errors.push(e.message);
        throw e;
      });
  }

  async getUserTokens({ trustApiName, defaultAccount }) {
    return new Promise((resolve, reject) => {
      if (this.userTokensInitialized) {
        resolve(this);
        return;
      }
      const url = sprintf(this.explorerAPIUrl, defaultAccount);
      console.log("explorerAPIUrl:", this.explorerAPIUrl);
      console.log("defaultAccount:", defaultAccount);
      console.log("url:", url);
      window
        .fetch(url)
        .then((res) => {
          return res.json();
        })
        .then((res) => {
          if (
            !(
              res.result &&
              typeof res.result === "object" &&
              res.result.hasOwnProperty("length")
            )
          ) {
            this.loading = false;
            reject(
              "Failed to load user tokens. Try again a minute later please."
            );
            return;
          }
          let tokens = res.result
            .filter((tx) => {
              if (
                !tx.hasOwnProperty("to") ||
                tx["to"].toLowerCase() != defaultAccount.toLowerCase()
              ) {
                return false;
              }
              if (!tx.hasOwnProperty("contractAddress")) {
                return false;
              }
              if (!tx.hasOwnProperty("tokenName")) {
                return false;
              }
              if (!tx.hasOwnProperty("tokenSymbol")) {
                return false;
              }
              if (!tx.hasOwnProperty("tokenDecimal")) {
                return false;
              }
              return true;
            })
            .map((tx) => {
              const tokenAddress = tx["contractAddress"];
              const tokenName = tx["tokenName"];
              const tokenSymbol = tx["tokenSymbol"];
              const tokenDecimal = tx["tokenDecimal"];
              return {
                label: `${tokenSymbol} - ${tokenAddress}`,
                value: tokenAddress,
                tokenSymbol,
              };
            });
          let tokensUniqueObj = {};
          for (let i = 0; i < tokens.length; i++) {
            let token = tokens[i];
            tokensUniqueObj[token.value] = token;
          }
          let tokensUnique = Object.keys(tokensUniqueObj).map(
            (tokenAddress) => tokensUniqueObj[tokenAddress]
          );
          tokensUnique.unshift({
            value: "0x000000000000000000000000000000000000bEEF",
            label:
              this.currencyTicker +
              " - " +
              this.blockchainName +
              " Native Currency",
          });
          this.userTokens = tokensUnique;
          this.userTokensInitialized = true;
          this.loading = false;
          resolve(this);
        })
        .catch((e) => {
          this.loading = false;
          console.error(e);
          reject(e);
        });
    });
  }
}

decorate(Web3Store, {
  web3: observable,
  defaultAccount: observable,
  currencyTicker: observable,
  currencyTickerName: observable,
  blockchainName: observable,
  maxBlockGas: observable,
  isEIP1559: observable,
  loading: observable,
  errors: observable,
  userTokens: observable,
  explorerUrl: observable,
  explorerAPIUrl: observable,
  gasPriceAPIUrl: observable,
  startedUrl: observable,
  setExplorerUrl: action,
  setExplorerAPIUrl: action,
  setStartedUrl: action,
});

export default Web3Store;
