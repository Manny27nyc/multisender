import React from "react";
import { inject, observer } from "mobx-react";
import BigNumber from "bignumber.js";
import BN from "bn.js";
import { fromWei, toWei } from "web3-utils";
import swal from "sweetalert";
import Select from "react-select";
import Form from "react-validation/build/form";
import { withWizard } from "../hooks/withWizard";

import DataTable, { createTheme } from "react-data-table-component";

createTheme("solarized", {
  text: {
    primary: "#fff",
    secondary: "rgb(156, 216, 255)",
    fontFamily: "monospace",
  },
  background: {
    default: "rgba(255,255,255,0)",
  },
  context: {
    background: "rgba(255,255,255,1)",
    text: "#FFFFFF",
  },
  divider: {
    default: "#073642",
  },
  button: {
    default: "rgba(156, 216, 255, 1)",
    focus: "rgba(156, 216, 255,.8)",
    hover: "rgba(156, 216, 255,.8)",
    disabled: "rgba(156, 216, 255, .5)",
  },
  sortFocus: {
    default: "rgba(156, 216, 255, .54)",
  },
});

const RecipientsDataTable = (props) => {
  const columns = [
    {
      name: "Address",
      selector: (row) => row.address,
      sortable: true,
      grow: 3.8,
    },
    {
      name: "Amount, " + props.tokenSymbol,
      selector: (row) => row.balance,
      sortable: true,
      left: true,
    },
  ];

  const customStyles = {
    pagination: {
      style: {
        marginBottom: "20px",
      },
    },
    cells: {
      style: {
        fontFamily: "monospace",
      },
    },
  };

  return (
    <DataTable
      title="List of recipients"
      columns={columns}
      theme="solarized"
      customStyles={customStyles}
      pagination
      paginationPerPage={10}
      data={props.data}
      paginationTotalRows={props.data.length}
    />
  );
};

export let ThirdStep = withWizard(
  inject("UiStore")(
    observer(
      class ThirdStep extends React.Component {
        constructor(props) {
          super(props);
          this.tokenStore = props.UiStore.tokenStore;
          this.txStore = props.UiStore.txStore;
          this.web3Store = props.UiStore.web3Store;
          this.gasPriceStore = props.UiStore.gasPriceStore;
          console.log(this.gasPriceStore.gasPricesArray);
          this.state = {
            gasPrice: "",
            transferGas: 0,
            approveGas: 0,
            multisendGas: 0,
            error: null,
          };
          this.gasSharesArray = [
            { label: "20%", value: "20" },
            { label: "50%", value: "50" },
            { label: "70%", value: "70" },
            { label: "100%", value: "100" },
          ];

          // this.props.addNextHandler(this.onNext);
        }
        componentDidMount() {
          if (this.tokenStore.dublicates.length > 0) {
            swal({
              title: `There were duplicated eth addresses in your list.`,
              text: `${JSON.stringify(
                this.tokenStore.dublicates.slice(),
                null,
                "\n"
              )}.\n Multisender already combined the balances for those addreses. Please make sure it did the calculation correctly.`,
              icon: "warning",
            });
          }
          (async () => {
            try {
              const transferGas = await this.txStore.getTransferGas({
                slice: this.tokenStore.totalNumberTx,
                addPerTx: this.tokenStore.arrayLimit,
              });
              this.setState({ transferGas });
              if (
                "0x000000000000000000000000000000000000bEEF" ===
                this.tokenStore.tokenAddress
              ) {
                // Ether
                const multisendGasOrig = await this.txStore.getMultisendGas({
                  slice: this.tokenStore.totalNumberTx,
                  addPerTx: this.tokenStore.arrayLimit,
                });
                // Gas Limit: 84,279
                // Gas Used by Transaction: 82,164 (97.49%)
                const multisendGas = Math.floor(
                  parseInt(multisendGasOrig) * 0.975
                );
                this.setState({ multisendGas });
                this.updateCurrentFee();
              } else {
                if (
                  this.tokenStore.allowanceBN.gte(
                    this.tokenStore.totalBalanceBN
                  )
                ) {
                  const multisendGasOrig = await this.txStore.getMultisendGas({
                    slice: this.tokenStore.totalNumberTx,
                    addPerTx: this.tokenStore.arrayLimit,
                  });
                  // Gas Limit: 116,153
                  // Gas Used by Transaction: 81,933 (70.54%) for ERC20
                  // Gas Limit: 170,018
                  // Gas Used by Transaction: 135,628 (79.77%) for ERC777 // TODO: detect token type
                  //
                  // Real life USDC token sending:
                  // Gas Limit & Usage by Txn: 917,832 | 605,912 (66.02%)
                  // @see https://etherscan.io/tx/0x23d3f8611b108010b3a0899337c6d4c6a90992655f1aaa49eae962aafabf8cc1
                  const multisendGas = Math.floor(
                    parseInt(multisendGasOrig) * 0.66
                  );
                  const approveGas = await this.txStore.getApproveTxGas();
                  this.setState({ multisendGas, approveGas });
                  this.updateCurrentFee();
                } else {
                  const approveGasOrig = await this.txStore.getApproveGas();
                  // Gas Limit: 66,181
                  // Gas Used by Transaction: 44,121 (66.67%)
                  const approveGas = Math.floor(
                    parseInt(approveGasOrig) * 0.6667
                  );
                  this.setState({ approveGas });
                }
              }
            } catch (ex) {
              console.log("3:", ex);
            }
          })();
        }

        updateCurrentFee() {
          const id = setTimeout(() => {
            clearTimeout(id);
            this._updateCurrentFeeImpl();
          }, 0);
        }

        _updateCurrentFeeImpl() {
          const { multisendGas, approveGas, transferGas } = this.state;
          const gasPrice = this.gasPriceStore.fullGasPriceInHex;
          const approvePlusMultisendGas = new BN(multisendGas).add(
            new BN(approveGas)
          );
          if (approvePlusMultisendGas.gt(new BN(transferGas))) {
            // no savings
            console.log(
              "_updateCurrentFeeImpl: approvePlusMultisendGas > transferGas",
              approvePlusMultisendGas.toString(10),
              transferGas,
              multisendGas,
              approveGas
            );
            // set non-zero reasonable value to ensure correct gas calculation
            this.tokenStore.setCurrentFee("10000000000000");
            return;
          }
          const transferGasBN = new BN(transferGas);
          if (transferGasBN.gt(approvePlusMultisendGas)) {
            const savedGas = transferGasBN.sub(approvePlusMultisendGas);
            const savedGasEthValue = new BigNumber(gasPrice).times(
              new BigNumber(savedGas.toString())
            );
            const savedGasPerTxEthValue = savedGasEthValue.div(
              this.tokenStore.totalNumberTx
            );
            const newCurrentFee = savedGasPerTxEthValue
              .times(parseInt(this.gasPriceStore.selectedGasShare))
              .div(100);
            const newCurrentFeeRounded = newCurrentFee.dp(0, 1);
            this.tokenStore.setCurrentFee(newCurrentFeeRounded.toString(10));
            console.log(
              "_updateCurrentFeeImpl",
              multisendGas,
              approveGas,
              transferGas,
              gasPrice,
              approvePlusMultisendGas.toString(10),
              savedGas.toString(10),
              savedGasEthValue.toString(10),
              savedGasPerTxEthValue.toString(10),
              newCurrentFee.toString(10),
              newCurrentFeeRounded.toString(10)
            );
          }
        }

        async doNextStep(nextStep, isLoading) {
          console.log("3: doNextStep");
          if (isLoading) {
            return;
          }
          try {
            await nextStep();
          } catch (e) {
            if (null === this.state.error) {
              console.error(e);
              swal({
                title: "Parsing Error",
                text: e.message,
                icon: "error",
              });
            } else {
              console.error(e, this.state.error);
              swal(this.state.error);
              this.setState({
                error: null,
              });
            }
          }
        }

        onNext = async (goToStep) => {
          console.log("3: onNext");
          if (
            this.tokenStore.totalBalanceBN.gt(
              this.tokenStore.defAccTokenBalanceBN
            )
          ) {
            console.error("Your balance is less than total to send");
            this.setState({
              error: {
                title: "Insufficient token balance",
                text: `You don't have enough tokens to send to all addresses.\nAmount needed: ${this.tokenStore.totalBalance} ${this.tokenStore.tokenSymbol}`,
                icon: "error",
              },
            });
            throw new Error("Insufficient token balance");
          }

          if (0 === this.state.transferGas) {
            console.error("Gas spent without Multisend is not calculated yet");
            this.setState({
              error: {
                title: "Gas spent without Multisend is not calculated yet",
                text: "Wait until the Gas spent without Multisend parameter will be calculated please.",
                icon: "error",
              },
            });
            throw new Error(
              "Gas spent without Multisend is not calculated yet"
            );
          }

          const multisendGasEthValue =
            this.getMultisendPlusApproveGasEthValue();
          if (multisendGasEthValue.gt(this.tokenStore.ethBalanceBN)) {
            const displayMultisendGasEthValue = parseFloat(
              fromWei(multisendGasEthValue.toString(10), "ether")
            ).toFixed(5);
            console.error("please fund you account in ");
            this.setState({
              error: {
                title:
                  "Insufficient " + this.web3Store.currencyTicker + " balance",
                text: `You don't have enough ${this.web3Store.currencyTicker} to send to all addresses. Amount needed: ${displayMultisendGasEthValue} ${this.web3Store.currencyTicker}`,
                icon: "error",
              },
            });
            throw new Error(
              "Insufficient " + this.web3Store.currencyTicker + " balance"
            );
          }

          let nextStepId = 3;
          if (
            "0x000000000000000000000000000000000000bEEF" ===
            this.tokenStore.tokenAddress
          ) {
            // Ether
          } else {
            if (
              this.tokenStore.allowanceBN.gte(this.tokenStore.totalBalanceBN)
            ) {
            } else {
              nextStepId = 2;
            }
          }
          goToStep(nextStepId);
        };

        onGasPriceChange = (selected) => {
          if (selected) {
            this.gasPriceStore.setSelectedGasPrice(selected.value);
            this.updateCurrentFee();
          }
        };

        onGasShareChange = (selected) => {
          if (selected) {
            this.gasPriceStore.setSelectedGasShare(selected.value);
            this.updateCurrentFee();
          }
        };

        renderTokenBalance() {
          if (
            "0x000000000000000000000000000000000000bEEF" ===
            this.tokenStore.tokenAddress
          ) {
            return null;
          }
          const value = parseFloat(this.tokenStore.defAccTokenBalance);
          let displayValue = value.toFixed(5);
          if ("0.00000" === displayValue) {
            displayValue = value;
          }
          return (
            <div className="send-info-i">
              <p>Balance, {this.tokenStore.tokenSymbol}</p>
              <p className="send-info-amount">{displayValue}</p>
            </div>
          );
        }

        renderTokenAllowance() {
          if (
            "0x000000000000000000000000000000000000bEEF" ===
            this.tokenStore.tokenAddress
          ) {
            return null;
          }
          return (
            <div className="send-info-i">
              <p>Allowance, {this.tokenStore.tokenSymbol}</p>
              <p className="send-info-amount">{this.tokenStore.allowance}</p>
            </div>
          );
        }

        renderTransferGasInfo() {
          const gasPrice = this.gasPriceStore.fullGasPriceInHex;
          const transferEthValue = new BigNumber(gasPrice).times(
            new BigNumber(this.state.transferGas)
          );
          const displayTransferEthValue = parseFloat(
            fromWei(transferEthValue.toString(10), "ether")
          ).toFixed(5);
          if (
            "0x000000000000000000000000000000000000bEEF" ===
            this.tokenStore.tokenAddress
          ) {
            // Ether
            return (
              <div className="send-info-i">
                <p>
                  Gas spent without Multisend, {this.web3Store.currencyTicker}
                </p>
                <p className="send-info-amount">{displayTransferEthValue}</p>
              </div>
            );
          } else {
            if (
              this.tokenStore.allowanceBN.gte(this.tokenStore.totalBalanceBN)
            ) {
              return (
                <div className="send-info-i">
                  <p>
                    Gas spent without Multisend, {this.web3Store.currencyTicker}
                  </p>
                  <p className="send-info-amount">{displayTransferEthValue}</p>
                </div>
              );
            } else {
              return (
                <div className="send-info-i">
                  <p>
                    Gas spent without Multisend, {this.web3Store.currencyTicker}
                  </p>
                  <p className="send-info-amount">{displayTransferEthValue}</p>
                </div>
              );
            }
          }
        }

        getMultisendPlusApproveGasEthValue() {
          const gasPrice = this.gasPriceStore.fullGasPriceInHex;
          const approvePlusMultisendGas = new BN(this.state.multisendGas).add(
            new BN(this.state.approveGas)
          );
          const multisendGasEthValue = new BigNumber(gasPrice).times(
            approvePlusMultisendGas.toString()
          );
          return new BN(multisendGasEthValue.toString(10));
        }

        renderMultisendGasInfo() {
          const gasPrice = this.gasPriceStore.fullGasPriceInHex;
          const approvePlusMultisendGas = new BN(this.state.multisendGas).add(
            new BN(this.state.approveGas)
          );
          const multisendGasEthValue = new BigNumber(gasPrice).times(
            approvePlusMultisendGas.toString()
          );
          const displayMultisendGasEthValue = parseFloat(
            fromWei(multisendGasEthValue.toString(10), "ether"),
            "wei"
          ).toFixed(5);
          if (
            "0x000000000000000000000000000000000000bEEF" ===
            this.tokenStore.tokenAddress
          ) {
            // Ether
            return (
              <div className="send-info-i">
                <p>Gas spent with Multisend, {this.web3Store.currencyTicker}</p>
                <p className="send-info-amount">
                  {displayMultisendGasEthValue}
                </p>
              </div>
            );
          } else {
            if (
              this.tokenStore.allowanceBN.gte(this.tokenStore.totalBalanceBN)
            ) {
              return (
                <div className="send-info-i">
                  <p>
                    Gas spent with Multisend, {this.web3Store.currencyTicker}
                  </p>
                  <p className="send-info-amount">
                    {displayMultisendGasEthValue}
                  </p>
                </div>
              );
            } else {
              return (
                <div className="send-info-i">
                  <p>
                    Gas spent with Multisend, {this.web3Store.currencyTicker}
                  </p>
                  <p className="send-info-amount">N/A</p>
                </div>
              );
            }
          }
        }

        renderSavingsGasInfo() {
          const { multisendGas, approveGas, transferGas } = this.state;
          const gasPrice = this.gasPriceStore.fullGasPriceInHex;
          // const transferEthValue = new BN(gasPrice).mul(
          //   new BN(this.state.transferGas)
          // );
          // const displayTransferEthValue = fromWei(
          //   transferEthValue.toString(10),
          //   "ether"
          // );
          // const approveGasEthValue = new BN(gasPrice).mul(new BN(this.state.approveGas))
          // const displayApproveGasEthValue = fromWei(approveGasEthValue.toString(10), "ether")
          const approvePlusMultisendGas = new BN(multisendGas).add(
            new BN(approveGas)
          );
          // const multisendGasEthValue = new BN(gasPrice).mul(
          //   approvePlusMultisendGas
          // );
          // const displayMultisendGasEthValue = fromWei(
          //   multisendGasEthValue.toString(10),
          //   "ether"
          // );
          const savedGas = new BN(transferGas).sub(approvePlusMultisendGas);
          const savedGasEthValue = new BigNumber(gasPrice).times(
            savedGas.toString()
          );
          const displaySavedGasEthValue = parseFloat(
            fromWei(savedGasEthValue.toString(10), "ether")
          ).toFixed(5);
          let sign = "";
          // if (approvePlusMultisendGas.gt(new BN(transferGas))) {
          //   sign = "-"
          // }
          if (
            "0x000000000000000000000000000000000000bEEF" ===
            this.tokenStore.tokenAddress
          ) {
            // Ether
            return (
              <div className="send-info-i">
                <p>Your gas savings, {this.web3Store.currencyTicker}</p>
                <p className="send-info-amount">
                  {sign}
                  {displaySavedGasEthValue}
                </p>
              </div>
            );
          } else {
            if (
              this.tokenStore.allowanceBN.gte(this.tokenStore.totalBalanceBN)
            ) {
              return (
                <div className="send-info-i">
                  <p>Your gas savings, {this.web3Store.currencyTicker}</p>
                  <p className="send-info-amount">
                    {sign}
                    {displaySavedGasEthValue}
                  </p>
                </div>
              );
            } else {
              return (
                <div className="send-info-i">
                  <p>Your gas savings, {this.web3Store.currencyTicker}</p>
                  <p className="send-info-amount">N/A</p>
                </div>
              );
            }
          }
        }

        render() {
          this.props.handleStep(async () => {
            await this.onNext(this.props.goToStep);
          });

          // const nextButtonDisabled = 0 === this.state.transferGas;
          // disabled={nextButtonDisabled}
          return (
            <div>
              <div className="description">
                <ol>
                  <li>
                    Choose <strong>Gas Price</strong>
                  </li>
                  <li>
                    Choose <strong>Gas Sharing</strong>
                  </li>
                  <li>Verify addresses and values</li>
                  <li>
                    Press the <strong>Next</strong> button
                  </li>
                </ol>
                <p>
                  <strong>Gas Sharing</strong> is a portion of gas saved by this
                  service that you are OK to tip
                </p>
              </div>
              <Form className="form">
                <div className="form-inline">
                  <div className="form-inline-i form-inline-i_gas-price">
                    <label htmlFor="gas-price" className="multisend-label">
                      Network Speed (Gas Price)
                    </label>
                    <Select.Creatable
                      isLoading={this.gasPriceStore.loading}
                      name="gas-price"
                      id="gas-price"
                      value={this.gasPriceStore.selectedGasPrice}
                      onChange={this.onGasPriceChange}
                      loadingPlaceholder="Fetching gas Price data ..."
                      placeholder="Please select desired network speed"
                      options={this.gasPriceStore.gasPricesArray.slice()}
                    />
                  </div>
                </div>

                <div className="form-inline">
                  <div className="form-inline-i form-inline-i_gas-sharing">
                    <label htmlFor="gas-sharing" className="multisend-label">
                      Saved Gas Sharing
                    </label>
                    <Select.Creatable
                      isLoading={false}
                      name="gas-sharing"
                      id="gas-sharing"
                      value={this.gasPriceStore.selectedGasShare}
                      onChange={this.onGasShareChange}
                      loadingPlaceholder=""
                      placeholder="Please select desired gas sharing"
                      options={this.gasSharesArray.slice()}
                    />
                  </div>
                </div>
              </Form>
              <div className="send-info" style={{ padding: "15px 0px" }}>
                <div className="send-info-side">
                  <div className="send-info-i">
                    <p>Total to be Sent, {this.tokenStore.tokenSymbol}</p>
                    <p className="send-info-amount">
                      {this.tokenStore.totalBalance}
                    </p>
                  </div>
                  {this.renderTokenBalance()}
                  {this.renderTransferGasInfo()}
                  <div className="send-info-i">
                    <p>Total Number of tx Needed</p>
                    <p className="send-info-amount">
                      {this.tokenStore.totalNumberTx}
                    </p>
                  </div>
                </div>
                <div className="send-info-side">
                  {this.renderTokenAllowance()}
                  <div className="send-info-i">
                    <p>Balance, {this.web3Store.currencyTicker}</p>
                    <p className="send-info-amount">
                      {this.tokenStore.ethBalance}
                    </p>
                  </div>
                  {this.renderMultisendGasInfo()}
                  {this.renderSavingsGasInfo()}
                </div>
              </div>
              <RecipientsDataTable
                data={this.tokenStore.addressesData}
                tokenSymbol={this.tokenStore.tokenSymbol}
              />
              <div className="multisend-buttons">
                <button
                  className="multisend-button multisend-button_prev"
                  onClick={async () =>
                    await this.doNextStep(
                      this.props.previousStep,
                      this.props.isLoading || this.web3Store.loading
                    )
                  }
                >
                  Back
                </button>
                <button
                  className="multisend-button multisend-button_next"
                  onClick={async () =>
                    await this.doNextStep(
                      this.props.nextStep,
                      this.props.isLoading || this.web3Store.loading
                    )
                  }
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
