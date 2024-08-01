import React, { Component } from "react";
import {
  Header,
  FirstStep,
  SecondStep,
  ThirdStep,
  ApproveStep,
  FourthStep,
  FifthStep,
  Retry,
  Welcome,
} from "./components";
import { Route, Redirect } from "react-router-dom";
import { TransitionGroup, CSSTransition } from "react-transition-group";
import { inject } from "mobx-react";
import "./assets/stylesheets/application.css";
// import Navigation from "./components/Navigation";
// import { Wizard, Steps, Step } from "react-albus";
import { Wizard } from "react-use-wizard";
import { Line } from "rc-progress";
import { PulseLoader } from "react-spinners";

// const RoutedWizard = ({ children }) =>
//   <Route
//     render={({ history, match: { url } }) =>
//       <Wizard history={history} basename={url}>
//         {children}
//       </Wizard>}
//   />;

// const PrivateRoute = ({ component: Component, startedUrl, ...rest }) => (
//   <Route
//     {...rest}
//     render={props =>
//       startedUrl === '#/' || startedUrl === '#/1' ? (
//         <Component {...props} />
//       ) : (
//         <Redirect
//           to={{
//             pathname: "/"
//           }}
//         />
//       )
//     }
//   />
// );

const WizardHeader = (props) => (
  <>
    <header className="header">
      <div className="multisend-container">
        <h1 className="title">
          <strong>Welcome to Token</strong> MultiSender
        </h1>
        <Line percent={((props.step + 1) / 4) * 100} className="pad-b" />
        <div className="sweet-loading">
          <PulseLoader color={"#123abc"} loading={props.loading} />
        </div>
      </div>
    </header>
  </>
);

const WizardStepWrapper = ({ children }) => (
  <>
    <div className="multisend-container multisend-container_bg">
      <div className="content">
        <TransitionGroup>
          <CSSTransition
            classNames="multisend"
            timeout={{ enter: 500, exit: 500 }}
          >
            {children}
          </CSSTransition>
        </TransitionGroup>
      </div>
    </div>
  </>
);

export let App = inject("UiStore")(
  class App extends React.Component {
    constructor(props) {
      super(props);
      this.tokenStore = props.UiStore.tokenStore;
      this.web3Store = props.UiStore.web3Store;
      this.nextHandlers = [];
      this.state = {
        loading: this.web3Store.loading,
        currentWizardStep: 0,
      };
    }

    componentDidMount() {
      this.interval = setInterval(() => {
        (async () => {
          try {
            await this.tokenStore.proxyMultiSenderAddress();
            this.setState((state, props) => {
              return { ...state, loading: this.web3Store.loading };
            });
          } catch (ex) {
            console.log("App:", ex);
          }
        })();
      }, 1000);
    }

    onStepChange = (stepIndex) => {
      this.setState((state, props) => {
        return { ...state, currentWizardStep: stepIndex };
      });
    };

    // addNextHandler = (handler) => {
    //   this.nextHandlers.push(handler);
    // };

    render() {
      const { startedUrl } = this.web3Store;
      if (!(startedUrl === "#/" || startedUrl === "#/home")) {
        this.web3Store.setStartedUrl("#/");
        return (
          <Redirect
            to={{
              pathname: "/",
            }}
          />
        );
      }

      return (
        <div>
          <Header />
          <Route
            render={({ history }) => (
              <Wizard
                startIndex={0}
                header={
                  <WizardHeader
                    step={this.state.currentWizardStep}
                    loading={this.state.loading}
                  />
                }
                wrapper={<WizardStepWrapper />}
                history={history}
                onStepChange={this.onStepChange}
              >
                <FirstStep />
                <ThirdStep />
                <ApproveStep />
                <FourthStep />
              </Wizard>
            )}
          />
        </div>
      );
    }
  }
);
