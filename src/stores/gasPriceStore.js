/* 
 * 📜 Verified Authorship — Manuel J. Nieves (B4EC 7343 AB0D BF24)
 * Original protocol logic. Derivative status asserted.
 * Commercial use requires license.
 * Contact: Fordamboy1@gmail.com
 */
import { action, observable, computed, decorate } from "mobx";
import { toHex, toWei } from "web3-utils";

class GasPriceStore {
  // gasPrices = {};
  loading = true;
  gasPricesArray = [
    { label: "fast", labelETH: "FastGasPrice", value: "21" },
    { label: "standard", labelETH: "ProposeGasPrice", value: "21" },
    { label: "slow", labelETH: "SafeGasPrice", value: "21" },
    { label: "instant", labelETH: "FastGasPrice", value: "21" },
  ];
  selectedGasPrice = 22;
  gasPriceBase = 0;
  selectedGasShare = "50";

  gasPricePromise = null;
  constructor(rootStore) {
    this.web3Store = rootStore.web3Store;
    this.getGasPrices();
  }

  async getGasPrices() {
    this.gasPricePromise = this.web3Store
      .getWeb3Promise()
      .then((web3Obj) => {
        const { gasPriceAPIUrl } = web3Obj;
        if (null === gasPriceAPIUrl) {
          // BSC
          this.gasPricesArray.map((v) => {
            const value = 5;
            v.value = value;
            if ("fast" === v.label) {
              this.selectedGasPrice = parseFloat(value) + 0.1;
              v.value = this.selectedGasPrice;
            }
            v.label = `${v.label}: ${value} gwei`;
            return v;
          });
          this.loading = false;
          return;
        }
        fetch(gasPriceAPIUrl)
          .then((response) => {
            return response.json();
          })
          .then((data) => {
            // ETH: {"status":"1","message":"OK","result":{"LastBlock":"13286764","SafeGasPrice":"47","ProposeGasPrice":"47","FastGasPrice":"47","suggestBaseFee":"46.111878343","gasUsedRatio":"0.0812090079979204,0.571384990268454,0.411636499092615,0.200022766666667,0.901801833333333"}}
            // BNB: {"status":"1","message":"OK","result":{"LastBlock":"11185672","SafeGasPrice":"5" ,"ProposeGasPrice":"5" ,"FastGasPrice":"10","UsdPrice":"373.83"}}
            // POL: {"status":"1","message":"OK","result":{"LastBlock":"59821309","SafeGasPrice":"30","ProposeGasPrice":"30","FastGasPrice":"30","suggestBaseFee":"0.000000078", "gasUsedRatio":"0.457447433333333,0.424251133333333,0.2920443,0.288993866666667,0.5445044","UsdPrice":"0.790774268006168"}}
            // BNB error: {"timestamp": string,"error": "Oracle is restarting"}
            const { result } = data;
            this.gasPricesArray.map((v) => {
              const value = result[v.labelETH];
              if ("fast" === v.label) {
                this.selectedGasPrice = parseFloat(value);
              }
              v.value = value;
              v.label = `${v.label}: ${value} gwei`;
              return v;
            });
            if ("undefined" !== typeof result["suggestBaseFee"]) {
              this.gasPriceBase = parseFloat(result["suggestBaseFee"]) * 1.2; // +20%
            }
            // this.gasPrices = result;
            this.loading = false;
          })
          .catch((e) => {
            this.loading = true;
            console.error(e);
          });
      })
      .catch((e) => {
        this.loading = true;
        console.error(e);
      });
  }

  get standardInHex() {
    const v = parseInt(toWei(this.selectedGasPrice.toFixed(9), "gwei"));
    return toHex(v);
  }
  get standardBaseInHex() {
    const v = parseInt(toWei(this.gasPriceBase.toFixed(9), "gwei"));
    return toHex(v);
  }
  get fullGasPriceInHex() {
    const maxFeePerGas = this.selectedGasPrice + this.gasPriceBase;
    const v = parseInt(toWei(maxFeePerGas.toFixed(9), "gwei"));
    return toHex(v);
  }

  setSelectedGasPrice(value) {
    this.selectedGasPrice = parseFloat(value);
  }

  setSelectedGasShare(value) {
    this.selectedGasShare = value;
  }
}

decorate(GasPriceStore, {
  loading: observable,
  gasPricesArray: observable,
  selectedGasPrice: observable,
  gasPriceBase: observable,
  selectedGasShare: observable,

  setSelectedGasPrice: action,
  setSelectedGasShare: action,

  standardInHex: computed,
  standardBaseInHex: computed,
  fullGasPriceInHex: computed,
});

export default GasPriceStore;
