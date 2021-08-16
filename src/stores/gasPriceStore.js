import { action, observable, computed } from "mobx";
import Web3Utils from 'web3-utils';

class GasPriceStore {
  @observable gasPrices = {};
  @observable loading = true;
  @observable gasPricesArray = [
    {label: 'fast', labelETH: 'FastGasPrice', value: '21'},
    {label: 'standard', labelETH: 'ProposeGasPrice', value: '21'},
    {label: 'slow', labelETH: 'SafeGasPrice', value: '21'},
    {label: 'instant', labelETH: 'FastGasPrice', value: '21'},
  ];
  @observable selectedGasPrice = '22'
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
        fetch(gasPriceAPIUrl).then((response) => {
          return response.json()
        }).then((data) => {
          // ETH: {"status":"1","message":"OK","result":{"LastBlock":"12720101","SafeGasPrice":"5","ProposeGasPrice":"8","FastGasPrice":"15"}}
          // BNB: {"timestamp":"2021-06-28T03:42:59.364Z","slow":5,"standard":5,"fast":5,"instant":5,"block_time":3,"last_block":8680171}
          // BNB error: {"timestamp": string,"error": "Oracle is restarting"}
          this.gasPricesArray.map((v) => {
            const value = 'undefined' !== typeof data[v.label] ? 2 * data[v.label] : data[v.labelETH]
            if ('fast' === v.label) {
                this.selectedGasPrice = value;
            }
            v.value = value
            v.label = `${v.label}: ${value} gwei`
            return v
          })
          this.gasPrices = data;
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
    const toWei = Web3Utils.toWei(this.selectedGasPrice.toString(), 'gwei')
    return Web3Utils.toHex(toWei)
  }
  @action
  setSelectedGasPrice(value) {
    this.selectedGasPrice = value;
  }

  @action
  setSelectedGasShare(value) {
    this.selectedGasShare = value;
  }
}

export default GasPriceStore;
