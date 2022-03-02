import { action, observable, computed } from "mobx";
import Web3Utils from 'web3-utils';

class GasPriceStore {
  // @observable gasPrices = {};
  @observable loading = true;
  @observable gasPricesArray = [
    {label: 'fast', labelETH: 'FastGasPrice', value: '21'},
    {label: 'standard', labelETH: 'ProposeGasPrice', value: '21'},
    {label: 'slow', labelETH: 'SafeGasPrice', value: '21'},
    {label: 'instant', labelETH: 'FastGasPrice', value: '21'},
  ];
  @observable selectedGasPrice = 22
  @observable gasPriceBase = '0'
  @observable selectedGasShare = '50'
  gasPricePromise = null;
  constructor(rootStore) {
    this.web3Store = rootStore.web3Store;
    this.getGasPrices()
  }

  async getGasPrices(){
    this.gasPricePromise = this.web3Store.getWeb3Promise().then((web3Obj) => {
        const {
          gasPriceAPIUrl
        } = web3Obj
        if (null === gasPriceAPIUrl) {
          // BSC
          this.gasPricesArray.map((v) => {
            const value = 5
            v.value = value
            if ('fast' === v.label) {
                this.selectedGasPrice = parseFloat(value) + 0.1;
                v.value = this.selectedGasPrice
            }
            v.label = `${v.label}: ${value} gwei`
            return v
          })
          this.loading = false;
          return
        }
        fetch(gasPriceAPIUrl).then((response) => {
          return response.json()
        }).then((data) => {
          // ETH: {"status":"1","message":"OK","result":{"LastBlock":"13286764","SafeGasPrice":"47","ProposeGasPrice":"47","FastGasPrice":"47","suggestBaseFee":"46.111878343","gasUsedRatio":"0.0812090079979204,0.571384990268454,0.411636499092615,0.200022766666667,0.901801833333333"}}
          // BNB: {"status":"1","message":"OK","result":{"LastBlock":"11185672","SafeGasPrice":"5" ,"ProposeGasPrice":"5" ,"FastGasPrice":"10","UsdPrice":"373.83"}}
          // BNB error: {"timestamp": string,"error": "Oracle is restarting"}
          const {
            result
          } = data
          this.gasPricesArray.map((v) => {
            const value = result[v.labelETH]
            if ('fast' === v.label) {
                this.selectedGasPrice = parseFloat(value);
            }
            v.value = value
            v.label = `${v.label}: ${value} gwei`
            return v
          })
          if ('undefined' !== typeof result['suggestBaseFee']) {
            this.gasPriceBase = parseFloat(result['suggestBaseFee']) * 1.2 // +20%
          }
          // this.gasPrices = result;
          this.loading = false;
        }).catch((e) => {
          this.loading = true;
          console.error(e)
        })
    }).catch((e) => {
      this.loading = true;
      console.error(e)
    })
  }

  @computed get standardInHex() {
    const toWei = Web3Utils.toWei(this.selectedGasPrice.toFixed(9).toString(), 'gwei')
    return Web3Utils.toHex(toWei)
  }
  @computed get standardBaseInHex() {
    const toWei = Web3Utils.toWei(this.gasPriceBase.toFixed(9).toString(), 'gwei')
    return Web3Utils.toHex(toWei)
  }
  @computed get fullGasPriceInHex() {
    const maxFeePerGas = parseFloat(this.selectedGasPrice) + parseFloat(this.gasPriceBase)
    const toWei = Web3Utils.toWei(maxFeePerGas.toFixed(9).toString(), 'gwei')
    return Web3Utils.toHex(toWei)
  }
  @action
  setSelectedGasPrice(value) {
    this.selectedGasPrice = parseFloat(value);
  }

  @action
  setSelectedGasShare(value) {
    this.selectedGasShare = value;
  }
}

export default GasPriceStore;
