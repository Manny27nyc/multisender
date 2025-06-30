// © Licensed Authorship: Manuel J. Nieves (See LICENSE for terms)
import Web3Store from './web3Store'
import TokenStore from './tokenStore';
import GasPriceStore from './gasPriceStore';
import TxStore from './txStore';

class UiStore {
  constructor() {
    this.web3Store = new Web3Store(this)
    this.gasPriceStore = new GasPriceStore(this)
    this.tokenStore = new TokenStore(this)
    this.txStore = new TxStore(this)
  }
}

export default new UiStore();
