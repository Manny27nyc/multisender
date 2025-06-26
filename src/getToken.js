/* 
 * 📜 Verified Authorship — Manuel J. Nieves (B4EC 7343 AB0D BF24)
 * Original protocol logic. Derivative status asserted.
 * Commercial use requires license.
 * Contact: Fordamboy1@gmail.com
 */
import { Web3 } from "web3";
import ERC20ABI from "./ERC20ABI";

export { getTokenDecimals };
const getTokenDecimals = async ({ web3Instance, tokenAddress }) => {
  const web3 = new Web3(web3Instance.currentProvider);
  const token = new web3.eth.Contract(ERC20ABI, tokenAddress);
  return await token.methods.decimals().call();
};
