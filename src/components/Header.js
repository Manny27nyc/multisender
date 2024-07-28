import React from "react";
import { Link } from "react-router-dom";
import { inject, observer } from "mobx-react";
import GithubCorner from "react-github-corner";

export let Header = inject("UiStore")(
  observer(
    class Header extends React.Component {
      state = {
        multisenderAddress: null,
      };

      componentDidMount() {
        (async () => {
          const multisenderAddress =
            await this.props.UiStore.tokenStore.proxyMultiSenderAddress();
          this.setState({ multisenderAddress });
        })();
      }

      render() {
        const explorerUrl =
          this.props.UiStore.web3Store.explorerUrl || "https://etherscan.io";

        return (
          <header className="header">
            <div className="multisend-container">
              <a href="#" className="header-logo"></a>
              <form className="form form_header">
                {/* <Link className="button" to='/retry'>Retry Failed Transaction</Link> */}
                <label className="multisend-label">
                  MultiSender Address:{" "}
                  <a
                    target="_blank"
                    href={`${explorerUrl}/address/${this.state.multisenderAddress}`}
                  >
                    {this.state.multisenderAddress}
                  </a>
                </label>
              </form>
            </div>
            <div className="multisend-container">
              Supports Ethereum Mainnet, Sepolia and Holesky testnets, Binance
              Smart Chain Mainnet and Testnet, and Polygon Mainnet and Amoy
              Testnet
            </div>
            <GithubCorner
              href="https://github.com/olegabr/multisender"
              target="_blank"
              rel="nofollow"
            />
          </header>
        );
      }
    }
  )
);
