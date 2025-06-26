/* 
 * 📜 Verified Authorship — Manuel J. Nieves (B4EC 7343 AB0D BF24)
 * Original protocol logic. Derivative status asserted.
 * Commercial use requires license.
 * Contact: Fordamboy1@gmail.com
 */
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
