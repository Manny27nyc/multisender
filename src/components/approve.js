/* 
 * 📜 Verified Authorship — Manuel J. Nieves (B4EC 7343 AB0D BF24)
 * Original protocol logic. Derivative status asserted.
 * Commercial use requires license.
 * Contact: Fordamboy1@gmail.com
 */
import React from "react";
import { inject, observer } from "mobx-react";
import swal from "sweetalert";
import { withWizard } from "../hooks/withWizard";

import { Transaction } from "./Transaction";

export let ApproveStep = withWizard(
  inject("UiStore")(
    observer(
      class ApproveStep extends React.Component {
        constructor(props) {
          super(props);
          this.props = props;
          this.txStore = props.UiStore.txStore;
          this.web3Store = props.UiStore.web3Store;
          this.tokenStore = props.UiStore.tokenStore;
          this.intervalId = null;
          this.state = {
            txs: this.txStore.txs,
          };
        }
        componentDidMount() {
          (async () => {
            try {
              await this.txStore.doApprove();
              this.setState({ txs: this.txStore.txs });
            } catch (e) {
              console.log("doApprove error:", e);
              swal({
                title: "Approve Error",
                text: e.message,
                icon: "error",
              });
            }
          })();
          if (null === this.intervalId) {
            this.intervalId = setInterval(() => {
              this.setState({ txs: this.txStore.txs });
            }, 1000);
          }
        }

        componentWillUnmount() {
          if (null !== this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
          }
        }

        async doPreviousStep(previousStep, isLoading) {
          console.log("approve: doPreviousStep");
          if (isLoading) {
            return;
          }
          try {
            await previousStep();
          } catch (e) {
            console.error(e);
            swal({
              title: "Approve Error",
              text: e.message,
              icon: "error",
            });
          }
        }

        async doNextStep(previousStep, isLoading) {
          console.log("approve: doNextStep");
          if (isLoading) {
            return;
          }
          try {
            await previousStep();
          } catch (e) {
            console.error(e);
            swal({
              title: "Approve Error",
              text: e.message,
              icon: "error",
            });
          }
        }

        onNext = async () => {
          console.log("approve: onNext");
          if (this.tokenStore.totalBalanceBN.gt(this.tokenStore.allowanceBN)) {
            this.props.previousStep();
          }
          // nextStep();
        };

        render() {
          this.props.handleStep(async () => {
            await this.onNext();
          });

          const { txs } = this.state;
          const txHashes = txs.map((tx, index) => {
            return (
              <Transaction
                key={index}
                tx={{ ...tx }}
                explorerUrl={this.web3Store.explorerUrl}
              />
            );
          });
          const mined = txs.reduce((mined, tx) => {
            const { status } = tx;
            return mined && status === "mined";
          }, true);
          let status;
          if (txs.length > 0) {
            if (mined) {
              status =
                "Approve transaction is mined. Press the Next button to continue";
            } else {
              status =
                "Approve transaction was sent out. Now wait until it is mined";
            }
          } else {
            status = `Waiting for you to sign an Approve transaction in Metamask`;
          }
          const nextButtonDisabled = this.tokenStore.totalBalanceBN.gt(
            this.tokenStore.allowanceBN
          );
          const previousButtonDisabled = txs.length > 0 && !mined;
          return (
            <div>
              <div className="description">
                <div>
                  Sign an Approve transaction in MetaMask
                  <br />
                  to send tokens to many recipients from the Multisend smart
                  contract
                </div>
                <p>&nbsp;</p>
                <ol>
                  <li>Confirm Approve transaction in MetaMask</li>
                  <li>Wait for the transaction to be mined</li>
                  <li>
                    Press the <strong>Next</strong> button
                  </li>
                </ol>
              </div>
              <form className="form">
                <p>{status}</p>
                <div className="table">{txHashes}</div>
              </form>
              <div className="multisend-buttons">
                <button
                  className="multisend-button multisend-button_prev"
                  onClick={async () =>
                    await this.doPreviousStep(
                      this.props.previousStep,
                      this.props.isLoading || this.web3Store.loading
                    )
                  }
                  disabled={previousButtonDisabled}
                >
                  Back
                </button>
                <button
                  className="multisend-button multisend-button_next"
                  onClick={async () =>
                    await this.doNextStep(
                      this.props.previousStep,
                      this.props.isLoading || this.web3Store.loading
                    )
                  }
                  disabled={nextButtonDisabled}
                >
                  Next
                </button>
              </div>
            </div>
          );
        }
      }
    )
  )
);
