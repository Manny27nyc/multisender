import { action, observable, computed, decorate } from "mobx";
import ERC20ABI from "../abis/ERC20ABI.json";
// import StormMultiSenderABI from '../abis/StormMultisender.json'
import { fromWei, toWei, toChecksumAddress } from "web3-utils";
import { isAddress } from "web3-validator";

const BN = require("bignumber.js");

class TokenStore {
  decimals = "";
  jsonAddresses = [];
  tokenAddress = "";
  defAccTokenBalance = "";
  allowance = "";
  // set non-zero reasonable value to ensure correct gas calculation
  currentFee = "10000000000000";
  tokenSymbol = "";
  ethBalance = "";
  balances_to_send = [];
  addresses_to_send = [];
  invalid_addresses = [];
  filteredAddresses = [];
  totalBalance = "0";
  arrayLimit = 0;
  errors = [];
  dublicates = [];

  constructor(rootStore) {
    this.web3Store = rootStore.web3Store;
    this.gasPriceStore = rootStore.gasPriceStore;
  }

  async proxyMultiSenderAddress() {
    try {
      const web3Obj = await this.web3Store.getWeb3Promise();
      const netIdEnvVarName =
        "REACT_APP_PROXY_MULTISENDER_" + web3Obj.netIdName.toUpperCase();
      const contractAddress = process.env[netIdEnvVarName];
      return contractAddress;
    } catch (ex) {
      console.log(ex);
    }
    return "";
  }

  async getDecimals(address) {
    if ("" !== this.decimals) {
      return this.decimals;
    }
    try {
      const web3 = this.web3Store.web3;
      const token = new web3.eth.Contract(ERC20ABI, address);
      const decimals = await token.methods.decimals().call();
      this.decimals = BigInt.asUintN(64, decimals);
      return this.decimals;
    } catch (e) {
      this.errors.push(
        "Cannot get decimals for token contract.\n Please make sure you are on the right network and token address exists"
      );
      console.error("Get Decimals", e);
    }
  }

  async getBalance() {
    if ("" !== this.defAccTokenBalance) {
      return this.defAccTokenBalance;
    }
    try {
      const web3 = this.web3Store.web3;
      const token = new web3.eth.Contract(ERC20ABI, this.tokenAddress);
      const defAccTokenBalance = await token.methods
        .balanceOf(this.web3Store.defaultAccount)
        .call();
      this.defAccTokenBalance = new BN(defAccTokenBalance.toString())
        .div(this.multiplier)
        .toString(10);
      web3.eth.subscribe("newBlockHeaders", async (err, result) => {
        if (err) {
          console.log(err);
          return;
        }
        const defAccTokenBalance = await token.methods
          .balanceOf(this.web3Store.defaultAccount)
          .call();
        this.defAccTokenBalance = new BN(defAccTokenBalance.toString())
          .div(this.multiplier)
          .toString(10);
      });
      return this.defAccTokenBalance;
    } catch (e) {
      this.errors.push(
        `${this.web3Store.defaultAccount} doesn't have token balance.\n Please make sure you are on the right network and token address exists`
      );
      console.error("getBalance", e);
    }
  }
  async getEthBalance() {
    if ("" !== this.ethBalance) {
      return this.ethBalance;
    }
    try {
      const web3 = this.web3Store.web3;
      let ethBalance = await web3.eth.getBalance(this.web3Store.defaultAccount);
      ethBalance = fromWei(ethBalance);
      this.ethBalance = new BN(ethBalance.toString()).toFormat(3);
      web3.eth.subscribe("newBlockHeaders", async (err, result) => {
        if (err) {
          console.log(err);
          return;
        }
        let ethBalance = await web3.eth.getBalance(
          this.web3Store.defaultAccount
        );
        ethBalance = fromWei(ethBalance);
        this.ethBalance = new BN(ethBalance.toString()).toFormat(3);
      });
      return this.ethBalance;
    } catch (e) {
      console.error(e);
    }
  }
  async getTokenSymbol(tokenAddress) {
    if ("" !== this.tokenSymbol) {
      return this.tokenSymbol;
    }
    try {
      const web3 = this.web3Store.web3;
      const token = new web3.eth.Contract(ERC20ABI, tokenAddress);
      this.tokenSymbol = await token.methods.symbol().call();
      return this.tokenSymbol;
    } catch (e) {
      this.errors.push(
        "Token with this Address doesnt exist.\n Please make sure you are on the right network and token address exists"
      );
      console.error(e);
    }
  }

  async getAllowance() {
    if ("" !== this.allowance) {
      return this.allowance;
    }
    try {
      const web3 = this.web3Store.web3;
      const token = new web3.eth.Contract(ERC20ABI, this.tokenAddress);
      const allowance = await token.methods
        .allowance(
          this.web3Store.defaultAccount,
          await this.proxyMultiSenderAddress()
        )
        .call();
      this.allowance = new BN(allowance.toString())
        .div(this.multiplier)
        .toString(10);
      web3.eth.subscribe("newBlockHeaders", async (err, result) => {
        if (err) {
          console.log(err);
          return;
        }
        const allowance = await token.methods
          .allowance(
            this.web3Store.defaultAccount,
            await this.proxyMultiSenderAddress()
          )
          .call();
        this.allowance = new BN(allowance.toString())
          .div(this.multiplier)
          .toString(10);
      });
      return this.allowance;
    } catch (e) {
      this.errors
        .push(`Token address doesn't have allowance method.\n Please make sure you are on the right network and token address exists.\n
         Your account: ${this.web3Store.defaultAccount}`);
      console.error("GetAllowance", e);
    }
  }

  async getCurrentFee() {
    // const currentFee = "100000000000000"; // 0.0001 ETH
    // this.currentFee = fromWei(currentFee)
    return this.currentFee;
    // try {
    //   this.web3Store.getWeb3Promise().then(async () => {
    //     const web3 = this.web3Store.web3;
    //     const multisender = new web3.eth.Contract(StormMultiSenderABI, await this.proxyMultiSenderAddress());
    //     const currentFee = await multisender.methods.currentFee(this.web3Store.defaultAccount).call();
    //     this.currentFee = fromWei(currentFee).toString()
    //     return this.currentFee
    //   })
    // }
    // catch(e){
    //   console.error('getCurrentFee',e)
    // }
  }

  setCurrentFee(currentFee) {
    this.currentFee = fromWei(currentFee).toString();
  }

  async getArrayLimit() {
    this.arrayLimit = 200;
    // this.arrayLimit = 1;
    return this.arrayLimit;
    // try {
    //   await this.web3Store.getWeb3Promise().then(async () => {
    //     const web3 = this.web3Store.web3;
    //     const multisender = new web3.eth.Contract(StormMultiSenderABI, await this.proxyMultiSenderAddress());
    //     await multisender.methods.arrayLimit().call();
    //     return this.arrayLimit
    //   })
    // }
    // catch(e){
    //   console.error('GetArrayLimit', e)
    // }
  }

  async setTokenAddress(tokenAddress) {
    await this.web3Store.getWeb3Promise();
    await this.getCurrentFee();
    await this.getEthBalance();
    await this.getArrayLimit();
    this.decimals = "";
    this.defAccTokenBalance = "";
    this.allowance = "";
    this.tokenSymbol = "";
    if (
      isAddress(this.web3Store.defaultAccount) &&
      tokenAddress !== "0x000000000000000000000000000000000000bEEF"
    ) {
      this.tokenAddress = tokenAddress;
      await this.getDecimals(tokenAddress);
      await this.getBalance();
      await this.getAllowance();
      await this.getTokenSymbol(tokenAddress);
    } else {
      this.tokenAddress = tokenAddress;
      this.tokenSymbol = this.web3Store.currencyTicker;
      this.decimals = 18;
      this.defAccTokenBalance = this.ethBalance;
    }
  }

  setDecimals(decimals) {
    this.decimals = decimals;
  }

  setJsonAddresses(addresses) {
    this.jsonAddresses = addresses;
  }

  async reset() {
    this.decimals = "";
    this.jsonAddresses = [];
    this.tokenAddress = "";
    this.defAccTokenBalance = "";
    this.allowance = "";
    this.currentFee = "0";
    this.tokenSymbol = "";
    this.ethBalance = "";
    this.balances_to_send = [];
    this.addresses_to_send = [];
    this.invalid_addresses = [];
    this.filteredAddresses = [];
    this.totalBalance = "0";
    this.arrayLimit = 0;
    this.errors = [];
    this.dublicates = [];
  }

  async parseAddresses() {
    this.addresses_to_send = [];
    this.dublicates = [];
    this.totalBalance = 0;
    this.invalid_addresses = [];
    this.balances_to_send = [];
    await Promise.all(
      this.jsonAddresses.map(async (account, index) => {
        if (Object.keys(account).length === 0) {
          throw new Exception(
            `There was an error parsing ${JSON.stringify(
              account
            )} at line ${index}`
          );
        }
        let address = Object.keys(account)[0]
          .replace(/\s/g, "")
          .replace("0X", "0x");
        address = toChecksumAddress(address);
        if (!isAddress(address)) {
          console.log("Invalid address", address);
          this.invalid_addresses.push(address);
          return;
        }
        const web3 = this.web3Store.web3;
        const code = await web3.eth.getCode(address);
        if ("" !== code && "0x" !== code.toLowerCase()) {
          console.log("Non-epty code for", address, "'" + code + "'");
          this.invalid_addresses.push(address);
          return;
        }
        let balance = Object.values(account)[0];
        this.totalBalance = new BN(balance)
          .plus(this.totalBalance)
          .toString(10);
        // console.log('balance,', balance)
        balance = this.multiplier.times(balance);
        const indexAddr = this.addresses_to_send.indexOf(address);
        if (indexAddr === -1) {
          this.addresses_to_send.push(address);
          this.balances_to_send.push(balance.toString(10));
        } else {
          if (this.dublicates.indexOf(address) === -1) {
            this.dublicates.push(address);
          }
          this.balances_to_send[indexAddr] = new BN(
            this.balances_to_send[indexAddr]
          )
            .plus(balance)
            .toString(10);
        }
      })
    );

    this.jsonAddresses = this.addresses_to_send.map((addr, index) => {
      let obj = {};
      obj[addr] = new BN(this.balances_to_send[index])
        .div(this.multiplier)
        .toString(10);
      return obj;
    });
    if (this.tokenAddress === "0x000000000000000000000000000000000000bEEF") {
      this.allowance = this.totalBalance;
    }
    return this.jsonAddresses;
  }

  get totalBalanceWithDecimals() {
    return new BN(this.totalBalance).times(this.multiplier).toString(10);
  }
  get multiplier() {
    const decimals = Number(this.decimals);
    return new BN(10).pow(decimals);
  }

  get totalNumberTx() {
    return Math.ceil(this.jsonAddresses.length / this.arrayLimit);
  }

  get addressesData() {
    return this.jsonAddresses.map((account) => {
      const address = Object.keys(account)[0].replace(/\s/g, "");
      const balance = Object.values(account)[0];
      return { address, balance };
    });
  }

  // get totalCostInEth(){
  //   const standardGasPrice = toWei(this.gasPriceStore.selectedGasPrice.toString(), 'gwei');
  //   const currentFeeInWei = toWei(this.currentFee);
  //   const tx = new BN(standardGasPrice).times(new BN('5000000'))
  //   const txFeeMiners = tx.times(new BN(this.totalNumberTx))
  //   const contractFee = new BN(currentFeeInWei).times(this.totalNumberTx);
  //
  //   return fromWei(txFeeMiners.plus(contractFee).toString(10))
  // }
}

decorate(TokenStore, {
  decimals: observable,
  jsonAddresses: observable,
  tokenAddress: observable,
  defAccTokenBalance: observable,
  allowance: observable,
  currentFee: observable,
  tokenSymbol: observable,
  ethBalance: observable,
  balances_to_send: observable,
  addresses_to_send: observable,
  invalid_addresses: observable,
  filteredAddresses: observable,
  totalBalance: observable,
  arrayLimit: observable,
  errors: observable,
  dublicates: observable,

  loading: observable,
  gasPricesArray: observable,
  selectedGasPrice: observable,
  gasPriceBase: observable,
  selectedGasShare: observable,

  getDecimals: action,
  getAllowance: action,
  getCurrentFee: action,
  setTokenAddress: action,
  setDecimals: action,
  setJsonAddresses: action,
  reset: action,
  parseAddresses: action,

  totalBalanceWithDecimals: computed,
  multiplier: computed,
  totalNumberTx: computed,
  addressesData: computed,
  // totalCostInEth: computed,
});

export default TokenStore;
