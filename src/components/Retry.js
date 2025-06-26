/* 
 * 📜 Verified Authorship — Manuel J. Nieves (B4EC 7343 AB0D BF24)
 * Original protocol logic. Derivative status asserted.
 * Commercial use requires license.
 * Contact: Fordamboy1@gmail.com
 */
import React from "react";
import { inject, observer } from "mobx-react";
import swal from "sweetalert";
import { Link } from "react-router-dom";
import generateElement from "../generateElement";

export let Retry = inject("UiStore")(
  observer(
    class Retry extends React.Component {
      constructor(props) {
        super(props);
        this.onTxInput = this.onTxInput.bind(this);
        this.txStore = props.UiStore.txStore;

        this.state = {
          txHash: "",
        };
      }

      onTxInput(e) {
        const txHash = e.target.value;
        setTimeout(async () => {
          if (txHash.length === 66) {
            const txdata = await this.txStore.getTxReceipt(txHash);
            console.log(txdata);
            this.setState({ txHash });
          } else {
            swal({
              content: generateElement(`Tx Hash is not valid`),
              icon: "error",
            });
          }
        }, 750);
      }
      render() {
        return (
          <div className="multisend-container multisend-container_bg container_opacity">
            <div className="content">
              <div className="table">
                <label htmlFor="txhash" className="multisend-label">
                  Transaction Hash
                </label>
                <input
                  onChange={this.onTxInput}
                  type="text"
                  className="input"
                  id="txhash"
                />
                <div className="table-tr table-tr_title">
                  <div className="table-td">Token Name</div>
                  <div className="table-td">Address</div>
                  <div className="table-td">Amount</div>
                </div>
                <div className="table-tr">
                  <div className="table-td">
                    <p>Name 1</p>
                  </div>
                  <div className="table-td">
                    <p className="break-all">
                      0xc6300135a8fcd43123bb486ff06831b5345d0971
                    </p>
                  </div>
                  <div className="table-td">
                    <p>2.5672 ETH</p>
                  </div>
                </div>
                <div className="table-tr">
                  <div className="table-td">
                    <p>Name 2</p>
                  </div>
                  <div className="table-td">
                    <p className="break-all">
                      0x0a7772cdbeee6dbdfdf944dd3e11d32d6a183bde
                    </p>
                  </div>
                  <div className="table-td">
                    <p>8.009 ETH</p>
                  </div>
                </div>
              </div>
              <Link className="button button_next" to="/">
                Back to Home
              </Link>
            </div>
          </div>
        );
      }
    }
  )
);
