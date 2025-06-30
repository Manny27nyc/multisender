// © Licensed Authorship: Manuel J. Nieves (See LICENSE for terms)
import React from "react";
import { inject, observer } from "mobx-react";
import swal from "sweetalert";
import { withWizard } from "../hooks/withWizard";

import { Transaction } from "./Transaction";

export let FourthStep = withWizard(
  inject("UiStore")(
    observer(
      class FourthStep extends React.Component {
        constructor(props) {
          super(props);
          this.txStore = props.UiStore.txStore;
          this.tokenStore = props.UiStore.tokenStore;
          this.web3Store = props.UiStore.web3Store;
          this.explorerUrl = props.UiStore.web3Store.explorerUrl;
          this.intervalId = null;
          this.state = {
            txs: this.txStore.txs,
            totalNumberOftx: this.calcTotalNumberOftx(),
          };
          this.doSendExecuted = false;

          // this.props.addNextHandler(this.onNext);
        }

        async doNextStep(nextStep, isLoading) {
          console.log("4: doNextStep");
          if (isLoading) {
            return;
          }
          location.reload();
          // try {
          //   await nextStep();
          // } catch (e) {
          //   console.error(e);
          //   swal({
          //     title: "Multi Tx Send Error",
          //     text: e.message,
          //     icon: "error",
          //   });
          // }
        }

        onNext = async (nextStep) => {
          console.log("4: onNext");
          // nextStep();
          location.reload();
        };

        componentDidMount() {
          (async () => {
            try {
              if (!this.doSendExecuted) {
                this.doSendExecuted = true;
                await this.txStore.doSend();
                this.setState({
                  txs: this.txStore.txs,
                  totalNumberOftx: this.calcTotalNumberOftx(),
                });
              }
            } catch (e) {
              console.log("doSend error:", e);
              swal({
                title: "Multi Tx Send Error",
                text: e.message,
                icon: "error",
              });
            }
          })();
          if (null === this.intervalId) {
            this.intervalId = setInterval(() => {
              this.setState({
                txs: this.txStore.txs,
                totalNumberOftx: this.calcTotalNumberOftx(),
              });
            }, 1000);
          }
        }

        componentWillUnmount() {
          if (null !== this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
          }
        }

        calcTotalNumberOftx() {
          let totalNumberOftx;

          // if(Number(this.tokenStore.totalBalance) > Number(this.tokenStore.allowance)){
          //   totalNumberOftx = Number(this.tokenStore.totalNumberTx) + 1;
          // } else {
          totalNumberOftx = Number(this.tokenStore.totalNumberTx);
          // }
          return totalNumberOftx;
        }

        render() {
          this.props.handleStep(async () => {
            await this.onNext(this.props.nextStep);
          });

          const { txs, totalNumberOftx } = this.state;
          const txHashes = txs.map((tx, index) => {
            return (
              <Transaction
                key={index}
                tx={{ ...tx }}
                explorerUrl={this.explorerUrl}
              />
            );
          });
          const mined = txs.reduce((mined, tx) => {
            const { status } = tx;
            return mined && status === "mined";
          }, true);
          let status;
          if (txs.length === totalNumberOftx) {
            if (mined) {
              status = "All transactions are mined. Congratulations!";
            } else {
              status =
                "Transactions were sent out. Now wait until all transactions are mined.";
            }
          } else {
            const txCount = totalNumberOftx - txs.length;
            status = `Waiting for you to sign transaction in Metamask`;
            if (totalNumberOftx > 1) {
              status = `Waiting for you to sign ${txCount} transactions in Metamask`;
            }
          }
          let label = "Sign a multisend transaction in MetaMask";
          if (totalNumberOftx > 1) {
            label = `Sign all ${totalNumberOftx} multisend transactions in MetaMask`;
          }
          let label2 =
            "to send tokens to many recipients from the Multisend smart contract";
          if (this.web3Store.currencyTicker === this.tokenStore.tokenSymbol) {
            label2 =
              "to send " +
              this.web3Store.currencyTicker +
              " to many recipients from the Multisend smart contract";
          }
          const previousButtonDisabled = txs.length < totalNumberOftx || !mined;
          return (
            <div>
              <div className="description">
                <div>
                  {label}
                  <br />
                  {label2}
                </div>
                <p>&nbsp;</p>
                <ol>
                  <li>Confirm all multisend transactions in MetaMask</li>
                  <li>Wait for all transactions to be mined</li>
                  <li>Check transactions on {this.explorerUrl}</li>
                  <li>
                    Press the <strong>Home</strong> button to send again
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
                    await this.doNextStep(
                      this.props.nextStep,
                      this.props.isLoading || this.web3Store.loading
                    )
                  }
                  disabled={previousButtonDisabled}
                >
                  Home
                </button>
              </div>
            </div>
          );
        }
      }
    )
  )
);
